# AI Builder Rules

These rules exist so future AI builders do not accidentally push the project away from the intended game vision.

## Read First

Before making meaningful changes, read:

1. `docs/GAME_BLUEPRINT.md`
2. `docs/UI_DIRECTION.md`
3. `docs/PRODUCTION_TODO_MASTER.md`
4. `docs/VIEWPORT_CONTRACT.md`

## General Rules

- Keep the project fictional unless explicitly told otherwise.
- Do not add real teams, real players or real league branding.
- Prefer small focused PRs.
- Avoid changing `App.tsx` unless routing or global state changes are required.
- If changing `App.tsx`, explain why and keep the patch small.
- Do not duplicate helper functions.
- Do not leave dead branches or broken PRs open.
- Do not add heavy dependencies unless absolutely necessary.
- Preserve local save compatibility when changing saved state.

## PR Rules

A good PR should:

- Have a clear feature goal.
- Touch as few files as possible.
- Explain user-facing value.
- Avoid unrelated refactors.
- Include manual test steps.

Bad PR:

- Updates five systems at once without need.
- Changes App.tsx and multiple components for a minor visual tweak.
- Adds new state without save migration.
- Adds UI that does not connect to gameplay.

## Screen-Level Work

When improving a screen:

- Add summary context.
- Add assistant/staff notes where useful.
- Add status labels.
- Add recommended next action.
- Keep existing actions working.
- Avoid changing app routing.

## Game Feel Rules

Every screen should feel like part of a sports management game.

Use words like:

- Board.
- Staff.
- Match Centre.
- Rotation.
- Recruitment.
- Development.
- Fixture.
- Playoff.
- Campaign.

Avoid generic website language.

## Save Rules

If adding anything to local save:

- Add a version bump.
- Add migration handling.
- Preserve old saves where possible.
- Avoid hard crashes from old localStorage data.

## Simulation Rules

Simulation changes must preserve:

- Determinism where seeded RNG is used.
- Believable results.
- Impact from tactics, fatigue, form, morale and minutes.
- Clear explanations in UI where possible.

## Mobile Rules

- Avoid whole-page scroll where possible.
- Avoid expensive animation on mobile.
- Avoid observing the full DOM unless absolutely needed.
- Touch buttons should be easy to tap.
- Keep mobile browser performance in mind.

## Final Principle

If a change makes the game deeper, clearer, more playable or more game-like, it is probably useful.

If a change only adds visual noise, generic web UI, or complexity without a gameplay reason, avoid it.
