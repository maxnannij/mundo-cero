import {
  type GameState, type AutomationOrder, type AutomationMode, type Resident,
  createInitialState, addResource, removeResource, addXp, addLog,
  getToolBonuses, calculatePassiveProduction, canAfford, isTechUnlocked,
  getAvailableWorkers, getAssignedWorkers, hasBuilding, getSkillBonuses, addMasteryXp, SAVE_VERSION, STORAGE_KEY, LEGACY_STORAGE_KEY,
  PREVIOUS_STORAGE_KEY, OLDEST_STORAGE_KEY, generateLifeExpectancyYears, ADULT_AGE_DAYS, MAX_POPULATION,
} from '../store/gameState';
import { SKILLS, type SkillId, type ActivityDef } from '../data/skills';
import { RECIPES, type RecipeDef } from '../data/recipes';
import { BUILDINGS } from '../data/buildings';
import { TECHS } from '../data/techs';
import { OBJECTIVES } from '../data/objectives';
import { TOOLS } from '../data/tools';
import { GAME_DAY_MS, DAYS_PER_YEAR, getCalendarInfo, type SeasonId } from '../data/calendar';
import type { ResourceId } from '../data/resources';

const MAX_SIMULATION_MS = 8 * 60 * 60 * 1000;
const BERRIES_PER_PERSON_DAY = 20;
const COOKED_FOOD_PER_PERSON_DAY = 3;
const BERRY_EQUIVALENT_PER_COOKED_FOOD = BERRIES_PER_PERSON_DAY / COOKED_FOOD_PER_PERSON_DAY;
const PREGNANCY_DAYS = 280;
const CONCEPTION_DAYS = 45;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeSave(value: unknown): GameState | null {
  if (!isRecord(value) || !isRecord(value.resources) || !isRecord(value.skills)) return null;
  const initial = createInitialState();
  const raw = value as Partial<GameState> & { activeActivity?: ActiveActivity | null };
  const resources = { ...initial.resources };
  for (const id of Object.keys(resources) as ResourceId[]) {
    const amount = raw.resources?.[id];
    resources[id] = typeof amount === 'number' && Number.isFinite(amount) && amount >= 0 ? amount : 0;
  }
  const skills = { ...initial.skills };
  for (const id of Object.keys(skills) as SkillId[]) {
    const item = raw.skills?.[id];
    if (item && Number.isFinite(item.level) && Number.isFinite(item.xp)) {
      skills[id] = { level: Math.max(1, Math.min(99, Math.floor(item.level))), xp: Math.max(0, item.xp), masteryLevel: Math.max(0, Math.min(20, Math.floor(Number(item.masteryLevel) || 0))), masteryXp: Math.max(0, Number(item.masteryXp) || 0), specialization: item.specialization === 'velocidad' || item.specialization === 'rendimiento' ? item.specialization : undefined };
    }
  }
  const buildings = Array.isArray(raw.buildings)
    ? raw.buildings.filter(b => b && typeof b.id === 'string' && BUILDINGS[b.id]).map(b => ({
        id: b.id, level: Math.max(1, Math.floor(Number(b.level) || 1)),
        count: Math.max(1, Math.floor(Number(b.count) || 1)),
        workersAssigned: Math.max(0, Math.floor(Number(b.workersAssigned) || 0)),
      }))
    : [];
  const population = raw.population && Array.isArray(raw.population.residents)
    ? {
        residents: raw.population.residents.filter(r => r && typeof r.id === 'string').map(r => ({
          ...r, ageDays: Math.max(0, Number(r.ageDays) || 0),
          health: Math.max(0, Math.min(100, Number(r.health) || 0)),
          hungerDays: Math.max(0, Number(r.hungerDays) || 0),
          coldDays: Math.max(0, Number(r.coldDays) || 0),
          lifeExpectancyYears: Number.isFinite(r.lifeExpectancyYears) && Number(r.lifeExpectancyYears) >= 70 && Number(r.lifeExpectancyYears) <= 110
            ? Number(r.lifeExpectancyYears)
            : Math.max(Math.max(0, Number(r.ageDays) || 0) / DAYS_PER_YEAR + 1, generateLifeExpectancyYears()),
        })) as Resident[],
        nextResidentId: Math.max(3, Math.floor(Number(raw.population.nextResidentId) || 3)),
        births: Math.max(0, Math.floor(Number(raw.population.births) || 0)),
        reproductionEnabled: raw.population.reproductionEnabled !== false,
      }
    : initial.population;

  // Old v1 saves had no residents or staffing. Assign the first available adults
  // to existing production buildings so an established settlement does not stop.
  if (!raw.population) {
    let workers = 2;
    for (const building of buildings) {
      if (BUILDINGS[building.id]?.production) {
        building.workersAssigned = Math.min(building.count, workers);
        workers -= building.workersAssigned;
      }
    }
  }

  const calendar = raw.calendar && Number.isFinite(raw.calendar.totalDays)
    ? {
        totalDays: Math.max(0, Math.floor(raw.calendar.totalDays)),
        dayProgressMs: Math.max(0, Math.min(GAME_DAY_MS - 1, Number(raw.calendar.dayProgressMs) || 0)),
      }
    : initial.calendar;

  const savedActivities: Partial<ActiveActivity>[] = Array.isArray(raw.activeActivities)
    ? raw.activeActivities
    : raw.activeActivity ? [raw.activeActivity] : [];
  const activeActivities: ActiveActivity[] = savedActivities
    .filter(activity => !!activity && typeof activity.skillId === 'string'
      && !!SKILLS[activity.skillId as SkillId]?.activities.some(def => def.id === activity.activityId))
    .map((activity, index) => ({
      id: typeof activity.id === 'string' && activity.id
        ? activity.id : `activity-${index}-${Number(activity.startTime) || Date.now()}`,
      skillId: activity.skillId as SkillId,
      activityId: activity.activityId as string,
      startTime: Number(activity.startTime) || Date.now(),
      progressMs: Math.max(0, Number(activity.progressMs) || 0),
      targetAmount: Number.isFinite(Number(activity.targetAmount)) && Number(activity.targetAmount) > 0
        ? Math.max(1, Math.floor(Number(activity.targetAmount))) : undefined,
      actionsDone: Math.max(0, Math.floor(Number(activity.actionsDone) || 0)),
    }));

  const normalized: GameState = {
    ...initial, ...raw, version: SAVE_VERSION,
    lastSave: Number(raw.lastSave) || Date.now(),
    lastTick: Number(raw.lastTick) || Number(raw.lastSave) || Date.now(),
    resources, skills, buildings, population, calendar,
    unlockedTechs: Array.isArray(raw.unlockedTechs) ? raw.unlockedTechs.filter(x => typeof x === 'string' && !!TECHS[x]) : [],
    equippedTools: isRecord(raw.equippedTools) ? raw.equippedTools as Record<string, string> : {},
    ownedTools: Array.isArray(raw.ownedTools) ? raw.ownedTools.filter(x => typeof x === 'string' && !!TOOLS[x]) : [],
    activeActivities,
    craftQueue: Array.isArray(raw.craftQueue) ? raw.craftQueue.filter(x => x && typeof x.recipeId === 'string' && !!RECIPES[x.recipeId]).map(x => ({
      recipeId: x.recipeId, remaining: Math.max(1, Math.floor(Number(x.remaining) || 1)),
      progressMs: Math.max(0, Number(x.progressMs) || 0), startTime: Number(x.startTime) || Date.now(),
      automationOrderId: x.automationOrderId,
    })) : [],
    automationOrders: Array.isArray(raw.automationOrders) ? raw.automationOrders.filter(x =>
      x && typeof x.id === 'string' && !!RECIPES[x.recipeId] && !!BUILDINGS[x.buildingId]
    ).map(x => ({ ...x, enabled: x.enabled !== false, priority: Number(x.priority) || 0, targetAmount: Math.max(1, Number(x.targetAmount) || 100) })) : [],
    completedObjectives: Array.isArray(raw.completedObjectives) ? raw.completedObjectives.filter(x => typeof x === 'string') : [],
    totalActions: isRecord(raw.totalActions) ? raw.totalActions as Record<string, number> : {},
    log: Array.isArray(raw.log) ? raw.log.filter(x => x && typeof x.message === 'string').slice(0, 80) : initial.log,
    maxStorage: Math.max(50, Number(raw.maxStorage) || initial.maxStorage),
    settings: { offlineCapHours: Math.max(1, Math.min(24, Number(raw.settings?.offlineCapHours) || 8)) },
  };

  // Drop staffing assignments that exceed the current adult workforce.
  const livingAdults = population.residents.filter(r => r.ageDays >= ADULT_AGE_DAYS && r.health > 0).length;
  if (normalized.activeActivity && livingAdults < 1) normalized.activeActivity = null;
  let staffRemaining = livingAdults;
  for (const b of normalized.buildings) {
    b.workersAssigned = Math.min(b.workersAssigned, staffRemaining, (BUILDINGS[b.id]?.workersRequired ?? 1) * b.count);
    staffRemaining -= b.workersAssigned;
  }
  normalized.activeActivities = normalized.activeActivities.slice(0, Math.max(0, livingAdults - getAssignedWorkers(normalized)));
  return normalized;
}

export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY) ?? localStorage.getItem(PREVIOUS_STORAGE_KEY) ?? localStorage.getItem(OLDEST_STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = normalizeSave(JSON.parse(raw) as unknown);
    if (!parsed) throw new Error('La partida guardada no tiene una estructura válida.');
    return parsed;
  } catch (error) {
    console.error('No se pudo cargar la partida guardada.', error);
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY) ?? localStorage.getItem(PREVIOUS_STORAGE_KEY) ?? localStorage.getItem(OLDEST_STORAGE_KEY);
      if (raw) localStorage.setItem(`mundo-cero-backup-corrupto-${Date.now()}`, raw);
    } catch { /* Storage may be unavailable or full. */ }
    return createInitialState();
  }
}

export function saveGame(state: GameState): void {
  try {
    state.lastSave = Date.now();
    state.version = SAVE_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('No se pudo guardar la partida.', error);
  }
}

export function exportSave(state: GameState): string {
  return JSON.stringify({ ...state, version: SAVE_VERSION }, null, 2);
}

export function importSave(json: string): GameState | null {
  try {
    return normalizeSave(JSON.parse(json) as unknown);
  } catch {
    return null;
  }
}

export function processOffline(state: GameState): { messages: string[]; produced: Record<string, number> } {
  const now = Date.now();
  const elapsed = Math.max(0, now - (state.lastTick || state.lastSave || now));
  const maxMs = Math.max(1, state.settings.offlineCapHours || 8) * 3600000;
  const effective = Math.min(elapsed, maxMs);
  if (effective < 1000) {
    state.lastTick = now;
    return { messages: [], produced: {} };
  }

  const before = { ...state.resources };
  tick(state, effective);
  state.lastTick = now;
  const produced: Record<string, number> = {};
  const messages = [`Estuviste ausente ${(effective / 3600000).toFixed(1)} horas.`];
  for (const [id, amount] of Object.entries(state.resources)) {
    const delta = amount - (before[id as ResourceId] || 0);
    if (delta > 0.01) {
      produced[id] = delta;
      messages.push(`+${Math.floor(delta * 100) / 100} ${id.replaceAll('_', ' ')}`);
    }
  }
  addLog(state, `Progreso offline: ${messages.slice(0, 7).join(' · ')}`);
  return { messages, produced };
}

function getActivity(skillId: SkillId, activityId: string): ActivityDef | null {
  const skill = SKILLS[skillId];
  return skill?.activities.find(a => a.id === activityId) || null;
}

function isSeasonAvailable(activity: ActivityDef, season: SeasonId): boolean {
  return !activity.seasonsAvailable || activity.seasonsAvailable.includes(season);
}

export function startActivity(state: GameState, skillId: SkillId, activityId: string, targetAmount?: number): boolean {
  const act = getActivity(skillId, activityId);
  if (!act || !state.skills[skillId] || state.activeActivity) return false;
  if (getAvailableWorkers(state) < 1) return false;
  if (state.skills[skillId].level < act.requiredLevel) return false;
  if (act.unlockTech && !isTechUnlocked(state, act.unlockTech)) return false;
  if (act.requiredBuilding && !hasBuilding(state, act.requiredBuilding)) return false;
  if (!isSeasonAvailable(act, getCalendarInfo(state.calendar).season)) return false;
  if (targetAmount !== undefined && (!Number.isFinite(targetAmount) || targetAmount < 1)) return false;

  state.activeActivity = {
    skillId, activityId, startTime: Date.now(), progressMs: 0,
    targetAmount: targetAmount ? Math.floor(targetAmount) : undefined, actionsDone: 0,
  };
  addLog(state, `Comenzaste: ${act.name}`);
  return true;
}

export function stopActivity(state: GameState): void {
  if (state.activeActivity) {
    addLog(state, 'Actividad detenida.');
    state.activeActivity = null;
  }
}

function completeActivityAction(state: GameState, act: ActivityDef): boolean {
  const season = getCalendarInfo(state.calendar).season;
  if (!isSeasonAvailable(act, season)) {
    addLog(state, `${act.name} no está disponible durante el invierno/esta estación.`);
    state.activeActivity = null;
    return false;
  }
  if (act.requiredBuilding && !hasBuilding(state, act.requiredBuilding)) {
    addLog(state, `Necesitás construir ${BUILDINGS[act.requiredBuilding]?.name || act.requiredBuilding} para continuar.`);
    state.activeActivity = null;
    return false;
  }
  if (act.inputs?.length && !canAfford(state, act.inputs)) {
    addLog(state, `Faltan materiales para continuar: ${act.inputs.map(i => `${i.amount} ${i.resourceId}`).join(', ')}.`);
    state.activeActivity = null;
    return false;
  }
  for (const input of act.inputs ?? []) removeResource(state, input.resourceId, input.amount);
  const toolBonuses = getToolBonuses(state, act.requiredTool || 'ninguna');
  const skillBonuses = getSkillBonuses(state, act.skillId);
  const yieldMult = (toolBonuses.yieldMult || 1) * skillBonuses.yieldMult;
  for (const out of act.outputs) {
    const chance = Math.min(1, Math.max(0, (out.chance ?? 1) + toolBonuses.specialChance));
    if (Math.random() <= chance) {
      const rawAmount = out.amount * yieldMult;
      let amount = Math.floor(rawAmount);
      if (Math.random() < rawAmount - amount) amount += 1;
      addResource(state, out.resourceId, Math.max(1, amount));
    }
  }
  for (const message of addXp(state, act.skillId, act.xp)) addLog(state, message);
  for (const message of addMasteryXp(state, act.skillId, act.xp)) addLog(state, message);
  if (state.activeActivity) {
    state.activeActivity.actionsDone += 1;
    state.totalActions[act.id] = (state.totalActions[act.id] || 0) + 1;
  }
  checkObjectives(state);
  return true;
}

function processCrafting(state: GameState, deltaMs: number): void {
  let remainingMs = deltaMs;
  let safety = 0;
  while (state.craftQueue.length > 0 && remainingMs > 0 && safety++ < 2000) {
    const item = state.craftQueue[0];
    const recipe = RECIPES[item.recipeId];
    if (!recipe) { state.craftQueue.shift(); continue; }
    const needed = Math.max(0, recipe.durationMs - item.progressMs);
    if (remainingMs + 1e-9 >= needed) {
      remainingMs = Math.max(0, remainingMs - needed);
      item.progressMs = 0;
      finishCraft(state, recipe);
      item.remaining -= 1;
      if (item.remaining <= 0) state.craftQueue.shift();
    } else {
      item.progressMs += remainingMs;
      remainingMs = 0;
    }
  }
}

function finishCraft(state: GameState, recipe: RecipeDef): void {
  for (const out of recipe.outputs) {
    if (out.resourceId === 'tool' && out.toolId) {
      if (!state.ownedTools.includes(out.toolId)) {
        state.ownedTools.push(out.toolId);
        addLog(state, `¡Fabricaste ${TOOLS[out.toolId]?.name || out.toolId}!`);
      }
    } else {
      const bonus = getSkillBonuses(state, recipe.skillId).yieldMult;
      const rawAmount = out.amount * bonus;
      let amount = Math.floor(rawAmount);
      if (Math.random() < rawAmount - amount) amount += 1;
      addResource(state, out.resourceId as ResourceId, Math.max(1, amount));
    }
  }
  for (const message of addXp(state, recipe.skillId, recipe.xp)) addLog(state, message);
  for (const message of addMasteryXp(state, recipe.skillId, recipe.xp)) addLog(state, message);
  checkObjectives(state);
}

function canUseRecipe(state: GameState, recipe: RecipeDef): boolean {
  if (!state.skills[recipe.skillId] || state.skills[recipe.skillId].level < recipe.requiredLevel) return false;
  if (recipe.requiredTech && !isTechUnlocked(state, recipe.requiredTech)) return false;
  if (recipe.requiredBuilding && !hasBuilding(state, recipe.requiredBuilding)) return false;
  return true;
}

function queueCraftInternal(state: GameState, recipe: RecipeDef, quantity: number, automationOrderId?: string): boolean {
  if (!canUseRecipe(state, recipe)) return false;
  const outputsTool = recipe.outputs.some(o => o.resourceId === 'tool' && o.toolId);
  if (outputsTool && (quantity !== 1 || recipe.outputs.some(o => o.toolId && state.ownedTools.includes(o.toolId)))) return false;
  const qty = Math.max(1, Math.min(50, Math.floor(quantity)));
  let affordable = 0;
  for (; affordable < qty; affordable++) {
    if (!canAfford(state, recipe.inputs)) break;
    for (const input of recipe.inputs) removeResource(state, input.resourceId, input.amount);
  }
  if (affordable === 0) return false;
  state.craftQueue.push({ recipeId: recipe.id, remaining: affordable, progressMs: 0, startTime: Date.now(), automationOrderId });
  addLog(state, `Añadido a cola: ${recipe.name} x${affordable}`);
  return true;
}

export function queueCraft(state: GameState, recipeId: string, quantity: number): boolean {
  const recipe = RECIPES[recipeId];
  if (!recipe || !Number.isFinite(quantity) || quantity < 1) return false;
  return queueCraftInternal(state, recipe, quantity);
}

export function createAutomationOrder(
  state: GameState, recipeId: string, buildingId: string, mode: AutomationMode, targetAmount = 100,
): boolean {
  const recipe = RECIPES[recipeId];
  if (!recipe || !hasBuilding(state, buildingId) || !canUseRecipe(state, recipe)) return false;
  const productionFacility = recipe.requiredBuilding || 'taller';
  if (productionFacility !== buildingId) return false;
  if (state.automationOrders.some(o => o.recipeId === recipeId && o.buildingId === buildingId)) return false;
  const output = recipe.outputs.find(o => o.resourceId !== 'tool');
  if (mode === 'mantener' && (!output || !Number.isFinite(targetAmount) || targetAmount < 1)) return false;
  const order: AutomationOrder = {
    id: `auto-${Date.now()}-${state.automationOrders.length}`,
    recipeId, buildingId, mode, targetAmount: Math.max(1, Math.floor(targetAmount)),
    enabled: true, priority: state.automationOrders.length,
  };
  state.automationOrders.push(order);
  addLog(state, `Automatización creada: ${recipe.name} en ${BUILDINGS[buildingId].name}.`);
  return true;
}

export function toggleAutomationOrder(state: GameState, orderId: string): void {
  const order = state.automationOrders.find(o => o.id === orderId);
  if (order) order.enabled = !order.enabled;
}

export function removeAutomationOrder(state: GameState, orderId: string): void {
  // Keep any already-paid batch in the queue; removing the order only stops future batches.
  state.automationOrders = state.automationOrders.filter(o => o.id !== orderId);
}

function processAutomations(state: GameState): void {
  for (const order of [...state.automationOrders].sort((a, b) => b.priority - a.priority)) {
    if (!order.enabled || !hasBuilding(state, order.buildingId)) continue;
    const facility = state.buildings.find(b => b.id === order.buildingId);
    if (BUILDINGS[order.buildingId]?.production && (facility?.workersAssigned || 0) < 1) continue;
    if (state.craftQueue.some(item => item.automationOrderId === order.id)) continue;
    const recipe = RECIPES[order.recipeId];
    if (!recipe || !canUseRecipe(state, recipe)) continue;
    if ((recipe.requiredBuilding || 'taller') !== order.buildingId) continue;
    const output = recipe.outputs.find(o => o.resourceId !== 'tool');
    if (order.mode === 'mantener' && output && (state.resources[output.resourceId as ResourceId] || 0) >= order.targetAmount) continue;
    if (state.craftQueue.length >= 12) break;
    queueCraftInternal(state, recipe, 1, order.id);
  }
}

function processContinuousSystems(state: GameState, deltaMs: number): void {
  const passive = calculatePassiveProduction(state, deltaMs);
  for (const [id, amount] of Object.entries(passive)) addResource(state, id as ResourceId, amount);

  if (state.activeActivity) {
    const active = state.activeActivity;
    const act = getActivity(active.skillId, active.activityId);
    if (!act) state.activeActivity = null;
    else {
      const toolSpeed = getToolBonuses(state, act.requiredTool || 'ninguna').speedMult || 1;
      const skillSpeed = getSkillBonuses(state, act.skillId).speedMult;
      const duration = Math.max(100, act.durationMs * toolSpeed * skillSpeed);
      active.progressMs += deltaMs;
      let actions = 0;
      while (state.activeActivity && state.activeActivity.progressMs >= duration && actions++ < 20_000) {
        if (!completeActivityAction(state, act)) break;
        const current = state.activeActivity;
        if (!current) break;
        current.progressMs -= duration;
        if (current.targetAmount && current.actionsDone >= current.targetAmount) {
          addLog(state, `Objetivo alcanzado (${current.targetAmount} acciones). Actividad detenida.`);
          state.activeActivity = null;
          break;
        }
      }
    }
  }

  processCrafting(state, deltaMs);
  processAutomations(state);
}

function consumeDailyFood(state: GameState): boolean {
  const residents = state.population.residents;
  const needed = residents.reduce((sum, r) => sum + (r.ageDays >= ADULT_AGE_DAYS ? FOOD_PER_ADULT_DAY : FOOD_PER_CHILD_DAY), 0);
  if (needed <= 0) return true;
  const cookedRations = Math.min(needed, (state.resources.comida_cocida || 0) * 2);
  if (cookedRations > 0) removeResource(state, 'comida_cocida', cookedRations / 2);
  const remaining = Math.max(0, needed - cookedRations);
  const berriesUsed = Math.min(remaining, state.resources.bayas || 0);
  if (berriesUsed > 0) removeResource(state, 'bayas', berriesUsed);
  return remaining - berriesUsed <= 1e-6;
}

function consumeDailyHeating(state: GameState, season: SeasonId): boolean {
  if (season !== 'invierno' || state.population.residents.length === 0) return true;
  const adults = state.population.residents.filter(r => r.ageDays >= ADULT_AGE_DAYS).length;
  const children = state.population.residents.length - adults;
  let neededWood = adults * 0.35 + children * 0.18;
  if (hasBuilding(state, 'fogata')) neededWood *= 0.55;
  if (hasBuilding(state, 'refugio') && hasBuilding(state, 'fogata')) neededWood *= 0.85;
  const used = Math.min(state.resources.madera || 0, neededWood);
  if (used > 0) removeResource(state, 'madera', used);
  return used + 1e-6 >= neededWood;
}

const CHILD_NAMES = ['Nima', 'Suri', 'Taren', 'Uma', 'Ilan', 'Mara', 'Noa', 'Ayla', 'Luan', 'Eira'];

function addNewborn(state: GameState, mother: Resident, father: Resident): void {
  if (state.population.residents.length >= MAX_POPULATION) return;
  const sex = Math.random() < 0.5 ? 'hombre' : 'mujer';
  const id = `resident-${state.population.nextResidentId++}`;
  const name = CHILD_NAMES[(state.population.nextResidentId + state.population.births) % CHILD_NAMES.length];
  state.population.residents.push({
    id, name, sex, ageDays: 0, health: 100, hungerDays: 0, coldDays: 0,
    lifeExpectancyYears: generateLifeExpectancyYears(),
    parents: [mother.id, father.id], pregnancyDaysRemaining: 0,
    conceptionProgressDays: 0, childrenBorn: 0,
  });
  mother.childrenBorn = (mother.childrenBorn || 0) + 1;
  mother.pregnancyDaysRemaining = 0;
  mother.conceptionProgressDays = 0;
  state.population.births += 1;
  addLog(state, `¡Nació ${name}! La población ahora es de ${state.population.residents.length} habitantes.`);
}

function shareCloseFamily(a: Resident, b: Resident): boolean {
  if (a.id === b.id) return true;
  if (a.parents?.includes(b.id) || b.parents?.includes(a.id)) return true;
  return (a.parents || []).some(parentId => (b.parents || []).includes(parentId));
}

function pairNewAdults(state: GameState): void {
  const unpaired = state.population.residents.filter(r =>
    r.ageDays >= ADULT_AGE_DAYS && r.health >= 70 && !r.partnerId
  );
  const men = unpaired.filter(r => r.sex === 'hombre');
  for (const man of men) {
    const woman = unpaired.find(r =>
      r.sex === 'mujer' && !r.partnerId && !shareCloseFamily(man, r)
    );
    if (!woman) continue;
    man.partnerId = woman.id;
    woman.partnerId = man.id;
    woman.conceptionProgressDays = 0;
    woman.pregnancyDaysRemaining = 0;
    addLog(state, `${man.name} y ${woman.name} formaron una pareja dentro de la comunidad.`);
  }
}

function processDailyPopulation(state: GameState, season: SeasonId): void {
  const fed = consumeDailyFood(state);
  const warm = consumeDailyHeating(state, season);
  for (const resident of state.population.residents) {
    if (fed) {
      resident.hungerDays = 0;
      resident.health = Math.min(100, resident.health + 1.5);
    } else {
      resident.hungerDays += 1;
      resident.health = Math.max(0, resident.health - 20);
      if (resident.hungerDays === 1 || resident.hungerDays % 5 === 0) addLog(state, `${resident.name} tiene hambre. Conseguí alimentos para el asentamiento.`);
    }
    if (season === 'invierno' && !warm) {
      resident.coldDays += 1;
      resident.health = Math.max(0, resident.health - 2);
      if (resident.coldDays === 1 || resident.coldDays % 5 === 0) addLog(state, `${resident.name} está pasando frío. Hace falta madera para calefaccionar.`);
    } else {
      resident.coldDays = 0;
      if (fed) resident.health = Math.min(100, resident.health + 0.5);
    }
    resident.ageDays += 1;
  }

  // La longevidad varía por persona; la media de la distribución es de 90 años.
  const deceased = state.population.residents.filter(resident =>
    resident.health <= 0 || resident.ageDays >= (resident.lifeExpectancyYears || 90) * DAYS_PER_YEAR
  );
  if (deceased.length > 0) {
    const deceasedIds = new Set(deceased.map(resident => resident.id));
    for (const resident of deceased) {
      const oldAge = resident.ageDays >= (resident.lifeExpectancyYears || 90) * DAYS_PER_YEAR;
      addLog(state, oldAge
        ? `${resident.name} falleció por causas naturales a los ${Math.floor(resident.ageDays / DAYS_PER_YEAR)} años.`
        : `${resident.name} falleció por falta de alimentos o condiciones de salud.`);
    }
    state.population.residents = state.population.residents.filter(resident => !deceasedIds.has(resident.id));
    for (const resident of state.population.residents) {
      if (resident.partnerId && deceasedIds.has(resident.partnerId)) {
        resident.partnerId = undefined;
        resident.pregnancyDaysRemaining = 0;
        resident.conceptionProgressDays = 0;
      }
    }

    // Ajustar la fuerza de trabajo cuando alguien fallece.
    const livingAdults = state.population.residents.filter(r => r.ageDays >= ADULT_AGE_DAYS && r.health > 0).length;
    if (state.activeActivity && livingAdults <= getAssignedWorkers(state)) {
      addLog(state, 'La actividad se detuvo porque ya no queda un trabajador libre.');
      state.activeActivity = null;
    }
    let remainingStaff = livingAdults;
    for (const building of state.buildings) {
      const previousStaff = building.workersAssigned;
      building.workersAssigned = Math.min(previousStaff, remainingStaff);
      remainingStaff -= building.workersAssigned;
      if (building.workersAssigned < previousStaff) {
        addLog(state, `Se redujo el personal de ${BUILDINGS[building.id]?.name || building.id} por falta de adultos.`);
      }
    }
  }

  // When children become adults, pair unrelated, healthy residents automatically.
  pairNewAdults(state);

  if (!state.population.reproductionEnabled || state.population.residents.length >= MAX_POPULATION || !hasBuilding(state, 'refugio') || !fed || !warm) return;
  const mothers = state.population.residents.filter(r =>
    r.sex === 'mujer' && r.ageDays >= ADULT_AGE_DAYS && r.ageDays <= 40 * DAYS_PER_YEAR &&
    r.health >= 70
  );
  for (const mother of mothers) {
    if (mother.pregnancyDaysRemaining && mother.pregnancyDaysRemaining > 0) {
      mother.pregnancyDaysRemaining -= 1;
      if (mother.pregnancyDaysRemaining <= 0) {
        const father = state.population.residents.find(r => r.id === mother.partnerId && r.sex === 'hombre' && r.ageDays >= ADULT_AGE_DAYS && r.health >= 70);
        if (father) addNewborn(state, mother, father);
        else mother.pregnancyDaysRemaining = 0;
      }
      continue;
    }
    if ((mother.childrenBorn || 0) >= 4) continue;
    const father = state.population.residents.find(r => r.id === mother.partnerId && r.sex === 'hombre' && r.ageDays >= ADULT_AGE_DAYS && r.health >= 70);
    if (!father) continue;
    mother.conceptionProgressDays = (mother.conceptionProgressDays || 0) + 1;
    if (mother.conceptionProgressDays >= CONCEPTION_DAYS) {
      mother.pregnancyDaysRemaining = PREGNANCY_DAYS;
      mother.conceptionProgressDays = 0;
      addLog(state, `${mother.name} y ${father.name} esperan un nuevo integrante para la comunidad. Tiempo estimado: ${PREGNANCY_DAYS} días.`);
    }
  }
}

function processDailySystems(state: GameState, previousSeason: SeasonId): void {
  const info = getCalendarInfo(state.calendar);
  if (info.season !== previousSeason) {
    addLog(state, `${info.seasonIcon} Comienza ${info.season.toLowerCase()}. ${info.seasonDescription}`);
    if (info.season === 'invierno') addLog(state, 'El invierno llegó: las bayas silvestres dejan de crecer y la población necesita leña para calentarse.');
  }
  processDailyPopulation(state, info.season);
  if (state.activeActivity) {
    const act = getActivity(state.activeActivity.skillId, state.activeActivity.activityId);
    if (act && !isSeasonAvailable(act, info.season)) {
      addLog(state, `${act.name} se detuvo: no está disponible durante ${info.season}.`);
      state.activeActivity = null;
    }
  }
}

export function tick(state: GameState, deltaMs: number): void {
  let remaining = Math.min(Math.max(0, deltaMs), MAX_SIMULATION_MS);
  let safety = 0;
  while (remaining > 0 && safety++ < 20_000) {
    const untilDay = GAME_DAY_MS - state.calendar.dayProgressMs;
    const step = Math.min(remaining, Math.max(1, untilDay));
    const previousSeason = getCalendarInfo(state.calendar).season;
    processContinuousSystems(state, step);
    state.calendar.dayProgressMs += step;
    remaining -= step;
    if (state.calendar.dayProgressMs >= GAME_DAY_MS - 1e-6) {
      state.calendar.dayProgressMs = Math.max(0, state.calendar.dayProgressMs - GAME_DAY_MS);
      state.calendar.totalDays += 1;
      processDailySystems(state, previousSeason);
    }
  }
  state.lastTick = Date.now();
}

export function buildBuilding(state: GameState, buildingId: string): boolean {
  const def = BUILDINGS[buildingId];
  if (!def || (def.requiredTech && !isTechUnlocked(state, def.requiredTech))) return false;
  const existing = state.buildings.find(b => b.id === buildingId);
  const count = existing?.count || 0;
  if (count >= def.maxCount) return false;
  const costs = def.baseCost.map(c => ({ resourceId: c.resourceId, amount: Math.ceil(c.amount * Math.pow(def.costScale, count)) }));
  if (!canAfford(state, costs)) return false;
  for (const cost of costs) removeResource(state, cost.resourceId, cost.amount);
  if (existing) existing.count += 1;
  else state.buildings.push({ id: buildingId, level: 1, count: 1, workersAssigned: 0 });
  addLog(state, `Construiste: ${def.name}`);
  checkObjectives(state);
  return true;
}

export function getBuildingUpgradeCosts(state: GameState, buildingId: string): { resourceId: ResourceId; amount: number }[] {
  const instance = state.buildings.find(b => b.id === buildingId);
  const def = BUILDINGS[buildingId];
  if (!instance || !def) return [];
  const mult = Math.pow(def.upgradeCostMult, instance.level);
  return def.baseCost.map(c => ({ resourceId: c.resourceId, amount: Math.ceil(c.amount * 0.6 * mult) }));
}

export function upgradeBuilding(state: GameState, buildingId: string): boolean {
  const instance = state.buildings.find(b => b.id === buildingId);
  const def = BUILDINGS[buildingId];
  if (!instance || !def || instance.level >= def.maxLevel) return false;
  const costs = getBuildingUpgradeCosts(state, buildingId);
  if (!canAfford(state, costs)) return false;
  for (const cost of costs) removeResource(state, cost.resourceId, cost.amount);
  instance.level += 1;
  addLog(state, `${def.name} mejorado a nivel ${instance.level}`);
  return true;
}

export function assignWorker(state: GameState, buildingId: string, delta: number): boolean {
  const instance = state.buildings.find(b => b.id === buildingId);
  const def = BUILDINGS[buildingId];
  if (!instance || !def?.production || !Number.isFinite(delta) || delta === 0) return false;
  if (delta > 0) {
    const max = (def.workersRequired ?? 1) * instance.count;
    if (instance.workersAssigned >= max || getAvailableWorkers(state) < delta) return false;
    instance.workersAssigned = Math.min(max, instance.workersAssigned + Math.floor(delta));
  } else {
    instance.workersAssigned = Math.max(0, instance.workersAssigned + Math.ceil(delta));
  }
  addLog(state, `Personal asignado a ${def.name}: ${instance.workersAssigned}.`);
  return true;
}

export function chooseSpecialization(state: GameState, skillId: SkillId, specialization: 'velocidad' | 'rendimiento'): boolean {
  const skill = state.skills[skillId];
  if (!skill || skill.level < 25 || skill.specialization) return false;
  skill.specialization = specialization;
  addLog(state, `${SKILLS[skillId].name}: especialización elegida: ${specialization === 'velocidad' ? 'Velocidad' : 'Rendimiento'}.`);
  return true;
}

export function setReproduction(state: GameState, enabled: boolean): void {
  state.population.reproductionEnabled = enabled;
  addLog(state, enabled ? 'La reproducción de la comunidad está habilitada.' : 'La reproducción de la comunidad está pausada.');
}

export function researchTech(state: GameState, techId: string): boolean {
  const tech = TECHS[techId];
  if (!tech || isTechUnlocked(state, techId)) return false;
  if (!tech.prerequisites.every(pre => isTechUnlocked(state, pre))) return false;
  if (!canAfford(state, tech.cost) || (state.resources.conocimiento || 0) < tech.knowledgeCost) return false;
  for (const cost of tech.cost) removeResource(state, cost.resourceId, cost.amount);
  removeResource(state, 'conocimiento', tech.knowledgeCost);
  state.unlockedTechs.push(techId);
  for (const message of addXp(state, 'investigacion', tech.knowledgeCost * 2)) addLog(state, message);
  for (const message of addMasteryXp(state, 'investigacion', tech.knowledgeCost * 2)) addLog(state, message);
  addLog(state, `¡Investigación completada: ${tech.name}!`);
  checkObjectives(state);
  return true;
}

export function equipTool(state: GameState, toolId: string): void {
  const tool = TOOLS[toolId];
  if (!tool || !state.ownedTools.includes(toolId)) return;
  state.equippedTools[tool.category] = toolId;
  addLog(state, `Equipaste: ${tool.name}`);
}

function checkObjectives(state: GameState): void {
  for (const obj of OBJECTIVES) {
    if (state.completedObjectives.includes(obj.id)) continue;
    const cond = obj.condition;
    let done = false;
    if (cond.type === 'resource') done = (state.resources[cond.target as ResourceId] || 0) >= cond.amount;
    else if (cond.type === 'skill_level') done = (state.skills[cond.target as SkillId]?.level || 0) >= cond.amount;
    else if (cond.type === 'building') done = (state.buildings.find(b => b.id === cond.target)?.count || 0) >= cond.amount;
    else if (cond.type === 'tech') done = cond.target === 'any'
      ? state.unlockedTechs.length >= cond.amount
      : state.unlockedTechs.includes(cond.target);
    else if (cond.type === 'craft') done = state.ownedTools.length >= cond.amount;
    if (done) {
      state.completedObjectives.push(obj.id);
      addLog(state, `🎯 Objetivo completado: ${obj.name}`);
      if (obj.reward?.knowledge) addResource(state, 'conocimiento', obj.reward.knowledge);
    }
  }
}

export function resetGame(): GameState {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  localStorage.removeItem(PREVIOUS_STORAGE_KEY);
  localStorage.removeItem(OLDEST_STORAGE_KEY);
  return createInitialState();
}
