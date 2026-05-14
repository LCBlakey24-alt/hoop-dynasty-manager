# Hoop Dynasty Manager — Production Master TODO

## Non-Negotiable Product Constraints

### C0: Single-screen rule (Desktop + TV)
- No primary screen may require vertical window scrolling.
- Target resolutions:
  - 1920x1080 (desktop + TV baseline)
  - 1366x768 (minimum laptop target)
- If data exceeds space, use in-panel tabs, paging, or modal drilldowns.

### C1: Team-focus default
- When managing one team, default views should prioritize team-relevant fixtures/results/messages.
- League-wide context remains available behind explicit toggles.

### C2: Deterministic simulation continuity
- Seeded simulation must remain reproducible across save/load/reset.
- RNG progress must persist and replay correctly.

---

## Phase 0 — Viewport Contract & UX Density System (P0)

- [ ] Add `docs/VIEWPORT_CONTRACT.md` as acceptance criteria.
- [ ] Introduce CSS density tokens (`--text-*`, `--space-*`, `--panel-h-*`).
- [ ] Add in-game Display Density setting: Normal / Compact / Ultra.
- [ ] Enforce fixed viewport shell and panel-level overflow strategy.
- [ ] Build a screen-by-screen no-scroll checklist.

---

## Phase 1 — Information Architecture (P0/P1)

### Dashboard
- [ ] Lock to fixed 2-row command-center layout.
- [ ] Cap verbose copy and move long helper text to tooltips.
- [ ] Keep core manager loop visible at all times (next game, objective, tasks, squad risk).

### Landing / Front Door
- [ ] Convert to game-like main menu shell:
  - Continue
  - New Career
  - Load Save
  - Settings
  - Exit
- [ ] Keep cinematic splash while reducing web-like card clutter on first touch.

### Team Focus Toggle
- [ ] Add global `Focus: My Team / League` preference.
- [ ] Apply to Schedule, Results, Inbox, and Dashboard widgets.

---

## Phase 2 — Player-Facing Feature Depth (P1)

### Inbox
- [ ] unread/read/pin state
- [ ] snooze/remind-next-round
- [ ] quick-resolve tasks
- [ ] category tabs and filters

### Match Result
- [ ] add expanded match factors (shot profile, bench/starter split, fatigue impact)
- [ ] comparative mini-charts for key drivers

### Roster
- [ ] sortable columns
- [ ] in-row quick actions (minutes/start/development)
- [ ] compact row mode for TV

### Tactics
- [ ] matchup-aware tactical recommendation
- [ ] expected pace/variance/fatigue visual meters
- [ ] “apply assistant preset” action

### Schedule/Results
- [ ] default My Team filter
- [ ] round timeline strip
- [ ] simulate-to-next-my-game shortcut

---

## Phase 3 — Simulation Depth (P1/P2)

- [ ] move toward possession/event-based simulation
- [ ] add turnover/foul/lineup interaction logic
- [ ] expand player model beyond OVR-centric flow
- [ ] AI tactics/rotation adaptation

---

## Phase 4 — Long-Term Save Identity (P2)

- [ ] multi-season lifecycle (aging/retirement/regression)
- [ ] scouting uncertainty/fog-of-war
- [ ] contract ecosystem expansion
- [ ] records, awards, milestones

---

## Phase 5 — Engineering Hardening (P0/P1)

- [ ] split `App.tsx` into focused hooks/modules
- [ ] deterministic regression tests
- [ ] save migration tests
- [ ] standings/sim invariants
- [ ] CI pipeline: build + lint + tests

---

## Phase 6 — Steam/Console Readiness (P2)

- [ ] controller-first navigation map
- [ ] performance/memory budgets
- [ ] crash reporting + telemetry
- [ ] legal/store assets package
- [ ] beta feedback/patch cadence
