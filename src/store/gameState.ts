import { RESOURCES, type ResourceId } from '../data/resources';
import { SKILLS, type SkillId, xpForLevel } from '../data/skills';
import { TOOLS } from '../data/tools';
import { RECIPES } from '../data/recipes';
import { BUILDINGS } from '../data/buildings';
import { TECHS } from '../data/techs';
import { OBJECTIVES } from '../data/objectives';

export interface SkillState {
  level: number;
  xp: number;
}

export interface BuildingInstance {
  id: string;
  level: number;
  count: number;
}

export interface ActiveActivity {
  skillId: SkillId;
  activityId: string;
  startTime: number;
  progressMs: number;
  targetAmount?: number;
  actionsDone: number;
}

export interface CraftQueueItem {
  recipeId: string;
  remaining: number;
  progressMs: number;
  startTime: number;
}

export interface GameState {
  version: number;
  lastSave: number;
  lastTick: number;
  resources: Record<ResourceId, number>;
  maxStorage: number;
  skills: Record<SkillId, SkillState>;
  unlockedTechs: string[];
  buildings: BuildingInstance[];
  equippedTools: Record<string, string>;
  ownedTools: string[];
  activeActivity: ActiveActivity | null;
  craftQueue: CraftQueueItem[];
  completedObjectives: string[];
  totalActions: Record<string, number>;
  log: { time: number; message: string }[];
  settings: {
    offlineCapHours: number;
  };
}

export const SAVE_VERSION = 1;

export function createInitialState(): GameState {
  const resources = {} as Record<ResourceId, number>;
  for (const r of Object.keys(RESOURCES) as ResourceId[]) {
    resources[r] = 0;
  }

  const skills = {} as Record<SkillId, SkillState>;
  for (const s of Object.keys(SKILLS) as SkillId[]) {
    skills[s] = { level: 1, xp: 0 };
  }

  return {
    version: SAVE_VERSION,
    lastSave: Date.now(),
    lastTick: Date.now(),
    resources,
    maxStorage: 200,
    skills,
    unlockedTechs: [],
    buildings: [],
    equippedTools: {},
    ownedTools: [],
    activeActivity: null,
    craftQueue: [],
    completedObjectives: [],
    totalActions: {},
    log: [{ time: Date.now(), message: 'Despertás en un mundo de piedra y silencio. La civilización se ha perdido. Es hora de reconstruirla desde cero.' }],
    settings: {
      offlineCapHours: 8,
    },
  };
}

export function getResource(state: GameState, id: ResourceId): number {
  return state.resources[id] ?? 0;
}

export function canAfford(state: GameState, costs: { resourceId: ResourceId; amount: number }[]): boolean {
  return costs.every(c => getResource(state, c.resourceId) >= c.amount);
}

export function addResource(state: GameState, id: ResourceId, amount: number): void {
  if (amount <= 0) return;
  const current = state.resources[id] ?? 0;
  const max = getMaxStorage(state, id);
  state.resources[id] = Math.min(current + amount, max);
}

export function removeResource(state: GameState, id: ResourceId, amount: number): boolean {
  const current = state.resources[id] ?? 0;
  if (current < amount) return false;
  state.resources[id] = current - amount;
  return true;
}

export function getMaxStorage(state: GameState, id?: ResourceId): number {
  let bonus = 0;
  for (const b of state.buildings) {
    const def = BUILDINGS[b.id];
    if (def?.storageBonus) {
      bonus += def.storageBonus * b.count * b.level;
    }
  }
  return state.maxStorage + bonus;
}

export function addXp(state: GameState, skillId: SkillId, amount: number): string[] {
  const messages: string[] = [];
  const skill = state.skills[skillId];
  if (!skill) return messages;
  skill.xp += amount;
  while (skill.level < 99 && skill.xp >= xpForLevel(skill.level)) {
    skill.xp -= xpForLevel(skill.level);
    skill.level += 1;
    messages.push(`${SKILLS[skillId].name} ha subido al nivel ${skill.level}.`);
  }
  return messages;
}

export function isTechUnlocked(state: GameState, techId: string): boolean {
  return state.unlockedTechs.includes(techId);
}

export function hasBuilding(state: GameState, buildingId: string, minCount = 1): boolean {
  const b = state.buildings.find(x => x.id === buildingId);
  return !!b && b.count >= minCount;
}

export function getEquippedTool(state: GameState, category: string): string | null {
  return state.equippedTools[category] || null;
}

export function getToolBonuses(state: GameState, category: string) {
  const toolId = getEquippedTool(state, category);
  if (!toolId || !TOOLS[toolId]) return { speedMult: 1, yieldMult: 1 };
  return TOOLS[toolId].bonuses;
}

export function calculatePassiveProduction(state: GameState, deltaMs: number): Record<ResourceId, number> {
  const produced: Partial<Record<ResourceId, number>> = {};
  const minutes = deltaMs / 60000;

  for (const b of state.buildings) {
    const def = BUILDINGS[b.id];
    if (!def?.production) continue;
    const levelMult = 1 + (b.level - 1) * 0.35;
    for (const prod of def.production) {
      const amount = prod.amountPerMinute * b.count * levelMult * minutes;
      produced[prod.resourceId] = (produced[prod.resourceId] || 0) + amount;
    }
  }
  return produced as Record<ResourceId, number>;
}

export function addLog(state: GameState, message: string): void {
  state.log.unshift({ time: Date.now(), message });
  if (state.log.length > 50) state.log.length = 50;
}
