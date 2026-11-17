export type ResourceId =
  | 'madera'
  | 'piedra'
  | 'fibra'
  | 'bayas'
  | 'pedernal'
  | 'arcilla'
  | 'carbon_vegetal'
  | 'conocimiento'
  | 'madera_dura'
  | 'resina'
  | 'semillas'
  | 'hierbas'
  | 'agua'
  | 'comida_cocida'
  | 'carne_cocinada'
  | 'plato_completo'
  | 'cuerda'
  | 'tabla'
  | 'mineral_cobre'
  | 'mineral_hierro'
  | 'lingote_cobre'
  | 'lingote_hierro'
  | 'carne_cruda'
  | 'piel_animal'
  | 'cuero'
  | 'odre';

export interface ResourceDef {
  id: ResourceId;
  name: string;
  description: string;
  category: 'natural' | 'mineral' | 'alimento' | 'componente' | 'cientifico' | 'fabricado';
  icon: string;
  baseMax?: number;
  /** Equivalente nutricional en bayas: 20 puntos cubren un día-persona. */
  foodValue?: number;
}

export const RESOURCES: Record<ResourceId, ResourceDef> = {
  madera: {
    id: 'madera',
    name: 'Madera',
    description: 'Troncos y ramas de árboles comunes. Base de la civilización.',
    category: 'natural',
    icon: '🌳',
    baseMax: 200,
  },
  piedra: {
    id: 'piedra',
    name: 'Piedra',
    description: 'Rocas y piedras comunes. Material de construcción y herramientas.',
    category: 'natural',
    icon: '⛰️',
    baseMax: 200,
  },
  fibra: {
    id: 'fibra',
    name: 'Fibra',
    description: 'Fibras vegetales útiles para cuerdas y tejidos básicos.',
    category: 'natural',
    icon: '🧵',
    baseMax: 150,
  },
  bayas: {
    id: 'bayas',
    name: 'Bayas',
    description: 'Frutos silvestres comestibles. Proporcionan sustento básico.',
    category: 'alimento',
    icon: '🫐',
    baseMax: 100,
    foodValue: 1,
  },
  pedernal: {
    id: 'pedernal',
    name: 'Pedernal',
    description: 'Piedra afilada ideal para herramientas primitivas y chispas.',
    category: 'mineral',
    icon: '✨',
    baseMax: 100,
  },
  arcilla: {
    id: 'arcilla',
    name: 'Arcilla',
    description: 'Tierra moldeable. Útil para cerámica y construcción.',
    category: 'natural',
    icon: '🧱',
    baseMax: 100,
  },
  carbon_vegetal: {
    id: 'carbon_vegetal',
    name: 'Carbón vegetal',
    description: 'Combustible obtenido de madera quemada. Necesario para fundición.',
    category: 'fabricado',
    icon: '⬛',
    baseMax: 80,
  },
  conocimiento: {
    id: 'conocimiento',
    name: 'Conocimiento',
    description: 'Puntos de conocimiento científico. Se usan para investigaciones.',
    category: 'cientifico',
    icon: '🧠',
    baseMax: 9999,
  },
  madera_dura: {
    id: 'madera_dura',
    name: 'Madera dura',
    description: 'Madera más resistente de árboles maduros.',
    category: 'natural',
    icon: '🌳',
    baseMax: 100,
  },
  resina: {
    id: 'resina',
    name: 'Resina',
    description: 'Sustancia pegajosa de árboles. Útil para adhesivos y combustibles.',
    category: 'natural',
    icon: '🍯',
    baseMax: 50,
  },
  semillas: {
    id: 'semillas',
    name: 'Semillas',
    description: 'Semillas de plantas silvestres. Base de la agricultura.',
    category: 'natural',
    icon: '🌱',
    baseMax: 80,
  },
  hierbas: {
    id: 'hierbas',
    name: 'Hierbas',
    description: 'Plantas medicinales y aromáticas.',
    category: 'natural',
    icon: '🌿',
    baseMax: 80,
  },
  agua: {
    id: 'agua',
    name: 'Agua',
    description: 'Agua potable. Necesaria para cocina y supervivencia.',
    category: 'alimento',
    icon: '💧',
    baseMax: 50,
  },
  comida_cocida: {
    id: 'comida_cocida',
    name: 'Comida cocida',
    description: 'Alimentos preparados. Más nutritivos y seguros.',
    category: 'alimento',
    icon: '🍲',
    baseMax: 50,
    foodValue: 20 / 3,
  },
  carne_cocinada: {
    id: 'carne_cocinada', name: 'Carne cocinada',
    description: 'Carne asada y lista para consumir. Una porción aporta la mitad de la ración diaria de un adulto.',
    category: 'alimento', icon: '🍖', baseMax: 100, foodValue: 10,
  },
  plato_completo: {
    id: 'plato_completo', name: 'Plato completo',
    description: 'Una porción de carne cocinada acompañada de bayas. Aporta una ración diaria completa.',
    category: 'alimento', icon: '🍛', baseMax: 100, foodValue: 20,
  },
  cuerda: {
    id: 'cuerda',
    name: 'Cuerda',
    description: 'Cuerda trenzada de fibras. Componente esencial.',
    category: 'componente',
    icon: '🪢',
    baseMax: 50,
  },
  tabla: {
    id: 'tabla',
    name: 'Tabla',
    description: 'Madera procesada en tablas. Mejor para construcción.',
    category: 'fabricado',
    icon: '📏',
    baseMax: 80,
  },
  mineral_cobre: {
    id: 'mineral_cobre',
    name: 'Mineral de cobre',
    description: 'Mineral crudo de cobre. Debe fundirse.',
    category: 'mineral',
    icon: '🟠',
    baseMax: 60,
  },
  mineral_hierro: {
    id: 'mineral_hierro',
    name: 'Mineral de hierro',
    description: 'Mineral crudo de hierro. Base de la metalurgia avanzada.',
    category: 'mineral',
    icon: '⚫',
    baseMax: 60,
  },
  lingote_cobre: {
    id: 'lingote_cobre',
    name: 'Lingote de cobre',
    description: 'Cobre refinado. Permite herramientas y componentes metálicos.',
    category: 'fabricado',
    icon: '🔶',
    baseMax: 40,
  },
  carne_cruda: { id: 'carne_cruda', name: 'Carne cruda', description: 'Carne obtenida de la caza. Debe cocinarse antes de consumirla.', category: 'alimento', icon: '🥩', baseMax: 100 },
  piel_animal: { id: 'piel_animal', name: 'Piel animal', description: 'Piel sin procesar obtenida de animales. Puede curtirse para fabricar abrigo y recipientes.', category: 'natural', icon: '🐾', baseMax: 80 },
  cuero: { id: 'cuero', name: 'Cuero', description: 'Piel curtida y tratada para confeccionar ropa y recipientes.', category: 'fabricado', icon: '🟫', baseMax: 100 },
  odre: { id: 'odre', name: 'Odre', description: 'Recipiente reutilizable de cuero. Cada odre permite almacenar 30 unidades de agua.', category: 'componente', icon: '🫙', baseMax: 100 },
  lingote_hierro: {
    id: 'lingote_hierro',
    name: 'Lingote de hierro',
    description: 'Hierro refinado. Material clave de la Era del Metal.',
    category: 'fabricado',
    icon: '⬜',
    baseMax: 40,
  },
};

export const RESOURCE_LIST = Object.values(RESOURCES);
