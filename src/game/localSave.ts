import { defaultTactics, type TacticalSettings } from './tactics';
import type { SimulatedGameResult } from './simulateGame';
import type { TrainingFocus } from '../components/TrainingScreen';

const SAVE_KEY = 'hoop-dynasty-manager-save-v1';
const SAVE_VERSION = 2;
const DEFAULT_TEAM_ID = 'bristol-breakers';

export type LocalSeasonSave = {
  version: number;
  playoffResults: SimulatedGameResult[];
  results: SimulatedGameResult[];
  selectedTeamId: string;
  tactics: TacticalSettings;
  savedAt: string;
  trainingFocus?: TrainingFocus;
};

export function loadLocalSeasonSave(): LocalSeasonSave | null {
  try {
    const rawSave = window.localStorage.getItem(SAVE_KEY);

    if (!rawSave) return null;

    const parsedSave = JSON.parse(rawSave) as Partial<LocalSeasonSave>;
    const migratedSave = migrateSave(parsedSave);

    if (!migratedSave) return null;

    return migratedSave;
  } catch {
    return null;
  }
}

export function saveLocalSeason(
  results: SimulatedGameResult[],
  tactics: TacticalSettings,
  playoffResults: SimulatedGameResult[] = [],
  selectedTeamId: string = DEFAULT_TEAM_ID,
  trainingFocus: TrainingFocus = 'Balanced',
) {
  const save: LocalSeasonSave = {
    version: SAVE_VERSION,
    playoffResults,
    results,
    selectedTeamId,
    tactics,
    savedAt: new Date().toISOString(),
    trainingFocus,
  };

  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // Ignore quota/private mode write failures; continue in-memory session.
  }

  return save;
}

export function clearLocalSeasonSave() {
  window.localStorage.removeItem(SAVE_KEY);
}

function migrateSave(save: Partial<LocalSeasonSave>): LocalSeasonSave | null {
  if (!Array.isArray(save.results) || !save.tactics) return null;

  return {
    version: typeof save.version === 'number' ? save.version : 1,
    playoffResults: Array.isArray(save.playoffResults) ? save.playoffResults as SimulatedGameResult[] : [],
    results: save.results as SimulatedGameResult[],
    selectedTeamId: save.selectedTeamId ?? DEFAULT_TEAM_ID,
    tactics: { ...defaultTactics, ...save.tactics },
    savedAt: save.savedAt ?? new Date().toISOString(),
    trainingFocus: save.trainingFocus ?? 'Balanced',
  };
}
