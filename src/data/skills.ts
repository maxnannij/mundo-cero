import type { ResourceId } from './resources';
import type { SeasonId } from './calendar';

export type SkillId =
  | 'tala'
  | 'mineria'
  | 'herboristeria'
  | 'recoleccion'
  | 'artesania'
  | 'cocina'
  | 'construccion'
  | 'investigacion'
  | 'metalurgia'
  | 'carpinteria';

export interface ActivityDef {
  id: string;
  skillId: SkillId;
  name: string;
  description: string;
  requiredLevel: number;
  durationMs: number;
  xp: number;
  outputs: { resourceId: ResourceId; amount: number; chance?: number }[];
  requiredTool?: string;
  unlockTech?: string;
  requiredBuilding?: string;
  seasonsAvailable?: SeasonId[];
  inputs?: { resourceId: ResourceId; amount: number }[];
}

export interface SkillDef {
  id: SkillId;
  name: string;
  description: string;
  icon: string;
  category: 'recoleccion' | 'produccion' | 'ciencia';
  unlockLevel?: number;
  activities: ActivityDef[];
}

export const SKILLS: Record<SkillId, SkillDef> = {
  tala: {
    id: 'tala',
    name: 'Tala',
    description: 'Extraer madera de los árboles del mundo regenerado.',
    icon: '🪓',
    category: 'recoleccion',
    activities: [
      {
        id: 'tala_comun',
        skillId: 'tala',
        name: 'Madera común',
        description: 'Cortar árboles jóvenes y ramas.',
        requiredLevel: 1,
        durationMs: 3000,
        xp: 8,
        outputs: [{ resourceId: 'madera', amount: 1 }],
        requiredTool: 'hacha',
      },
      {
        id: 'tala_dura',
        skillId: 'tala',
        name: 'Madera dura',
        description: 'Árboles más antiguos y resistentes.',
        requiredLevel: 10,
        durationMs: 6000,
        xp: 18,
        outputs: [{ resourceId: 'madera_dura', amount: 1 }, { resourceId: 'madera', amount: 1, chance: 0.4 }],
        requiredTool: 'hacha',
      },
      {
        id: 'tala_resinosa',
        skillId: 'tala',
        name: 'Madera resinosa',
        description: 'Árboles que producen resina útil.',
        requiredLevel: 20,
        durationMs: 8000,
        xp: 28,
        outputs: [
          { resourceId: 'madera', amount: 2 },
          { resourceId: 'resina', amount: 1, chance: 0.6 },
        ],
        requiredTool: 'hacha',
      },
    ],
  },
  mineria: {
    id: 'mineria',
    name: 'Minería',
    description: 'Extraer piedras y minerales de la tierra.',
    icon: '⛏️',
    category: 'recoleccion',
    activities: [
      {
        id: 'min_piedra',
        skillId: 'mineria',
        name: 'Piedra común',
        description: 'Recolectar rocas superficiales.',
        requiredLevel: 1,
        durationMs: 4000,
        xp: 9,
        outputs: [{ resourceId: 'piedra', amount: 1 }],
        requiredTool: 'pico',
      },
      {
        id: 'min_pedernal',
        skillId: 'mineria',
        name: 'Pedernal',
        description: 'Buscar nódulos de pedernal afilado.',
        requiredLevel: 5,
        durationMs: 5500,
        xp: 14,
        outputs: [{ resourceId: 'pedernal', amount: 1 }],
        requiredTool: 'pico',
      },
      {
        id: 'min_cobre',
        skillId: 'mineria',
        name: 'Mineral de cobre',
        description: 'Excavar vetas de cobre.',
        requiredLevel: 15,
        durationMs: 9000,
        xp: 25,
        outputs: [{ resourceId: 'mineral_cobre', amount: 1 }],
        requiredTool: 'pico',
        unlockTech: 'metalurgia_basica',
      },
      {
        id: 'min_hierro',
        skillId: 'mineria',
        name: 'Mineral de hierro',
        description: 'Extraer hierro de depósitos profundos.',
        requiredLevel: 25,
        durationMs: 12000,
        xp: 40,
        outputs: [{ resourceId: 'mineral_hierro', amount: 1 }],
        requiredTool: 'pico',
        unlockTech: 'metalurgia_basica',
      },
    ],
  },
  herboristeria: {
    id: 'herboristeria',
    name: 'Herboristería',
    description: 'Recolectar plantas, fibras y hierbas del entorno.',
    icon: '🌿',
    category: 'recoleccion',
    activities: [
      {
        id: 'herb_fibra',
        skillId: 'herboristeria',
        name: 'Fibras vegetales',
        description: 'Recolectar plantas fibrosas.',
        requiredLevel: 1,
        durationMs: 3500,
        xp: 7,
        outputs: [{ resourceId: 'fibra', amount: 1 }],
      },
      {
        id: 'herb_semillas',
        skillId: 'herboristeria',
        name: 'Semillas',
        description: 'Buscar semillas de plantas comestibles.',
        requiredLevel: 5,
        seasonsAvailable: ['primavera', 'verano', 'otono'],
        durationMs: 4500,
        xp: 12,
        outputs: [{ resourceId: 'semillas', amount: 1 }, { resourceId: 'fibra', amount: 1, chance: 0.3 }],
      },
      {
        id: 'herb_hierbas',
        skillId: 'herboristeria',
        name: 'Hierbas medicinales',
        description: 'Identificar y recolectar hierbas útiles.',
        requiredLevel: 10,
        durationMs: 6000,
        xp: 18,
        outputs: [{ resourceId: 'hierbas', amount: 1 }],
      },
    ],
  },
  recoleccion: {
    id: 'recoleccion',
    name: 'Recolección',
    description: 'Buscar alimentos silvestres y recursos dispersos.',
    icon: '🧺',
    category: 'recoleccion',
    activities: [
      {
        id: 'rec_bayas',
        skillId: 'recoleccion',
        name: 'Bayas silvestres',
        description: 'Recolectar bayas de arbustos. No crecen durante el invierno.',
        requiredLevel: 1,
        seasonsAvailable: ['primavera', 'verano', 'otono'],
        durationMs: 4000,
        xp: 8,
        outputs: [{ resourceId: 'bayas', amount: 2 }],
      },
      {
        id: 'rec_arcilla',
        skillId: 'recoleccion',
        name: 'Arcilla',
        description: 'Extraer arcilla de lechos de ríos secos.',
        requiredLevel: 8,
        durationMs: 5500,
        xp: 14,
        outputs: [{ resourceId: 'arcilla', amount: 1 }],
      },
    ],
  },
  artesania: {
    id: 'artesania',
    name: 'Artesanía',
    description: 'Fabricar herramientas, componentes y objetos útiles.',
    icon: '🛠️',
    category: 'produccion',
    activities: [],
  },
  cocina: {
    id: 'cocina',
    name: 'Cocina',
    description: 'Preparar alimentos para mejorar la supervivencia.',
    icon: '🍳',
    category: 'produccion',
    activities: [
      {
        id: 'coc_bayas',
        skillId: 'cocina',
        name: 'Cocinar bayas',
        description: 'Preparar bayas para hacerlas más seguras y nutritivas.',
        requiredLevel: 1,
        requiredBuilding: 'fogata',
        inputs: [{ resourceId: 'bayas', amount: 2 }],
        durationMs: 5000,
        xp: 12,
        outputs: [{ resourceId: 'comida_cocida', amount: 1 }],
        unlockTech: 'control_fuego',
      },
    ],
  },
  construccion: {
    id: 'construccion',
    name: 'Construcción',
    description: 'Construir refugios, talleres e instalaciones.',
    icon: '🏗️',
    category: 'produccion',
    activities: [],
  },
  investigacion: {
    id: 'investigacion',
    name: 'Investigación',
    description: 'Descubrir y desarrollar tecnologías mediante experimentos.',
    icon: '🔬',
    category: 'ciencia',
    activities: [
      {
        id: 'inv_basica',
        skillId: 'investigacion',
        name: 'Experimentos básicos',
        description: 'Realizar pruebas simples para generar conocimiento.',
        requiredLevel: 1,
        durationMs: 8000,
        xp: 15,
        outputs: [{ resourceId: 'conocimiento', amount: 1 }],
      },
      {
        id: 'inv_avanzada',
        skillId: 'investigacion',
        name: 'Experimentos avanzados',
        description: 'Investigaciones más complejas con mejores resultados.',
        requiredLevel: 10,
        durationMs: 15000,
        xp: 35,
        outputs: [{ resourceId: 'conocimiento', amount: 3 }],
      },
    ],
  },
  metalurgia: {
    id: 'metalurgia',
    name: 'Metalurgia',
    description: 'Fundir minerales y crear metales útiles.',
    icon: '🔥',
    category: 'produccion',
    unlockLevel: 1,
    activities: [
      {
        id: 'met_cobre',
        skillId: 'metalurgia',
        name: 'Fundir cobre',
        description: 'Convertir mineral de cobre en lingotes.',
        requiredLevel: 1,
        requiredBuilding: 'horno',
        inputs: [{ resourceId: 'mineral_cobre', amount: 2 }, { resourceId: 'carbon_vegetal', amount: 1 }],
        durationMs: 12000,
        xp: 30,
        outputs: [{ resourceId: 'lingote_cobre', amount: 1 }],
        unlockTech: 'metalurgia_basica',
      },
    ],
  },
  carpinteria: {
    id: 'carpinteria',
    name: 'Carpintería',
    description: 'Procesar madera en tablas y componentes.',
    icon: '🪚',
    category: 'produccion',
    activities: [
      {
        id: 'carp_tabla',
        skillId: 'carpinteria',
        name: 'Aserrar tablas',
        description: 'Convertir madera en tablas útiles.',
        requiredLevel: 1,
        requiredBuilding: 'aserradero',
        inputs: [{ resourceId: 'madera', amount: 2 }],
        durationMs: 6000,
        xp: 15,
        outputs: [{ resourceId: 'tabla', amount: 1 }],
      },
    ],
  },
};

export const SKILL_LIST = Object.values(SKILLS);

export function xpForLevel(level: number): number {
  return Math.floor(50 + level * 25 + Math.pow(level, 1.8) * 8);
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}
