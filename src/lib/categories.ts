// Categorías simplificadas para REMI
export interface Category {
  id: string;
  name: string;
  nameEn: string;
  nameDe: string;
  icon: string;
  color: string;
  description: string;
  descriptionEn: string;
  descriptionDe: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'bajar_peso',
    name: 'Bajar peso',
    nameEn: 'Lose weight',
    nameDe: 'Gewicht verlieren',
    icon: '⚖️',
    color: '#6366f1', // Indigo - Unique
    description: 'Alcanza tu peso ideal con hábitos saludables',
    descriptionEn: 'Reach your ideal weight with healthy habits',
    descriptionDe: 'Erreiche dein Idealgewicht mit gesunden Gewohnheiten'
  },
  {
    id: 'ahorrar',
    name: 'Ahorrar',
    nameEn: 'Save money',
    nameDe: 'Geld sparen',
    icon: '💰',
    color: '#10b981', // Emerald - Unique
    description: 'Mejora tus finanzas y ahorra dinero',
    descriptionEn: 'Improve your finances and save money',
    descriptionDe: 'Verbessere deine Finanzen und spare Geld'
  },
  {
    id: 'mantenerse_forma',
    name: 'Mantenerse en forma',
    nameEn: 'Stay fit',
    nameDe: 'Fit bleiben',
    icon: '💪',
    color: '#f59e0b', // Amber/Orange - Unique
    description: 'Mantén tu cuerpo activo y saludable',
    descriptionEn: 'Keep your body active and healthy',
    descriptionDe: 'Halte deinen Körper aktiv und gesund'
  },
  {
    id: 'dejar_fumar',
    name: 'Dejar de fumar',
    nameEn: 'Quit smoking',
    nameDe: 'Mit Rauchen aufhören',
    icon: '🚭',
    color: '#ef4444', // Red - Unique
    description: 'Libérate del tabaco y mejora tu salud',
    descriptionEn: 'Break free from tobacco and improve your health',
    descriptionDe: 'Befreie dich vom Tabak und verbessere deine Gesundheit'
  },
  {
    id: 'comer_sano',
    name: 'Comer más sano',
    nameEn: 'Eat healthier',
    nameDe: 'Gesünder essen',
    icon: '🥗',
    color: '#84cc16', // Lime Green - Unique (diferente del emerald)
    description: 'Nutre tu cuerpo con alimentos saludables',
    descriptionEn: 'Nourish your body with healthy foods',
    descriptionDe: 'Ernähre deinen Körper mit gesunden Lebensmitteln'
  },
  {
    id: 'dormir_mejor',
    name: 'Dormir mejor',
    nameEn: 'Sleep better',
    nameDe: 'Besser schlafen',
    icon: '😴',
    color: '#a855f7', // Purple - Unique
    description: 'Mejora la calidad de tu descanso',
    descriptionEn: 'Improve the quality of your rest',
    descriptionDe: 'Verbessere die Qualität deiner Erholung'
  },
  {
    id: 'eliminar_stress',
    name: 'Eliminar estrés',
    nameEn: 'Eliminate stress',
    nameDe: 'Stress reduzieren',
    icon: '🧘',
    color: '#ec4899', // Pink - Unique
    description: 'Reduce el estrés y encuentra paz interior',
    descriptionEn: 'Reduce stress and find inner peace',
    descriptionDe: 'Reduziere Stress und finde inneren Frieden'
  },
  {
    id: 'mejorar_medio_ambiente',
    name: 'Mejorar el medio ambiente',
    nameEn: 'Improve the environment',
    nameDe: 'Umwelt verbessern',
    icon: '🌍',
    color: '#06b6d4', // Cyan - Unique (más azul que teal)
    description: 'Cuida el planeta con acciones sostenibles',
    descriptionEn: 'Care for the planet with sustainable actions',
    descriptionDe: 'Schütze den Planeten mit nachhaltigen Aktionen'
  },
  {
    id: 'reducir_uso_pantallas',
    name: 'Reducir uso de pantallas',
    nameEn: 'Reduce screen time',
    nameDe: 'Bildschirmzeit reduzieren',
    icon: '📱',
    color: '#8b5cf6', // Violet - Unique (diferente del purple)
    description: 'Desconecta y recupera tu tiempo libre',
    descriptionEn: 'Disconnect and reclaim your free time',
    descriptionDe: 'Schalte ab und gewinne deine Freizeit zurück'
  }
];

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find(cat => cat.id === id);
};

export const getCategoryIcon = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.icon || '🎯';
};

export const getCategoryColor = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.color || 'gray';
};

export const getCategoryName = (categoryId: string, locale: string = 'es'): string => {
  const category = getCategoryById(categoryId);
  if (!category) return categoryId;
  
  if (locale === 'en') return category.nameEn;
  if (locale === 'de') return category.nameDe;
  return category.name;
};

export const getCategoryDescription = (categoryId: string, locale: string = 'es'): string => {
  const category = getCategoryById(categoryId);
  if (!category) return '';
  
  if (locale === 'en') return category.descriptionEn;
  if (locale === 'de') return category.descriptionDe;
  return category.description;
};
