import { teams } from '../data/teams';
import { defaultTactics } from './tactics';
import { createSeededRng } from './rng';
import { simulateGame } from './simulateGame';
import { calculateSimulationDiagnostics, type SimulationDiagnostics } from './simulationDiagnostics';

export type SimulationHarnessReport = SimulationDiagnostics & {
  seed: number;
  samples: number;
};

export function runSimulationHarness(samples: number, seed: number): SimulationHarnessReport {
  const rng = createSeededRng(seed);
  const results = [];

  for (let index = 0; index < samples; index += 1) {
    const homeTeam = teams[Math.floor(rng() * teams.length)];
    let awayTeam = teams[Math.floor(rng() * teams.length)];

    while (awayTeam.id === homeTeam.id) {
      awayTeam = teams[Math.floor(rng() * teams.length)];
    }

    results.push(simulateGame(homeTeam, awayTeam, {
      homeTactics: defaultTactics,
      awayTactics: defaultTactics,
      rng,
    }));
  }

  return {
    ...calculateSimulationDiagnostics(results),
    seed,
    samples,
  };
}
