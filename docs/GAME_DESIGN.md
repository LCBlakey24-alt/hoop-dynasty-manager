# Hoop Dynasty Manager Game Design Document

## Working Title

**Hoop Dynasty Manager**

A fictional basketball management game focused on franchise building, tactical decisions, player development, season simulation, and long-term dynasty storytelling.

## Core Pitch

Take control of a fictional basketball franchise. Build the roster, manage tactics, develop players, handle pressure from fans and the board, simulate matches, chase championships, and eventually experience a separate player career mode where one created player rises through the basketball world.

The game should feel like a basketball version of a deep sports manager sim, but with a cleaner and more approachable web-game interface.

## Design Pillars

### 1. Fictional First

The first version uses fictional teams, players, leagues, cities, awards, and history. This avoids licensing issues and allows complete creative control.

### 2. Playable Before Massive

The first version must be small but genuinely playable. The core loop matters more than huge features.

### 3. Data With Drama

Stats should matter, but the game should not feel like a plain spreadsheet. Player morale, storylines, development arcs, rivalries, injuries, and board pressure should make each save feel alive.

### 4. Easy To Start, Hard To Master

Players should understand the basics quickly: pick team, set lineup, simulate match. Deeper systems like tactics, contracts, scouting, and player development can grow over time.

### 5. Built For Expansion

The code and design should allow future features such as custom leagues, career mode, online saves, imports, alternate rules, draft systems, European-style leagues, promotion/relegation, and community-made rosters.

---

# Game Modes

## 1. Franchise Manager Mode

This is the main first mode.

The player becomes the general manager/head coach of a fictional team and manages them across seasons.

Core responsibilities:

- Pick a team
- View roster
- Set starting five
- Set bench order
- Choose tactical style
- Simulate matches
- Review box scores
- Track league standings
- Develop players
- Manage morale
- Reach playoffs
- Win championships

Future responsibilities:

- Contracts
- Transfers/free agents
- Trades
- Draft/youth prospects
- Staff hiring
- Facilities
- Sponsorships
- Fan expectations
- Board confidence
- Media stories

## 2. Player Career Mode

This is planned after the franchise match/season loop works.

The player creates one basketball player and simulates their career.

Possible player creation choices:

- Name
- Age
- Nationality/city
- Height
- Weight
- Position
- Archetype
- Personality
- Strengths
- Weaknesses

Career mode should track:

- Team offers
- Minutes
- Role
- Stats
- Morale
- Training focus
- Contract value
- Awards
- Injuries
- Rivalries
- Legacy score

Example career fantasy:

> Create a 6'4 defensive point guard from Bristol, start as a raw prospect, fight for minutes, become a starter, request a move, win MVP, decline with age, and retire as a club legend.

---

# First Playable Target

The first playable version should be deliberately small.

## Version 0.1 Goal

A player can:

1. Open the game
2. Pick a fictional team
3. View the team dashboard
4. View the roster
5. Set or view a starting five
6. Simulate the next match
7. See the final score and box score
8. See the league table update
9. Continue through a short season
10. Reach playoffs and crown a champion

## Version 0.1 Non-Goals

Do not include these yet:

- Real teams or players
- Online multiplayer
- 3D match engine
- Full salary cap
- Huge scouting system
- Real-money purchases
- Mobile app store release
- Complex transfer AI
- Deep media engine

---

# Fictional League

## League Name

**British Elite Basketball League**

Short name: **BEBL**

## Starting League Size

Start with **8 teams**.

This keeps the season manageable and makes the first simulation easier to test.

## Teams

### 1. Bristol Breakers

- City: Bristol
- Identity: fast, aggressive, exciting
- Colours: navy, orange, white
- Style: fast break, attacking guards

### 2. London Lionsgate

- City: London
- Identity: wealthy, polished, high expectation
- Colours: purple, gold, black
- Style: star-led half-court offence

### 3. Manchester Titans

- City: Manchester
- Identity: physical, disciplined, hard to beat
- Colours: steel blue, silver, black
- Style: defence and rebounding

### 4. Birmingham Blaze

- City: Birmingham
- Identity: energetic, streaky, dangerous scorers
- Colours: red, orange, charcoal
- Style: three-point shooting and pace

### 5. Cardiff Dragons

- City: Cardiff
- Identity: passionate, tough, home-court energy
- Colours: red, black, white
- Style: pressure defence and attacking the paint

### 6. Glasgow Giants

- City: Glasgow
- Identity: big, physical, intimidating
- Colours: green, white, dark navy
- Style: post play, rebounding, rim protection

### 7. Sheffield Steel

- City: Sheffield
- Identity: gritty, efficient, underdog mentality
- Colours: grey, orange, black
- Style: balanced team basketball

### 8. Newcastle Knights

- City: Newcastle
- Identity: proud, tactical, defensive
- Colours: midnight blue, silver, white
- Style: slow pace, strong defence

---

# Season Structure

## Version 0.1 Season

- 8 teams
- Each team plays each other twice
- 14 regular season games per team
- Top 4 qualify for playoffs
- Semi-finals: 1st vs 4th, 2nd vs 3rd
- Final crowns the champion

## Future Season Options

- Longer seasons
- Best-of-three playoff series
- Cup competition
- All-Star event
- Promotion/relegation
- Continental competitions
- Custom league settings

---

# Player Model

## Positions

- PG: Point Guard
- SG: Shooting Guard
- SF: Small Forward
- PF: Power Forward
- C: Centre

## Core Ratings

Ratings should initially be out of 100.

- Overall
- Potential
- Shooting
- Three Point
- Finishing
- Passing
- Ball Handling
- Rebounding
- Interior Defence
- Perimeter Defence
- Athleticism
- Stamina
- Basketball IQ
- Consistency
- Morale
- Injury Resistance

## Hidden/Future Ratings

Later versions can add hidden traits:

- Ambition
- Loyalty
- Work Rate
- Leadership
- Clutch
- Professionalism
- Coachability
- Big Game Mentality

## Player Archetypes

Initial archetypes:

- Floor General
- Sharpshooter
- Slasher
- Lockdown Defender
- Rim Protector
- Stretch Big
- Glass Cleaner
- Two-Way Wing
- Playmaking Big
- Sixth Man
- Veteran Leader
- Raw Prospect

Archetypes should affect starting ratings, development, and tactical fit.

---

# Team Model

Each team should have:

- ID
- Name
- City
- Short name
- Logo/badge placeholder
- Primary colour
- Secondary colour
- Reputation
- Budget rating
- Fanbase rating
- Tactical identity
- Roster
- Record
- Form

Future team traits:

- Board patience
- Youth academy quality
- Market size
- Training facilities
- Medical facilities
- Rivalries
- Fan culture

---

# Tactics

## Version 0.1 Tactical Settings

Keep tactics simple at first.

### Pace

- Slow
- Balanced
- Fast

### Offensive Focus

- Inside
- Balanced
- Three-Point Heavy

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

## Tactical Effects

Tactics should affect match simulation.

Examples:

- Fast pace increases possessions, scoring, fatigue, and turnovers.
- Slow pace lowers score variance and favours defensive teams.
- Three-point heavy increases high-scoring potential but adds inconsistency.
- Inside focus favours strong finishers and bigs.
- Press increases steals but increases fatigue and fouls.
- Crash boards increases rebounds but risks fast-break points conceded.

---

# Match Simulation

## Version 0.1 Approach

Start with a simplified simulation, not a full possession-by-possession engine.

The match engine should:

- Compare team attacking strength
- Compare team defensive strength
- Consider tactics
- Consider morale/form
- Add controlled randomness
- Produce a believable score
- Produce player box score stats

## Basic Team Strength Concepts

Attack should consider:

- Shooting
- Three-point ability
- Finishing
- Passing
- Ball handling
- Basketball IQ

Defence should consider:

- Interior defence
- Perimeter defence
- Rebounding
- Stamina
- Basketball IQ

Game flow should also consider:

- Home advantage
- Pace
- Morale
- Consistency
- Random variance

## Box Score Stats

Initial box score should include:

- Minutes
- Points
- Rebounds
- Assists
- Steals
- Blocks
- Turnovers
- Field goal percentage
- Three-point makes/attempts

Future stats:

- Plus/minus
- Fouls
- Free throws
- Usage
- Efficiency rating
- Shot chart

---

# Screens

## Home / Save Start

Purpose:

- Start new franchise mode
- Start player career mode later
- Continue save later

## Team Select

Purpose:

- Choose starting team
- Show team identity, record expectations, play style, difficulty

## Dashboard

Purpose:

- Main hub between matches

Should show:

- Current team
- Next fixture
- Team record
- League position
- Recent form
- Top performers
- Injuries
- Board confidence
- Continue/simulate button

## Roster

Purpose:

- Understand squad quality and roles

Should show:

- Player list
- Position
- Age
- Overall
- Potential
- Morale
- Form
- Key ratings
- Starting five marker

## Tactics

Purpose:

- Control how the team plays

Should show:

- Starting five
- Bench order
- Pace
- Offensive focus
- Defensive style
- Rebounding focus
- Usage focus
- Court diagram

## Match Result

Purpose:

- Make simulation results feel satisfying

Should show:

- Final score
- Quarter scores
- Top performers
- Box score
- Tactical notes
- Standings impact

## League

Purpose:

- Track competition progress

Should show:

- Standings
- Wins/losses
- Points percentage
- Games behind
- Points scored/against
- Playoff picture

---

# Player Career Mode Design Notes

Player career should not be built before the manager loop works, but it should be planned from the start.

## Player Career Core Loop

1. Create player
2. Choose archetype
3. Receive starting team/offers
4. Train attributes
5. Simulate games
6. Earn or lose minutes
7. Improve ratings
8. Receive media/story events
9. Sign contracts or move teams
10. Build legacy

## Player Career Personality Options

Possible personality types:

- Loyal Teammate
- Confident Star
- Hard Worker
- Flashy Showman
- Quiet Professional
- Hot-Headed Competitor
- Team-First Leader

Personality can affect morale, team chemistry, media stories, contract demands, and development.

---

# Progression Systems

## Player Development

Initial simple model:

- Young players improve faster.
- High potential players improve more.
- Minutes help development.
- Morale helps development.
- Injuries slow development.
- Older players slowly decline.

## Team Progression

Future model:

- Facilities improve development.
- Coaches affect tactical boosts.
- Board investment affects budgets.
- Fanbase grows after success.
- Reputation improves after championships.

---

# Story Systems For Later

The long-term goal is to make the save feel alive.

Possible story events:

- Star player unhappy with minutes
- Rookie breakout season
- Veteran accepts bench role
- Rival coach talks trash
- Fan favourite injured before playoffs
- Player requests transfer
- Board demands playoff qualification
- Underdog team makes finals
- Prospect becomes a superstar
- Ageing legend declines

---

# Technical Direction

## Recommended Prototype Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Local storage first
- Static fictional data first

## Future Stack Options

Once the game loop works:

- Supabase for accounts and saves
- PostgreSQL database
- Vercel hosting
- Auth system
- Cloud saves
- Custom league sharing

---

# First Build Milestone

## Milestone: Playable Prototype 0.1

A successful 0.1 build means:

- The app runs in browser
- Fictional teams exist
- Fictional players exist
- User can select a team
- Dashboard displays current team and next fixture
- User can simulate a match
- Match result displays final score and player stats
- League standings update
- A short season can finish
- Playoffs can crown a champion

This is the first real version of the game.

---

# Design Note

The UI should follow the **Midnight Court** theme from `docs/DESIGN.md`.

The game should look like a premium sports-management dashboard, not a plain database table.
