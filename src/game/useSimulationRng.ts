import { useMemo, useRef } from 'react';
import { createSeededRng } from './rng';

export function useSimulationRng(seed: number, initialCalls: number) {
  const rngCallsRef = useRef<number>(initialCalls);
  const rngReplayAppliedRef = useRef(false);
  const simulationRngBase = useRef(createSeededRng(seed));

  if (!rngReplayAppliedRef.current && rngCallsRef.current > 0) {
    for (let draw = 0; draw < rngCallsRef.current; draw += 1) simulationRngBase.current();
    rngReplayAppliedRef.current = true;
  }

  const rng = useMemo(() => () => {
    rngCallsRef.current += 1;
    return simulationRngBase.current();
  }, []);

  function reset(nextSeed: number) {
    rngCallsRef.current = 0;
    rngReplayAppliedRef.current = true;
    simulationRngBase.current = createSeededRng(nextSeed);
  }

  return {
    rng,
    reset,
    rngCallsRef,
  };
}
