# Hoop Dynasty Manager — Readiness Audit (May 11, 2026)

## Critical fixes (must-do before calling the game "ready to play")

1. **Fix dashboard "latest user game" lookup bug.**
   - `userGameResult` currently uses `results.find(...)`, which returns the **first** game involving the selected team, not the latest one.
   - Impact: Board confidence and dashboard state can show stale information after multiple rounds.
   - Suggested fix: use `results.findLast(...)` (or reverse scan) for selected team games.

2. **Replace placeholder board confidence logic with data-driven values.**
   - Current values are static percentages (`76%`, `68%`, `72%`) and do not reflect form, streak, standings, or expectations.
   - Impact: Core management feedback loop feels fake and reduces replay value.

3. **Add deterministic simulation mode for testing.**
   - Match simulation is fully random (`Math.random`) with no seed support.
   - Impact: Hard to reproduce bugs, balance issues, or tuning regressions.
   - Suggested fix: injectable RNG seed utility for `simulateGame` and related score generators.

4. **Protect save compatibility with schema versioning + migration hooks.**
   - Save key has `v1`, but load path only checks minimal shape and no migrations.
   - Impact: future updates risk broken saves or silent data loss.

5. **Add real TypeScript linting and CI gate.**
   - Lint command now runs, but currently only targets `*.js` files.
   - Impact: TS/React files can accumulate issues undetected.
   - Suggested fix: add `@typescript-eslint` parser/plugin when environment policy allows package install.

## High-priority gameplay/system improvements

6. **Tune and validate possession/score model against expected league scoring bands.**
   - Current model is a direct score formula with random variance and tactical modifiers.
   - Recommended: calibrate against target pace tiers and average team offensive/defensive ratings.

7. **Improve tiebreakers in standings.**
   - Sorting uses wins → point differential → points for → name.
   - Recommended: add head-to-head and conference/division-like logic (if applicable) to avoid unrealistic table outcomes.

8. **Harden playoff progression state rules.**
   - Bracket generation is clean, but relies on one simulated game per matchup and does not encode best-of series.
   - Recommended: explicitly define playoff format (single-elimination vs best-of-N) and render it in UI copy.

9. **Decouple global `teams` data from mutable season state.**
   - Team records exist in data definitions, while standings are recomputed from results; the two can diverge conceptually.
   - Recommended: keep static roster metadata separate from runtime season state store.

10. **Add guardrails for localStorage failures and quota errors.**
    - Save writes are not wrapped in try/catch, unlike load.
    - Impact: private mode/quota errors may crash save cycles.

## UI/UX and product polish

11. **Add a dedicated onboarding flow and explicit objective system.**
    - New players need a clear "what to do next" path beyond sim buttons.

12. **Surface team-specific tactical impact preview.**
    - Pre-game labels are useful, but users need concrete expected effects (pace, variance, rebounding, etc.).

13. **Add season milestones and narrative events.**
    - Injuries, morale events, and board targets would make management choices meaningful.

14. **Improve accessibility baseline.**
    - Audit keyboard focus states, contrast for muted text/chips, and semantic headings in dense panels.

15. **Expose simulation logs/history beyond latest result.**
    - Users need easy browsing by round and team for debugging and engagement.

## Engineering quality improvements

16. **Add unit tests for core game engine modules.**
    - Minimum targets: fixtures generation, standings ordering, playoff bracket progression, tactic modifier outputs.

17. **Add integration tests for critical flows.**
    - Team selection reset behavior, regular season completion, playoff unlock/advance, save/load roundtrip.

18. **Introduce lightweight telemetry/debug panel (dev only).**
    - Track average scores, upset rates, and distribution of win probabilities during balancing.

19. **Pin dependency versions instead of `latest`.**
    - Current `package.json` uses `latest` across major packages.
    - Impact: non-deterministic installs and sudden breaking changes.

20. **Set up automated quality checks in CI.**
    - Recommended baseline: `npm run lint`, `npm run build`, and tests on every PR.
