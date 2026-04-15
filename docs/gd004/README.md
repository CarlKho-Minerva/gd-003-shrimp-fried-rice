# GD-004 — Shrimp Fried Rice (continued)

*Carl Kho · April 2026 · Continuing from GD-003*

## This submission

GD-004 continues the Shrimp Fried Rice prototype from GD-003. Same codebase, different scope decision and a real deployment.

The game is live: **[gd-003-shrimp-fried-rice.onrender.com](https://gd-003-shrimp-fried-rice.onrender.com)**

## What's new in this cycle (v0.7)

- Stage 1 shipped to the public web (not just ngrok in class)
- Stages 2 and 3 deliberately cut — see Medium post for reasoning
- Persistent leaderboard via Upstash Redis
- Infrastructure: Render + UptimeRobot + Upstash Redis ($0/month)
- Polish: MSG crystal breathing animation, ROOM ACTIVE badge, tutorial skip button

## Docs for this submission

| File | Description |
|------|-------------|
| [MEDIUM_POST.md](MEDIUM_POST.md) | Essay: shipping Stage 1, the three cloud systems, the scope decision |
| [../slides.html](../slides.html) | GDC presentation slides (10 slides, game aesthetic) |
| [../SLIDES_SCRIPT.md](../SLIDES_SCRIPT.md) | Presenter script with per-slide timing |
| [../../\[Kho GD004 - game 4\] Assignment Coversheet - Shrimp Fried Rice.md](../../[Kho%20GD004%20-%20game%204]%20Assignment%20Coversheet%20-%20Shrimp%20Fried%20Rice.md) | Assignment coversheet |

## What this is continuing from

GD-003 docs are at `../` (MEDIUM_POST.md, original slides iterations). The design history and hardware build guide are there.

The GD-003 Medium post covers the original three-stage design, the hardware wok, ngrok-era cross-device bugs, and the calibration system. That story is still true. This post is what came after.
