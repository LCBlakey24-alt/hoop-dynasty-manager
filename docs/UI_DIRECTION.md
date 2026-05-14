# Hoop Dynasty Manager — UI Direction

This file defines the intended visual direction for Hoop Dynasty Manager.

## Design Goal

The game should feel like a sports management game, not a generic website.

It should feel like:

- A basketball operations room.
- A modern sports broadcast package.
- A club command centre.
- A tactical management interface.

It should not feel like:

- A static web dashboard.
- A spreadsheet with buttons.
- A generic SaaS template.
- A plain information website.

## Core UI Principles

### 1. Every screen needs a purpose

Each screen should answer:

- What is happening?
- What is urgent?
- What can I do next?
- What changed since the last decision?

### 2. Use management-game language

Prefer terms like:

- Match Centre.
- Board Notes.
- Staff Report.
- Development Hub.
- Rotation Manager.
- Club Office.
- Postseason Control.
- Recruitment Room.

Avoid generic labels like:

- Info panel.
- Data section.
- Details area.
- Generic dashboard.

### 3. Keep decisions visible

Major decision screens should show:

- Current state.
- Recommended action.
- Risk.
- Reward.
- Consequence.

### 4. Preserve mobile performance

Avoid heavy animation loops, large blur layers and expensive visual effects on mobile.

Use:

- Subtle transitions.
- Small hover lifts on desktop.
- No hover dependence.
- Reduced motion support.

## Recommended Final Theme

Recommended direction: Midnight Broadcast.

This combines the current dark command-centre style with more premium sports broadcast polish.

Palette:

- Main background: near black / deep navy.
- Primary action: electric orange.
- Secondary data: sky blue.
- Prestige/accent: championship gold.
- Danger/warning: amber/red.
- Text: off-white.
- Muted text: slate grey.

This keeps the current identity while making the game feel more premium and less like a generic dashboard.

## Alternative Theme Concepts

### Midnight Court

Close to current design.

- Deep navy background.
- Orange primary action.
- Sky blue data accents.
- White text.

Best for: modern basketball command centre.

### Premium Broadcast

More serious and trophy-focused.

- Black background.
- Gold primary accents.
- Cream text highlights.
- Deep red warnings.

Best for: playoffs, history, legacy and prestige.

### Hardwood Manager

Warmer basketball-court feel.

- Dark brown/black background.
- Maple wood accents.
- Cream text.
- Court blue highlights.

Best for: more basketball-specific atmosphere.

### Neon Arena

High-energy modern sports vibe.

- Deep purple background.
- Neon purple/pink/cyan.

Best for: flashy mode, but riskier for a serious management sim.

## Preferred Direction

Use a hybrid of Midnight Court and Premium Broadcast.

The game should feel:

- Dark.
- Premium.
- Sporty.
- Energetic.
- Data-rich but readable.

## Screen Goals

### Landing

Should feel like the game front door.

Needs:

- Big title.
- Continue/New Franchise.
- Mode cards.
- Clear save state.
- Strong mobile performance.

### Dashboard

Should feel like the main command centre.

Needs:

- Next fixture.
- Current record.
- Board confidence.
- Manager tasks.
- Objective progress.
- Recent result.

### Inbox

Should feel like the manager control room.

Needs:

- Recommended action.
- Priority stack.
- Message categories.
- Urgent warnings.

### Roster

Should feel like squad management.

Needs:

- Status tags.
- Fitness warnings.
- Development notes.
- Core player summaries.

### Tactics

Should feel like a coaching board.

Needs:

- Starting five.
- Rotation.
- Minutes.
- Tactical instructions.
- Warnings.

### Training

Should feel like weekly preparation.

Needs:

- Active focus.
- Staff advice.
- Risk and reward.
- Fitness and development context.

### Match Centre

Should feel like a post-game report.

Needs:

- Scoreline.
- Result type.
- Margin.
- Top performers.
- Team totals.
- Condition report.

### League

Should feel like standings analysis.

Needs:

- Full table.
- Playoff cutline.
- Title race.
- User-team status.
- Best offence/defence/differential.

### Playoffs

Should feel like a postseason mode.

Needs:

- Bracket status.
- Next action.
- Top seed.
- Dark horse.
- Champion spotlight.

### Board & Finance

Should feel like the club office.

Needs:

- Wage status.
- Spending room.
- Board expectations.
- Recruitment advice.
- Financial projection.

### Contracts

Should feel like asset management.

Needs:

- Expiring deals.
- High-risk contracts.
- Bargains.
- Release options.
- Renewal actions.

### Free Agents

Should feel like recruitment/scouting.

Needs:

- Sorted market.
- Player interest.
- Fit labels.
- Wage impact.
- Board approval.

## Component Rules

- Reuse panel, chip, assistant-note and summary-card patterns.
- Avoid one-off styles unless needed.
- Keep status labels short and readable.
- Keep important actions above the fold.
- Do not add heavy animation that hurts mobile performance.
- Do not edit App.tsx unless routing or app-level state is required.

## Accessibility Rules

- Maintain visible focus states.
- Touch targets should be large enough for mobile.
- Do not hide critical information behind hover only.
- Respect prefers-reduced-motion.
- Avoid text contrast issues.

## Final UI Goal

The final UI should feel like a premium basketball operations game where every screen gives the manager meaningful context, pressure and decisions.
