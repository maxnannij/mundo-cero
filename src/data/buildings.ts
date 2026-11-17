import type { ResourceId } from './resources';
import type { SeasonId } from './calendar';

export interface BuildingDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxCount: number;
  baseCost: { resourceId: ResourceId; amount: number }[];
  costScale: number;
  requiredTech?: string;
  workersRequired?: number;
  production?: {
    resourceId: ResourceId;
    amountPerMinute: number;
    seasonMultipliers?: Partial<Record<SeasonId, number>>;
  }[];
  storageBonus?: number;
  effects?: string[];
  upgradeCostMult: number;
  maxLevel: number;
}

export const BUILDINGS: Record<string, BuildingDef> = {
  refugio: {
    id: 'refugio',
    name: 'Refugio',
    description: 'Un refugio básico que protege y aumenta el almacenamiento.',
    icon: '🏠',
    maxCount: 3,
    baseCost: [
      { resourceId: 'madera', amount: 30 },
      { resourceId: 'piedra', amount: 15 },
      { resourceId: 'fibra', amount: 10 },
    ],
    costScale: 1.6,
    storageBonus: 100,
    upgradeCostMult: 1.8,
    maxLevel: 5,
  },
  fogata: {
    id: 'fogata',
    name: 'Fogata',
    description: 'Fuego controlado. Permite cocinar e investigar el fuego.',
    icon: '🔥',
    maxCount: 1,
    baseCost: [
      { resourceId: 'madera', amount: 15 },
      { resourceId: 'piedra', amount: 10 },
    ],
    costScale: 1,
    requiredTech: 'control_fuego',
    effects: ['Permite cocina básica', 'Desbloquea investigaciones de fuego'],
    upgradeCostMult: 2,
    maxLevel: 3,
  },
  taller: {
    id: 'taller',
    name: 'Taller',
    description: 'Espacio dedicado a la fabricación de herramientas y objetos.',
    icon: '🔧',
    maxCount: 2,
    baseCost: [
      { resourceId: 'madera', amount: 40 },
      { resourceId: 'piedra', amount: 25 },
      { resourceId: 'cuerda', amount: 5 },
    ],
    costScale: 1.7,
    requiredTech: 'construccion_primitiva',
    effects: ['Acelera fabricación un 10% por nivel'],
    upgradeCostMult: 1.9,
    maxLevel: 5,
  },
  aserradero: {
    id: 'aserradero',
    name: 'Aserradero',
    description: 'Produce madera de forma automática.',
    icon: '🪚',
    maxCount: 4,
    baseCost: [
      { resourceId: 'madera', amount: 50 },
      { resourceId: 'piedra', amount: 30 },
      { resourceId: 'cuerda', amount: 8 },
    ],
    costScale: 1.65,
    requiredTech: 'aserradero',
    workersRequired: 1,
    production: [{ resourceId: 'madera', amountPerMinute: 2 }],
    upgradeCostMult: 1.85,
    maxLevel: 8,
  },
  cantera: {
    id: 'cantera',
    name: 'Cantera',
    description: 'Extrae piedra de forma pasiva.',
    icon: '⛏️',
    maxCount: 4,
    baseCost: [
      { resourceId: 'madera', amount: 40 },
      { resourceId: 'piedra', amount: 40 },
      { resourceId: 'cuerda', amount: 6 },
    ],
    costScale: 1.65,
    requiredTech: 'cantera',
    workersRequired: 1,
    production: [{ resourceId: 'piedra', amountPerMinute: 1.5 }],
    upgradeCostMult: 1.85,
    maxLevel: 8,
  },
  huerto: {
    id: 'huerto',
    name: 'Huerto',
    description: 'Cultiva alimentos y fibras de forma automatizada.',
    icon: '🌾',
    maxCount: 3,
    baseCost: [
      { resourceId: 'madera', amount: 35 },
      { resourceId: 'piedra', amount: 15 },
      { resourceId: 'semillas', amount: 10 },
      { resourceId: 'fibra', amount: 5 },
    ],
    costScale: 1.6,
    requiredTech: 'agricultura',
    workersRequired: 1,
    production: [
      { resourceId: 'bayas', amountPerMinute: 1.2, seasonMultipliers: { primavera: 1.2, verano: 1.1, otono: 0.65, invierno: 0 } },
      { resourceId: 'fibra', amountPerMinute: 0.6, seasonMultipliers: { primavera: 1.1, verano: 1, otono: 0.8, invierno: 0.35 } },
    ],
    upgradeCostMult: 1.8,
    maxLevel: 6,
  },
  trampa_caza: {
    id: 'trampa_caza', name: 'Puesto de trampeo', description: 'Red de trampas y refugios de caza que generan carne y pieles con un trabajador asignado.', icon: '🪤', maxCount: 3,
    baseCost: [{ resourceId: 'madera', amount: 35 }, { resourceId: 'fibra', amount: 15 }, { resourceId: 'cuerda', amount: 4 }], costScale: 1.7, requiredTech: 'caza_primitiva', workersRequired: 1,
    production: [{ resourceId: 'carne_cruda', amountPerMinute: 0.35 }, { resourceId: 'piel_animal', amountPerMinute: 0.08 }], upgradeCostMult: 1.8, maxLevel: 5,
  },
  horno: {
    id: 'horno',
    name: 'Horno',
    description: 'Permite fundir minerales y producir carbón de forma eficiente.',
    icon: '🏭',
    maxCount: 2,
    baseCost: [
      { resourceId: 'piedra', amount: 60 },
      { resourceId: 'arcilla', amount: 20 },
      { resourceId: 'madera', amount: 30 },
    ],
    costScale: 1.8,
    requiredTech: 'metalurgia_basica',
    effects: ['Habilita metalurgia', 'Mejora producción de carbón'],
    upgradeCostMult: 2.0,
    maxLevel: 5,
  },
};

export const BUILDING_LIST = Object.values(BUILDINGS);
