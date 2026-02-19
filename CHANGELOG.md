# Shrimp Fried Rice — Changelog

## v0.5 — "The Shrimp Fried the Rice" (2026-02-19)

### Stage 3: Wave Defense Redesign
- **Replaced** 4-column kitchen management with **wave-defense in the same circular wok**.
- Shrimp wears a chef hat, defends scattered ingredients (🍚🥕🧅) from human hands reaching in from the wok rim.
- **3 escalating waves**: 2 → 3 → 5 hands, getting faster each wave (`S3_HAND_SPEED_MULT: [1.0, 1.2, 1.5]`).
- Same tilt/toss/swat mechanics — no new cognitive load for GDC Alt Control (1–3 min sessions).
- Hands reach in, hold for 2s, steal 20 oil if not swatted. Telegraph warning circle during reach phase.
- **Airborne ram**: Toss into a hand to damage it mid-flight.
- Wave breaks with oil regen between waves.
- Removed rectangular canvas, station system, order cards, kitchen hazards.

### Bugfixes (Code Audit)
- **Fixed S3 toss broken on touch/click/keyboard**: Touch/click now tosses in S3 (swat is via Enter key or phone shake). Previously S3 was unplayable on desktop.
- **Fixed speedBoost upgrade doing nothing**: `getUpgradeBonus('speedBoost')` now applied to tilt physics in both S1/S2 and S3.
- **Fixed wave speed off-by-one**: Wave 1 now correctly uses 1.0× speed (was accidentally 1.2×).
- **Fixed S3 shrimp position not reset**: Shrimp now centers in wok when S3 starts (was carried over from S2 edge position).
- **Fixed `drawS3()` never clearing canvas**: Added full-canvas clear to prevent stale pixel artifacts outside the wok.
- **Fixed oil bar overflow**: Bar now clamps to 100% even with `oilCapacity` upgrade bonus.
- **Fixed S3 screen flash using DPR-scaled coords**: Now uses `WOK.size` consistently.
- **Added oil reward for swatting**: +8 oil per swat, making S3 economy survivable.

### Sensor Debug Fix
- `updateSensorDebug()` now runs on **all screens** (title, calibrate, transitions) — not just during active gameplay.
- Shows "no events yet (desktop?)" when no sensor data has been received.
- Immediate populate on toggle (no more blank panel).

### Input Updates
- Touch/click/Space/Enter now trigger `attemptS3Swat()` during Stage 3.
- Space does double duty: toss in S1/S2, swat in S3.

### Portfolio
- Added Shrimp Fried Rice, The Horse and the Infant, and The Booger Picker to portfolio page.
- Gold border (`#f7c948`) for Watson course games.

### CSS Cleanup
- Removed `body.stage3-active` rectangular canvas override.
- Replaced `.order-card` styles with minimal `#s3-wave-info` HUD.

### Compatibility Testing
- Verified working across 7 devices via ngrok HTTPS tunnel.
- Playtesters: Benny (iPhone 16 Pro), Dain (iPhone 14 Pro), Chelsea (iPhone 12), Angela (iPhone SE 2024), Manu (iPhone 16).
- Added ngrok setup, Android Chrome sensor permissions, and itch.io hosting guide to README.

---

## v0.4 — "Kitchen Pandemonium" (2026-02-19)

### Stage 3: Kitchen Pandemonium
- **New endgame stage**: After defeating the chef in S2, the shrimp *becomes* the chef in a top-down kitchen management game.
- **4-column split view** on canvas: Column 0 = "Shrimp Cam" close-up (animated shrimp with chef hat, MSG aura, carrying indicator, upgrade levels); Columns 1–3 = kitchen floor with 4 stations (Fridge → Stove → Wok → Pass).
- **5 dish types**: Fried Rice 🍚, Pad Thai 🍜, Ramen 🍜, Tempura 🍤, Soup 🍲 — each with unique emoji, cook time, and points.
- **Order deadline system**: Orders spawn at intervals with countdown timers; urgent orders flash red; missed orders drain oil.
- **Kitchen hazards**: Grease splashes and steam vents spawn dynamically; floor slip chance adds tension.
- **Victory condition**: Serve 5 orders to win. Burn meter still active (with upgrade resistance).
- **Transition cinematic**: "ROLE REVERSAL" → "YOU ARE THE CHEF NOW" → upgrade shop → kitchen.

### Upgrade Shop (Watson Feedback)
- **Professor Watson's core insight**: *"Buy those upgrades with MSG and oil... additional jump height or temperature resistance"* (28:37), referencing Froggy's Battle progression model.
- **MSG currency**: All MSG collected across S1 carries over as upgrade currency.
- **4 upgrade paths**: Jump Height (higher tosses), Temp Resist (slower burn), Oil Capacity (bigger tank), Speed Boost (faster kitchen movement).
- **Escalating costs**: Each upgrade level costs more (base × multiplier^level), with max levels per path.
- **"Every subsystem must be fun"** (Watson 00:00): Upgrade shop is a strategic decision point, not just a menu.

### Title Screen Polish
- **Animated title**: Bouncing shrimp emoji (🍤) with shimmer effect, pulsing tagline "YOU ARE THE SHRIMP."
- **Background particle system**: Floating emoji (✨🔥🍤💫🫧) on a dedicated `<canvas>` behind the UI.
- **Game-like controls**: Reorganized into icon-labeled rows (📱🖥🔧) instead of plain buttons.
- **Version badge**: v0.4 in footer.

### Sensor Debug Overlay
- **Toggle**: 🐛 button in bottom-right corner.
- **Real-time data**: Orientation (alpha/beta/gamma), acceleration (x/y/z), magnitude, threshold, device type, permission status.
- **Terminal aesthetic**: Monospace green-on-black panel; green = sensor active, red = sensor missing.
- **Purpose**: Diagnose accelerometer issues on iPhone 16 Pro and Pixel 6 Pro during USB-C testing.

### iOS / Android Compatibility
- **iOS**: Now requests BOTH `DeviceOrientationEvent.requestPermission()` AND `DeviceMotionEvent.requestPermission()` — previous versions only requested orientation.
- **Android**: Auto-grants sensors; UA detection identifies Pixel 6 Pro specifically.
- **Device detection**: `detectDevice()` function classifies iPhone, Pixel, iPad, Android, and desktop via User-Agent string.
- **Sensor debug tracking**: Logs which permissions are granted/denied for debugging cross-device issues.

### Bug Fixes
- Fixed garbled code blocks from previous session's edit operations (corrupted collectibles guard, duplicate obstacle spawning, mangled color strings).
- Chef defeat in both `attemptSwat()` and `updateChef()` ram collision now correctly routes to `startTransition2()` instead of `triggerVictory()`.
- S1/S2-specific code (shrimp physics, collectibles, obstacles) properly guarded with `if (stage !== STAGE.S3)` to prevent running during kitchen mode.
- Burn meter game-over check restored inside S1/S2 physics guard.

---

## v0.3 — "The Chef Takes Matters Into His Own Hands" (2026-02-18)

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
| `OBSTACLE_AIR_DRAIN` | — | **8** | Obstacles drain oil even while airborne (no damage, just oil cost) |
| Chef attack interval | ~2 s | **~1.5 s** | Chef is more aggressive in S2 |
| Chef grab-hold oil drain | — | **8/sec** | Chef's hand actively drains oil while holding |

### Stage 2 Reframe
- **Old**: "you are now the chef" (confusing role reversal)
- **New**: "the chef takes matters into his own hands"—his literal hand reaches into the wok and tries to grab + crush the shrimp. Being grabbed drains oil continuously. Swat (hard flick up) to escape.
- Transition text: "Wait—the chef noticed you. He reaches into the wok... FIGHT BACK!"
- Simpler, scarier, keeps the shrimp POV throughout.
- Airborne is no longer full immunity: obstacles still drain oil (just no knockback/damage).

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
- Keyboard: arrow keys / WASD for tilt, Space for toss, Enter for swat (S2), Escape to skip calibration.
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
