# Hoop Dynasty Manager Match Engine

## Core Philosophy

The match engine should be built around a hidden win probability system rather than simple flat bonuses.

The player should feel that every choice matters, but no choice should guarantee victory. There should never be one obvious best tactic. Every tactic should have strengths, weaknesses, player-fit requirements, and counters.

## Core Rule

No team should ever have a 0% or 100% chance to win.

Recommended early clamp:

- Minimum win chance: 5%
- Maximum win chance: 95%

This keeps underdogs alive and prevents strong teams from becoming automatic wins.

---

# Match Flow

The match engine should eventually follow this structure:

1. Calculate base team strength.
2. Compare both teams to create an initial hidden win probability.
3. Apply modular modifiers.
4. Clamp final win probability.
5. Roll/simulate the winner using the hidden probability.
6. Generate a believable scoreline based on style and pace.
7. Generate player box score stats based on role, archetype, usage and performance.
8. Show the player descriptive feedback, not exact hidden percentages.

---

# Hidden Win Probability

## Base Strength

Base strength should come from the roster.

Early inputs:

- Player overall
- Player role
- Player form
- Player morale
- Team reputation
- Bench depth

Future inputs:

- Full attribute ratings
- Coach quality
- Injuries
- Fatigue
- Chemistry
- Home/away travel
- Recent schedule congestion

## Probability Modifiers

Each system should add or subtract small probability modifiers.

Examples:

- Home court advantage: +2% to +5%
- Strong morale: +1% to +4%
- Poor form: -1% to -5%
- Better bench depth: +1% to +3%
- Tactical advantage: +2% to +8%
- Bad tactical matchup: -2% to -8%
- Fatigue: -1% to -8%
- Key injury: -3% to -15%

These values are not final balance numbers. They are starting ranges.

---

# Player-Facing Feedback

The exact win probability should usually remain hidden.

Instead of showing:

> Win chance: 63%

Show descriptive hints such as:

- Even matchup
- Slight advantage
- Strong advantage
- Risky tactical fit
- Bad matchup
- High upset chance
- Favourable game plan
- Opponent counters our style well

This keeps the game immersive and avoids turning every match into a maths puzzle.

---

# Tactical Balance Principles

Every tactic must have:

- Strengths
- Weaknesses
- Good player fits
- Bad player fits
- Counters
- Situational value

No tactic should be strictly better than the others.

---

# Pace

## Slow

Strengths:

- More control
- Lower variance
- Helps veteran teams
- Helps defensive teams
- Protects weaker benches

Weaknesses:

- Fewer scoring chances
- Harder to come back from behind
- Can struggle against elite shooters
- Can waste athleticism

Good fits:

- Veteran Leader
- Floor General
- Rim Protector
- Playmaking Big

Bad fits:

- Raw Prospect
- Slasher-heavy teams with poor shooting
- Teams needing tempo

Counters:

- Press defence
- Three-point heavy offence
- Fast pace with athletic guards

## Balanced

Strengths:

- Safe default
- Lower tactical risk
- Works with mixed rosters

Weaknesses:

- No strong edge
- Can be out-specialised by focused teams

Good fits:

- Two-Way Wing
- Floor General
- Balanced rosters

Counters:

- Strongly specialised teams if they have good player fit

## Fast

Strengths:

- More possessions
- Better comeback potential
- Rewards athleticism
- Creates higher scoring games

Weaknesses:

- More variance
- More fatigue later
- More turnovers later
- Can expose weak defence

Good fits:

- Slasher
- Floor General
- Two-Way Wing
- Raw Prospect with athleticism later

Bad fits:

- Veteran-heavy teams
- Slow bigs
- Poor ball handlers
- Short benches

Counters:

- Slow pace
- Strong rebounding
- Good transition defence

---

# Offensive Focus

## Inside

Strengths:

- Efficient scoring
- More stable than three-point-heavy offence
- Rewards strong bigs and finishers
- Better rebounding profile

Weaknesses:

- Can be clogged by zone defence
- Needs strong bigs
- Can struggle without spacing

Good fits:

- Rim Protector
- Glass Cleaner
- Playmaking Big
- Slasher

Counters:

- Zone
- Rim protection
- Fast pace that punishes slower bigs

## Balanced

Strengths:

- Low risk
- Flexible
- Works with mixed rosters

Weaknesses:

- Does not strongly exploit opponent weaknesses

Good fits:

- Two-Way Wing
- Floor General
- Versatile rosters

Counters:

- Teams with a clear tactical edge and strong player fit

## Three-Point Heavy

Strengths:

- High scoring ceiling
- Great comeback potential
- Stretches defences
- Punishes zone

Weaknesses:

- Streaky
- Bad shooting nights can be brutal
- Long rebounds can create transition chances

Good fits:

- Sharpshooter
- Stretch Big
- Floor General
- Playmaking Big

Bad fits:

- Poor shooting rosters
- Low passing/IQ rosters later

Counters:

- Perimeter defence
- Strong rebounding
- Press if opponent lacks ball handling

## Transition

Strengths:

- Rewards athletic teams
- Creates easy points
- Can punish slow teams

Weaknesses:

- Can become chaotic
- Needs guards who can handle pressure
- Can be slowed by disciplined teams

Good fits:

- Slasher
- Floor General
- Two-Way Wing
- Athletic prospects later

Counters:

- Get Back rebounding focus
- Slow pace
- Veteran defensive teams

---

# Defensive Style

## Man-to-Man

Strengths:

- Balanced defensive default
- Works with most rosters
- Less risky than press

Weaknesses:

- Can be beaten by elite individual scorers
- No special counter advantage

Good fits:

- Two-Way Wing
- Lockdown Defender
- Balanced rosters

Counters:

- Star Player usage if the star has a mismatch

## Zone

Strengths:

- Protects the paint
- Helps weaker individual defenders
- Slows inside-heavy teams

Weaknesses:

- Vulnerable to shooting
- Vulnerable to strong passing
- Can allow offensive rebounds

Good fits:

- Rim Protector
- Glass Cleaner
- Veteran Leader

Counters:

- Three-point heavy offence
- Passing and spacing
- Stretch Bigs

## Press

Strengths:

- Creates chaos
- Can force turnovers later
- Great for comebacks
- Punishes poor ball handlers

Weaknesses:

- High fatigue cost later
- Foul risk later
- Can give up easy baskets if beaten
- High variance

Good fits:

- Lockdown Defender
- Two-Way Wing
- Athletic guards later
- Deep benches

Counters:

- Floor General
- Veteran teams
- Slow pace
- Strong passing teams

---

# Rebounding Focus

## Get Back

Strengths:

- Reduces transition points conceded
- Good against fast teams
- Helps slow/controlled teams

Weaknesses:

- Fewer offensive rebounds
- Fewer second-chance points

Good fits:

- Veteran Leader
- Floor General
- Defensive teams

Counters:

- Crash Boards if the opponent dominates the glass

## Balanced

Strengths:

- Safe default
- No major risk

Weaknesses:

- No major edge

## Crash Boards

Strengths:

- More offensive rebounds
- More second-chance points
- Helps inside-focused teams

Weaknesses:

- Vulnerable to fast breaks
- Risky against transition teams

Good fits:

- Glass Cleaner
- Rim Protector
- Physical lineups

Counters:

- Fast pace
- Transition offence
- Get Back focus

---

# Usage Focus

## Balanced

Strengths:

- Shares scoring load
- Low risk
- Good for deep squads

Weaknesses:

- May underuse a superstar

## Star Player

Strengths:

- Maximises elite player impact
- Useful in close games
- Good against weak individual matchups

Weaknesses:

- Predictable
- Bad if star is off-form
- Can lower team involvement

Good fits:

- High overall player
- Veteran Leader
- Sharpshooter
- Floor General

Counters:

- Lockdown Defender
- Zone/help defence later
- Fatigue/injury pressure later

## Guards

Strengths:

- Good for pace and shooting
- Rewards strong backcourts
- Helps transition and three-heavy styles

Weaknesses:

- Can ignore strong bigs
- Can struggle against elite perimeter defence

Good fits:

- Floor General
- Sharpshooter
- Slasher

Counters:

- Lockdown Defender
- Press if guards lack ball handling
- Strong rim protection if guards are slashers

## Bigs

Strengths:

- Rewards strong frontcourts
- Good for inside offence
- Helps rebounding profile

Weaknesses:

- Can be slow
- Can struggle against spacing and shooting
- Can be countered by zone/rim protection

Good fits:

- Rim Protector
- Glass Cleaner
- Playmaking Big
- Stretch Big

Counters:

- Zone
- Fast pace
- Three-point heavy lineups

---

# Future Attribute Fit

Current player data uses simple fields:

- Overall
- Potential
- Morale
- Form
- Role
- Archetype

Future match engine depth should add:

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

These attributes should feed into tactical fit.

Examples:

- Fast pace needs athleticism, stamina, ball handling.
- Three-point heavy needs shooting, passing, IQ.
- Press needs athleticism, stamina, perimeter defence, discipline.
- Slow pace needs IQ, passing, half-court scoring.
- Inside focus needs finishing, rebounding, interior presence.

---

# Implementation Direction

Short term:

- Keep the current simulator readable.
- Start moving flat tactical score bonuses into probability-style modifiers.
- Add a function that calculates hidden win probability.
- Use that probability to influence the result.
- Keep score generation separate from win probability.

Long term:

- Make each future system provide a small modifier.
- Avoid magic giant bonuses.
- Keep probabilities clamped.
- Show hints, not exact hidden numbers.

---

# Design Rule

If a tactic has no downside, it is not finished.

If a tactic has no counter, it is not finished.

If a tactic works with every roster, it is too generic.
