export interface ObjectiveDef {
  id: string;
  name: string;
  description: string;
  category: 'principal' | 'secundario' | 'logro';
  condition: {
    type: 'resource' | 'skill_level' | 'building' | 'tech' | 'craft' | 'activity_count';
    target: string;
    amount: number;
  };
  reward?: {
    resourceId?: string;
    amount?: number;
    knowledge?: number;
  };
  era: number;
}

export const OBJECTIVES: ObjectiveDef[] = [
  {
    id: 'primeros_pasos_madera',
    name: 'Primeros pasos: Madera',
    description: 'Recolectar 20 unidades de madera.',
    category: 'principal',
    condition: { type: 'resource', target: 'madera', amount: 20 },
    reward: { knowledge: 2 },
    era: 1,
  },
  {
    id: 'primeros_pasos_piedra',
    name: 'Primeros pasos: Piedra',
    description: 'Recolectar 20 unidades de piedra.',
    category: 'principal',
    condition: { type: 'resource', target: 'piedra', amount: 20 },
    reward: { knowledge: 2 },
    era: 1,
  },
  {
    id: 'primera_herramienta',
    name: 'Primera herramienta',
    description: 'Fabricar cualquier herramienta.',
    category: 'principal',
    condition: { type: 'craft', target: 'any_tool', amount: 1 },
    reward: { knowledge: 5 },
    era: 1,
  },
  {
    id: 'superviviente_tala',
    name: 'Superviviente: Tala',
    description: 'Alcanzar nivel 10 en Tala.',
    category: 'secundario',
    condition: { type: 'skill_level', target: 'tala', amount: 10 },
    reward: { knowledge: 8 },
    era: 1,
  },
  {
    id: 'superviviente_mineria',
    name: 'Superviviente: Minería',
    description: 'Alcanzar nivel 10 en Minería.',
    category: 'secundario',
    condition: { type: 'skill_level', target: 'mineria', amount: 10 },
    reward: { knowledge: 8 },
    era: 1,
  },
  {
    id: 'construir_refugio',
    name: 'Primer refugio',
    description: 'Construir un Refugio.',
    category: 'principal',
    condition: { type: 'building', target: 'refugio', amount: 1 },
    reward: { knowledge: 10 },
    era: 1,
  },
  {
    id: 'control_fuego_obj',
    name: 'Dominar el fuego',
    description: 'Investigar Control del fuego.',
    category: 'principal',
    condition: { type: 'tech', target: 'control_fuego', amount: 1 },
    reward: { knowledge: 5 },
    era: 1,
  },
  {
    id: 'primer_asentamiento',
    name: 'Primer asentamiento',
    description: 'Construir un Aserradero y una Cantera.',
    category: 'principal',
    condition: { type: 'building', target: 'aserradero', amount: 1 },
    reward: { knowledge: 20 },
    era: 2,
  },
  {
    id: 'cientifico',
    name: 'Científico emergente',
    description: 'Completar 3 investigaciones.',
    category: 'logro',
    condition: { type: 'tech', target: 'any', amount: 3 },
    reward: { knowledge: 15 },
    era: 1,
  },
];
