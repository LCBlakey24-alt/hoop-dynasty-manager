# Hoop Dynasty Manager Roadmap

## Current Status

The project is newly created and currently in planning/setup stage.

Completed:

- Repository created
- README added
- Design direction added
- Game design document added

---

# Phase 1: Project Foundation

Goal: Create a working React/TypeScript web app foundation.

Tasks:

- Set up Vite + React + TypeScript
- Add Tailwind CSS
- Add base folder structure
- Add Midnight Court colour tokens
- Add basic routing/navigation
- Add placeholder screens

Success criteria:

- App runs locally
- Dashboard page displays
- Design theme is visible
- Navigation works

---

# Phase 2: Fictional Data

Goal: Add the first fictional league.

Tasks:

- Add 8 BEBL teams
- Add 10 fictional players per team
- Add player ratings and archetypes
- Add team tactical identities
- Add initial schedule generator or fixed schedule

Success criteria:

- User can see teams
- User can view a roster
- Data is strongly typed
- Bristol Breakers and the other starter teams exist

---

# Phase 3: Core Game Loop

Goal: Make the game playable in a basic form.

Tasks:

- Add team selection
- Add dashboard state
- Add next fixture logic
- Add match simulation engine
- Add match result screen
- Add league standings calculation
- Add season progression

Success criteria:

- User selects a team
- User simulates a match
- Score is generated
- Box score is generated
- Standings update
- User can continue through a short season

---

# Phase 4: Roster and Tactics

Goal: Let the user influence match outcomes.

Tasks:

- Add roster screen
- Add starting five display
- Add bench order later
- Add tactics screen
- Add pace/offence/defence/rebounding/usage settings
- Feed tactics into match simulation

Success criteria:

- User can view key player ratings
- User can see current tactical setup
- Tactics affect simulated results

---

# Phase 5: Season Finish and Playoffs

Goal: Complete the first satisfying season loop.

Tasks:

- Detect end of regular season
- Generate playoff bracket
- Simulate semi-finals
- Simulate final
- Crown champion
- Add season summary screen

Success criteria:

- A champion can be crowned
- User receives a season result
- Save feels like a complete mini-season

---

# Phase 6: Player Development

Goal: Add long-term progression.

Tasks:

- Add age-based development
- Add potential-based growth
- Add morale/form influence
- Add end-of-season progression
- Add veteran decline

Success criteria:

- Young players can improve
- Older players can decline
- Seasons feel connected

---

# Phase 7: Player Career Mode Prototype

Goal: Build a simple created-player career loop.

Tasks:

- Add create-player screen
- Add position/archetype selection
- Add starting team assignment
- Add player minutes/role system
- Simulate player stats across games
- Add career summary screen

Success criteria:

- User can create one player
- Player joins a team
- Career stats are tracked
- Player can improve over time

---

# Recommended Build Order

Build in this order:

1. Vite/React/Tailwind app scaffold
2. Design tokens and layout shell
3. Fictional team/player data
4. Dashboard screen
5. Match simulator
6. Standings calculator
7. Roster screen
8. Tactics screen
9. Playoffs
10. Player development
11. Player career mode

---

# Immediate Next Coding Target

Create the first app scaffold with:

- `src/types`
- `src/data`
- `src/game`
- `src/components`
- `src/pages`
- `src/styles`

The first visible screen should be a dark Midnight Court dashboard placeholder with navigation and sample Bristol Breakers data.
