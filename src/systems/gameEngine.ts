import {
  type GameState,
  createInitialState,
  addResource,
  removeResource,
  addXp,
  addLog,
  getToolBonuses,
  calculatePassiveProduction,
  canAfford,
  isTechUnlocked,
  SAVE_VERSION,
} from '../store/gameState';
import { SKILLS, type SkillId, type ActivityDef } from '../data/skills';
import { RECIPES } from '../data/recipes';
import { BUILDINGS } from '../data/buildings';
import { TECHS } from '../data/techs';
import { OBJECTIVES } from '../data/objectives';
import { TOOLS } from '../data/tools';
import type { ResourceId } from '../data/resources';

const STORAGE_KEY = 'mundo-cero-save-v1';

export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.version !== SAVE_VERSION) {
      console.warn('Save version mismatch');
    }
    const initial = createInitialState();
    for (const k of Object.keys(initial.resources) as ResourceId[]) {
      if (parsed.resources[k] === undefined) parsed.resources[k] = 0;
    }
    for (const k of Object.keys(initial.skills) as SkillId[]) {
      if (!parsed.skills[k]) parsed.skills[k] = { level: 1, xp: 0 };
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load save', e);
    return createInitialState();
  }
}

export function saveGame(state: GameState): void {
  try {
    state.lastSave = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save', e);
  }
}

export function exportSave(state: GameState): string {
  return JSON.stringify(state, null, 2);
}

export function importSave(json: string): GameState | null {
  try {
    const parsed = JSON.parse(json) as GameState;
    if (!parsed.resources || !parsed.skills) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function processOffline(state: GameState): { messages: string[]; produced: Record<string, number> } {
  const now = Date.now();
  const elapsed = now - (state.lastTick || state.lastSave || now);
  const maxMs = state.settings.offlineCapHours * 3600 * 1000;
  const effective = Math.min(elapsed, maxMs);
  if (effective < 1000) {
    state.lastTick = now;
    return { messages: [], produced: {} };
  }

  const messages: string[] = [];
  const hours = (effective / 3600000).toFixed(1);
  messages.push(`Estuviste ausente ${hours} horas.`);

  const produced = calculatePassiveProduction(state, effective);
  let totalProduced = 0;
  for (const [id, amount] of Object.entries(produced)) {
    if (amount > 0.01) {
      const whole = Math.floor(amount);
      if (whole > 0) {
        addResource(state, id as ResourceId, whole);
        messages.push(`+${whole} ${id.replace('_', ' ')}`);
        totalProduced += whole;
      }
    }
  }

  if (state.activeActivity) {
    const act = getActivity(state.activeActivity.skillId, state.activeActivity.activityId);
    if (act) {
      const bonuses = getToolBonuses(state, act.requiredTool || 'ninguna');
      const duration = act.durationMs * (bonuses.speedMult || 1);
      const actionsPossible = Math.floor(effective / duration);
      let actions = Math.min(actionsPossible, 500);
      if (state.activeActivity.targetAmount) {
        actions = Math.min(actions, state.activeActivity.targetAmount - state.activeActivity.actionsDone);
      }
      for (let i = 0; i < actions; i++) {
        completeActivityAction(state, act);
      }
      if (actions > 0) {
        messages.push(`Actividad offline: ${actions} acciones de ${act.name}`);
      }
      if (state.activeActivity.targetAmount && state.activeActivity.actionsDone >= state.activeActivity.targetAmount) {
        state.activeActivity = null;
        messages.push('Objetivo de producción alcanzado. Actividad detenida.');
      }
    }
  }

  if (state.craftQueue.length > 0) {
    let remainingMs = effective;
    while (state.craftQueue.length > 0 && remainingMs > 0) {
      const item = state.craftQueue[0];
      const recipe = RECIPES[item.recipeId];
      if (!recipe) {
        state.craftQueue.shift();
        continue;
      }
      const needed = recipe.durationMs - item.progressMs;
      if (remainingMs >= needed) {
        remainingMs -= needed;
        finishCraft(state, recipe);
        item.remaining -= 1;
        item.progressMs = 0;
        if (item.remaining <= 0) state.craftQueue.shift();
      } else {
        item.progressMs += remainingMs;
        remainingMs = 0;
      }
    }
  }

  state.lastTick = now;
  if (totalProduced > 0 || messages.length > 1) {
    addLog(state, `Progreso offline (${hours}h): ${messages.slice(1).join(' | ') || 'sin producción significativa'}`);
  }
  return { messages, produced };
}

function getActivity(skillId: SkillId, activityId: string): ActivityDef | null {
  const skill = SKILLS[skillId];
  if (!skill) return null;
  return skill.activities.find(a => a.id === activityId) || null;
}

export function startActivity(state: GameState, skillId: SkillId, activityId: string, targetAmount?: number): boolean {
  const act = getActivity(skillId, activityId);
  if (!act) return false;
  if (state.skills[skillId].level < act.requiredLevel) return false;
  if (act.unlockTech && !isTechUnlocked(state, act.unlockTech)) return false;

  state.activeActivity = {
    skillId,
    activityId,
    startTime: Date.now(),
    progressMs: 0,
    targetAmount,
    actionsDone: 0,
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

function completeActivityAction(state: GameState, act: ActivityDef): void {
  const bonuses = getToolBonuses(state, act.requiredTool || 'ninguna');
  const yieldMult = bonuses.yieldMult || 1;

  for (const out of act.outputs) {
    const chance = out.chance ?? 1;
    if (Math.random() <= chance) {
      const amount = Math.max(1, Math.floor(out.amount * yieldMult));
      addResource(state, out.resourceId, amount);
    }
  }
  const msgs = addXp(state, act.skillId, act.xp);
  for (const m of msgs) addLog(state, m);

  if (state.activeActivity) {
    state.activeActivity.actionsDone += 1;
    state.totalActions[act.id] = (state.totalActions[act.id] || 0) + 1;
  }
  checkObjectives(state);
}

export function tick(state: GameState, deltaMs: number): void {
  const produced = calculatePassiveProduction(state, deltaMs);
  for (const [id, amount] of Object.entries(produced)) {
    if (amount >= 1) {
      const whole = Math.floor(amount);
      addResource(state, id as ResourceId, whole);
    }
  }

  if (state.activeActivity) {
    const act = getActivity(state.activeActivity.skillId, state.activeActivity.activityId);
    if (!act) {
      state.activeActivity = null;
      return;
    }
    const bonuses = getToolBonuses(state, act.requiredTool || 'ninguna');
    const duration = act.durationMs * (bonuses.speedMult || 1);
    state.activeActivity.progressMs += deltaMs;

    while (state.activeActivity.progressMs >= duration) {
      state.activeActivity.progressMs -= duration;
      completeActivityAction(state, act);

      if (state.activeActivity.targetAmount && state.activeActivity.actionsDone >= state.activeActivity.targetAmount) {
        addLog(state, `Objetivo alcanzado (${state.activeActivity.targetAmount}). Actividad detenida.`);
        state.activeActivity = null;
        break;
      }
    }
  }

  if (state.craftQueue.length > 0) {
    const item = state.craftQueue[0];
    const recipe = RECIPES[item.recipeId];
    if (!recipe) {
      state.craftQueue.shift();
    } else {
      item.progressMs += deltaMs;
      if (item.progressMs >= recipe.durationMs) {
        item.progressMs = 0;
        finishCraft(state, recipe);
        item.remaining -= 1;
        if (item.remaining <= 0) {
          state.craftQueue.shift();
          addLog(state, `Cola de fabricación: ${recipe.name} completada.`);
        }
      }
    }
  }

  state.lastTick = Date.now();
}

function finishCraft(state: GameState, recipe: typeof RECIPES[string]): void {
  for (const out of recipe.outputs) {
    if (out.resourceId === 'tool' && out.toolId) {
      if (!state.ownedTools.includes(out.toolId)) {
        state.ownedTools.push(out.toolId);
        addLog(state, `¡Fabricaste ${TOOLS[out.toolId]?.name || out.toolId}!`);
      }
    } else {
      addResource(state, out.resourceId as ResourceId, out.amount);
    }
  }
  const msgs = addXp(state, recipe.skillId, recipe.xp);
  for (const m of msgs) addLog(state, m);
  checkObjectives(state);
}

export function queueCraft(state: GameState, recipeId: string, quantity: number): boolean {
  const recipe = RECIPES[recipeId];
  if (!recipe) return false;
  if (state.skills[recipe.skillId].level < recipe.requiredLevel) return false;
  if (recipe.requiredTech && !isTechUnlocked(state, recipe.requiredTech)) return false;

  for (let i = 0; i < quantity; i++) {
    if (!canAfford(state, recipe.inputs)) {
      if (i === 0) return false;
      quantity = i;
      break;
    }
    for (const inp of recipe.inputs) {
      removeResource(state, inp.resourceId, inp.amount);
    }
  }
  if (quantity <= 0) return false;

  state.craftQueue.push({
    recipeId,
    remaining: quantity,
    progressMs: 0,
    startTime: Date.now(),
  });
  addLog(state, `Añadido a cola: ${recipe.name} x${quantity}`);
  return true;
}

export function buildBuilding(state: GameState, buildingId: string): boolean {
  const def = BUILDINGS[buildingId];
  if (!def) return false;
  if (def.requiredTech && !isTechUnlocked(state, def.requiredTech)) return false;

  const existing = state.buildings.find(b => b.id === buildingId);
  const currentCount = existing?.count || 0;
  if (currentCount >= def.maxCount) return false;

  const costMult = Math.pow(def.costScale, currentCount);
  const costs = def.baseCost.map(c => ({
    resourceId: c.resourceId,
    amount: Math.ceil(c.amount * costMult),
  }));
  if (!canAfford(state, costs)) return false;

  for (const c of costs) removeResource(state, c.resourceId, c.amount);

  if (existing) {
    existing.count += 1;
  } else {
    state.buildings.push({ id: buildingId, level: 1, count: 1 });
  }
  addLog(state, `Construiste: ${def.name}`);
  checkObjectives(state);
  return true;
}

export function upgradeBuilding(state: GameState, buildingId: string): boolean {
  const instance = state.buildings.find(b => b.id === buildingId);
  const def = BUILDINGS[buildingId];
  if (!instance || !def || instance.level >= def.maxLevel) return false;

  const costMult = Math.pow(def.upgradeCostMult, instance.level);
  const costs = def.baseCost.map(c => ({
    resourceId: c.resourceId,
    amount: Math.ceil(c.amount * 0.6 * costMult),
  }));
  if (!canAfford(state, costs)) return false;
  for (const c of costs) removeResource(state, c.resourceId, c.amount);
  instance.level += 1;
  addLog(state, `${def.name} mejorado a nivel ${instance.level}`);
  return true;
}

export function researchTech(state: GameState, techId: string): boolean {
  const tech = TECHS[techId];
  if (!tech) return false;
  if (isTechUnlocked(state, techId)) return false;
  for (const pre of tech.prerequisites) {
    if (!isTechUnlocked(state, pre)) return false;
  }
  if (!canAfford(state, tech.cost)) return false;
  if ((state.resources.conocimiento || 0) < tech.knowledgeCost) return false;

  for (const c of tech.cost) removeResource(state, c.resourceId, c.amount);
  removeResource(state, 'conocimiento', tech.knowledgeCost);

  state.unlockedTechs.push(techId);
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
    let done = false;
    const cond = obj.condition;
    if (cond.type === 'resource') {
      done = (state.resources[cond.target as ResourceId] || 0) >= cond.amount;
    } else if (cond.type === 'skill_level') {
      done = (state.skills[cond.target as SkillId]?.level || 0) >= cond.amount;
    } else if (cond.type === 'building') {
      done = (state.buildings.find(b => b.id === cond.target)?.count || 0) >= cond.amount;
    } else if (cond.type === 'tech') {
      if (cond.target === 'any') {
        done = state.unlockedTechs.length >= cond.amount;
      } else {
        done = state.unlockedTechs.includes(cond.target);
      }
    } else if (cond.type === 'craft') {
      done = state.ownedTools.length >= cond.amount;
    }
    if (done) {
      state.completedObjectives.push(obj.id);
      addLog(state, `🎯 Objetivo completado: ${obj.name}`);
      if (obj.reward?.knowledge) {
        addResource(state, 'conocimiento', obj.reward.knowledge);
      }
    }
  }
}

export function resetGame(): GameState {
  localStorage.removeItem(STORAGE_KEY);
  return createInitialState();
}
