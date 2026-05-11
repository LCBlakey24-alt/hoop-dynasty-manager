# Hoop Dynasty Manager Design Direction

## Main Theme: Midnight Court

Hoop Dynasty Manager should feel like a modern basketball operations command centre: dark, sharp, premium, statistical, and energetic. The UI should look more like a serious franchise-management dashboard than a casual mobile game.

## Core Feeling

- Professional basketball analytics room
- Franchise owner / general manager dashboard
- Clean sports broadcast graphics
- Dark navy panels with orange basketball energy
- Easy to read on desktop and mobile
- Stylish without becoming distracting
- Angular and serious rather than soft/mobile-app styled

## Primary Palette

| Purpose | Colour | Hex |
|---|---:|---:|
| Deep Background | Near-black navy | `#050A12` |
| Main Panel | Dark navy | `#101827` |
| Card Surface | Blue-black | `#162033` |
| Primary Action | Basketball orange | `#F97316` |
| Accent | Electric blue | `#38BDF8` |
| Main Text | Soft white | `#F8FAFC` |
| Muted Text | Slate grey | `#94A3B8` |
| Success | Green | `#22C55E` |
| Warning | Yellow | `#FACC15` |
| Danger | Red | `#EF4444` |

## Layout Principles

- Use a left sidebar for core navigation.
- Main dashboard should be card-based.
- Important game actions should use bright orange buttons.
- Stats should sit in compact cards with clear labels.
- Player/team cards should use badges, ratings, and visual hierarchy.
- League tables should be clean, readable, and dense enough for sim fans.
- Avoid over-textured backgrounds. Use subtle gradients and sharp borders instead.

## Main Navigation

Suggested primary navigation:

1. Dashboard
2. Roster
3. Tactics
4. Schedule
5. League
6. Scouting
7. Transfers
8. Training
9. Finances
10. Inbox
11. Settings

## Card Style

Cards should use:

- Sharp/square corners
- Thin borders
- Slight inner glow or subtle shadow
- Clear section titles
- Orange or blue highlights for important information
- Team-colour stripes where appropriate

Example visual behaviour:

- Upcoming match card: large angular team badges, records, location, and simulate button.
- League table card: compact ranking table with user's team highlighted in orange.
- Player card/table row: position badge, overall rating, morale, form.
- Board confidence card: percentage stat card rather than a soft circular widget.

## Button Style

Primary buttons:

- Orange fill
- White text
- Sharp corners
- Slight hover glow

Secondary buttons:

- Transparent or dark navy fill
- Slate/cyan border
- White/slate text
- Sharp corners

Danger buttons:

- Red accent only when needed

## Typography

Use bold headings and compact body text. The UI should feel like a sports broadcast package mixed with a management dashboard.

Suggested style:

- Page titles: bold, uppercase or title case
- Card headings: small uppercase labels
- Body text: clean, readable, not too tiny
- Stats: large, punchy numbers

## Screens to Build First

### 1. Dashboard

Must show:

- Current team
- Next fixture
- Team record
- League position
- Recent form
- Top performers
- Injuries
- Board confidence
- Continue / simulate next game button

### 2. Roster

Must show:

- Player list
- Positions
- Age
- Overall
- Potential
- Morale
- Key ratings
- Starting five status

### 3. Tactics

Must show:

- Starting five
- Bench order
- Pace setting
- Offensive focus
- Defensive style
- Rebounding focus
- Usage/focal player options

### 4. Match Result

Must show:

- Final score
- Quarter scores
- Top performers
- Box score
- Tactical notes
- Standings impact

## Alternate Themes for Later

### Neon Streetball

Good for player career mode. More energetic, pink/purple/cyan, slightly more dramatic.

### Hardwood Classic

Good for retro/history sections. Warm browns, cream, orange, subtle court-line patterns.

### Executive Suite

Good for finance/contract/boardroom sections. Black, gold, stone grey, luxury GM office feel.

## Design Rule

The game should never look like a plain spreadsheet. Even when showing lots of data, it should feel like a basketball franchise hub. The preferred shape language is sharp, angular and dashboard-like rather than rounded and soft.
