# Shrimp Fried Rice — Changelog

## v0.3 — "The Chef Takes Matters Into His Own Hands" (2025-07-23)

### Architecture
- **Split monolithic HTML into four files**: `index.html` (shell), `config.js` (tunable constants), `style.css` (all styles), `game.js` (logic). Old build backed up as `index_v02_backup.html`.
- All balance constants live in `CFG` object in `config.js`—playtesters can tweak without touching game logic.

### Difficulty Rebalance
| Param | v0.2 | v0.3 | Why |
|---|---|---|---|
| `OIL_DRAIN_BASE` | 0.4 | **0.55** | Too easy to coast; shrimp should feel the heat |
| `OIL_DRAIN_MOVE` | 0.015 | **0.025** | Moving should cost something |
| `OIL_REFILL` (on toss) | +20 | **+15** | Tossing was a full reset; now it's mitigation |
| `MSG_SPAWN_INTERVAL` | 5 s | **8 s** | MSG was everywhere; now it's a decision point |
| `MSG_MAX_ON_SCREEN` | 2 | **1** | One at a time = real tradeoff |
| Obstacle damage | 10–15 | **15–25** | Hits should punish |
| `OBSTACLE_AIR_DRAIN` | — | **8** | Can now drain oil while airborne via obstacles |
| Chef attack interval | ~2 s | **~1.5 s** | Chef is more aggressive in S2 |
| Chef grab-hold oil drain | — | **8/sec** | Chef's hand actively drains oil while holding |

### Stage 2 Reframe
- **Old**: "you are now the chef" (confusing role reversal)
- **New**: "the chef takes matters into his own hands"—his literal hand reaches into the wok and tries to grab + crush the shrimp. Being grabbed drains oil continuously. Swat (hard flick up) to escape.
- Transition text: "Wait—the chef noticed you. He reaches into the wok... FIGHT BACK!"
- Simpler, scarier, keeps the shrimp POV throughout.

### Phone Calibration System
- New `CALIBRATE` game state before Stage 1 begins.
- Player flicks phone upward 3× to establish personal baseline:
  - `tossThreshold` = avg × 0.60 (forgiving toss)
  - `swatThreshold` = avg × 1.10 (decisive swat for S2)
- Visual: 3 dots fill green with each successful flick.
- "Skip" button falls back to default thresholds.
- Desktop mode button bypasses sensors entirely (mouse-only play).

### Phone Status Indicator
- Small floating badge: "📱 Phone connected" (green) or "🖥 Desktop mode" (grey).
- Helps playtesting—immediately confirms whether sensors are live.

### Desktop Fallback
- "DESKTOP MODE" button on title screen calls `setupDesktopFallback()`.
- Keyboard: arrow keys for tilt, space for toss, Enter for swat (S2).
- Needed for testing/demoing without a phone rig.

### Zip / Itch.io
- Build zipped to `shrimp-fried-rice-v03.zip` (4 files, no backup).
- Upload to itch.io as HTML game, set viewport ≤ 480×800.

---

## Roadmap Notes

### Sensor Hardware (GDC Alt. Ctrl.)
- **Piezo disc on wok exterior**: Cheap, great for impact detection (swat = spike > threshold). Attach with hot glue + foam pad. Arduino reads analog.
- **FSR (Force-Sensitive Resistor) under wok feet**: Detects sustained grab / press events better than piezo. Complements piezo well for S2 grab mechanic.
- **IMU (MPU-6050 / LSM6DSO)**: Already on phone via DeviceMotion; hardware version goes on wok itself for real tilt/toss. ESP32 + MPU-6050 → WebSocket → browser.
- **Recommendation**: Piezo for swat, IMU for tilt, optional FSR for grab. Total BOM ≈ $12.

### Stage 3 Concept — "Kitchen Pandemonium"
4-column split-screen layout (portrait phone):
1. **Camera feed** — real wok via phone/webcam, picture-in-picture.
2–4. **Gameplay columns** — multiple shrimp frying simultaneously; player manages all three at once. Chef attacks escalate.

Think *Overcooked* meets *Guitar Hero* lane system, but you're physically inside the instrument.

---

## v0.2 — Initial Web Port (prior)
- Ported from concept to HTML5 Canvas 2D.
- DeviceMotionEvent / DeviceOrientationEvent for phone tilt + shake.
- Web Audio API procedural sound (slap, collect, whoosh, pop, hit, victory).
- Two-stage game: survive wok → swat chef.
- MSG collectibles, oil meter, obstacle spawning.

## v0.1 — Paper Prototype
- Concept: "What if the shrimp could fight back?"
- Wok = controller, phone = shrimp.
