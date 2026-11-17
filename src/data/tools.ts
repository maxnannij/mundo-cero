export type ToolCategory = 'hacha' | 'pico' | 'lanza' | 'ninguna';

export interface ToolDef {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  tier: number;
  craftRecipeId?: string;
  bonuses: {
    speedMult?: number;
    yieldMult?: number;
    specialChance?: number;
  };
  icon: string;
}

export const TOOLS: Record<string, ToolDef> = {
  lanza_madera: { id: 'lanza_madera', name: 'Lanza de madera', description: 'Una lanza sencilla, endurecida al fuego y con punta afilada.', category: 'lanza', tier: 0, bonuses: { speedMult: 0.9, yieldMult: 1.1, specialChance: 0.05 }, icon: '🗡️' },
  lanza_piedra: { id: 'lanza_piedra', name: 'Lanza de piedra', description: 'Lanza reforzada con una punta de piedra tallada.', category: 'lanza', tier: 1, bonuses: { speedMult: 0.75, yieldMult: 1.25, specialChance: 0.12 }, icon: '🗡️' },
  hacha_rudimentaria: {
    id: 'hacha_rudimentaria',
    name: 'Hacha rudimentaria',
    description: 'Una rama afilada con piedra. Mejor que las manos desnudas.',
    category: 'hacha',
    tier: 0,
    bonuses: { speedMult: 0.9, yieldMult: 1.05 },
    icon: '🪓',
  },
  hacha_piedra: {
    id: 'hacha_piedra',
    name: 'Hacha de piedra',
    description: 'Hacha con cabeza de piedra atada. Más eficiente.',
    category: 'hacha',
    tier: 1,
    bonuses: { speedMult: 0.75, yieldMult: 1.15 },
    icon: '🪓',
  },
  hacha_cobre: {
    id: 'hacha_cobre',
    name: 'Hacha de cobre',
    description: 'Herramienta metálica. Claramente superior.',
    category: 'hacha',
    tier: 2,
    bonuses: { speedMult: 0.6, yieldMult: 1.3 },
    icon: '🪓',
  },
  pico_rudimentario: {
    id: 'pico_rudimentario',
    name: 'Pico rudimentario',
    description: 'Palo con piedra puntiaguda.',
    category: 'pico',
    tier: 0,
    bonuses: { speedMult: 0.9, yieldMult: 1.05 },
    icon: '⛏️',
  },
  pico_piedra: {
    id: 'pico_piedra',
    name: 'Pico de piedra',
    description: 'Pico con cabeza de piedra resistente.',
    category: 'pico',
    tier: 1,
    bonuses: { speedMult: 0.75, yieldMult: 1.15 },
    icon: '⛏️',
  },
  pico_cobre: {
    id: 'pico_cobre',
    name: 'Pico de cobre',
    description: 'Pico metálico para minerales más duros.',
    category: 'pico',
    tier: 2,
    bonuses: { speedMult: 0.6, yieldMult: 1.3 },
    icon: '⛏️',
  },
};

export const TOOL_LIST = Object.values(TOOLS);
