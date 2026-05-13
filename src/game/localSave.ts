import type { TrainingFocus } from '../components/TrainingScreen';
import { defaultTactics, type TacticalSettings } from './tactics';
import type { SimulatedGameResult } from './simulateGame';
import type { RotationPlan, Team } from '../types/basketball';

const SAVE_KEY = 'hoop-dynasty-manager-save-v1';
const SAVE_VERSION = 3;
const DEFAULT_TEAM_ID = 'bristol-breakers';
const DEFAULT_TRAINING_FOCUS: TrainingFocus = 'Balanced';

export type LocalSeasonSave = {
  version: number;
  playoffResults: SimulatedGameResult[];
  results: SimulatedGameResult[];
  selectedTeamId: string;
  selectedTeamState: Team | null;
  rotationPlan: RotationPlan | null;
  tactics: TacticalSettings;
  savedAt: string;
  trainingFocus: TrainingFocus;
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
  rotationPlan: RotationPlan | null = null,
  selectedTeamState: Team | null = null,
) {
  const save: LocalSeasonSave = {
    version: SAVE_VERSION,
    playoffResults,
    results,
    selectedTeamId,
    selectedTeamState,
    rotationPlan,
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
    selectedTeamState: isTeam(save.selectedTeamState) ? save.selectedTeamState : null,
    rotationPlan: Array.isArray(save.rotationPlan) ? save.rotationPlan as RotationPlan : null,
    tactics: { ...defaultTactics, ...save.tactics },
    savedAt: save.savedAt ?? new Date().toISOString(),
    trainingFocus: isTrainingFocus(save.trainingFocus) ? save.trainingFocus : DEFAULT_TRAINING_FOCUS,
  };
}

function isTrainingFocus(value: unknown): value is TrainingFocus {
  return value === 'Balanced' || value === 'Offense' || value === 'Defense' || value === 'Conditioning';
}

function isTeam(value: unknown): value is Team {
  return Boolean(value && typeof value === 'object' && 'id' in value && 'roster' in value && Array.isArray((value as Team).roster));
}
