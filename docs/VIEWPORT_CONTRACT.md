# Viewport Contract — No-Scroll Product Rule

## Goal
Every primary game screen must fit without vertical window scrolling.

## Target Resolutions
- 1920x1080 (primary)
- 1366x768 (minimum desktop/laptop)

## Acceptance Criteria
1. `window` vertical scrollbar is absent on primary screens.
2. Core gameplay controls remain visible without scrolling.
3. Overflow is handled only inside dedicated panel regions.
4. Long text uses truncation + tooltip/detail modal.

## Primary Screens In Scope
- Landing
- Dashboard
- Inbox
- Roster
- Development
- Contracts
- Free Agents
- Board & Finance
- Tactics
- Schedule
- Results
- League
- Playoffs
- Summary
- Training

## QA Checklist (per screen)
- [ ] 1920x1080 no page scroll
- [ ] 1366x768 no page scroll
- [ ] all primary actions visible
- [ ] no clipped critical content
- [ ] keyboard/controller focus order valid
