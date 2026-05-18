import type { AnimeSeason, AnimeSeasonRef, DayOfWeek } from './types';

export const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

export const PLATFORM_PRESETS = [
  'Netflix',
  'Bilibili',
  'Muse Asia',
  'Crunchyroll',
  'iQIYI',
  'AIS PLAY',
  'Disney+',
  'Prime Video',
  'YouTube',
];

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getTodayDay(): DayOfWeek {
  const idx = new Date().getDay();
  return DAYS_SUN_FIRST[idx];
}

const DAYS_SUN_FIRST: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Anime season convention (industry standard):
 *   Winter: Jan-Mar, Spring: Apr-Jun, Summer: Jul-Sep, Fall: Oct-Dec
 * Year stays as the calendar year — "Winter 2026" means Jan-Mar 2026.
 */
export function getCurrentSeasonName(date: Date = new Date()): string {
  const m = date.getMonth();
  const y = date.getFullYear();
  if (m <= 2) return `Winter ${y}`;
  if (m <= 5) return `Spring ${y}`;
  if (m <= 8) return `Summer ${y}`;
  return `Fall ${y}`;
}

/** "21:00" → 1260. Returns null if not parseable. */
export function timeToMinutes(time: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** True when both arrays contain the same strings regardless of order. */
export function tagsMatch(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((t, i) => t === sb[i]);
}

const SEASON_INDEX: Record<string, number> = {
  winter: 0,
  spring: 1,
  summer: 2,
  fall: 3,
};

/**
 * Maps an anime-season name like "Spring 2026" to a single sortable integer
 * (year * 4 + season-of-year). Returns null for names that don't match the
 * `Winter|Spring|Summer|Fall YYYY` pattern (custom-named seasons).
 *
 * Use with a descending sort to get newest-first ordering:
 *   Spring 2026 (8105) > Winter 2026 (8104) > Fall 2025 (8103)
 */
export function seasonRank(name: string): number | null {
  const m = /^(Winter|Spring|Summer|Fall)\s+(\d{4})/i.exec(name.trim());
  if (!m) return null;
  return Number(m[2]) * 4 + SEASON_INDEX[m[1].toLowerCase()];
}

const SEASON_CODES: AnimeSeason[] = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
const SEASON_DISPLAY = ['Winter', 'Spring', 'Summer', 'Fall'];

export function getCurrentAnimeSeasonRef(date: Date = new Date()): AnimeSeasonRef {
  const m = date.getMonth();
  const y = date.getFullYear();
  const idx = m <= 2 ? 0 : m <= 5 ? 1 : m <= 8 ? 2 : 3;
  return { season: SEASON_CODES[idx], year: y, name: `${SEASON_DISPLAY[idx]} ${y}` };
}

/**
 * Returns the season following the one for `date`.
 *   Spring 2026 → Summer 2026
 *   Fall 2026   → Winter 2027 (year rolls over after Fall)
 */
export function getNextAnimeSeasonRef(date: Date = new Date()): AnimeSeasonRef {
  const cur = getCurrentAnimeSeasonRef(date);
  const curIdx = SEASON_CODES.indexOf(cur.season);
  let nextIdx = curIdx + 1;
  let year = cur.year;
  if (nextIdx > 3) {
    nextIdx = 0;
    year++;
  }
  return {
    season: SEASON_CODES[nextIdx],
    year,
    name: `${SEASON_DISPLAY[nextIdx]} ${year}`,
  };
}

/**
 * Generates a list of anime-season references for a season-picker. Returns
 * `future + 1 + past` entries, newest first. e.g. `{ past: 6, future: 1 }` →
 * 8 entries with the future season at the top.
 */
export function getAnimeSeasonRefs(
  opts: { past: number; future: number },
  date: Date = new Date(),
): AnimeSeasonRef[] {
  const cur = getCurrentAnimeSeasonRef(date);
  const curIdx = SEASON_CODES.indexOf(cur.season);
  const refs: AnimeSeasonRef[] = [];
  for (let i = opts.future; i >= -opts.past; i--) {
    let idx = curIdx + i;
    let year = cur.year;
    while (idx < 0) {
      idx += 4;
      year--;
    }
    while (idx > 3) {
      idx -= 4;
      year++;
    }
    refs.push({
      season: SEASON_CODES[idx],
      year,
      name: `${SEASON_DISPLAY[idx]} ${year}`,
    });
  }
  return refs;
}
