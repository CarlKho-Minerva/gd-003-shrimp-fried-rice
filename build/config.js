/* ═══════════════════════════════════════════════════════════════
 *  CONFIG.JS — Shrimp Fried Rice — Tunable Variables
 *  Separate file for easy balancing. Touch this, not game.js.
 *  GDC Alt. Ctrl. Build
 * ═══════════════════════════════════════════════════════════════ */

const CFG = {
  // ─── Physics ───
  GRAVITY: 0.8,
  BASE_DRAG: 0.88,
  BOUNCE: 0.3,
  TOSS_THRESHOLD: 15,      // Accelerometer magnitude to trigger a toss
  SWAT_THRESHOLD: 22,      // Accelerometer magnitude to trigger swat (harder shake)
  TOSS_FORCE: 15,
  AIR_DURATION: 1.0,       // Seconds airborne per toss

  // ─── Oil / Survival ───
  OIL_MAX: 100,
  OIL_DRAIN_BASE: 0.55,    // ↑ from 0.4 — harder to stay oiled
  OIL_DRAIN_MOVE: 0.025,   // ↑ from 0.015 — moving costs more oil
  OIL_DRAIN_AIR_MULT: 0.6, // ↑ from 0.4 — jumping drains more too
  OIL_REFILL: 15,          // ↓ from 20 — each oil drop gives less
  BURN_MAX: 100,
  BURN_RATE_GROWTH: 55,    // How fast burn meter fills when oil is empty
  BURN_RATE_COOL: 20,      // How fast burn meter cools when oil is available

  // ─── Stage 1: Survive the Wok ───
  MSG_TO_WIN: 5,
  MSG_SPAWN_INTERVAL: 8,   // ↑ from 5 — MSG appears less frequently
  MSG_MAX_ON_SCREEN: 1,    // ↓ from 2 — only 1 MSG crystal at a time
  MSG_RADIUS: 16,
  OIL_SPAWN_INTERVAL: 5,   // ↑ from 4 — oil appears less frequently
  OIL_MAX_ON_SCREEN: 2,    // ↓ from 3 — fewer oil drops at a time
  OIL_RADIUS: 16,

  // ─── Obstacles ───
  SPATULA_INTERVAL_MIN: 3.5,  // ↓ from 4 — spatula comes more often
  SPATULA_INTERVAL_MAX: 6,    // ↓ from 7
  PEPPER_INTERVAL_MIN: 2.5,   // ↓ from 3
  PEPPER_INTERVAL_MAX: 4.5,   // ↓ from 5
  OILPOP_INTERVAL_MIN: 2,     // ↓ from 2.5
  OILPOP_INTERVAL_MAX: 3.5,   // ↓ from 4
  SPATULA_DAMAGE: 18,         // ↑ from 15 — hurts more
  PEPPER_DAMAGE: 12,          // ↑ from 10
  OILPOP_DAMAGE: 10,          // ↑ from 8
  OBSTACLE_AIR_DRAIN: 8,       // Oil drained when obstacle fires while airborne (not damage, just oil cost)

  // ─── Stage 2: Chef Takes Matters Into His Own Hands ───
  // The chef reaches in to grab/stir/squish you. You swat his hand.
  CHEF_MAX_HP: 4,
  SWAT_DAMAGE: 1,          // Damage per swat to chef
  RAM_DAMAGE: 0.5,         // Damage from airborne collision with chef hand
  CHEF_IDLE_MIN: 2.0,      // ↓ from 2.5 — chef attacks more often
  CHEF_IDLE_MAX: 3.5,      // ↓ from 4
  CHEF_REACH_TIME: 0.8,    // Seconds for hand to reach in
  CHEF_HOLD_TIME: 1.8,     // ↓ from 2.0 — less time to react
  CHEF_RECOIL_TIME: 0.5,   // Seconds for hand to withdraw after swat
  // Stage 2 obstacle frequency multipliers (less frequent — focus is on chef)
  S2_SPATULA_MIN: 5,
  S2_SPATULA_MAX: 8,
  S2_PEPPER_MIN: 4,
  S2_PEPPER_MAX: 6.5,
  S2_OILPOP_MIN: 3.5,
  S2_OILPOP_MAX: 5.5,

  // ─── Calibration ───
  CALIBRATION_FLICKS: 5,   // Number of flicks to average during calibration
  CALIBRATION_COOLDOWN: 0.5, // Seconds between valid calibration flicks
  CALIBRATION_MIN_ACCEL: 8,  // Minimum accel to register as a calibration flick

  // ─── Stage 3: "The Shrimp Fried The Rice" — Role Reversal ───
  // Same wok, same shrimp (now with chef hat), but now YOU are the chef.
  // Multiple human hands reach in to steal your ingredients.
  // Watson feedback: "upgrade system…buy upgrades with MSG and oil…"
  // Ref: Froggy's Battle upgrade model, Cookie Clicker progressive reveal
  S3_WAVES: 3,                  // Number of waves to survive
  S3_HANDS_PER_WAVE: [2, 3, 5],// Hands per wave (escalating)
  S3_HAND_REACH_TIME: 1.5,     // Seconds for hand to reach the wok center
  S3_HAND_HOLD_TIME: 2.0,      // Seconds hand holds inside before retreating
  S3_HAND_IDLE_MIN: 0.8,       // Min seconds between hand spawns within a wave
  S3_HAND_IDLE_MAX: 2.0,       // Max seconds between hand spawns
  S3_WAVE_BREAK: 3.0,          // Seconds break between waves
  S3_HAND_HP: 1,               // Hits to swat a hand away
  S3_HAND_STEAL: 20,           // Oil stolen if a hand grabs an ingredient
  S3_HAND_SPEED_MULT: [1.0, 1.2, 1.5], // Hands get faster each wave
  S3_OIL_DRAIN_MULT: 0.2,      // S3 oil drain is gentle (you're the chef now)

  // ─── Upgrade Shop (Watson: "every subsystem has to be fun") ───
  UPGRADES: {
    jumpHeight:  { label: 'Jump Height',  baseCost: 2, costMult: 1.5, maxLevel: 3, effect: 0.3 },
    tempResist:  { label: 'Temp Resist',  baseCost: 2, costMult: 1.5, maxLevel: 3, effect: 15 },
    oilCapacity: { label: 'Oil Capacity', baseCost: 3, costMult: 2.0, maxLevel: 2, effect: 25 },
    speedBoost:  { label: 'Speed Boost',  baseCost: 3, costMult: 2.0, maxLevel: 2, effect: 0.15 },
  },

  // ─── Juice / Effects ───
  SLOWMO_SCALE: 0.15,
  SLOWMO_DURATION_MS: 250,
  HIT_INVULN_TIME: 0.5,
  HAPTIC_SWAT: [100, 30, 60],
  HAPTIC_HIT: 50,

  // ─── Arcade High Scores (pre-seeded with tester names) ───
  DEFAULT_SCORES: [
    { name: 'JAK',  time: 43, stage: 3 },
    { name: 'BEN',  time: 48, stage: 3 },
    { name: 'STI',  time: 52, stage: 3 },
    { name: 'DAI',  time: 55, stage: 3 },
    { name: 'MAR',  time: 58, stage: 3 },
    { name: 'CHE',  time: 62, stage: 3 },
    { name: 'NOK',  time: 67, stage: 3 },
    { name: 'ANG',  time: 71, stage: 2 },
    { name: 'SAK',  time: 74, stage: 2 },
    { name: 'MAN',  time: 78, stage: 3 },
    { name: 'LAR',  time: 85, stage: 2 },
    { name: 'ART',  time: 90, stage: 2 },
  ],
};
