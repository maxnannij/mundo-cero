import type { ResourceId } from './resources';
import type { SkillId } from './skills';

export interface RecipeDef {
  id: string;
  name: string;
  description: string;
  skillId: SkillId;
  requiredLevel: number;
  requiredTech?: string;
  durationMs: number;
  xp: number;
  inputs: { resourceId: ResourceId; amount: number }[];
  outputs: { resourceId: ResourceId | 'tool'; amount: number; toolId?: string }[];
  category: 'herramienta' | 'componente' | 'alimento' | 'material' | 'otro';
}

export const RECIPES: Record<string, RecipeDef> = {
  cuerda: {
    id: 'cuerda',
    name: 'Cuerda',
    description: 'Trenzar fibras para crear cuerda resistente.',
    skillId: 'artesania',
    requiredLevel: 1,
    durationMs: 4000,
    xp: 10,
    inputs: [{ resourceId: 'fibra', amount: 5 }],
    outputs: [{ resourceId: 'cuerda', amount: 1 }],
    category: 'componente',
  },
  hacha_rudimentaria: {
    id: 'hacha_rudimentaria',
    name: 'Hacha rudimentaria',
    description: 'Una herramienta básica de madera y piedra.',
    skillId: 'artesania',
    requiredLevel: 1,
    durationMs: 6000,
    xp: 15,
    inputs: [
      { resourceId: 'madera', amount: 2 },
      { resourceId: 'piedra', amount: 2 },
      { resourceId: 'fibra', amount: 1 },
    ],
    outputs: [{ resourceId: 'tool', amount: 1, toolId: 'hacha_rudimentaria' }],
    category: 'herramienta',
  },
  pico_rudimentario: {
    id: 'pico_rudimentario',
    name: 'Pico rudimentario',
    description: 'Herramienta básica para minería.',
    skillId: 'artesania',
    requiredLevel: 1,
    durationMs: 6000,
    xp: 15,
    inputs: [
      { resourceId: 'madera', amount: 2 },
      { resourceId: 'piedra', amount: 3 },
      { resourceId: 'fibra', amount: 1 },
    ],
    outputs: [{ resourceId: 'tool', amount: 1, toolId: 'pico_rudimentario' }],
    category: 'herramienta',
  },
  hacha_piedra: {
    id: 'hacha_piedra',
    name: 'Hacha de piedra',
    description: 'Mejor hacha con cabeza de piedra bien atada.',
    skillId: 'artesania',
    requiredLevel: 5,
    requiredTech: 'herramientas_piedra',
    durationMs: 10000,
    xp: 30,
    inputs: [
      { resourceId: 'madera', amount: 3 },
      { resourceId: 'piedra', amount: 5 },
      { resourceId: 'cuerda', amount: 2 },
      { resourceId: 'pedernal', amount: 1 },
    ],
    outputs: [{ resourceId: 'tool', amount: 1, toolId: 'hacha_piedra' }],
    category: 'herramienta',
  },
  pico_piedra: {
    id: 'pico_piedra',
    name: 'Pico de piedra',
    description: 'Pico mejorado para extraer minerales.',
    skillId: 'artesania',
    requiredLevel: 5,
    requiredTech: 'herramientas_piedra',
    durationMs: 10000,
    xp: 30,
    inputs: [
      { resourceId: 'madera', amount: 3 },
      { resourceId: 'piedra', amount: 6 },
      { resourceId: 'cuerda', amount: 2 },
      { resourceId: 'pedernal', amount: 1 },
    ],
    outputs: [{ resourceId: 'tool', amount: 1, toolId: 'pico_piedra' }],
    category: 'herramienta',
  },
  carbon_vegetal: {
    id: 'carbon_vegetal',
    name: 'Carbón vegetal',
    description: 'Quemar madera en condiciones controladas.',
    skillId: 'artesania',
    requiredLevel: 3,
    requiredTech: 'control_fuego',
    durationMs: 8000,
    xp: 18,
    inputs: [{ resourceId: 'madera', amount: 4 }],
    outputs: [{ resourceId: 'carbon_vegetal', amount: 2 }],
    category: 'material',
  },
  comida_bayas: {
    id: 'comida_bayas',
    name: 'Bayas cocidas',
    description: 'Cocinar bayas para mejorar su valor nutricional.',
    skillId: 'cocina',
    requiredLevel: 1,
    requiredTech: 'control_fuego',
    durationMs: 5000,
    xp: 12,
    inputs: [{ resourceId: 'bayas', amount: 3 }],
    outputs: [{ resourceId: 'comida_cocida', amount: 2 }],
    category: 'alimento',
  },
};

export const RECIPE_LIST = Object.values(RECIPES);
