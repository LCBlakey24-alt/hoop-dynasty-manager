# Hardwood Dynasty — Steam Release Roadmap

## Goal
Ship a stable, marketable Early Access build on Steam with clear core-loop depth, strong save reliability, polished onboarding, and compliant store/ops setup.

## Release Readiness Stages

### Stage 1 — Core Product Readiness (Now → Pre-Alpha)
- **Season Loop Completion**
  - Multi-season continuity (offseason transitions, season rollover, history archive).
  - Awards + milestones (MVP, All-League, champions history).
  - Robust playoff progression UX (full bracket + series state clarity).
- **Manager Systems Depth**
  - Contracts pass: clearer statuses, renewal outcomes, retention risk.
  - Inbox actionability: contract deadlines, board objective deadlines, auto-linked actions.
  - Roster roles/minutes governance tied to morale/fatigue outcomes.
- **Simulation Credibility**
  - Balance pass on pace/scoring distributions, upset rates, and blowout variance.
  - Team identity impact pass (styles materially influence results over large samples).
  - Debug diagnostics dashboard for simulation QA in dev mode.

### Stage 2 — UX, Accessibility, and Presentation (Pre-Alpha → Beta)
- **Onboarding / First-Run Experience**
  - Tutorialized first franchise start flow.
  - Context tips for Inbox, Tactics, and Sim controls.
  - Explainers for key stats/terms (OVR/POT/fatigue/board confidence).
- **Visual Identity & Branding**
  - Complete team-theme propagation (all major surfaces use selected team palette).
  - Logo pipeline hardening (validation, sizing, fallback consistency).
  - Match center polish (timeline chart, run/lead-change moments, clearer key factors).
- **Accessibility**
  - Keyboard-first navigation pass.
  - Focus states + color contrast pass.
  - Reduced motion option for intro/animations.

### Stage 3 — Technical Hardening (Beta → Release Candidate)
- **Save Safety / Migration**
  - Save schema versioning policy and migration tests for each release.
  - Backup + rollback slot support (last-good save).
  - Import validation hardening and user-facing recovery messaging.
- **Quality Assurance**
  - Unit test coverage for simulation, save migration, and standings integrity.
  - Integration smoke tests for key flows (new franchise, sim season, import/export, playoffs).
  - Crash/exception logging strategy and telemetry baseline.
- **Performance**
  - Long-session memory pass.
  - Large-save responsiveness checks.
  - UI render optimization for inbox/result history lists.

### Stage 4 — Steam Store & Platform Readiness (Release Candidate → Launch)
- **Steamworks Integration**
  - App config, depots, branch strategy (internal/beta/public).
  - Achievements + stats (if included in launch scope).
  - Steam Cloud sync support for save portability.
- **Storefront Assets & Copy**
  - Capsule art set, screenshots, trailer, key art.
  - Store description with clear Early Access scope + roadmap.
  - Localized store text for priority markets.
- **Operations & Compliance**
  - EULA/privacy/support docs and contact channels.
  - Launch checklist + rollback/hotfix plan.
  - Pricing, discount policy, and launch-window promo plan.

## Feature Checklist Before Selling on Steam

### Must-Have (Blockers)
- [ ] Stable multi-season progression with no save corruption.
- [ ] Save import/export + migration fully validated.
- [ ] Playoffs and season summary flows fully deterministic and understandable.
- [ ] Contract lifecycle sufficiently complete to avoid dead-end team states.
- [ ] Comprehensive settings screen (audio, display, accessibility, gameplay pace).
- [ ] Crash handling + recoverability standards in place.
- [ ] Steam store page + legal/support requirements complete.

### Should-Have (High Value)
- [ ] Deeper match center analytics and clearer post-game insight cards.
- [ ] Expanded inbox recommendations linked directly to actions.
- [ ] Better onboarding/tutorial guidance for first 30 minutes.
- [ ] Additional customization polish (logos/colors/identity previews).
- [ ] Basic achievements for retention loops.

### Nice-to-Have (Post-Launch Friendly)
- [ ] Extended global league universe rollout.
- [ ] Player career mode prototype.
- [ ] Advanced analytics module.
- [ ] Mod support investigation.

## Suggested Delivery Timeline (Example)
- **Milestone A (4–6 weeks):** Core loop + save integrity + contracts baseline.
- **Milestone B (3–4 weeks):** UX/accessibility polish + onboarding + match center improvements.
- **Milestone C (3–5 weeks):** QA hardening + automation + performance.
- **Milestone D (2–3 weeks):** Steamworks/store setup + launch prep.

## Go/No-Go Launch Criteria
Launch only when all are true:
1. No known data-loss bugs in current candidate.
2. New franchise → full season → playoffs → offseason works end-to-end.
3. Import/export passes regression checks across at least one previous save version.
4. Minimum performance targets are met on target hardware.
5. Store page, legal docs, support workflow, and hotfix process are complete.

## Post-Launch 90-Day Priorities
1. Stability patches and telemetry-informed bug fixes.
2. Content depth updates (contracts, offseason, awards depth).
3. UX quality-of-life based on player feedback.
4. Store conversion optimization (capsules/trailer/copy iteration).
