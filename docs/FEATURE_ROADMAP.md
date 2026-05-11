# Hoop Dynasty Manager Feature Roadmap

## Purpose

This document tracks the full feature roadmap for Hoop Dynasty Manager.

The goal is to build a fictional basketball management game that starts small, becomes playable quickly, and then grows into a deeper franchise/career simulation over time.

---

# Current Merged Prototype

The current prototype already includes the foundation of the game.

## Project Foundation

- Vite + React + TypeScript app
- GitHub repository structure
- Main app shell
- Sidebar navigation
- Dark Midnight Court visual theme
- Sharp-corner manager-sim UI style
- Documentation folder

## League Foundation

- Main fictional league: British Super Basketball League
- Short name: BSBL
- 12 teams
- Teams across England, Wales and Scotland
- Planned season structure: 22 regular season games per team
- Planned playoffs: top 8 teams qualify

## Current Teams

- Bristol Breakers
- London Lionsgate
- Manchester Titans
- Birmingham Blaze
- Sheffield Steel
- Newcastle Knights
- Leeds Lightning
- Nottingham Outlaws
- Leicester Foxes
- Brighton Waves
- Cardiff Dragons
- Glasgow Giants

## Player Data

- 120 fictional players
- 10 players per team
- Player positions: PG, SG, SF, PF, C
- Player roles: Starter, Rotation, Depth, Prospect
- Player archetypes including Floor General, Sharpshooter, Slasher, Lockdown Defender, Rim Protector, Stretch Big, Glass Cleaner, Two-Way Wing, Playmaking Big, Sixth Man, Veteran Leader and Raw Prospect
- Current player ratings: overall, potential, morale, form

## Current Screens

### Dashboard

- Current team hero card
- Next fixture
- Team record
- League position
- Board confidence
- Top players/game leaders
- Latest result card
- Opening round standings
- Active tactics summary
- Simulate next fixture
- Simulate opening round

### Roster

- Full 10-player squad view
- Average overall
- Average potential
- Squad leader
- Top prospect
- Player role display
- Morale and form meters

### Tactics

- Starting five display
- Bench rotation display
- Depth/prospect players
- Tactical controls for pace, offensive focus, defensive style, rebounding focus and usage focus
- Assistant tactical notes

## Current Match Simulation

- Basic game simulation
- Hidden win probability helper
- Hidden probability is clamped between 5% and 95%
- Result winner is rolled from hidden probability
- Scoreline generated around selected winner
- Box score leaders generated with points, rebounds and assists
- Tactics influence scoring, variance, rebounding and usage
- Dashboard shows descriptive matchup labels instead of exact percentages

## Current Tactical Options

### Pace

- Slow
- Balanced
- Fast

### Offensive Focus

- Inside
- Balanced
- Three-Point Heavy
- Transition

### Defensive Style

- Man-to-Man
- Zone
- Press

### Rebounding Focus

- Get Back
- Balanced
- Crash Boards

### Usage Focus

- Balanced
- Star Player
- Guards
- Bigs

---

# Roadmap Overview

The roadmap is split into phases.

## Phase 1: Make the Prototype Properly Playable

Goal: Turn the current interactive prototype into a basic but complete mini-season experience.

Key outcome:

> The player can choose Bristol, simulate a full BSBL season, view standings, reach playoffs, and crown a champion.

## Phase 2: Make Management Choices Matter

Goal: Add real managerial decisions beyond clicking simulate.

Key outcome:

> The user can set tactics, manage rotation, respond to team form, develop players and feel responsible for results.

## Phase 3: Add Basketball Manager Depth

Goal: Add systems that make it feel like a proper franchise management game.

Key outcome:

> Team building, contracts, player development, scouting and transfers begin to shape long-term saves.

## Phase 4: Add Story, Drama and Long-Term Save Identity

Goal: Make each save feel alive.

Key outcome:

> Players have personalities, morale, story events, rivalries, media pressure and career arcs.

## Phase 5: Add Additional Game Modes

Goal: Expand beyond franchise mode.

Key outcome:

> Player career mode and custom league mode become possible.

---

# Phase 1: Make the Prototype Properly Playable

## 1. Full Season Schedule

Build a full 22-game regular season schedule.

Requirements:

- Each team plays every other team twice
- Home and away fixtures
- Round/game tracking
- Next fixture progression
- Ability to simulate next fixture
- Ability to simulate all games in a round
- Ability to simulate to end of regular season

Priority: Very high

## 2. Persistent Season State

Current results exist only during the current app session.

Requirements:

- Keep fixtures, results and standings in app state
- Track current round
- Prevent duplicate simulation of same fixture
- Store played results
- Prepare for local storage saves

Priority: Very high

## 3. Full Standings Table

Expand standings beyond the current compact dashboard table.

Requirements:

- Played
- Wins
- Losses
- Points for
- Points against
- Point difference
- Win percentage
- Position movement later
- Playoff cut line

Priority: Very high

## 4. Match Result Screen

Create a dedicated result screen after each game.

Requirements:

- Final score
- Matchup label
- Quarter-by-quarter scoring
- Top performers
- Full team box score
- Tactical summary
- Standings impact
- Continue button

Priority: High

## 5. Basic Playoffs

Add end-of-season playoffs.

Requirements:

- Top 8 qualify
- Quarter-finals
- Semi-finals
- Final
- Champion crowned
- Season summary

Priority: High

---

# Phase 2: Make Management Choices Matter

## 6. Tactics Influence Expansion

Current tactics affect the simulator in a simple first-pass way.

Future improvements:

- Better tactical counter system
- Better player archetype fit
- Matchup warnings
- Assistant advice before games
- Risk/reward explanations
- Tactical familiarity later

Priority: Very high

## 7. Rotation Management

Let the user choose who plays and how much.

Requirements:

- Starting five selection
- Bench order
- Minutes allocation
- Role assignment
- Rest player option
- Auto-pick rotation option

Priority: High

## 8. Player Attribute Expansion

Current players only have overall, potential, morale and form.

Add deeper attributes:

- Shooting
- Finishing
- Passing
- Ball handling
- Rebounding
- Interior defence
- Perimeter defence
- Athleticism
- Stamina
- Basketball IQ
- Discipline
- Clutch

Priority: Very high

## 9. Tactical Player Fit

Connect attributes and archetypes to tactics.

Examples:

- Fast pace needs athleticism, stamina and ball handling
- Three-point heavy needs shooting and passing
- Press needs stamina, athleticism, perimeter defence and discipline
- Inside focus needs finishing, rebounding and bigs
- Slow pace needs IQ, passing and half-court scorers

Priority: Very high

## 10. Form and Morale System

Make morale and form change over time.

Inputs:

- Wins/losses
- Minutes
- Role satisfaction
- Recent performance
- Team streaks
- Injuries later
- Contract issues later

Priority: High

---

# Phase 3: Basketball Manager Depth

## 11. Player Development

Make players improve or decline.

Requirements:

- Young players improve faster
- High potential matters
- Minutes help development
- Morale/form affect growth
- Older players decline
- End-of-season progression

Priority: High

## 12. Training Screen

Add training decisions.

Possible features:

- Team training focus
- Individual player focus
- Rest/recovery
- Tactical familiarity
- Youth development
- Shooting/defence/fitness focus

Priority: Medium

## 13. Contracts and Wages

Add basic team-building restrictions.

Possible features:

- Player salary
- Contract years
- Team budget
- Renewal negotiations
- Expiring contracts
- Free agents

Priority: Medium

## 14. Transfers / Free Agency

Add player movement.

Possible features:

- Sign free agents
- Release players
- Offer contracts
- Basic AI team signings
- Transfer interest
- Trade system later if using franchise-style rules

Priority: Medium

## 15. Scouting

Add future squad building.

Possible features:

- Scout free agents
- Scout youth prospects
- Reveal hidden potential
- Scout reports
- Risk ratings
- Fit with tactics

Priority: Medium

## 16. Facilities and Staff

Add club development.

Possible staff/facilities:

- Head coach
- Assistant coach
- Scout
- Physio/medical staff
- Training facility
- Youth academy

Priority: Low to medium

---

# Phase 4: Story, Drama and Save Identity

## 17. Inbox / News Feed

Add a central place for events.

Possible messages:

- Match previews
- Match reports
- Injury updates
- Player morale messages
- Board expectations
- Rivalry stories
- Transfer rumours

Priority: High once season loop works

## 18. Board Confidence

Current board confidence is static/simple.

Future improvements:

- Board expectations by team reputation
- Confidence changes from results
- Confidence changes from finances
- Pressure after bad runs
- Sacking risk later

Priority: Medium

## 19. Player Personalities

Add hidden or visible personality traits.

Possible traits:

- Loyal
- Ambitious
- Professional
- Hot-headed
- Team-first
- Injury-prone
- Big-game player
- Inconsistent

Priority: Medium

## 20. Rivalries

Add rivalry fixtures and increased drama.

Examples:

- Bristol vs London
- Manchester vs Birmingham
- Cardiff vs Glasgow
- Sheffield vs Leeds

Effects:

- Increased fan attention
- Morale swings
- Board expectations
- Higher variance

Priority: Low to medium

## 21. Awards and Records

Add season history.

Possible awards:

- MVP
- Defensive Player of the Year
- Rookie of the Year
- Sixth Man
- Coach/Manager of the Year
- All-BSBL Team

Records:

- Team championships
- Player career stats
- Single-game records
- Season records

Priority: Medium later

---

# Phase 5: Additional Game Modes

## 22. Team Selection / New Save Screen

Currently the user is effectively Bristol by default.

Requirements:

- Choose any BSBL team
- Show team difficulty
- Show roster strength
- Show finances later
- Show board expectations

Priority: High

## 23. Player Career Mode

Create one player and simulate their career.

Core loop:

- Create player
- Choose position/archetype
- Join a team
- Train attributes
- Earn minutes
- Track stats
- Move teams
- Win awards
- Retire with legacy score

Priority: Later, but important

## 24. Custom League Mode

Let users create their own league.

Possible options:

- Number of teams
- Team names
- League format
- Playoff size
- Fictional player generation
- Import/export data

Priority: Later

## 25. Expanded League Pyramid

Add lower or alternative competitions.

Possible future structure:

- BSBL top league
- British Championship second tier
- English lower division
- Welsh league
- Scottish league
- National Cup
- Trophy competition
- European-style competition

Priority: Later

---

# User Experience / Quality of Life

## Save System

Short term:

- Local storage save
- Continue save button
- Reset season button

Long term:

- User accounts
- Cloud saves
- Multiple save slots

Priority: Very high after season loop

## Responsive / Mobile UI

The game should work on phone, tablet and desktop.

Need:

- Better mobile navigation
- Scrollable tables
- Compact stat views
- Touch-friendly buttons

Priority: Medium

## Deployment

Need to deploy the app so it can be played in browser.

Possible route:

- Vercel deployment
- GitHub connected deploys
- Preview links per PR
- Main branch production deploy

Priority: High soon

## Testing and Build Checks

Need basic confidence that changes do not break the app.

Possible additions:

- TypeScript build check
- GitHub Actions workflow
- Basic linting
- Simple simulator tests later

Priority: High soon

---

# Suggested Immediate Build Order

## Next 10 Builds

1. Full 22-game schedule generator
2. Current round/fixture progression
3. Full standings screen
4. Dedicated match result screen
5. Local storage save system
6. Full regular season simulation
7. Playoff bracket and champion screen
8. Team selection/new save screen
9. Expanded player attributes
10. Rotation/minutes management

This order turns the current prototype into a playable season before adding deeper economy, transfers or career mode.

---

# Current Best Next Step

The next best build step is:

## Full 22-Game Schedule Generator

Reason:

The current game only has an opening round. A full schedule unlocks the rest of the game loop:

- Season progression
- Standings over time
- Save system
- Playoffs
- Player form changes
- Morale changes
- Match reports
- Awards

Without a full schedule, the game cannot yet become a real season simulator.
