# Hoop Dynasty Manager - Game Design Blueprint

This file is the source-of-truth design blueprint for Hoop Dynasty Manager.

Future AI builders and contributors should read this before making major feature, UI, or game-system changes.

## Product Vision

Hoop Dynasty Manager is a fictional basketball management game inspired by deep football management games, adapted for basketball.

The player is not directly controlling shots, passes, or dribbles. The player is the club decision-maker: manager, coach, general manager, and board-facing leader.

The goal is to build a basketball dynasty through smart squad building, tactical choices, financial management, player development, and long-term planning.

The final product should feel like a proper management sim game, not just a website dashboard.

## Fictional Setting

- League: British Super Basketball League.
- Short name: BSBL.
- Clubs: fictional British clubs with unique cities, histories, arenas, rivalries, fan cultures, and play styles.
- Players: fictional players only.
- Tone: serious sports management, energetic, readable, dramatic.

Do not add real teams, real players, NBA/BBL/EuroLeague data, or copyrighted real-world league assets unless explicitly approved later.

## Core Player Fantasy

The player should feel like they are taking charge of a club and shaping its future.

The player should regularly ask:

- Who should start?
- Who should get minutes?
- Who is tired or injured?
- Who is developing?
- Who needs a contract?
- Can I afford a signing?
- What does the board expect?
- How do I prepare for the next opponent?
- Am I building a contender or a rebuild?
- Can this club become a dynasty?

## Core Gameplay Loop

1. Read Inbox.
2. Review squad status.
3. Set rotation and tactics.
4. Choose training focus.
5. Simulate fixture or round.
6. Read Match Centre report.
7. React to fatigue, injuries, development, morale, board confidence, and standings.
8. Manage contracts, finance, releases, and free agents.
9. Progress through regular season.
10. Simulate playoffs.
11. Review season summary.
12. Eventually progress into offseason and next season.

## Current Feature Pillars

### Franchise Mode

The main playable mode.

Current direction:

- Choose a BSBL club.
- Manage roster.
- Set tactics.
- Set training.
- Simulate season fixtures.
- Track results and standings.
- Manage fatigue and injuries.
- Develop players.
- Manage contracts.
- Sign free agents.
- Manage board and finance.
- Simulate playoffs.
- Review season summary.

Future direction:

- Multi-season career saves.
- Offseason progression.
- Player ageing and regression.
- Generated rookies or academy intake.
- Staff and facilities.
- Sponsorship and deeper finances.
- Transfers or trades.
- League history.
- Awards and records.

### Inbox

The Inbox should become the main command centre.

It should surface actionable information:

- Results.
- Injury news.
- Fatigue warnings.
- Board confidence.
- Finance issues.
- Contract decisions.
- Player development.
- Free agent recommendations.
- Fixture prep.
- Playoff implications.

A good inbox message should always guide the player toward an action.

### Match Simulation

The match engine should make decisions matter.

Current factors:

- Team quality.
- Tactics.
- Home advantage.
- Player minutes.
- Form.
- Morale.
- Fatigue.
- Injuries.

Future factors:

- Possession model.
- Quarter-by-quarter scoring.
- Shot profiles.
- Turnovers.
- Fouls.
- Tactical counters.
- Bench unit chemistry.
- Clutch moments.
- Rivalry and home-court modifiers.

### Rotation and Minutes

Rotation management is central.

The player should balance:

- Star workload.
- Bench usage.
- Prospect development.
- Fatigue control.
- Injury risk.
- Matchup needs.

Future additions:

- Closing lineup.
- Rest player option.
- Minutes restriction.
- Auto-rotation assistant.
- Opponent-specific rotation advice.

### Training

Training is weekly preparation.

Current focuses:

- Balanced.
- Offense.
- Defense.
- Conditioning.

Training should influence:

- Form.
- Morale.
- Fatigue recovery.
- Development consistency.
- Tactical identity.

Future additions:

- Individual player plans.
- Position drills.
- Coaching staff impact.
- Facilities.
- Youth development.

### Player Development

Development should reward intelligent long-term management.

Current factors:

- Minutes.
- Age.
- Potential gap.
- Role.
- Form.
- Morale.
- Fatigue.
- Injury status.

Future additions:

- Hidden potential.
- Scouting uncertainty.
- Work ethic.
- Personality.
- Coach quality.
- Facilities.
- Breakout seasons.
- Regression.

### Fitness and Injuries

Fitness should create pressure.

Current ideas:

- Fatigue rises from heavy minutes.
- Conditioning helps recovery.
- Injuries affect performance.
- Rest helps recovery.

Future additions:

- Injury history.
- Medical staff.
- Return-to-play restrictions.
- Long-term injuries.
- Risk reports.

### Contracts and Finance

Contracts make roster building meaningful.

Current ideas:

- Annual wage.
- Contract years.
- Contract status.
- Renewals.
- Releases.
- Wage usage.
- Budget pressure.

Future additions:

- Player demands.
- Agent negotiations.
- Counter-offers.
- Signing bonuses.
- Release penalties.
- Expiry consequences.
- Board wage restrictions.

### Recruitment

Free agents are the first recruitment system.

Current ideas:

- Static free agent pool.
- Player interest.
- Fit labels.
- Budget approval.
- Signing adds to roster.

Future additions:

- Dynamic free agent generation.
- Competing clubs.
- Player demands.
- Negotiation windows.
- Scouting reports.
- Youth academy signings.

### Board Confidence

The board is the pressure layer.

Board confidence should react to:

- League position.
- Results.
- Club reputation.
- Financial health.
- Wage discipline.
- Playoff qualification.
- Championship success.
- Development for smaller clubs.

Future additions:

- Board objectives.
- Job security.
- Budget requests.
- Facility requests.
- Ultimatums.

## Future Game Modes

### Player Career

Create and guide one player through their career.

Possible loop:

- Create player.
- Choose position and archetype.
- Earn minutes.
- Train attributes.
- Change clubs.
- Chase awards.
- Build a legacy.

### Custom League

Build a custom fictional basketball universe.

Possible features:

- Custom teams.
- Custom league sizes.
- Custom countries.
- Custom formats.
- Custom colours and logos.

### Commissioner Mode

Control league rules and structure.

Possible features:

- Expansion.
- League format.
- Award rules.
- Financial rules.
- Competition structure.

## End Goal

The finished game should include:

- Multi-season franchise saves.
- Full league history.
- Player ageing and development.
- Staff and facilities.
- Contracts and recruitment.
- Meaningful tactics.
- Fitness and injury management.
- Board pressure.
- Playoffs and champion history.
- Awards and records.
- A polished game-like UI.

The final experience should feel like a sports management game that happens to run in a browser, not a static website with tables.