import type { ResourceId } from './resources';
import type { SkillId } from './skills';

export interface RecipeDef {
  id: string;
  name: string;
  description: string;
  skillId: SkillId;
  requiredLevel: number;
  requiredTech?: string;
  requiredBuilding?: string;
  durationMs: number;
  xp: number;
  inputs: { resourceId: ResourceId; amount: number }[];
  outputs: { resourceId: ResourceId | 'tool' | 'clothing'; amount: number; toolId?: string; clothingId?: string }[];
  category: 'herramienta' | 'componente' | 'alimento' | 'material' | 'otro';
}

export const RECIPES: Record<string, RecipeDef> = {
  lanza_madera: { id: 'lanza_madera', name: 'Lanza de madera', description: 'Fabricar una lanza sencilla para la caza.', skillId: 'artesania', requiredLevel: 1, requiredTech: 'caza_primitiva', requiredBuilding: 'taller', durationMs: 7000, xp: 18, inputs: [{ resourceId: 'madera', amount: 3 }, { resourceId: 'pedernal', amount: 1 }, { resourceId: 'fibra', amount: 2 }], outputs: [{ resourceId: 'tool', amount: 1, toolId: 'lanza_madera' }], category: 'herramienta' },
  lanza_piedra: { id: 'lanza_piedra', name: 'Lanza de piedra', description: 'Una lanza con punta de piedra tallada.', skillId: 'artesania', requiredLevel: 5, requiredTech: 'caza_primitiva', requiredBuilding: 'taller', durationMs: 11000, xp: 32, inputs: [{ resourceId: 'madera', amount: 3 }, { resourceId: 'pedernal', amount: 3 }, { resourceId: 'cuerda', amount: 2 }], outputs: [{ resourceId: 'tool', amount: 1, toolId: 'lanza_piedra' }], category: 'herramienta' },
  abrigo_piel: { id: 'abrigo_piel', name: 'Abrigo de piel', description: 'Curtir y coser pieles para confeccionar ropa de abrigo.', skillId: 'artesania', requiredLevel: 3, requiredTech: 'caza_primitiva', durationMs: 10000, xp: 25, inputs: [{ resourceId: 'piel_animal', amount: 4 }, { resourceId: 'fibra', amount: 3 }], outputs: [{ resourceId: 'clothing', amount: 1, clothingId: 'abrigo_piel' }], category: 'otro' },
  comida_caza: { id: 'comida_caza', name: 'Carne cocinada', description: 'Asar carne de caza. Cada porción alimenta a una persona durante medio día.', skillId: 'cocina', requiredLevel: 1, requiredTech: 'caza_primitiva', requiredBuilding: 'fogata', durationMs: 6000, xp: 16, inputs: [{ resourceId: 'carne_cruda', amount: 2 }], outputs: [{ resourceId: 'carne_cocinada', amount: 2 }], category: 'alimento' },
  plato_completo: { id: 'plato_completo', name: 'Plato completo: carne y bayas', description: 'Combinar una porción de carne asada con bayas frescas. Aporta una ración diaria completa.', skillId: 'cocina', requiredLevel: 2, requiredTech: 'caza_primitiva', requiredBuilding: 'fogata', durationMs: 9000, xp: 24, inputs: [{ resourceId: 'carne_cocinada', amount: 1 }, { resourceId: 'bayas', amount: 10 }], outputs: [{ resourceId: 'plato_completo', amount: 1 }], category: 'alimento' },
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
    requiredBuilding: 'taller',
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
    requiredBuilding: 'taller',
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
    requiredBuilding: 'taller',
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
    requiredBuilding: 'taller',
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
    requiredBuilding: 'fogata',
    skillId: 'artesania',
    requiredLevel: 3,
    requiredTech: 'control_fuego',
    durationMs: 8000,
    xp: 18,
    inputs: [{ resourceId: 'madera', amount: 4 }],
    outputs: [{ resourceId: 'carbon_vegetal', amount: 2 }],
    category: 'material',
  },
  tabla: {
    id: 'tabla',
    name: 'Tablas de madera',
    description: 'Procesar troncos en tablas para estructuras y componentes.',
    skillId: 'carpinteria',
    requiredLevel: 1,
    requiredBuilding: 'aserradero',
    durationMs: 6000,
    xp: 15,
    inputs: [{ resourceId: 'madera', amount: 3 }],
    outputs: [{ resourceId: 'tabla', amount: 2 }],
    category: 'material',
  },
  fundir_cobre: {
    id: 'fundir_cobre',
    name: 'Lingote de cobre',
    description: 'Fundir mineral de cobre con carbón vegetal.',
    skillId: 'metalurgia',
    requiredLevel: 1,
    requiredTech: 'metalurgia_basica',
    requiredBuilding: 'horno',
    durationMs: 12000,
    xp: 30,
    inputs: [{ resourceId: 'mineral_cobre', amount: 2 }, { resourceId: 'carbon_vegetal', amount: 1 }],
    outputs: [{ resourceId: 'lingote_cobre', amount: 1 }],
    category: 'material',
  },
  fundir_hierro: {
    id: 'fundir_hierro',
    name: 'Lingote de hierro',
    description: 'Refinar mineral de hierro en un horno avanzado.',
    skillId: 'metalurgia',
    requiredLevel: 15,
    requiredTech: 'metalurgia_basica',
    requiredBuilding: 'horno',
    durationMs: 18000,
    xp: 45,
    inputs: [{ resourceId: 'mineral_hierro', amount: 3 }, { resourceId: 'carbon_vegetal', amount: 2 }],
    outputs: [{ resourceId: 'lingote_hierro', amount: 1 }],
    category: 'material',
  },
  comida_bayas: {
    id: 'comida_bayas',
    name: 'Bayas cocidas',
    description: 'Cocinar bayas para mejorar su valor nutricional.',
    requiredBuilding: 'fogata',
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
