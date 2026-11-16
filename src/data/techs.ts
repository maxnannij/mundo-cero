import type { ResourceId } from './resources';

export interface TechDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: { resourceId: ResourceId; amount: number }[];
  knowledgeCost: number;
  prerequisites: string[];
  unlocks: string[];
  era: number;
}

export const TECHS: Record<string, TechDef> = {
  control_fuego: {
    id: 'control_fuego',
    name: 'Control del fuego',
    description: 'Aprender a encender y mantener fuego de forma controlada. El primer gran salto de la humanidad.',
    icon: '🔥',
    cost: [{ resourceId: 'madera', amount: 20 }, { resourceId: 'piedra', amount: 5 }],
    knowledgeCost: 5,
    prerequisites: [],
    unlocks: ['fogata', 'comida_bayas', 'carbon_vegetal', 'cocina'],
    era: 1,
  },
  herramientas_piedra: {
    id: 'herramientas_piedra',
    name: 'Herramientas de piedra',
    description: 'Técnicas para crear herramientas de piedra más eficaces.',
    icon: '🪨',
    cost: [{ resourceId: 'piedra', amount: 25 }, { resourceId: 'pedernal', amount: 5 }, { resourceId: 'cuerda', amount: 3 }],
    knowledgeCost: 8,
    prerequisites: [],
    unlocks: ['hacha_piedra', 'pico_piedra'],
    era: 1,
  },
  procesamiento_fibras: {
    id: 'procesamiento_fibras',
    name: 'Procesamiento de fibras',
    description: 'Técnicas para transformar fibras en cuerdas y materiales textiles básicos.',
    icon: '🧵',
    cost: [{ resourceId: 'fibra', amount: 30 }],
    knowledgeCost: 6,
    prerequisites: [],
    unlocks: ['cuerda'],
    era: 1,
  },
  construccion_primitiva: {
    id: 'construccion_primitiva',
    name: 'Construcción primitiva',
    description: 'Principios básicos de construcción de estructuras estables.',
    icon: '🏠',
    cost: [{ resourceId: 'madera', amount: 40 }, { resourceId: 'piedra', amount: 20 }],
    knowledgeCost: 10,
    prerequisites: ['control_fuego'],
    unlocks: ['refugio', 'taller'],
    era: 1,
  },
  aserradero: {
    id: 'aserradero',
    name: 'Aserradero',
    description: 'Diseño de una instalación que produce madera de forma continua.',
    icon: '🪚',
    cost: [{ resourceId: 'madera', amount: 60 }, { resourceId: 'piedra', amount: 30 }, { resourceId: 'cuerda', amount: 10 }],
    knowledgeCost: 15,
    prerequisites: ['construccion_primitiva', 'herramientas_piedra'],
    unlocks: ['aserradero'],
    era: 2,
  },
  cantera: {
    id: 'cantera',
    name: 'Cantera',
    description: 'Métodos para extraer piedra de forma automatizada.',
    icon: '⛏️',
    cost: [{ resourceId: 'piedra', amount: 50 }, { resourceId: 'madera', amount: 40 }, { resourceId: 'cuerda', amount: 8 }],
    knowledgeCost: 15,
    prerequisites: ['construccion_primitiva', 'herramientas_piedra'],
    unlocks: ['cantera'],
    era: 2,
  },
  agricultura: {
    id: 'agricultura',
    name: 'Agricultura',
    description: 'Cultivar plantas de forma deliberada en lugar de solo recolectar.',
    icon: '🌾',
    cost: [{ resourceId: 'semillas', amount: 15 }, { resourceId: 'madera', amount: 30 }, { resourceId: 'fibra', amount: 10 }],
    knowledgeCost: 12,
    prerequisites: ['procesamiento_fibras'],
    unlocks: ['huerto'],
    era: 2,
  },
  metalurgia_basica: {
    id: 'metalurgia_basica',
    name: 'Metalurgia básica',
    description: 'Fundir minerales de cobre y comenzar la era de los metales.',
    icon: '🔶',
    cost: [
      { resourceId: 'mineral_cobre', amount: 10 },
      { resourceId: 'carbon_vegetal', amount: 15 },
      { resourceId: 'arcilla', amount: 10 },
    ],
    knowledgeCost: 25,
    prerequisites: ['control_fuego', 'aserradero'],
    unlocks: ['horno', 'metalurgia', 'min_cobre'],
    era: 3,
  },
};

export const TECH_LIST = Object.values(TECHS);
