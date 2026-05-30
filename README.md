# MUET SmartHub MVP v2.0 — Phase A Fixes

## What changed in v2.0

✅ Fixed: Streak System — now increments on consecutive daily logins, resets on 2+ day gap, 7-day = +50 XP + badge
✅ Fixed: XP Key — single profile.xp key across all modules, removed xpTotal
✅ Fixed: Badge Engine — afterSessionSave() called after every session, 18 badges auto-checked
✅ New: XP Level Titles — Band Rookie / MUET Explorer / Band Climber / SmartSpeaker / Band Champion
✅ New: XP progress bar on dashboard
✅ New: Cycle Schema — muet_cycle_history key, cycleNumber tagged on all sessions
✅ New: Band Achiever — calculated on cycle completion, shown on Progress screen
✅ New: Cycle strip shows done/current/locked states with band labels
✅ Fixed: Materials Screen — 14 real clickable URLs, cycle-paper map
✅ New: Named coaches — Aira (Speaking), Riz (Reading), Dani (Listening), Mira (Writing)
✅ Fixed: Cycle-aware coach feedback messages

## How to run
1. Extract ZIP → open index.html in Chrome
2. Create profile → use Demo button to preview Cycle 1 complete state

## What's next (Phase B–D)
- Phase B: 10 cycle content sets (real MUET papers per cycle)
- Phase C: AI coach API feedback via Anthropic claude-sonnet
- Phase D: Mock Exam module with real MUET timing + warnings
