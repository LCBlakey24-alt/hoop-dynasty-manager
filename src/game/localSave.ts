import { defaultTactics, type TacticalSettings } from './tactics';
import type { SimulatedGameResult } from './simulateGame';

const SAVE_KEY = 'hoop-dynasty-manager-save-v1';
const DEFAULT_TEAM_ID = 'bristol-breakers';

export type LocalSeasonSave = {
  playoffResults: SimulatedGameResult[];
  results: SimulatedGameResult[];
  selectedTeamId: string;
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
      playoffResults: Array.isArray(parsedSave.playoffResults) ? parsedSave.playoffResults as SimulatedGameResult[] : [],
      results: parsedSave.results as SimulatedGameResult[],
      selectedTeamId: parsedSave.selectedTeamId ?? DEFAULT_TEAM_ID,
      tactics: { ...defaultTactics, ...parsedSave.tactics },
      savedAt: parsedSave.savedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveLocalSeason(
  results: SimulatedGameResult[],
  tactics: TacticalSettings,
  playoffResults: SimulatedGameResult[] = [],
  selectedTeamId: string = DEFAULT_TEAM_ID,
) {
  const save: LocalSeasonSave = {
    playoffResults,
    results,
    selectedTeamId,
    tactics,
    savedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));

  return save;
}

export function clearLocalSeasonSave() {
  window.localStorage.removeItem(SAVE_KEY);
}
