export type SeasonId = 'primavera' | 'verano' | 'otono' | 'invierno';

export interface CalendarState { totalDays: number; dayProgressMs: number; }

export const GAME_DAY_MS = 120_000;
export const DAYS_PER_SEASON = 30;
export const DAYS_PER_YEAR = DAYS_PER_SEASON * 4;
export const SEASONS: { id: SeasonId; name: string; icon: string; description: string }[] = [
  { id: 'primavera', name: 'Primavera', icon: '🌱', description: 'La vegetación vuelve a crecer y abundan las bayas.' },
  { id: 'verano', name: 'Verano', icon: '☀️', description: 'Temporada cálida y favorable para recolectar y cultivar.' },
  { id: 'otono', name: 'Otoño', icon: '🍂', description: 'Las cosechas disminuyen y comienza la preparación para el frío.' },
  { id: 'invierno', name: 'Invierno', icon: '❄️', description: 'Escasean los alimentos silvestres y la población necesita combustible para calentarse.' },
];

export interface CalendarInfo {
  day: number; dayOfYear: number; dayOfSeason: number; year: number;
  season: SeasonId; seasonName: string; seasonIcon: string; seasonDescription: string; progress: number;
}

export function getCalendarInfo(calendar: CalendarState): CalendarInfo {
  const safeDays = Math.max(0, Math.floor(calendar.totalDays || 0));
  const dayOfYear = (safeDays % DAYS_PER_YEAR) + 1;
  const season = SEASONS[Math.floor((dayOfYear - 1) / DAYS_PER_SEASON)];
  return {
    day: safeDays + 1, dayOfYear, dayOfSeason: ((dayOfYear - 1) % DAYS_PER_SEASON) + 1,
    year: Math.floor(safeDays / DAYS_PER_YEAR) + 1, season: season.id, seasonName: season.name,
    seasonIcon: season.icon, seasonDescription: season.description,
    progress: Math.max(0, Math.min(1, (calendar.dayProgressMs || 0) / GAME_DAY_MS)),
  };
}

export function seasonMultiplier(season: SeasonId, multipliers?: Partial<Record<SeasonId, number>>): number {
  return multipliers?.[season] ?? 1;
}
