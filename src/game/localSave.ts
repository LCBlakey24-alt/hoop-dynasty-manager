import { defaultTactics, type TacticalSettings } from './tactics';
import type { SimulatedGameResult } from './simulateGame';

const SAVE_KEY = 'hoop-dynasty-manager-save-v1';

export type LocalSeasonSave = {
  results: SimulatedGameResult[];
  tactics: TacticalSettings;
  savedAt: string;
};

export function loadLocalSeasonSave(): LocalSeasonSave | null {
  try {
    const rawSave = window.localStorage.getItem(SAVE_KEY);

    if (!rawSave) return null;

    const parsedSave = JSON.parse(rawSave) as Partial<LocalSeasonSave>;

    if (!Array.isArray(parsedSave.results) || !parsedSave.tactics) {
      return null;
    }

    return {
      results: parsedSave.results as SimulatedGameResult[],
      tactics: { ...defaultTactics, ...parsedSave.tactics },
      savedAt: parsedSave.savedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveLocalSeason(results: SimulatedGameResult[], tactics: TacticalSettings) {
  const save: LocalSeasonSave = {
    results,
    tactics,
    savedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));

  return save;
}

export function clearLocalSeasonSave() {
  window.localStorage.removeItem(SAVE_KEY);
}
