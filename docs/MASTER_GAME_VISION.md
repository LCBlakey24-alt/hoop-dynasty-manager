# Hoop Dynasty Manager — Master Game Vision

## Purpose

This document is the long-term design source of truth for Hoop Dynasty Manager.

Any future developer, AI coding agent, Codex task or planning tool should read this file before making major gameplay, simulation, UI or data changes.

Hoop Dynasty Manager should grow into a fictional basketball management universe with the depth, personality and long-term storytelling of Football Manager, but designed around basketball culture, coaching, tactics, staff, players, facilities, finances and global league identity.

The game should not feel like a simple match simulator. It should feel like a living basketball world.

---

## High-Level Vision

Hoop Dynasty Manager is a deep basketball management and career simulation game.

Players should be able to take control of a club, coach, general manager, owner or individual player and build a legacy across seasons, leagues and countries.

The long-term vision is:

- A fictional basketball universe with its own teams, players, leagues and history.
- A full season loop with fixtures, standings, playoffs, champions and records.
- Distinct national and league identities.
- Deep tactical, staff, player development, training, finance and facility systems.
- Player, coach and manager personalities and conversations.
- Watchable matches with moving dots and live event commentary.
- Expandable leagues, countries, custom teams and future Steam/mod support.

---

## Core Design Principles

### 1. Football Manager-style depth

The target is not a small casual basketball game. The target is a deep management simulation.

The game should grow in layers: simple first, deep over time.

Every system should create more meaningful decisions, more unique teams, more player stories, or more world identity.

### 2. A fictional world with believable structure

The game should avoid licensed teams and real players, but the fictional world should still feel grounded.

Teams should have histories, fan cultures, rivalries, arenas, famous former players and long-term reputations.

### 3. Countries and leagues must feel different

A British team should not feel like an American team with a different name.

A European league should not feel like a British league with different colours.

Each country and league should have different rules, playing styles, budgets, staff structures, development systems and media cultures.

### 4. Management roles should feel different

A head coach should not play the same as a general manager.

A player career should not play the same as a franchise career.

A club owner should not play the same as a tactical coach.

Every mode needs its own responsibilities and limitations.

### 5. Simulation first, flavour second

AI-generated flavour, story text and reports can be powerful, but they must sit on top of structured simulation systems.

The game should not fake depth with text alone. Underlying ratings, roles, finance, form, tactics and results should drive the experience.

---

## Core Game Modes

## Franchise / Manager Mode

This is the main mode currently being built.

The player takes control of a basketball club or franchise and runs the overall team operation.

Responsibilities should eventually include:

- Team selection
- Roster management
- Tactics
- Training
- Player development
- Staff hiring
- Scouting
- Transfers or free agency
- Contracts
- Facilities
- Finances
- Sponsorship
- Board expectations
- Media handling
- Season results
- Playoffs
- Awards and records
- Club legacy

This mode should become the closest equivalent to Football Manager.

---

## Head Coach Career Mode

In this mode, the player is a coach, not the whole club.

The player should control:

- Tactics
- Rotations
- Training focus
- Player relationships
- Staff communication
- Match preparation
- In-game adjustments
- Media answers
- Board pressure
- Job offers

The player should not always fully control:

- Transfers
- Contracts
- Budgets
- Facility upgrades
- Ownership decisions

Career progression example:

- Assistant coach at a small British club
- Head coach at a lower-reputation team
- Move to a bigger BSBL club
- Win domestic trophies
- Move to Europe or America
- Become a legendary coach

This mode should focus on reputation, coaching identity, relationships and results.

---

## General Manager / Director Mode

In this mode, the player is responsible for front-office decisions.

The player should control:

- Contracts
- Trades or transfers
- Free agents
- Drafts in American leagues
- Scouting
- Salary rules
- Staff hiring
- Facilities
- Long-term roster planning
- Player values
- Owner expectations

The head coach should control tactics and game-day rotations.

This mode fits especially well with American-style leagues where front offices are a huge part of basketball culture.

---

## Player Career Mode

In this mode, the player creates and controls one basketball player.

The player should choose or manage:

- Name
- Height
- Weight
- Position
- Archetype
- Personality
- Training focus
- Agent relationship
- Contract choices
- Media behaviour
- Team relationships
- Personal goals
- Career decisions

The game should decide or influence:

- Coach trust
- Minutes
- Role
- Injuries
- Team offers
- Transfers
- Development
- Decline
- Legacy
- Retirement

Possible player paths:

- British academy prospect
- American college star
- European tactical guard
- Defensive specialist
- Flashy scorer
- Late bloomer
- Injury comeback story
- Bench player who becomes a legend

---

## Owner / Club Builder Mode

Long-term future mode.

The player owns, creates or rebuilds a team.

Responsibilities could include:

- Club name and branding
- Kit colours
- Arena selection
- Facility upgrades
- Budgets
- Sponsorship
- Ticket prices
- Staff hiring
- Youth academy
- League applications
- Expansion decisions
- Community profile

This mode supports custom teams and long-term save identity.

---

## Commissioner / League Creator Mode

Very long-term future mode.

The player runs an entire league.

Responsibilities could include:

- Number of teams
- League format
- Salary rules
- Draft rules
- Transfer rules
- Promotion and relegation
- Cup competitions
- Foreign player limits
- Playoff format
- Expansion teams
- Media deals
- League reputation

This mode could support custom league creation and Steam Workshop sharing.

---

## Country and League Identity

Each country should have a unique basketball identity.

This should affect:

- Playing style
- Team building
- Staff roles
- Budgets
- Player development
- Media pressure
- Fan culture
- Transfer systems
- League rules
- Match tempo
- Tactical preferences

---

## Britain / UK Basketball Identity

British basketball should feel:

- Physical
- Gritty
- Defensive
- Emotional
- Underdog-driven
- Rivalry-heavy
- Community-based
- Less polished than elite European systems
- Less flashy than America
- Hard-working and rough around the edges

British clubs should value:

- Effort
- Rebounding
- Defence
- Pressure
- Toughness
- Chemistry
- Local pride
- Smart coaching

British challenges:

- Lower budgets
- Smaller arenas
- Harder player retention
- Less star power
- Sponsorship pressure
- Reliance on development and coaching

British staff roles may include:

- Head Coach
- Assistant Coach
- Player Development Coach
- Strength and Conditioning Coach
- Physio
- Team Manager
- Academy Coach
- Community Coach
- Scout

---

## United States Basketball Identity

American basketball should feel:

- Flashy
- Star-driven
- Athletic
- Stats-heavy
- Media-heavy
- High scoring
- Commercial
- Draft-focused
- Big money
- Big personalities

American teams should value:

- Star power
- Athleticism
- Shot creation
- Marketing
- Analytics
- Draft picks
- Contracts
- Individual matchups
- Specialist coaching

American systems should include:

- Draft
- Salary cap
- Trades
- Trade deadline
- Free agency
- Player options
- Team options
- Rookie contracts
- Waivers
- Luxury tax later
- All-Star events
- Media drama
- Player brands

American staff roles may include:

- Head Coach
- Associate Head Coach
- Offensive Coordinator
- Defensive Coordinator
- Assistant Coach
- Shooting Coach
- Player Development Coach
- Strength Coach
- Conditioning Coach
- Analytics Director
- Video Coordinator
- College Scout
- Pro Scout
- Cap Specialist
- General Manager
- Assistant GM
- Medical Director
- Performance Director
- Sports Psychologist
- Media Relations Officer
- Agent Liaison

---

## European Basketball Identity

European basketball should feel:

- Technical
- Tactical
- Disciplined
- Structured
- Team-first
- Development-heavy
- Passing-heavy
- Spacing-focused
- Coaching-driven

European teams should value:

- Basketball IQ
- Passing
- Spacing
- Defensive schemes
- Youth academies
- Tactical discipline
- Team chemistry
- International scouting

European systems may include:

- Domestic leagues
- Continental competitions
- Cup tournaments
- Promotion and relegation in some countries
- Foreign player limits
- Academy pathways
- Loan systems
- Buyout clauses

European staff roles may include:

- Head Coach
- Technical Director
- Youth Academy Director
- Development Coach
- Tactical Assistant
- Skills Coach
- Shooting Coach
- Fitness Coach
- Scout
- European Scout
- Foreign Player Liaison
- Medical Lead
- Performance Analyst

---

## Other Future Country Styles

Spain should feel tactical, technical, passing-heavy and development-driven.

Serbia and Balkan leagues should feel tough, passionate, high-IQ and guard-focused.

France should feel athletic, defensive and development-focused.

Germany should feel structured, disciplined, physical and efficient.

Australia should feel tough, physical, high-motor and development-friendly.

Japan should feel fast, disciplined, guard-heavy and efficient.

Canada should feel modern, athletic, development-focused and American-influenced.

---

## Staff and Coaching Systems

Staff should become a major part of the game.

Basic staff roles:

- Head Coach
- Assistant Coach
- General Manager
- Scout
- Physio
- Strength Coach
- Development Coach

Advanced staff roles:

- Offensive Coach
- Defensive Coach
- Shooting Coach
- Big Man Coach
- Guard Coach
- Youth Coach
- Academy Director
- Analytics Analyst
- Video Analyst
- Sports Psychologist
- Medical Director
- Conditioning Coach
- Recruitment Director
- Salary Cap Expert
- Media Officer
- Team Manager

Staff attributes:

- Tactical Knowledge
- Player Development
- Motivation
- Discipline
- Adaptability
- Scouting Eye
- Negotiation
- Medical Skill
- Fitness Knowledge
- Analytics
- Youth Development
- Man Management
- Reputation
- Loyalty
- Ambition

Staff personalities:

- Strict disciplinarian
- Player-friendly mentor
- Analytics obsessive
- Old-school motivator
- Defensive specialist
- Offensive genius
- Youth developer
- Media-friendly coach
- Hot-headed coach
- Loyal assistant
- Future head coach

Staff should affect:

- Tactics
- Training
- Player development
- Morale
- Injuries
- Scouting accuracy
- Player trust
- Match preparation
- Late-game performance
- Team identity

---

## Player Attributes

Long-term player depth should include technical, physical and mental attributes.

Technical attributes:

- Shooting
- Three-point shooting
- Mid-range shooting
- Free throws
- Finishing
- Post scoring
- Passing
- Ball handling
- Off-ball movement
- Screen setting
- Rebounding
- Shot blocking
- Steals

Defensive attributes:

- Interior defence
- Perimeter defence
- Help defence
- Switching
- Defensive IQ
- Rim protection
- Closeouts
- Defensive discipline

Physical attributes:

- Speed
- Acceleration
- Strength
- Vertical
- Stamina
- Durability
- Agility
- Balance
- Explosiveness

Mental attributes:

- Basketball IQ
- Composure
- Leadership
- Work ethic
- Discipline
- Clutch
- Consistency
- Confidence
- Aggression
- Coachability
- Professionalism
- Loyalty
- Ambition

Hidden attributes:

- Injury proneness
- Big-game mentality
- Adaptability
- Pressure handling
- Greed
- Teamwork
- Media comfort
- Development curve
- Peak age
- Decline rate

---

## Player Personalities

Players should feel like people, not just numbers.

Personality examples:

- Loyal club man
- Ambitious star
- Quiet professional
- Flashy scorer
- Defensive dog
- Hot-headed competitor
- Team-first leader
- Inconsistent talent
- Injury-prone prodigy
- Late bloomer
- Locker-room problem
- Fan favourite
- Big-game killer

Personality should affect:

- Contract demands
- Transfer requests
- Morale
- Media behaviour
- Training effort
- Team chemistry
- Leadership
- Coach relationships

---

## Conversations and Relationships

The game should eventually allow conversations between:

- Player and coach
- Player and manager
- Coach and general manager
- Coach and assistant coach
- Manager and board
- Manager and media
- Player and agent

Conversation examples:

- Player asks for more minutes
- Player complains about role
- Coach asks for a new assistant
- Board demands playoff qualification
- Star player wants a contract extension
- Veteran accepts reduced role
- Young prospect wants a loan or development plan
- Player reacts to training intensity
- Captain helps resolve squad conflict

Conversation outcomes should affect:

- Morale
- Trust
- Role satisfaction
- Contract demands
- Transfer requests
- Chemistry
- Reputation
- Board confidence

---

## Tactics and Match Preparation

Current tactics are only the beginning.

Future tactical systems should include:

- Pick-and-roll frequency
- Post-up frequency
- Isolation frequency
- Off-ball screens
- Three-point rate
- Transition priority
- Switching defence
- Drop coverage
- Hedge coverage
- Trapping
- Double-teaming stars
- Protecting the paint
- Forcing baseline
- Zone types
- Press types
- Bench rotation aggressiveness
- Foul management
- Timeout logic
- Late-game strategy

Tactical familiarity should matter.

Changing tactics constantly should hurt chemistry.

A team that has played the same system for multiple seasons should perform better in it.

---

## Match Engine Vision

The current match engine simulates results instantly.

Long-term, the player should be able to watch their game.

A future match view should include:

- A court visual
- Player dots moving around the court
- Ball movement
- Possession flow
- Live scoreboard
- Game clock
- Play-by-play feed
- Player stats updating live
- Tactical adjustments during the game
- Substitution decisions
- Timeout decisions
- Momentum swings

The match should feel like a sped-up basketball version of Football Manager.

The player should not just simulate all games in a round.

Long-term schedule progression should be calendar-based.

The ideal flow is:

- Calendar advances day by day
- News and events appear between matches
- The player sees the next match date
- The player can simulate to next match
- Other league matches happen naturally in the background
- The player can choose to watch their own match
- Results update after each match day

Current round-based simulation is acceptable for the prototype, but should be replaced later with date-based fixtures and simulate-to-next-match controls.

---

## Kit Design and Sponsorship

Kit design should become part of the club identity and commercial system.

Possible features:

- Home kit
- Away kit
- Alternate kit
- Sponsor logo/style
- Manufacturer style
- Colour palette
- Shirt pattern
- Short colour
- Trim colour
- Seasonal redesign

Sponsor-driven redesign idea:

If a new sponsor signs with the club or league, the club may need to redesign kits based on that sponsor's style.

The game could generate three kit options.

The player chooses one.

Kit choices could affect:

- Fan reaction
- Sponsorship value
- Merchandise sales
- Club identity
- Board approval

Future custom team creators should be able to design kits from scratch.

---

## Custom Teams and Club Creation

Players should eventually be able to create their own team and build it up.

Custom team creation could include:

- Team name
- City
- Country
- League entry point
- Badge/logo later
- Kit colours
- Arena name
- Fan culture
- Starting budget
- Starting roster quality
- Youth academy quality
- Staff quality
- Club philosophy
- Rivalries

Custom teams should be usable in:

- Franchise mode
- Owner mode
- Custom league mode
- Expansion league systems

A general manager should be able to create a team in a league and try to build that team into a powerhouse.

---

## Facilities and Finances

Facilities need as much detail as possible because they create long-term progression.

Facility areas:

- Main arena
- Training court
- Strength and conditioning centre
- Medical centre
- Recovery suite
- Analytics department
- Video room
- Youth academy
- Scouting department
- Fan facilities
- Merchandise store
- Travel infrastructure
- Accommodation and player care

Facilities should affect:

- Player development
- Injury recovery
- Injury prevention
- Scouting accuracy
- Revenue
- Fan growth
- Sponsorship attraction
- Player interest
- Staff recruitment
- Youth intake quality

Finances should include:

- Wage budget
- Transfer or recruitment budget
- Staff wages
- Facility costs
- Arena income
- Ticket sales
- Sponsorship
- Merchandise
- Prize money
- Travel costs
- Academy costs
- Debt
- Owner investment

Sponsorship should help fund facilities and growth.

The player should be able to choose whether to spend money on players now or infrastructure for the future.

---

## Media and News

The game should eventually include an inbox or news feed.

Possible messages:

- Star unhappy with minutes
- Prospect impresses in training
- Coach under pressure
- Board demands playoffs
- Fan anger after rivalry loss
- Player wants new contract
- Transfer rumour
- Injury setback
- Breakout performance
- Veteran considering retirement
- Player called up internationally
- Sponsor offer
- Facility upgrade proposal
- Kit redesign request

Media tone should differ by country.

America should have star drama, hot takes and trade rumours.

Britain should have local pride, board pressure and underdog stories.

Europe should have tactical analysis and club politics.

---

## Awards and Records

The game world needs memory.

Awards could include:

- MVP
- Defensive Player of the Year
- Rookie of the Year
- Sixth Man
- Coach of the Year
- Most Improved
- All-League First Team
- All-Defensive Team
- Finals MVP

Records could include:

- Most points in a game
- Most rebounds in a game
- Most assists in a game
- Best season record
- Championship history
- Player career totals
- Club legends
- Retired jerseys
- Hall of Fame

---

## International Basketball

Future features should include:

- National teams
- International tournaments
- World Cup-style events
- Olympic-style events
- Player call-ups
- National pride
- International scouting
- Country reputation
- Dual nationality

This should connect to country identity and player development.

---

## Custom League Mode and Mod Support

Custom league mode should eventually allow players to create:

- Teams
- Leagues
- Countries
- Players
- Rules
- Playoff formats
- Promotion and relegation
- Drafts
- Financial systems
- Roster rules
- Foreign player limits

Steam Workshop or mod support could allow:

- Custom teams
- Custom players
- Custom leagues
- Custom logos
- Custom rosters
- Custom country styles
- Custom rule sets
- Custom arenas

This is a major long-term selling point.

---

## Steam and Early Access Direction

The game should eventually be suitable for Steam Early Access.

Early Access is viable only once the game has a small but real playable loop.

Minimum Early Access quality should include:

- Full playable season
- Team selection
- Save system
- Roster screen
- Tactics screen
- Training screen
- Schedule
- Standings
- Playoffs
- Champion
- Team identity
- Basic player attributes
- Basic player development
- Match reports
- Few obvious bugs

Long-term packaging could use Electron or Tauri to turn the web app into a desktop game.

Suggested roadmap:

Version 0.1:

- BSBL league
- 12 teams
- Full season
- Playoffs
- Champion
- Team select
- Roster
- Tactics
- Training
- Club identity
- Save system

Version 0.2:

- Deeper player attributes
- Better match engine
- Better training
- Player development
- Season stats
- Awards

Version 0.3:

- Contracts
- Free agents
- Transfers
- Staff hiring
- Scouting

Version 0.4:

- Youth academy
- Player personalities
- Morale and chemistry depth
- Media inbox

Version 0.5:

- Player career mode
- Coach career mode
- Job offers
- Career progression

Version 0.6:

- More countries
- More leagues
- International competitions
- Country-specific systems

Version 1.0:

- Full career universe
- Multiple leagues
- Deep staff
- Deep tactics
- Awards and history
- Custom leagues
- Steam-ready polish

---

## Current Design Correction Needed

The current prototype uses round-based simulation.

Long-term, the game should move to a calendar system.

Instead of the player clicking simulate round, the player should progress through dates.

The ideal control should be:

- Continue
- Simulate to next match
- Simulate day
- Simulate week
- Watch match

Other games should happen in the background based on the calendar.

The player should be able to watch their own game with live dots and event commentary.

---

## Build Philosophy

Build in layers:

1. Core loop
2. Better information display
3. Player attributes
4. Statistics tracking
5. Development and progression
6. Staff
7. Scouting and recruitment
8. Contracts and finances
9. Facilities
10. Media and conversations
11. Career modes
12. Customisation and expansion
13. Polish and Steam readiness

Every new system should answer at least one of these questions:

- Does this make the world feel more alive?
- Does this make choices more meaningful?
- Does this make teams or players feel different?
- Does this create long-term stories?
- Does this support future expansion?

If the answer is no, the feature is probably not worth adding yet.
