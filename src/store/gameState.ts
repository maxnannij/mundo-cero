import { RESOURCES, type ResourceId } from '../data/resources';
import { SKILLS, type SkillId, xpForLevel } from '../data/skills';
import { TOOLS } from '../data/tools';
import { BUILDINGS } from '../data/buildings';
import { getCalendarInfo, DAYS_PER_YEAR, type CalendarState, seasonMultiplier } from '../data/calendar';

export interface SkillState { level: number; xp: number; masteryLevel: number; masteryXp: number; specialization?: 'velocidad' | 'rendimiento'; }
export interface BuildingInstance { id: string; level: number; count: number; workersAssigned: number; }
export interface ActiveActivity { id: string; skillId: SkillId; activityId: string; startTime: number; progressMs: number; targetAmount?: number; actionsDone: number; }
export interface CraftQueueItem { recipeId: string; remaining: number; progressMs: number; startTime: number; automationOrderId?: string; }
export interface ResidentEquipment { tool?: string; clothing?: string; weapon?: string; accessory?: string; }
export interface Resident {
  id: string; name: string; sex: 'hombre' | 'mujer'; ageDays: number; health: number;
  equipment?: ResidentEquipment;
  hungerDays: number; coldDays: number; partnerId?: string; parents?: string[];
  lifeExpectancyYears: number;
  pregnancyDaysRemaining?: number; conceptionProgressDays?: number; childrenBorn?: number;
}
export interface PopulationState { residents: Resident[]; nextResidentId: number; births: number; reproductionEnabled: boolean; }
export type AutomationMode = 'continuo' | 'mantener';
export interface AutomationOrder {
  id: string; recipeId: string; buildingId: string; mode: AutomationMode;
  targetAmount: number; enabled: boolean; priority: number;
}
export interface GameState {
  version: number; lastSave: number; lastTick: number; resources: Record<ResourceId, number>;
  maxStorage: number; skills: Record<SkillId, SkillState>; unlockedTechs: string[];
  buildings: BuildingInstance[]; equippedTools: Record<string, string>; ownedTools: string[]; toolInventory: Record<string, number>;
  activeActivities: ActiveActivity[]; craftQueue: CraftQueueItem[]; automationOrders: AutomationOrder[];
  completedObjectives: string[]; totalActions: Record<string, number>; log: { time: number; message: string }[];
  calendar: CalendarState; population: PopulationState; settings: { offlineCapHours: number };
}
export const SAVE_VERSION = 5;
export const STORAGE_KEY = 'mundo-cero-save-v5';
export const LEGACY_STORAGE_KEY = 'mundo-cero-save-v4';
export const PREVIOUS_STORAGE_KEY = 'mundo-cero-save-v3';
export const OLDEST_STORAGE_KEY = 'mundo-cero-save-v2';
export const ANCIENT_STORAGE_KEY = 'mundo-cero-save-v1';
export const ADULT_AGE_DAYS = 18 * DAYS_PER_YEAR;
export const MAX_POPULATION = 30;

// Distribución triangular centrada en 90 años: longevidad individual entre 70 y 110.
export function generateLifeExpectancyYears(): number {
  const sample = Math.random() + Math.random() + Math.random() + Math.random();
  return Math.round((70 + sample * 10) * 10) / 10;
}

export function createInitialPopulation(): PopulationState {
  return {
    residents: [
      { id: 'resident-1', name: 'Aren', sex: 'hombre', ageDays: 25 * DAYS_PER_YEAR, health: 100, hungerDays: 0, coldDays: 0, partnerId: 'resident-2', lifeExpectancyYears: generateLifeExpectancyYears(), equipment: {} },
      { id: 'resident-2', name: 'Lira', sex: 'mujer', ageDays: 24 * DAYS_PER_YEAR, health: 100, hungerDays: 0, coldDays: 0, partnerId: 'resident-1', lifeExpectancyYears: generateLifeExpectancyYears(), pregnancyDaysRemaining: 0, conceptionProgressDays: 0, childrenBorn: 0, equipment: {} },
    ],
    nextResidentId: 3, births: 0, reproductionEnabled: true,
  };
}

export function createInitialState(): GameState {
  const resources = {} as Record<ResourceId, number>;
  for (const r of Object.keys(RESOURCES) as ResourceId[]) resources[r] = 0;
  resources.bayas = 40;
  const skills = {} as Record<SkillId, SkillState>;
  for (const s of Object.keys(SKILLS) as SkillId[]) skills[s] = { level: 1, xp: 0, masteryLevel: 0, masteryXp: 0 };
  return {
    version: SAVE_VERSION, lastSave: Date.now(), lastTick: Date.now(), resources, maxStorage: 200,
    skills, unlockedTechs: [], buildings: [], equippedTools: {}, ownedTools: [], toolInventory: {},
    activeActivities: [], craftQueue: [], automationOrders: [], completedObjectives: [], totalActions: {},
    log: [{ time: Date.now(), message: 'Despertás en un mundo de piedra y silencio. Aren y Lira son los primeros habitantes de este asentamiento. La civilización se ha perdido: es hora de reconstruirla.' }],
    calendar: { totalDays: 0, dayProgressMs: 0 }, population: createInitialPopulation(),
    settings: { offlineCapHours: 8 },
  };
}
export function getResource(state: GameState, id: ResourceId): number { return state.resources[id] ?? 0; }
export function canAfford(state: GameState, costs: { resourceId: ResourceId; amount: number }[]): boolean {
  return costs.every(c => getResource(state, c.resourceId) + 1e-9 >= c.amount);
}
export function addResource(state: GameState, id: ResourceId, amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) return;
  state.resources[id] = Math.min((state.resources[id] ?? 0) + amount, getMaxStorage(state));
}
export function removeResource(state: GameState, id: ResourceId, amount: number): boolean {
  if (!Number.isFinite(amount) || amount < 0) return false;
  const current = state.resources[id] ?? 0;
  if (current + 1e-9 < amount) return false;
  state.resources[id] = Math.max(0, current - amount);
  return true;
}
export function getMaxStorage(state: GameState, _id?: ResourceId): number {
  return state.maxStorage + state.buildings.reduce((sum, b) => sum + (BUILDINGS[b.id]?.storageBonus ?? 0) * b.count * b.level, 0);
}
export function addXp(state: GameState, skillId: SkillId, amount: number): string[] {
  const messages: string[] = [];
  const skill = state.skills[skillId];
  if (!skill || !Number.isFinite(amount) || amount <= 0) return messages;
  skill.xp += amount;
  while (skill.level < 99 && skill.xp >= xpForLevel(skill.level)) {
    skill.xp -= xpForLevel(skill.level); skill.level += 1;
    messages.push(`${SKILLS[skillId].name} ha subido al nivel ${skill.level}.`);
  }
  return messages;
}
export function masteryXpForNext(level: number): number { return 500 + level * 250; }
export function addMasteryXp(state: GameState, skillId: SkillId, amount: number): string[] {
  const skill = state.skills[skillId];
  const messages: string[] = [];
  if (!skill || amount <= 0) return messages;
  skill.masteryXp += amount;
  while (skill.masteryLevel < 20 && skill.masteryXp >= masteryXpForNext(skill.masteryLevel)) {
    skill.masteryXp -= masteryXpForNext(skill.masteryLevel);
    skill.masteryLevel += 1;
    messages.push(`${SKILLS[skillId].name}: maestría nivel ${skill.masteryLevel}.`);
  }
  return messages;
}
export function getSkillBonuses(state: GameState, skillId: SkillId) {
  const skill = state.skills[skillId];
  const level = skill?.level || 1;
  const mastery = skill?.masteryLevel || 0;
  let speedMult = level >= 20 ? 0.95 : 1;
  let yieldMult = 1 + mastery * 0.015 + (level >= 10 ? 0.05 : 0) + (level >= 40 ? 0.05 : 0);
  if (skill?.specialization === 'velocidad') speedMult *= 0.85;
  if (skill?.specialization === 'rendimiento') yieldMult *= 1.2;
  return { speedMult, yieldMult };
}
export function isTechUnlocked(state: GameState, techId: string): boolean { return state.unlockedTechs.includes(techId); }
export function hasBuilding(state: GameState, buildingId: string, minCount = 1): boolean {
  const b = state.buildings.find(x => x.id === buildingId); return !!b && b.count >= minCount;
}
export function getEquippedTool(state: GameState, category: string): string | null { return state.equippedTools[category] || null; }
export function getToolBonuses(state: GameState, category: string) {
  const toolId = getEquippedTool(state, category);
  if (!toolId || !TOOLS[toolId]) return { speedMult: 1, yieldMult: 1, specialChance: 0 };
  return { speedMult: TOOLS[toolId].bonuses.speedMult ?? 1, yieldMult: TOOLS[toolId].bonuses.yieldMult ?? 1, specialChance: TOOLS[toolId].bonuses.specialChance ?? 0 };
}
export function getAssignedWorkers(state: GameState): number {
  return state.buildings.reduce((sum, b) => sum + Math.max(0, b.workersAssigned || 0), 0);
}
export function getAvailableWorkers(state: GameState): number {
  const adults = state.population.residents.filter(r => r.ageDays >= ADULT_AGE_DAYS && r.health > 0).length;
  return Math.max(0, adults - getAssignedWorkers(state) - state.activeActivities.length);
}
export function calculatePassiveProduction(state: GameState, deltaMs: number): Record<ResourceId, number> {
  const produced: Partial<Record<ResourceId, number>> = {};
  const minutes = Math.max(0, deltaMs) / 60000;
  const season = getCalendarInfo(state.calendar).season;
  const populationHealth = state.population.residents.length
    ? state.population.residents.reduce((sum, r) => sum + r.health, 0) / (state.population.residents.length * 100)
    : 0;
  const healthFactor = 0.5 + Math.max(0, Math.min(1, populationHealth)) * 0.5;
  for (const b of state.buildings) {
    const def = BUILDINGS[b.id];
    if (!def?.production || b.count <= 0) continue;
    const levelMult = 1 + (b.level - 1) * 0.35;
    const requiredWorkers = (def.workersRequired ?? 1) * b.count;
    const workerRatio = requiredWorkers > 0 ? Math.min(1, (b.workersAssigned || 0) / requiredWorkers) : 1;
    for (const prod of def.production) {
      const seasonal = seasonMultiplier(season, prod.seasonMultipliers);
      const amount = prod.amountPerMinute * b.count * levelMult * workerRatio * healthFactor * seasonal * minutes;
      produced[prod.resourceId] = (produced[prod.resourceId] || 0) + amount;
    }
  }
  return produced as Record<ResourceId, number>;
}
export function addLog(state: GameState, message: string): void {
  state.log.unshift({ time: Date.now(), message });
  if (state.log.length > 80) state.log.length = 80;
}
