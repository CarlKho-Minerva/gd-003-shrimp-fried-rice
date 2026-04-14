/* ═══════════════════════════════════════════════════════════════
 *  GAME.JS — Shrimp Fried Rice — v0.5.0
 *  GDC Alt. Ctrl. Prototype
 *  Hardware target: Wok + IMU (Arduino/ESP32) + Piezo
 *  This build:  Phone tilt + shake via browser sensors
 *  Depends on:  config.js (loaded first)
 *  Stage 3: Wave Defense — the shrimp fried the rice
 *  Watson feedback: upgrade system, "every subsystem must be fun"
 *  Ref: Froggy's Battle, Cookie Clicker progressive reveal
 * ═══════════════════════════════════════════════════════════════ */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

/* ═══ AUDIO ENGINE (Procedural — no files) ═══ */
let audioCtx = null;
let sizzleNode = null;
let sizzleGain = null;

function initSizzle() {
  if (sizzleNode) return;
  const sr = audioCtx.sampleRate;
  const buf = audioCtx.createBuffer(1, sr * 2, sr);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  sizzleNode = audioCtx.createBufferSource();
  sizzleNode.buffer = buf;
  sizzleNode.loop = true;

  const filt = audioCtx.createBiquadFilter();
  filt.type = 'highpass';
  filt.frequency.value = 1400;

  sizzleGain = audioCtx.createGain();
  sizzleGain.gain.value = 0;

  sizzleNode.connect(filt).connect(sizzleGain).connect(audioCtx.destination);
  sizzleNode.start();
}

function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    initSizzle();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playSound(type) {
  ensureAudio();
  const sr = audioCtx.sampleRate;
  let dur, data;
  switch (type) {
    case 'slap': {
      dur = 0.12;
      const buf = audioCtx.createBuffer(1, sr * dur, sr);
      data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.015));
      const src = audioCtx.createBufferSource(); src.buffer = buf;
      const filt = audioCtx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 600;
      const gain = audioCtx.createGain(); gain.gain.value = 0.6;
      src.connect(filt).connect(gain).connect(audioCtx.destination); src.start(); break;
    }
    case 'collect': {
      const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.08);
      g.gain.setValueAtTime(0.15, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(g).connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.15); break;
    }
    case 'whoosh': {
      dur = 0.18;
      const buf = audioCtx.createBuffer(1, sr * dur, sr);
      data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) { data[i] = (Math.random() * 2 - 1) * Math.sin((i / data.length) * Math.PI) * 0.3; }
      const src = audioCtx.createBufferSource(); src.buffer = buf;
      const filt = audioCtx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = 1200; filt.Q.value = 2;
      src.connect(filt).connect(audioCtx.destination); src.start(); break;
    }
    case 'pop': {
      const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(300, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.1);
      g.gain.setValueAtTime(0.2, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.connect(g).connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.12); break;
    }
    case 'hit': {
      dur = 0.08;
      const buf = audioCtx.createBuffer(1, sr * dur, sr);
      data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.01)) * 0.4;
      const src = audioCtx.createBufferSource(); src.buffer = buf;
      src.connect(audioCtx.destination); src.start(); break;
    }
    case 'victory': {
      [0, 0.12, 0.24, 0.4].forEach((t, i) => {
        const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
        osc.type = 'triangle'; osc.frequency.value = [523, 659, 784, 1047][i];
        g.gain.setValueAtTime(0.15, audioCtx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t + 0.3);
        osc.connect(g).connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + t); osc.stop(audioCtx.currentTime + t + 0.35);
      }); break;
    }
    case 'calibrate': {
      const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
      osc.type = 'sine'; osc.frequency.value = 660;
      g.gain.setValueAtTime(0.1, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.connect(g).connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.12); break;
    }
    case 'ding': {
      const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
      osc.type = 'triangle'; osc.frequency.value = 1200;
      g.gain.setValueAtTime(0.12, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.connect(g).connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.25); break;
    }
    case 'fail': {
      const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
      g.gain.setValueAtTime(0.12, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(g).connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.35); break;
    }
    case 'upgrade': {
      [0, 0.08, 0.16].forEach((t, i) => {
        const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
        osc.type = 'sine'; osc.frequency.value = [440, 554, 660][i];
        g.gain.setValueAtTime(0.1, audioCtx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t + 0.15);
        osc.connect(g).connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + t); osc.stop(audioCtx.currentTime + t + 0.2);
      }); break;
    }
  }
}

/* ═══ WOK GEOMETRY ═══ */
const WOK = {
  size: 500,
  cx() { return this.size / 2; },
  cy() { return this.size / 2; },
  radius() { return this.size * 0.46; },
  innerRadius() { return this.size * 0.15; },
};

/* ═══ GAME STATE ═══ */
const STAGE = { TITLE: 0, CALIBRATE: 1, S1: 2, TRANSITION: 3, S2: 4, TRANSITION2: 5, UPGRADE: 6, S3: 7, GAMEOVER: 8, VICTORY: 9 };
let stage = STAGE.TITLE;
let gameRunning = false;
let gameTime = 0;
let timeScale = 1;

// Shrimp
let shrimp = { x: 0, y: 0, vx: 0, vy: 0, radius: 14, airborne: false, airTime: 0, scale: 1, angle: 0, wobble: 0 };

// Oil / Burn
let oilLevel = CFG.OIL_MAX;
let burnMeter = 0;
let currentDrag = CFG.BASE_DRAG;

// Entities
let oilItems = [];
let msgItems = [];
let msgCollected = 0;
let totalMsgCollected = 0;   // Lifetime MSG (currency for upgrades)
let obstacles = [];
let particles = [];

// Spawn timers
let oilSpawnTimer = 0;
let msgSpawnTimer = 0;
let spatulaTimer = 0;
let pepperTimer = 0;
let oilpopTimer = 0;

// Chef (Stage 2)
let chef = {
  hp: CFG.CHEF_MAX_HP,
  angle: 0, reachProgress: 0,
  state: 'idle', stateTimer: 3,
  handX: 0, handY: 0,
  active: false, invuln: 0,
};

// Effects
let screenShake = { x: 0, y: 0, intensity: 0 };
let screenFlash = 0;
let hitFlash = 0;
let hitCooldown = 0;

// Input
let tiltX = 0, tiltY = 0;
let hasDeviceOrientation = false;
let lastAccel = { x: 0, y: 0, z: 0 };
let accelMagnitude = 0;
let keys = {};
let sensorsSetup = false; // guard against double event-listener registration

// Sensor debug
let sensorDebug = {
  visible: false,
  orient: { alpha: 0, beta: 0, gamma: 0 },
  accel: { x: 0, y: 0, z: 0 },
  mag: 0,
  device: 'unknown',
  permission: 'pending',
  hasOrientation: false,
  hasMotion: false,
};

// WebSocket Relay
let relayWS = null;
let relayRoom = null;
let remoteControllerCount = 0;


// Upgrades (Watson: "buy upgrades with MSG and oil")
let upgrades = {
  jumpHeight: 0,
  tempResist: 0,
  oilCapacity: 0,
  speedBoost: 0,
};

// Stage 3: Role Reversal — same wok, shrimp is the chef, defend from hands
let s3 = {
  wave: 0,
  hands: [],          // Active hand instances (like chef hand but multiple)
  handsSwatted: 0,    // Total hands defeated
  handsToSpawn: 0,    // Remaining hands to spawn this wave
  handSpawnTimer: 0,  // Timer until next hand spawn
  waveBreakTimer: 0,  // Countdown between waves
  inBreak: false,     // True during wave break
  ingredients: [],    // Visual rice grains in the wok center (steal targets)
};

// Calibration
let calibration = {
  active: false,
  flicks: [],
  cooldown: 0,
  tossThreshold: CFG.TOSS_THRESHOLD,
  swatThreshold: CFG.SWAT_THRESHOLD,
};

// Title background particles
let bgParticles = [];

/* ═══ UI HELPERS ═══ */
const $ = id => document.getElementById(id);

function hideAllScreens() {
  ['title-screen','tutorial-screen','calibration-screen','transition-screen','transition2-screen','upgrade-screen','gameover-screen','victory-screen','name-entry-screen','scores-screen'].forEach(id => $(id).style.display = 'none');
  $('hud').style.display = 'none';
  $('oil-label').style.display = 'none';
  $('oil-bar-wrap').style.display = 'none';
  $('chef-label').style.display = 'none';
  $('chef-bar-wrap').style.display = 'none';
  $('s3-hud').style.display = 'none';
  $('stage-announce').style.opacity = '0';
  const mc = $('mini-ctrl-canvas'); if (mc) mc.style.display = 'none';
  document.body.classList.remove('burn-pulse');
  document.body.classList.remove('stage3-active');
}

function updateDbgVisibility() {
  const dbgBtn = $('debug-toggle');
  if (!dbgBtn) return;
  const inGame = stage === STAGE.S1 || stage === STAGE.S2 || stage === STAGE.S3;
  dbgBtn.style.display = inGame ? 'none' : 'flex';
}

function showScreen(id) { hideAllScreens(); if (id) $(id).style.display = 'flex'; }

function showHUD() {
  $('hud').style.display = 'flex';
  $('oil-label').style.display = 'block';
  $('oil-bar-wrap').style.display = 'block';
  const mc = $('mini-ctrl-canvas'); if (mc) mc.style.display = 'block';
}

function showChefBar() {
  $('chef-label').style.display = 'block';
  $('chef-bar-wrap').style.display = 'block';
}

function announce(title, sub, duration = 2000) {
  $('sa-title').textContent = title;
  $('sa-sub').textContent = sub;
  $('stage-announce').style.opacity = '1';
  setTimeout(() => { $('stage-announce').style.opacity = '0'; }, duration);
}

function spawnPopup(worldX, worldY, text, color = '#ffd700') {
  const popup = document.createElement('div');
  popup.className = 'msg-popup';
  popup.style.color = color;
  popup.innerHTML = text;
  const rect = canvas.getBoundingClientRect();
  const ratio = rect.width / WOK.size;
  popup.style.left = (rect.left + worldX * ratio) + 'px';
  popup.style.top = (rect.top + worldY * ratio) + 'px';
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 800);
}

let phoneStatusTimer;
function updatePhoneStatus(mode) {
  const el = $('phone-status');
  if (mode === 'none') { el.className = ''; el.textContent = ''; return; }

  if (remoteControllerCount > 0) {
    el.textContent = `Controllers: ${remoteControllerCount}`;
    el.className = 'connected';
  } else if (mode === 'phone') {
    el.textContent = 'Sensors Connected';
    el.classList.add('connected');
  } else {
    el.textContent = 'Mouse / Keyboard';
    el.classList.add('desktop');
  }

  clearTimeout(phoneStatusTimer);
  phoneStatusTimer = setTimeout(() => { el.className = ''; el.textContent = ''; }, 4000);
}

/* ═══ CANVAS RESIZE ═══ */
function resize() {
  const maxW = 600;
  const sizeCSS = Math.min(window.innerWidth - 32, window.innerHeight - 140, maxW);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = sizeCSS * dpr;
  canvas.height = sizeCSS * dpr;
  canvas.style.width = sizeCSS + 'px';
  canvas.style.height = sizeCSS + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  WOK.size = sizeCSS;
  if (shrimp.x === 0) { shrimp.x = WOK.cx(); shrimp.y = WOK.cy(); }
}
window.addEventListener('resize', resize);
resize();

/* ═══ INPUT HANDLERS ═══ */
function setupDeviceOrientation() {
  if (sensorsSetup) return;
  window.addEventListener('deviceorientation', e => {
    // Ignore local sensors if we have a remote controller active
    if (remoteControllerCount > 0) return;

    if (e.gamma === null || e.beta === null) return;
    hasDeviceOrientation = true;
    sensorDebug.hasOrientation = true;
    sensorDebug.orient = { alpha: e.alpha || 0, beta: e.beta || 0, gamma: e.gamma || 0 };
    tiltX = Math.max(-1, Math.min(1, (e.gamma || 0) / 60)); // reduced X sensitivity
    tiltY = Math.max(-1, Math.min(1, (e.beta || 0) / 28)); // more sensitive forward lean
    updatePhoneStatus('phone');
  });
}

function processMotion(a) {
  sensorDebug.hasMotion = true;
  sensorDebug.accel = { x: a.x || 0, y: a.y || 0, z: a.z || 0 };
  const dx = a.x - lastAccel.x, dy = a.y - lastAccel.y, dz = a.z - lastAccel.z;
  accelMagnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);
  sensorDebug.mag = accelMagnitude;
  lastAccel = { x: a.x, y: a.y, z: a.z };

  // Tutorial step 2: update flick bar live
  if (tutorialStep === 2) updateTutFlickFeedback();

  // Calibration mode (handles both standalone screen and tutorial step 4)
  if (calibration.active) {
    handleCalibrationFlick(accelMagnitude);
    return;
  }

  if (!gameRunning) return;

  if (accelMagnitude > calibration.swatThreshold) {
    if (stage === STAGE.S2) attemptSwat();
    else if (stage === STAGE.S3) attemptS3Swat();
  } else if (accelMagnitude > calibration.tossThreshold && !shrimp.airborne) {
    tossShrimp();
  }
}

function setupDeviceMotion() {
  if (sensorsSetup) return;
  window.addEventListener('devicemotion', e => {
    // Ignore local sensors if we have a remote controller active
    if (remoteControllerCount > 0) return;

    const a = e.accelerationIncludingGravity;
    if (!a) return;
    processMotion(a);
  });
}

/* ═══ SENSOR EARLY-SETUP (Tutorial step 1 gesture) ═══ */
// Request permissions and start listeners without triggering calibration.
// Called on the NEXT tap advancing to tutorial step 1 so iOS has a user gesture.
function requestSensorsEarly() {
  if (sensorsSetup) return;

  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    sensorDebug.device = sensorDebug.device || 'iOS';
    Promise.all([
      DeviceOrientationEvent.requestPermission(),
      typeof DeviceMotionEvent.requestPermission === 'function'
        ? DeviceMotionEvent.requestPermission()
        : Promise.resolve('granted')
    ]).then(([orientPerm, motionPerm]) => {
      sensorDebug.permission = `orient:${orientPerm} motion:${motionPerm}`;
      if (orientPerm === 'granted' && motionPerm === 'granted') {
        setupDeviceOrientation();
        setupDeviceMotion();
        sensorsSetup = true;
      } else {
        // Permission denied — fall back to desktop mode for step 4
        isDesktop = true;
        const btn = $('tut-next-btn');
        if (btn) { btn.style.display = 'block'; btn.innerHTML = 'LET\'S COOK'; }
      }
    }).catch(err => {
      console.warn('[Sensor] Early permission error:', err);
      isDesktop = true;
    });
  } else {
    // Android / desktop: no permission API
    setupDeviceOrientation();
    setupDeviceMotion();
    sensorsSetup = true;
  }
}

/* ═══ TUTORIAL LIVE FEEDBACK ═══ */

// Step 1 — live tilt preview canvas
let tutTiltAnimId = null;
let tutTiltDetected = false;
let tutTiltPhase = 'hold'; // 'hold' | 'tilt' | 'detected'
let tutStillTimer = 0;
let tutAutoAdvanceTimer = 0; // auto-advance even without sensor
const TUT_STILL_NEEDED = 0.9; // seconds of stillness to advance phase
const TUT_AUTO_ADVANCE = 3.0; // max seconds before auto-advancing anyway
const TUT_STILL_THRESH = 0.08;
const TUT_TILT_THRESH  = 0.15;

function startTutTiltFeedback() {
  tutTiltDetected = false;
  tutTiltPhase = isDesktop ? 'tilt' : 'hold';
  tutStillTimer = 0;
  const tutCanvas = $('tut-tilt-canvas');
  if (!tutCanvas) return;
  const ctx2 = tutCanvas.getContext('2d');
  // Set initial heading + text for the current phase
  const titleEl = $('tut-step-1-title');
  const textEl = $('tut-step-1-text');
  const nudge = $('tut-tilt-nudge');
  tutAutoAdvanceTimer = 0;
  if (isDesktop) {
    if (titleEl) titleEl.textContent = 'TILT';
    if (textEl) textEl.innerHTML = '<strong>Arrow keys</strong> or <strong>WASD</strong> to slide the shrimp.';
    if (nudge) { nudge.textContent = ''; nudge.style.color = ''; }
  } else {
    if (titleEl) titleEl.textContent = 'HOLD';
    if (textEl) textEl.innerHTML = 'Hold your phone <strong>flat and still</strong>.';
    if (nudge) { nudge.textContent = ''; nudge.style.color = ''; }
  }
  let lastFrameTime = performance.now();
  function frame() {
    if (tutorialStep !== 1) return;
    tutTiltAnimId = requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
    lastFrameTime = now;
    const W = tutCanvas.width, H = tutCanvas.height;
    const cx = W / 2, cy = H / 2, r = cx - 6;
    ctx2.clearRect(0, 0, W, H);
    // Wok circle background
    ctx2.fillStyle = '#1a1a24';
    ctx2.beginPath(); ctx2.arc(cx, cy, r, 0, Math.PI * 2); ctx2.fill();
    ctx2.strokeStyle = 'rgba(255,255,255,0.12)'; ctx2.lineWidth = 2;
    ctx2.beginPath(); ctx2.arc(cx, cy, r, 0, Math.PI * 2); ctx2.stroke();
    // Center crosshair guide
    ctx2.strokeStyle = 'rgba(255,255,255,0.06)'; ctx2.lineWidth = 1;
    ctx2.beginPath(); ctx2.moveTo(cx - r, cy); ctx2.lineTo(cx + r, cy); ctx2.stroke();
    ctx2.beginPath(); ctx2.moveTo(cx, cy - r); ctx2.lineTo(cx, cy + r); ctx2.stroke();
    // "Hold still" phase: draw pulse ring at center to guide player
    if (tutTiltPhase === 'hold') {
      const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 400);
      ctx2.strokeStyle = `rgba(247,201,72,${0.25 + pulse * 0.35})`;
      ctx2.lineWidth = 2;
      ctx2.beginPath(); ctx2.arc(cx, cy, 18 + pulse * 6, 0, Math.PI * 2); ctx2.stroke();
    }
    // Shrimp dot position based on tilt
    const dotX = cx + tiltX * (r * 0.72);
    const dotY = cy + tiltY * (r * 0.72);
    // Glow trail
    ctx2.fillStyle = 'rgba(255,107,53,0.12)';
    ctx2.beginPath(); ctx2.arc(dotX, dotY, 18, 0, Math.PI * 2); ctx2.fill();
    // Shrimp body
    ctx2.fillStyle = '#ff8844';
    ctx2.beginPath(); ctx2.arc(dotX, dotY, 10, 0, Math.PI * 2); ctx2.fill();
    ctx2.fillStyle = '#fff';
    ctx2.beginPath(); ctx2.arc(dotX + 3, dotY - 3, 3, 0, Math.PI * 2); ctx2.fill();
    // Phase progression
    const nudgeEl = $('tut-tilt-nudge');
    const isStill = Math.abs(tiltX) < TUT_STILL_THRESH && Math.abs(tiltY) < TUT_STILL_THRESH;
    const isTilting = Math.abs(tiltX) > TUT_TILT_THRESH || Math.abs(tiltY) > TUT_TILT_THRESH;
    if (tutTiltPhase === 'hold') {
      tutAutoAdvanceTimer += dt;
      if (isStill) { tutStillTimer += dt; } else { tutStillTimer = 0; }
      if (tutStillTimer >= TUT_STILL_NEEDED || tutAutoAdvanceTimer >= TUT_AUTO_ADVANCE) {
        tutTiltPhase = 'tilt';
        tutAutoAdvanceTimer = 0;
        // Swap heading and text
        const h2 = $('tut-step-1-title');
        const p = $('tut-step-1-text');
        if (h2) h2.textContent = 'TILT';
        if (p) p.innerHTML = 'Tilt to <strong>slide the shrimp</strong>.';
        if (nudgeEl) { nudgeEl.textContent = ''; nudgeEl.style.color = ''; }
      }
    } else if (tutTiltPhase === 'tilt') {
      tutAutoAdvanceTimer += dt;
      if (isTilting || tutAutoAdvanceTimer >= TUT_AUTO_ADVANCE) {
        tutTiltPhase = 'detected';
        tutTiltDetected = true;
        if (nudgeEl) { nudgeEl.textContent = isTilting ? 'Tilt detected!' : 'Tilt your phone to play!'; nudgeEl.style.color = '#4cd964'; }
      }
    }
  }
  tutTiltAnimId = requestAnimationFrame(frame);
}

function stopTutTiltFeedback() {
  if (tutTiltAnimId) { cancelAnimationFrame(tutTiltAnimId); tutTiltAnimId = null; }
}

// Step 2 — live flick magnitude bar (updated in processMotion)
let tutFlickDetected = false;

function startTutFlickFeedback() {
  tutFlickDetected = false;
  const bar = $('tut-flick-bar');
  if (bar) { bar.style.width = '0%'; bar.style.background = '#f7c948'; }
  const nudge = $('tut-flick-nudge');
  if (nudge) { nudge.textContent = 'Flick your phone upward'; nudge.style.color = ''; }
}

function updateTutFlickFeedback() {
  const bar = $('tut-flick-bar');
  if (!bar) return;
  const pct = Math.min(100, (accelMagnitude / 30) * 100);
  bar.style.width = pct + '%';
  if (!tutFlickDetected && accelMagnitude > calibration.tossThreshold) {
    tutFlickDetected = true;
    bar.style.background = '#4cd964';
    const nudge = $('tut-flick-nudge');
    if (nudge) { nudge.textContent = 'Flick detected!'; nudge.style.color = '#4cd964'; }
    setTimeout(() => { if (bar) bar.style.background = '#f7c948'; }, 400);
  }
}

// Step 3 — canvas-drawn game elements (MSG crystal, oil drop, red hazard)
let tutItemsAnimId = null;

function startTutItemsFeedback() {
  function frame() {
    if (tutorialStep !== 3) return;
    tutItemsAnimId = requestAnimationFrame(frame);
    drawTutorialItems();
  }
  tutItemsAnimId = requestAnimationFrame(frame);
}

function stopTutItemsFeedback() {
  if (tutItemsAnimId) { cancelAnimationFrame(tutItemsAnimId); tutItemsAnimId = null; }
}

function drawTutorialItems() {
  const tutCanvas = $('tut-items-canvas');
  if (!tutCanvas) return;
  const ctx2 = tutCanvas.getContext('2d');
  const W = tutCanvas.width, H = tutCanvas.height;
  ctx2.clearRect(0, 0, W, H);
  const t = performance.now() / 1000;
  const icx = W / 2, icy = H / 2; // centered

  if (tutStep3Phase === 0) {
    // MSG crystal — white rotating diamond
    const r = 18;
    ctx2.save();
    ctx2.translate(icx, icy + Math.sin(t * 3.5) * 3);
    ctx2.rotate(t * 2);
    ctx2.shadowBlur = 20; ctx2.shadowColor = '#fff';
    ctx2.fillStyle = '#fff';
    ctx2.beginPath();
    ctx2.moveTo(0, -r); ctx2.lineTo(r * 0.6, 0); ctx2.lineTo(0, r); ctx2.lineTo(-r * 0.6, 0);
    ctx2.closePath(); ctx2.fill();
    ctx2.fillStyle = 'rgba(200,220,255,0.55)';
    ctx2.beginPath();
    ctx2.moveTo(0, -r * 0.5); ctx2.lineTo(r * 0.3, 0); ctx2.lineTo(0, r * 0.5); ctx2.lineTo(-r * 0.3, 0);
    ctx2.closePath(); ctx2.fill();
    ctx2.shadowBlur = 0;
    ctx2.restore();
  } else if (tutStep3Phase === 1) {
    // Oil drop — yellow orb
    const r = 16;
    const bob = Math.sin(t * 3) * 3;
    ctx2.shadowBlur = 18; ctx2.shadowColor = '#ffd700';
    ctx2.fillStyle = '#ffaa00';
    ctx2.beginPath(); ctx2.arc(icx, icy + bob, r, 0, Math.PI * 2); ctx2.fill();
    ctx2.shadowBlur = 0;
    ctx2.fillStyle = '#fff';
    ctx2.beginPath(); ctx2.arc(icx - r * 0.25, icy + bob - r * 0.25, r * 0.22, 0, Math.PI * 2); ctx2.fill();
  } else if (tutStep3Phase === 2) {
    // Red hazard — pulsing danger circle
    const r = 16;
    const pulse = Math.sin(t * 5) * 0.3 + 0.7;
    ctx2.strokeStyle = `rgba(255,60,60,${pulse})`; ctx2.lineWidth = 2.5;
    ctx2.setLineDash([5, 3]);
    ctx2.beginPath(); ctx2.arc(icx, icy, r, 0, Math.PI * 2); ctx2.stroke();
    ctx2.setLineDash([]);
    ctx2.fillStyle = `rgba(255,60,60,${pulse * 0.25})`;
    ctx2.beginPath(); ctx2.arc(icx, icy, r * 0.65, 0, Math.PI * 2); ctx2.fill();
    ctx2.strokeStyle = `rgba(255,80,80,${pulse})`; ctx2.lineWidth = 1.5;
    ctx2.beginPath();
    ctx2.moveTo(icx - 7, icy); ctx2.lineTo(icx + 7, icy);
    ctx2.moveTo(icx, icy - 7); ctx2.lineTo(icx, icy + 7);
    ctx2.stroke();
  }
}

/* ═══ TITLE SHRIMP CANVAS ═══ */

let titleShrimpAnimId = null;

function drawStaticShrimp(ctx2, cx, cy, scale, t) {
  ctx2.save();
  ctx2.translate(cx, cy);
  ctx2.scale(scale, scale);
  const bodyColor = 'rgb(255,140,80)';
  for (let i = 0; i < 5; i++) {
    const offset = Math.sin((t || 0) * 3 + i) * 1.5;
    const sz = 14 * (1 - i * 0.15);
    ctx2.fillStyle = bodyColor;
    ctx2.beginPath(); ctx2.arc(-i * 6, offset, sz, 0, Math.PI * 2); ctx2.fill();
    ctx2.strokeStyle = 'rgba(255,255,255,0.25)'; ctx2.lineWidth = 2; ctx2.stroke();
  }
  ctx2.fillStyle = '#111';
  ctx2.beginPath(); ctx2.arc(4, -4, 3, 0, Math.PI * 2); ctx2.arc(4, 4, 3, 0, Math.PI * 2); ctx2.fill();
  ctx2.fillStyle = '#fff';
  ctx2.beginPath(); ctx2.arc(5, -5, 1, 0, Math.PI * 2); ctx2.arc(5, 3, 1, 0, Math.PI * 2); ctx2.fill();
  ctx2.restore();
}

function startTitleShrimp() {
  const c = $('title-shrimp');
  if (!c) return;
  if (titleShrimpAnimId) return; // already running
  const ctx2 = c.getContext('2d');
  function frame() {
    titleShrimpAnimId = requestAnimationFrame(frame);
    const t = performance.now() / 1000;
    ctx2.clearRect(0, 0, c.width, c.height);
    drawStaticShrimp(ctx2, c.width / 2 + 8, c.height / 2, 1.0, t);
  }
  frame(); // call immediately so first frame renders right away
}

function stopTitleShrimp() {
  if (titleShrimpAnimId) { cancelAnimationFrame(titleShrimpAnimId); titleShrimpAnimId = null; }
}

// Also draw on the tutorial step 0 small preview
function drawTutShrimpPreview() {
  const c = $('tut-shrimp-preview');
  if (!c) return;
  const ctx2 = c.getContext('2d');
  ctx2.clearRect(0, 0, c.width, c.height);
  drawStaticShrimp(ctx2, c.width / 2 + 6, c.height / 2, 0.8, performance.now() / 1000);
}

/* ═══ MINI GAMEPLAY DEMO (Tutorial step 3) ═══ */

let tutDemoAnimId = null;

function startTutDemo() {
  const c = $('tut-demo-canvas');
  if (!c) return;
  const ctx2 = c.getContext('2d');
  const W = c.width, H = c.height;
  const wokCx = W / 2, wokCy = H / 2, wokR = 50;

  // Demo state
  let demoT = 0;
  const demoShrimp = { x: wokCx - 20, y: wokCy + 10, vy: 0, airborne: false };
  const demoMsg = { x: wokCx + 15, y: wokCy - 25 };
  let collected = false;
  let burstParticles = [];
  let phase = 0; // 0=slide right, 1=jump, 2=burst, 3=reset

  function frame() {
    if (tutorialStep !== 3) return;
    tutDemoAnimId = requestAnimationFrame(frame);
    demoT += 1 / 60;
    ctx2.clearRect(0, 0, W, H);

    // Wok background
    ctx2.fillStyle = '#1a1a24';
    ctx2.beginPath(); ctx2.arc(wokCx, wokCy, wokR, 0, Math.PI * 2); ctx2.fill();
    ctx2.strokeStyle = 'rgba(255,255,255,0.1)'; ctx2.lineWidth = 2;
    ctx2.beginPath(); ctx2.arc(wokCx, wokCy, wokR, 0, Math.PI * 2); ctx2.stroke();

    // Phase logic
    if (phase === 0) {
      // Slide toward MSG
      demoShrimp.x += 0.6;
      if (demoShrimp.x >= demoMsg.x - 5) { phase = 1; demoShrimp.vy = -4.5; demoShrimp.airborne = true; }
    } else if (phase === 1) {
      // Jump arc
      demoShrimp.vy += 0.25;
      demoShrimp.y += demoShrimp.vy;
      if (demoShrimp.airborne && demoShrimp.y <= demoMsg.y + 5 && Math.abs(demoShrimp.x - demoMsg.x) < 15) {
        collected = true;
        phase = 2;
        for (let i = 0; i < 8; i++) {
          burstParticles.push({
            x: demoMsg.x, y: demoMsg.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1,
          });
        }
      }
      if (demoShrimp.y >= wokCy + 10) {
        demoShrimp.y = wokCy + 10;
        demoShrimp.vy = 0;
        demoShrimp.airborne = false;
        if (!collected) phase = 1; // retry
      }
    } else if (phase === 2) {
      // Burst + land
      demoShrimp.vy += 0.25;
      demoShrimp.y += demoShrimp.vy;
      if (demoShrimp.y >= wokCy + 10) {
        demoShrimp.y = wokCy + 10;
        demoShrimp.vy = 0;
        demoShrimp.airborne = false;
        phase = 3;
        demoT = 0;
      }
    } else if (phase === 3) {
      // Wait then reset
      if (demoT > 1.5) {
        demoShrimp.x = wokCx - 20;
        demoShrimp.y = wokCy + 10;
        collected = false;
        burstParticles = [];
        phase = 0;
        demoT = 0;
      }
    }

    // Draw MSG crystal (if not collected)
    if (!collected) {
      const bob = Math.sin(demoT * 3.5) * 2;
      ctx2.save();
      ctx2.translate(demoMsg.x, demoMsg.y + bob);
      ctx2.rotate(demoT * 2);
      ctx2.shadowBlur = 10; ctx2.shadowColor = '#fff';
      ctx2.fillStyle = '#fff';
      ctx2.beginPath();
      ctx2.moveTo(0, -8); ctx2.lineTo(5, 0); ctx2.lineTo(0, 8); ctx2.lineTo(-5, 0);
      ctx2.closePath(); ctx2.fill();
      ctx2.shadowBlur = 0;
      ctx2.restore();
    }

    // Draw burst particles
    burstParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.life -= 0.03;
      if (p.life > 0) {
        ctx2.globalAlpha = p.life;
        ctx2.fillStyle = '#ffd700';
        ctx2.beginPath(); ctx2.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx2.fill();
        ctx2.globalAlpha = 1;
      }
    });

    // Draw shrimp
    drawStaticShrimp(ctx2, demoShrimp.x, demoShrimp.y, 0.7, demoT);

    // Shadow when airborne
    if (demoShrimp.airborne) {
      ctx2.fillStyle = 'rgba(0,0,0,0.2)';
      ctx2.beginPath();
      ctx2.ellipse(demoShrimp.x, wokCy + 14, 8, 3, 0, 0, Math.PI * 2);
      ctx2.fill();
    }
  }
  tutDemoAnimId = requestAnimationFrame(frame);
}

function stopTutDemo() {
  if (tutDemoAnimId) { cancelAnimationFrame(tutDemoAnimId); tutDemoAnimId = null; }
}

/* ═══ ARCADE HIGH SCORE SYSTEM ═══ */

let highScores = [];
let lastRunTime = 0;
let lastRunStage = 0;
let nameEntryMidGame = false;

function loadScores() {
  try {
    const stored = localStorage.getItem('sfr_highscores');
    if (stored) {
      highScores = JSON.parse(stored);
    } else {
      highScores = CFG.DEFAULT_SCORES.map(s => ({ ...s }));
      saveScoresToStorage();
    }
  } catch (e) {
    highScores = CFG.DEFAULT_SCORES.map(s => ({ ...s }));
  }
  sortScores();
  // On Render (non-localhost), also fetch server-side shared scores
  if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    fetch('/scores').then(r => r.json()).then(serverScores => {
      // Merge server scores with local, deduplicate by name+time, keep best 10
      const seen = new Set(highScores.map(s => s.name + s.time));
      for (const s of serverScores) {
        if (!seen.has(s.name + s.time)) { highScores.push(s); seen.add(s.name + s.time); }
      }
      sortScores();
      updateHighScorePreview();
    }).catch(() => {});
  }
}

function sortScores() {
  // Sort by time only — fastest 5 MSG wins regardless of stage reached
  // (stage-first sort buried S1 completers below seeded S2 entries)
  highScores.sort((a, b) => a.time - b.time);
}

function saveScoresToStorage() {
  try { localStorage.setItem('sfr_highscores', JSON.stringify(highScores)); } catch (e) {}
}

let hasSavedCalibration = false;
function loadCalibration() {
  try {
    const stored = localStorage.getItem('sfr_calibration');
    if (stored) {
      const c = JSON.parse(stored);
      if (c.toss && c.swat) {
        calibration.tossThreshold = c.toss;
        calibration.swatThreshold = c.swat;
        return true;
      }
    }
  } catch (e) {}
  return false;
}

function saveScore(name, time, stageNum) {
  highScores.push({ name: name.toUpperCase().slice(0, 8), time: Math.round(time), stage: stageNum });
  sortScores();
  saveScoresToStorage();
  // Also post to shared server leaderboard when on Render
  if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    fetch('/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.toUpperCase().slice(0, 8), time: Math.round(time), stage: stageNum })
    }).catch(() => {});
  }
}

function getBestScore() {
  if (highScores.length === 0) return null;
  return highScores[0];
}

function fmtScoreTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m + ':' + String(s).padStart(2, '0');
}

function updateHighScorePreview() {
  const stack = $('title-score-stack');
  if (!stack) return;
  const top3 = highScores.slice(0, 3);
  if (top3.length === 0) { stack.style.display = 'none'; return; }
  stack.style.display = 'block';
  const best = top3[0];
  const rows = top3.map((s, i) =>
    '<div class="score-row">' +
    '<span class="score-rank">#' + (i + 1) + '</span>' +
    '<span class="score-name">' + s.name + '</span>' +
    '<span class="score-time">' + fmtScoreTime(s.time) + '</span>' +
    '</div>'
  ).join('');
  stack.innerHTML =
    '<div class="stack-callout">Can you beat <strong>' + best.name + '</strong>?</div>' +
    '<div class="title-scores-rows">' + rows + '</div>';
}

function showNameEntry(midGame) {
  nameEntryMidGame = midGame || false;
  hideAllScreens();
  $('name-entry-screen').style.display = 'flex';
  const stageNum = nameEntryMidGame ? 1 : (stage >= STAGE.S3 ? 3 : stage >= STAGE.S2 ? 2 : 1);
  lastRunTime = Math.round(gameTime);
  lastRunStage = stageNum;
  if (nameEntryMidGame) {
    $('run-stats').innerHTML = 'Stage 1 complete! Time: <span>' + fmtScoreTime(lastRunTime) + '</span>';
  } else {
    $('run-stats').innerHTML = 'Time: <span>' + fmtScoreTime(lastRunTime) + '</span> — Stage <span>' + lastRunStage + '</span>';
  }
  const input = $('name-input');
  input.value = '';
  setTimeout(() => input.focus(), 100);
}

function submitScore() {
  const rawName = $('name-input').value.trim() || 'SHRIMP';
  const name = rawName.toUpperCase().slice(0, 8);
  saveScore(name, lastRunTime, lastRunStage);
  updateHighScorePreview();
  if (nameEntryMidGame) {
    nameEntryMidGame = false;
    _doTransition();
  } else {
    const isNewBest = highScores[0].name === name && highScores[0].time === lastRunTime;
    showScoresScreen(name, isNewBest);
  }
}

function showScoresScreen(highlightName, isNewBest) {
  hideAllScreens();
  $('scores-screen').style.display = 'flex';

  if (isNewBest) announce('NEW HIGH SCORE!', '', 2500);

  renderScoresArcade(highlightName);
}

function renderScoresArcade(highlightName) {
  const wrap = $('scores-arcade');
  if (!wrap) return;
  wrap.innerHTML = '';

  highScores.forEach((s, i) => {
    const isHighlight = highlightName && s.name === highlightName && s.time === lastRunTime;
    const isDim = i >= 5;
    const row = document.createElement('div');
    row.className = 'score-row' + (isDim ? ' dim' : '') + (isHighlight ? ' highlight' : '');
    row.style.opacity = '0'; // start hidden for stagger animation
    row.innerHTML =
      '<span class="score-rank">#' + (i + 1) + '</span>' +
      '<span class="score-name">' + s.name + '</span>' +
      '<span class="score-time">' + fmtScoreTime(s.time) + '</span>';
    wrap.appendChild(row);

    // Stagger reveal
    const targetOpacity = isDim ? '0.4' : '1';
    setTimeout(() => {
      row.style.transition = 'opacity 0.2s ease';
      row.style.opacity = targetOpacity;
    }, i * 70 + 50);
  });
}

/* ═══ WEBSOCKET RELAY ═══ */

// Auto-detect relay URL from current page origin (for combined serve.js)
function autoConnectRelay() {
  let host = $('relay-url').value.trim();
  if (!host) {
    // Auto-detect: use the current page's host (works with serve.js + ngrok)
    host = window.location.host;
  }
  connectToRelay(host);
}

// Generate QR code using qrcodejs (local, no external API)
function generateQRCode(text, container, size) {
  container.innerHTML = '';
  if (typeof QRCode !== 'undefined') {
    new QRCode(container, {
      text: text,
      width: size,
      height: size,
      colorDark: '#4cd964',
      colorLight: '#000000',
      correctLevel: QRCode.CorrectLevel.M
    });
    const child = container.firstChild;
    if (child) { child.style.display = 'block'; child.style.margin = '0 auto'; child.style.borderRadius = '4px'; }
  } else {
    // Fallback: show URL as text
    const p = document.createElement('p');
    p.style.cssText = 'color:#4cd964;font-size:10px;word-break:break-all;text-align:center;margin:4px 0;line-height:1.4;';
    p.textContent = text;
    container.appendChild(p);
  }
}

function connectToRelay(host) {
  const btn = $('relay-connect-btn');
  if (btn) { btn.textContent = 'CONNECTING...'; btn.disabled = true; }

  const protocol = host.includes('localhost') ? 'ws' : 'wss';
  relayWS = new WebSocket(`${protocol}://${host.replace(/^https?:\/\//, '')}`);

  relayWS.onopen = () => {
    console.log('[Relay] Connected. Requesting room...');
    relayWS.send(JSON.stringify({ role: 'display' }));
  };

  relayWS.onerror = () => {
    if (btn) { btn.textContent = 'GENERATE ROOM CODE'; btn.disabled = false; btn.classList.remove('btn-relay--active'); }
    const box = $('relay-box');
    if (box) {
      box.style.display = 'block';
      $('relay-code-display').textContent = '----';
      $('relay-code-display').style.color = '#ff4444';
      $('relay-code-display').style.textShadow = '0 0 12px rgba(255,68,68,.4)';
      const urlEl = $('relay-controller-url');
      if (urlEl) urlEl.textContent = 'Connection failed — is the server running? (node serve.js)';
    }
  };

  relayWS.onclose = () => {
    if (!relayRoom && btn) { btn.textContent = 'GENERATE ROOM CODE'; btn.disabled = false; btn.classList.remove('btn-relay--active'); }
  };

  relayWS.onmessage = (e) => {
    const msg = JSON.parse(e.data);

    if (msg.type === 'room') {
      relayRoom = msg.code;
      if (btn) { btn.textContent = 'ROOM ACTIVE'; btn.disabled = false; btn.classList.add('btn-relay--active'); }
      $('relay-code-display').textContent = msg.code;
      $('relay-code-display').style.color = '#4cd964';
      $('relay-code-display').style.textShadow = '2px 2px 0 rgba(0,0,0,0.7), 0 0 20px rgba(76,217,100,0.4)';
      $('relay-box').style.display = 'block';

      // Build controller URL and generate QR code
      const proto = window.location.protocol;
      const controllerURL = `${proto}//${host}/controller.html?relay=${encodeURIComponent(host)}&code=${msg.code}`;
      const urlEl = $('relay-controller-url');
      if (urlEl) urlEl.textContent = controllerURL;
      const qrEl = $('relay-qr');
      if (qrEl) generateQRCode(controllerURL, qrEl, 150);
    }
    else if (msg.type === 'controller-connected') {
      remoteControllerCount = msg.count;
      updatePhoneStatus('phone');
      // Show tutorial walkthrough when controller connects from title
      if (stage === STAGE.TITLE) {
        startTutorial(false);
      } else if (stage === STAGE.CALIBRATE) {
        // Already past tutorial — skip calibration for remote controllers
        skipCalibration();
      }
    }
    else if (msg.type === 'controller-disconnected') {
      remoteControllerCount = msg.count;
      updatePhoneStatus('phone');
    }
    // Remote Sensor Data Injection
    else if (msg.type === 'orientation') {
      hasDeviceOrientation = true;
      sensorDebug.hasOrientation = true;
      sensorDebug.orient = { alpha: msg.alpha || 0, beta: msg.beta || 0, gamma: msg.gamma || 0 };
      tiltX = Math.max(-1, Math.min(1, (msg.gamma || 0) / 60));
      tiltY = Math.max(-1, Math.min(1, (msg.beta || 0) / 28)); // more sensitive forward lean
    }
    else if (msg.type === 'motion') {
      processMotion(msg); // Reuses the unified motion parser
    }
    else if (msg.type === 'hit') {
      // Piezo Hit Triggered (Remote Spatula)
      if (gameRunning) {
         if (stage === STAGE.S3) {
            // Zone mapping: 0=Top, 1=Right, 2=Bottom, 3=Left
            // Map the raw zone hit to a coordinate in world space for attemptS3Swat
            // Piezo hits bypass threshold checks
            if (msg.worldX !== undefined) attemptS3Swat(msg.worldX, msg.worldY);
            else attemptS3Swat();
         } else if (stage === STAGE.S2) {
            attemptSwat();
         } else if (!shrimp.airborne) {
            tossShrimp();
         }
      }
    }
  };

  relayWS.onerror = (err) => console.log('[Relay Error]', err);
}

// Detect device type for debug
function detectDevice() {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) sensorDebug.device = 'iPhone';
  else if (/iPad/.test(ua)) sensorDebug.device = 'iPad';
  else if (/Android/.test(ua)) sensorDebug.device = 'Android';
  else if (/Mac/.test(ua)) sensorDebug.device = 'macOS';
  else if (/Windows/.test(ua)) sensorDebug.device = 'Windows';
  else sensorDebug.device = 'Unknown';
}
detectDevice();

// Mouse / Touch (desktop testing + mobile fallback)
window.addEventListener('mousemove', e => {
  if (hasDeviceOrientation) return;
  const rect = canvas.getBoundingClientRect();
  tiltX = Math.max(-1, Math.min(1, (e.clientX - rect.left - rect.width / 2) / (rect.width * 0.4)));
  tiltY = Math.max(-1, Math.min(1, (e.clientY - rect.top - rect.height / 2) / (rect.height * 0.4)));
  updatePhoneStatus('desktop');
});

// Touch toss & swat
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  if (!gameRunning) return;
  if (stage === STAGE.S2 && chef.state === 'holding') { attemptSwat(); return; }
  if (stage === STAGE.S3 && s3.hands.length > 0) { attemptS3Swat(); return; }
  if (!shrimp.airborne) tossShrimp();
}, { passive: false });

window.addEventListener('mousedown', () => {
  if (!gameRunning) return;
  if (stage === STAGE.S2 && chef.state === 'holding') { attemptSwat(); return; }
  if (stage === STAGE.S3 && s3.hands.length > 0) { attemptS3Swat(); return; }
  if (!shrimp.airborne) tossShrimp();
});

window.addEventListener('keydown', e => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  keys[e.code] = true;
  if (e.code === 'Space' && gameRunning) {
    if (stage === STAGE.S2 && chef.state === 'holding') attemptSwat();
    else if (stage === STAGE.S3) { if (!shrimp.airborne) tossShrimp(); }
    else if (!shrimp.airborne) tossShrimp();
  }
  if (e.code === 'Enter' && gameRunning && (stage === STAGE.S2 || stage === STAGE.S3)) {
    if (stage === STAGE.S2) attemptSwat(); else attemptS3Swat();
  }
  if (e.code === 'Space' && (stage === STAGE.GAMEOVER || stage === STAGE.VICTORY)) restartGame();
  // Skip calibration on desktop
  if (e.code === 'Escape' && stage === STAGE.CALIBRATE) skipCalibration();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

$('gameover-screen').addEventListener('click', e => { if (e.target.tagName !== 'BUTTON') restartGame(); });
$('gameover-screen').addEventListener('touchstart', () => restartGame());
$('victory-screen').addEventListener('click', e => { if (e.target.tagName !== 'BUTTON') restartGame(); });
$('victory-screen').addEventListener('touchstart', () => restartGame());

/* ═══ CALIBRATION ═══ */
function startCalibration() {
  stage = STAGE.CALIBRATE;
  calibration.active = true;
  calibration.flicks = [];
  calibration.cooldown = 0;
  showScreen('calibration-screen');
  updateCalibrationUI();
}

function handleCalibrationFlick(magnitude) {
  if (calibration.cooldown > 0) return;
  if (magnitude < CFG.CALIBRATION_MIN_ACCEL) return;

  calibration.flicks.push(magnitude);
  calibration.cooldown = CFG.CALIBRATION_COOLDOWN;
  playSound('calibrate');

  updateCalibrationUI();

  if (calibration.flicks.length >= CFG.CALIBRATION_FLICKS) {
    finishCalibration();
  }
}

function updateCalibrationUI() {
  // Standalone calibration screen dots
  const dots = document.querySelectorAll('#calibration-screen .cal-dot');
  dots.forEach((dot, i) => {
    if (i < calibration.flicks.length) dot.classList.add('done');
    else dot.classList.remove('done');
  });
  const hint = $('cal-hint');
  if (hint) {
    const remaining = CFG.CALIBRATION_FLICKS - calibration.flicks.length;
    hint.textContent = remaining > 0 ? `FLICK UP! (${remaining} left)` : 'CALIBRATING...';
  }

  // Tutorial step-4 embedded calibration dots
  if (tutorialStep === 4) {
    const remaining = CFG.CALIBRATION_FLICKS - calibration.flicks.length;
    for (let i = 0; i < CFG.CALIBRATION_FLICKS; i++) {
      const dot = $('tut-cal-dot-' + i);
      if (!dot) continue;
      if (i < calibration.flicks.length) dot.classList.add('done');
      else dot.classList.remove('done');
    }
    const countEl = $('tut-cal-count');
    if (countEl) countEl.textContent = remaining > 0 ? `${remaining} left` : 'CALIBRATING...';
    // Fade arrow out when done
    const arrowEl = document.querySelector('#tut-cal-hint .flick-arrow-anim');
    if (arrowEl) arrowEl.style.opacity = remaining > 0 ? '' : '0';
  }
}

// Skip embedded tutorial calibration — use defaults and start gameplay
function skipTutorialCalibration() {
  calibration.active = false;
  calibration.tossThreshold = CFG.TOSS_THRESHOLD;
  calibration.swatThreshold = CFG.SWAT_THRESHOLD;
  startGameplay();
}

// Use previously cached calibration (shown on replay when sfr_calibration exists)
function useSavedCalibration() {
  calibration.active = false;
  // thresholds already loaded by loadCalibration() at boot
  hasSeenTutorial = true;
  startGameplay();
}

function finishCalibration() {
  calibration.active = false;
  const avg = calibration.flicks.reduce((a, b) => a + b, 0) / calibration.flicks.length;
  // Set thresholds relative to the user's natural flick strength
  calibration.tossThreshold = avg * 0.6;   // 60% of average = toss
  calibration.swatThreshold = avg * 1.1;   // 110% of average = hard swat
  console.log(`[Calibration] Avg flick: ${avg.toFixed(1)}, Toss: ${calibration.tossThreshold.toFixed(1)}, Swat: ${calibration.swatThreshold.toFixed(1)}`);
  // Persist calibration so replays don't start from scratch
  try {
    localStorage.setItem('sfr_calibration', JSON.stringify({
      toss: calibration.tossThreshold,
      swat: calibration.swatThreshold,
    }));
    hasSavedCalibration = true;
  } catch (e) {}
  hasSeenTutorial = true;
  startGameplay();
}

function skipCalibration() {
  calibration.active = false;
  calibration.tossThreshold = CFG.TOSS_THRESHOLD;
  calibration.swatThreshold = CFG.SWAT_THRESHOLD;
  startGameplay();
}

/* ═══ TUTORIAL FLOW (FTUE Walkthrough) ═══ */
let tutorialStep = 0;
let isDesktop = false;
let hasSeenTutorial = false;
const TUTORIAL_TOTAL_STEPS = 5; // steps 0-4
let tutStep3Phase = 0;     // sub-phase within step 3: 0=MSG, 1=Oil, 2=Danger
let tutStep3Timer = null;  // auto-advance timeout

function startTutorial(desktop = false) {
  isDesktop = desktop;
  ensureAudio();
  stopTitleShrimp();
  showScreen('tutorial-screen');

  if (hasSeenTutorial) {
    // Replay: skip straight to calibration step
    tutorialStep = 4;
    updateTutorialUI();
    // Show "Use saved" button if we have cached calibration
    const savedBtn = $('tut-use-saved-btn');
    if (savedBtn) savedBtn.style.display = hasSavedCalibration ? 'block' : 'none';
  } else {
    tutorialStep = 0;
    updateTutorialUI();
  }
}

function nextTutorialStep() {
  // During step 3: button advances sub-phase, not the whole step
  if (tutorialStep === 3 && tutStep3Phase < 2) {
    if (tutStep3Timer) { clearTimeout(tutStep3Timer); tutStep3Timer = null; }
    showStep3Phase(tutStep3Phase + 1);
    return;
  }

  // Stop any active feedback from the current step
  stopTutTiltFeedback();
  stopTutItemsFeedback();
  stopTutDemo();
  if (tutStep3Timer) { clearTimeout(tutStep3Timer); tutStep3Timer = null; }

  tutorialStep++;
  if (tutorialStep >= TUTORIAL_TOTAL_STEPS) {
    // Steps exhausted — desktop mode only reaches here (step 4 shown with NEXT for desktop)
    setupDesktopFallback();
  } else {
    // Request sensors on the transition to step 1 (iOS needs a user gesture)
    if (tutorialStep === 1 && !sensorsSetup) {
      requestSensorsEarly();
    }
    updateTutorialUI();
  }
}

function updateTutorialUI() {
  for (let i = 0; i < TUTORIAL_TOTAL_STEPS; i++) {
    const stepEl = $('tut-step-' + i);
    const dotEl = $('tut-dot-' + i);
    if (stepEl) stepEl.style.display = (i === tutorialStep) ? 'block' : 'none';
    if (dotEl) {
      if (i <= tutorialStep) dotEl.classList.add('done');
      else dotEl.classList.remove('done');
    }
  }

  const btn = $('tut-next-btn');

  // Draw shrimp preview on step 0
  if (tutorialStep === 0) {
    drawTutShrimpPreview();
  }

  if (tutorialStep === 1) {
    // Live tilt preview with hold→tilt auto-advance
    if (btn) { btn.style.display = 'block'; btn.innerHTML = 'NEXT'; }
    startTutTiltFeedback();
  } else if (tutorialStep === 2) {
    // Live flick bar — reset state for fresh entry
    if (btn) { btn.style.display = 'block'; btn.innerHTML = 'NEXT'; }
    startTutFlickFeedback();
  } else if (tutorialStep === 3) {
    // Individual objective cards — auto-advance every 4 seconds, skip button visible
    if (btn) { btn.style.display = 'block'; btn.innerHTML = 'SKIP →'; }
    tutStep3Phase = 0;
    showStep3Phase(0);
    startTutItemsFeedback();
    startTutDemo();
  } else if (tutorialStep === 4) {
    // Embedded calibration
    if (isDesktop) {
      // Desktop: show a NEXT/skip button — clicking goes to setupDesktopFallback
      if (btn) { btn.style.display = 'block'; btn.innerHTML = 'LET\'S COOK'; }
    } else {
      // Phone: hide NEXT, start live calibration
      if (btn) btn.style.display = 'none';
      calibration.active = true;
      calibration.flicks = [];
      calibration.cooldown = 0;
      updateCalibrationUI();
    }
  } else {
    if (btn) { btn.style.display = 'block'; btn.innerHTML = 'NEXT'; }
  }
}

// Step 3 sub-phase management — one card at a time, auto-advance
function showStep3Phase(phase) {
  tutStep3Phase = phase;
  const cards = document.querySelectorAll('#tut-step-3 .goal-card');
  cards.forEach((card, i) => {
    card.style.display = (i === phase) ? 'flex' : 'none';
    if (i === phase) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(12px)';
      requestAnimationFrame(() => {
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    }
  });

  // Update the step title per phase
  const h2 = document.querySelector('#tut-step-3 h2');
  if (h2) {
    const titles = ['COLLECT MSG', 'OIL = HEALTH', 'AVOID DANGER'];
    h2.textContent = titles[phase] || 'THE GOAL';
  }

  // Update skip button label (last phase → button becomes "NEXT →")
  const btn = $('tut-next-btn');
  if (btn) btn.innerHTML = phase < 2 ? 'SKIP →' : 'NEXT →';

  // Auto-advance to next phase or next tutorial step
  if (tutStep3Timer) clearTimeout(tutStep3Timer);
  tutStep3Timer = setTimeout(() => {
    if (tutorialStep !== 3) return; // user already advanced
    if (phase < 2) {
      showStep3Phase(phase + 1);
    } else {
      // All 3 cards shown, advance to calibration (step 4)
      nextTutorialStep();
    }
  }, 4000);
}

/* ═══ GAME FLOW ═══ */
function initGame() {
  ensureAudio();
  stopBgParticles();

  // If sensors were already set up via requestSensorsEarly() in tutorial step 1,
  // go straight to calibration without re-requesting permission.
  if (sensorsSetup) {
    startCalibration();
    return;
  }

  // iOS 13+ requires explicit permission request from user gesture
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    sensorDebug.device = sensorDebug.device.includes('iPhone') || sensorDebug.device.includes('iPad') ? sensorDebug.device : 'iOS';
    Promise.all([
      DeviceOrientationEvent.requestPermission(),
      typeof DeviceMotionEvent.requestPermission === 'function'
        ? DeviceMotionEvent.requestPermission()
        : Promise.resolve('granted')
    ]).then(([orientPerm, motionPerm]) => {
      sensorDebug.permission = `orient:${orientPerm} motion:${motionPerm}`;
      if (orientPerm === 'granted' && motionPerm === 'granted') {
        setupDeviceOrientation();
        setupDeviceMotion();
        sensorsSetup = true;
        startCalibration();
      } else {
        setupDesktopFallback();
      }
    }).catch(err => {
      console.warn('[Sensor] Permission error:', err);
      sensorDebug.permission = 'denied/error';
      setupDesktopFallback();
    });
  } else {
    // Android Chrome: sensors auto-granted (no permission API)
    // Some Android browsers need HTTPS for sensor access
    sensorDebug.permission = 'auto (no API)';
    setupDeviceOrientation();
    setupDeviceMotion();
    sensorsSetup = true;
    // If sensors fire within 500ms, we'll calibrate; otherwise skip
    setTimeout(() => {
      if (hasDeviceOrientation) { startCalibration(); }
      else { skipCalibration(); }
    }, 500);
  }
}

function setupDesktopFallback() {
  ensureAudio();
  stopBgParticles();
  sensorDebug.permission = 'desktop mode';
  updatePhoneStatus('desktop');
  skipCalibration();
}

let _wakeLock = null;
async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    _wakeLock = await navigator.wakeLock.request('screen');
    _wakeLock.addEventListener('release', () => { _wakeLock = null; });
  } catch (e) {}
}
function releaseWakeLock() {
  if (_wakeLock) { _wakeLock.release(); _wakeLock = null; }
}
// Re-acquire wake lock when tab becomes visible again
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && gameRunning) requestWakeLock();
});

function startGameplay() {
  resetAll();
  stage = STAGE.S1;
  gameRunning = true;
  hideAllScreens();
  showHUD();
  updateDbgVisibility();
  requestWakeLock();
  // Lock to portrait so landscape rotation doesn't flip the tilt axes
  try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('portrait-primary').catch(() => {}); } catch (e) {}
  announce('STAGE 1', 'SURVIVE THE WOK');
  spawnOil();
}

function restartGame() {
  stage = STAGE.TITLE;
  gameRunning = false;
  stopTitleShrimp(); // cancel any old handle
  hideAllScreens();
  showScreen('title-screen');
  startTitleShrimp();
  initBgParticles();
  updateHighScorePreview();
  updateDbgVisibility();
}

function resetAll() {
  resize();
  shrimp.x = WOK.cx(); shrimp.y = WOK.cy();
  shrimp.vx = 0; shrimp.vy = 0; shrimp.airborne = false; shrimp.airTime = 0;
  shrimp.scale = 1; shrimp.angle = 0; shrimp.wobble = 0;
  oilLevel = CFG.OIL_MAX; burnMeter = 0;
  oilItems = []; msgItems = []; obstacles = []; particles = [];
  msgCollected = 0; totalMsgCollected = 0; gameTime = 0; timeScale = 1;
  oilSpawnTimer = 0; msgSpawnTimer = 0;
  spatulaTimer = randRange(2, 4);
  pepperTimer = randRange(3, 5);
  oilpopTimer = randRange(2, 3);
  chef.hp = CFG.CHEF_MAX_HP; chef.state = 'idle'; chef.stateTimer = 3;
  chef.active = false; chef.reachProgress = 0; chef.invuln = 0;
  chef.angle = Math.random() * Math.PI * 2;
  screenShake = { x: 0, y: 0, intensity: 0 };
  screenFlash = 0; hitFlash = 0; hitCooldown = 0;
  tiltX = 0; tiltY = 0;
  upgrades = { jumpHeight: 0, tempResist: 0, oilCapacity: 0, speedBoost: 0 };
  s3 = { wave: 0, hands: [], handsSwatted: 0, handsToSpawn: 0, handSpawnTimer: 0, waveBreakTimer: 0, inBreak: false, ingredients: [] };
  document.body.classList.remove('burn-pulse');
  document.body.classList.remove('stage3-active');
  // Don't clear phone status if a remote controller is attached
  if (remoteControllerCount === 0) updatePhoneStatus('none');
}

function triggerGameOver() {
  gameRunning = false;
  releaseWakeLock();
  stage = STAGE.GAMEOVER;
  $('go-title').textContent = burnMeter >= CFG.BURN_MAX ? 'BURNT!' : 'GAME OVER';
  $('go-stats').innerHTML = `MSG: <span>${msgCollected}</span> / ${CFG.MSG_TO_WIN}<br>Time: <span>${fmtTime(gameTime)}</span>`;
  $('go-flavor').textContent = burnMeter >= CFG.BURN_MAX ? 'The oil ran dry... crispy shrimp.' : 'The chef got you.';
  const callout = $('go-beat-callout');
  if (callout && highScores.length > 0) callout.textContent = `Can you beat ${highScores[0].name}? (${fmtScoreTime(highScores[0].time)})`;
  showScreen('gameover-screen');
  updateDbgVisibility();
}

function triggerVictory() {
  gameRunning = false;
  releaseWakeLock();
  stage = STAGE.VICTORY;
  playSound('victory');
  const swatted = s3.handsSwatted || 0;
  $('vic-stats').innerHTML = `Time: <span>${fmtTime(gameTime)}</span><br>Hands Swatted: <span>${swatted}</span><br>Waves Survived: <span>${s3.wave}</span><br>The shrimp fried the rice.`;
  showScreen('victory-screen');
}

function triggerS3Victory() {
  triggerVictory();
}

/* ═══ FINAL MSG DIVE ANIMATION (before S1 → S2 transition) ═══ */
function triggerFinalMsgDive() {
  gameRunning = false;
  obstacles = [];
  addShake(18);
  // Burst of particles around the shrimp
  for (let i = 0; i < 50; i++) spawnParticle(shrimp.x, shrimp.y, '#ffffff', 12, 8);
  for (let i = 0; i < 30; i++) spawnParticle(shrimp.x, shrimp.y, '#ffd700', 10, 6);
  spawnPopup(shrimp.x, shrimp.y - 20, 'MSG POWER!', '#ffd700');
  playSound('collect');
  // Animate shrimp: scale bounce + spin over 1.3s, then transition
  const startTime = performance.now();
  function animDive() {
    const elapsed = (performance.now() - startTime) / 1000;
    if (elapsed < 1.3) {
      shrimp.scale = 1 + Math.sin(elapsed / 1.3 * Math.PI) * 2.2;
      shrimp.angle += 0.13;
      requestAnimationFrame(animDive);
    } else {
      shrimp.scale = 1;
      shrimp.angle = 0;
      startTransition();
    }
  }
  requestAnimationFrame(animDive);
}

/* ═══ TRANSITION 1: S1 → S2 ═══ */
function startTransition() {
  stage = STAGE.TRANSITION;
  gameRunning = false;
  obstacles = [];
  // Stage 1 complete — show name entry then leaderboard (single-stage release)
  showNameEntry(false);
}

function _doTransition() {
  const el = $('transition-text');
  showScreen('transition-screen');

  el.innerHTML = '<span style="color:#f7c948;font-size:24px;font-weight:800;letter-spacing:4px">* * *</span><br>The MSG... it\'s changing you...';
  setTimeout(() => {
    el.innerHTML = '<span style="font-size:32px;font-weight:800;color:#f7c948;letter-spacing:3px">BOSS FIGHT</span><br><span style="color:#f7c948;font-weight:800;margin-top:12px;display:inline-block">The chef noticed you.<br>He reaches into the wok...</span><br><span style="font-size:18px;color:#ff6b35;margin-top:8px;display:inline-block;font-weight:700">FIGHT BACK!</span><br><span style="font-size:14px;opacity:.8;margin-top:8px;display:inline-block;color:#fff">Swat his hand away!<br>Shake your phone hard or tap the screen!</span>';
  }, 2500);
  setTimeout(() => {
    startS2();
  }, 7500);
}

function startS2() {
  hideAllScreens();
  showHUD();
  showChefBar();
  gameRunning = true;
  stage = STAGE.S2;
  updateDbgVisibility();
  chef.active = true;
  chef.state = 'idle';
  chef.stateTimer = 2;
  oilLevel = CFG.OIL_MAX; // Refill for Stage 2
  burnMeter = 0;
  spatulaTimer = CFG.S2_SPATULA_MIN;
  pepperTimer = CFG.S2_PEPPER_MIN;
  oilpopTimer = CFG.S2_OILPOP_MIN;
  announce('STAGE 2', 'SWAT THE CHEF');
  $('hud-left-label').textContent = 'CHEF HP';
}

/* ═══ TRANSITION 2: S2 → UPGRADE SHOP → S3 ═══ */
function startTransition2() {
  stage = STAGE.TRANSITION2;
  gameRunning = false;
  obstacles = [];
  const el = $('transition2-text');
  showScreen('transition2-screen');

  el.innerHTML = '<span style="color:#f7c948;font-weight:800;font-size:28px;letter-spacing:3px">ROLE REVERSAL</span><br><span style="color:#ddd;margin-top:12px;display:inline-block">The MSG courses through you...<br>You\'re not the ingredient anymore.</span>';
  setTimeout(() => {
    el.innerHTML = '<span style="color:#ff6b35;font-weight:800;font-size:24px;letter-spacing:2px">THE SHRIMP FRIED THE RICE</span><br><span style="color:#ddd;margin-top:8px;display:inline-block;font-size:16px">Now YOU hold the wok.<br>Defend your kitchen from greedy hands!<br><span style="font-size:13px;opacity:.8;margin-top:6px;display:inline-block;color:#f7c948">NEW MECHANIC:<br>Shake hard or tap to swat hands away!</span></span>';
  }, 3500);
  setTimeout(() => {
    // Skip upgrade shop — go directly to S3
    startS3();
  }, 8000);
}

/* ═══ UPGRADE SHOP ═══ */
// Watson: "upgrade system...buy those upgrades with MSG and oil...
//   additional jump height or temperature resistance"
// Design: spend accumulated MSG on permanent buffs before S3
function showUpgradeShop() {
  stage = STAGE.UPGRADE;
  hideAllScreens();
  showScreen('upgrade-screen');
  renderUpgradeShop();
}

function renderUpgradeShop() {
  const currency = totalMsgCollected;
  $('upgrade-currency').innerHTML = `MSG: <span>${currency}</span>`;
  const list = $('upgrade-list');
  list.innerHTML = '';
  for (const [key, cfg] of Object.entries(CFG.UPGRADES)) {
    const level = upgrades[key];
    const cost = Math.ceil(cfg.baseCost * Math.pow(cfg.costMult, level));
    const maxed = level >= cfg.maxLevel;
    const canBuy = currency >= cost && !maxed;

    const row = document.createElement('div');
    row.className = 'upgrade-row';
    row.innerHTML = `
      <div class="upgrade-info">
        <div class="upgrade-name">${cfg.label}</div>
        <div class="upgrade-level">Lv ${level}/${cfg.maxLevel}${maxed ? ' MAX' : ''}</div>
      </div>
      <button class="upgrade-buy" ${canBuy ? '' : 'disabled'} data-key="${key}" data-cost="${cost}">
        ${maxed ? 'MAX' : cost + ' MSG'}
      </button>
    `;
    list.appendChild(row);
  }
  list.querySelectorAll('.upgrade-buy:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.key;
      const c = parseInt(btn.dataset.cost);
      if (totalMsgCollected >= c && upgrades[k] < CFG.UPGRADES[k].maxLevel) {
        totalMsgCollected -= c;
        upgrades[k]++;
        playSound('upgrade');
        applyUpgrades();
        renderUpgradeShop();
      }
    });
  });
}

function applyUpgrades() {
  // Most upgrades read via getUpgradeBonus() in the update loop.
  // Nothing to pre-compute here.
}

function getUpgradeBonus(key) {
  const cfg = CFG.UPGRADES[key];
  return upgrades[key] * cfg.effect;
}

function closeUpgradeShop() {
  startS3();
}

/* ═══ STAGE 3: ROLE REVERSAL — Shrimp Fried The Rice ═══ */
// Same wok, same shrimp (now with chef hat). Multiple human hands
// reach in from outside to steal your ingredients. Swat them all!
// Reuses the same tilt/toss/swat mechanics the player already knows.

function initS3() {
  s3.wave = 0;
  s3.hands = [];
  s3.handsSwatted = 0;
  s3.handsToSpawn = 0;
  s3.handSpawnTimer = 0;
  s3.waveBreakTimer = 0;
  s3.inBreak = false;
  // Scatter rice/ingredients in the wok center for visual flavor
  s3.ingredients = [];
  for (let i = 0; i < 20; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = Math.random() * WOK.radius() * 0.35;
    s3.ingredients.push({
      x: WOK.cx() + Math.cos(a) * d,
      y: WOK.cy() + Math.sin(a) * d,
      type: Math.random() > 0.6 ? 'R' : Math.random() > 0.5 ? 'C' : 'O',
      stolen: false,
    });
  }
}

function spawnS3Hand() {
  const speedMult = CFG.S3_HAND_SPEED_MULT[Math.min(s3.wave - 1, CFG.S3_HAND_SPEED_MULT.length - 1)];
  const angle = Math.random() * Math.PI * 2;
  s3.hands.push({
    angle: angle,
    reachProgress: 0,
    state: 'reaching',
    stateTimer: CFG.S3_HAND_REACH_TIME / speedMult,
    reachTime: CFG.S3_HAND_REACH_TIME / speedMult,
    holdTime: CFG.S3_HAND_HOLD_TIME / speedMult,
    handX: 0, handY: 0,
    hp: CFG.S3_HAND_HP,
    invuln: 0,
    swatted: false,
  });
}

function startS3() {
  hideAllScreens();
  stage = STAGE.S3;
  gameRunning = true;
  updateDbgVisibility();

  // Restore circular canvas (same as S1/S2)
  resize();

  // Center shrimp in the wok for S3
  shrimp.x = WOK.cx();
  shrimp.y = WOK.cy();
  shrimp.vx = 0;
  shrimp.vy = 0;
  shrimp.airborne = false;
  shrimp.scale = 1;

  initS3();
  showHUD();
  $('s3-hud').style.display = 'block';
  $('hud-left-label').textContent = 'WAVE';
  $('hud-left-value').textContent = '1 / ' + CFG.S3_WAVES;
  $('oil-label').style.display = 'block';
  $('oil-bar-wrap').style.display = 'block';
  oilLevel = CFG.OIL_MAX + getUpgradeBonus('oilCapacity');
  burnMeter = 0;
  obstacles = [];

  // Start first wave
  startS3Wave();
  announce('STAGE 3', 'DEFEND YOUR WOK');
}

/* ═══ ENTITY SPAWNING ═══ */
function spawnOil() {
  const a = Math.random() * Math.PI * 2;
  const d = Math.random() * (WOK.radius() - CFG.OIL_RADIUS - 30) * 0.75;
  oilItems.push({ x: WOK.cx() + Math.cos(a) * d, y: WOK.cy() + Math.sin(a) * d, radius: CFG.OIL_RADIUS, bob: Math.random() * Math.PI * 2, collected: false });
}

function spawnMSG() {
  const a = Math.random() * Math.PI * 2;
  const d = Math.random() * (WOK.radius() - CFG.MSG_RADIUS - 30) * 0.7;
  msgItems.push({ x: WOK.cx() + Math.cos(a) * d, y: WOK.cy() + Math.sin(a) * d, radius: CFG.MSG_RADIUS, bob: Math.random() * Math.PI * 2, collected: false });
}

function spawnSpatula() {
  obstacles.push({ type: 'spatula', angle: Math.random() * Math.PI * 2, progress: 0, speed: 0.7 + Math.random() * 0.3, telegraphTime: 1.2, timer: 0, active: false, done: false, hitOnce: false });
}
function spawnPepper() {
  const a = Math.random() * Math.PI * 2, d = Math.random() * WOK.radius() * 0.65;
  obstacles.push({ type: 'pepper', x: WOK.cx() + Math.cos(a) * d, y: WOK.cy() + Math.sin(a) * d, maxRadius: 35 + Math.random() * 15, timer: 0, phase: 'warning', warningDur: 1.0, activeDur: 0.8, done: false, hitOnce: false });
}
function spawnOilPop() {
  const a = Math.random() * Math.PI * 2, d = Math.random() * WOK.radius() * 0.55;
  obstacles.push({ type: 'oilpop', x: WOK.cx() + Math.cos(a) * d, y: WOK.cy() + Math.sin(a) * d, maxRadius: 25 + Math.random() * 10, timer: 0, phase: 'bubble', bubbleDur: 0.6, popDur: 0.4, done: false, hitOnce: false });
}
function spawnParticle(x, y, color, speed, size) {
  particles.push({ x, y, vx: (Math.random() - .5) * speed, vy: (Math.random() - .5) * speed, life: 0.4 + Math.random() * 0.4, maxLife: 0.8, color, size: size + Math.random() * size });
}

/* ═══ SHRIMP ACTIONS ═══ */
function tossShrimp() {
  if (shrimp.airborne) return;
  shrimp.airborne = true;
  shrimp.airTime = CFG.AIR_DURATION + getUpgradeBonus('jumpHeight');
  shrimp.vx = 0; // lock in place — kill drift at jump start
  shrimp.vy = 0;
  shrimp.scale = 1.6;
  oilLevel = Math.max(0, oilLevel - CFG.OIL_MAX * 0.05); // Classmate: Jump costs oil (reduced to 5%)
  playSound('whoosh');
  for (let i = 0; i < 10; i++) spawnParticle(shrimp.x, shrimp.y, '#fff', 3, 5);
}

function hitShrimp(damage) {
  if (hitCooldown > 0 || shrimp.airborne) return;
  hitCooldown = CFG.HIT_INVULN_TIME;
  oilLevel -= damage;
  addShake(8);
  hitFlash = 0.15;
  playSound('hit');
  if (navigator.vibrate) navigator.vibrate(CFG.HAPTIC_HIT);
  for (let i = 0; i < 6; i++) spawnParticle(shrimp.x, shrimp.y, '#ff3333', 5, 3);
}

function attemptSwat() {
  if (stage !== STAGE.S2 || !chef.active) return;
  if (chef.state !== 'holding' && chef.state !== 'reaching') return;
  if (chef.invuln > 0) return;

  chef.hp -= CFG.SWAT_DAMAGE;
  chef.invuln = 0.5;
  chef.state = 'recoiling';
  chef.stateTimer = CFG.CHEF_RECOIL_TIME;

  addShake(25);
  screenFlash = 0.4;
  playSound('slap');
  if (navigator.vibrate) navigator.vibrate(CFG.HAPTIC_SWAT);

  timeScale = CFG.SLOWMO_SCALE;
  setTimeout(() => { timeScale = 1; }, CFG.SLOWMO_DURATION_MS);

  spawnPopup(chef.handX, chef.handY, 'SWAT!', '#ff4444');
  for (let i = 0; i < 25; i++) spawnParticle(chef.handX, chef.handY, '#ff6666', 12, 5);

  if (chef.hp <= 0) { chef.active = false; setTimeout(startTransition2, 600); }
}

/* ═══ EFFECTS ═══ */
function addShake(intensity) { screenShake.intensity = Math.max(screenShake.intensity, intensity); }

/* ═══ UTILITIES ═══ */
function randRange(a, b) { return a + Math.random() * (b - a); }
function lerp(a, b, t) { return a + (b - a) * t; }
function fmtTime(t) { return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`; }
function dist(x1, y1, x2, y2) { return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2); }
function ptSegDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
  if (len2 === 0) return dist(px, py, ax, ay);
  let t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return dist(px, py, ax + t * dx, ay + t * dy);
}

/* ═══ OBSTACLE UPDATE ═══ */
function updateObstacles(dt) {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.timer += dt;
    switch (o.type) {
      case 'spatula': {
        if (o.timer < o.telegraphTime) break;
        if (!o.active) { o.active = true; o.timer = 0; break; }
        o.progress += o.speed * dt;
        if (o.progress >= 1) { o.done = true; break; }
        if (!o.hitOnce) {
          const sweepAngle = o.angle + o.progress * Math.PI;
          const cx = WOK.cx(), cy = WOK.cy(), r = WOK.radius() * 0.92;
          const ex = cx + Math.cos(sweepAngle) * r, ey = cy + Math.sin(sweepAngle) * r;
          if (ptSegDist(shrimp.x, shrimp.y, cx, cy, ex, ey) < shrimp.radius + 12) {
            if (shrimp.airborne) {
              // Airborne: no damage, but drain oil as a cost
              oilLevel -= CFG.OBSTACLE_AIR_DRAIN;
              o.hitOnce = true;
            } else {
              hitShrimp(CFG.SPATULA_DAMAGE);
              o.hitOnce = true;
              const ka = sweepAngle + Math.PI / 2;
              shrimp.vx += Math.cos(ka) * 6; shrimp.vy += Math.sin(ka) * 6;
            }
          }
        }
        break;
      }
      case 'pepper': {
        if (o.phase === 'warning' && o.timer >= o.warningDur) { o.phase = 'active'; o.timer = 0; addShake(3); playSound('pop'); }
        if (o.phase === 'active') {
          if (o.timer >= o.activeDur) { o.done = true; break; }
          if (!o.hitOnce && dist(shrimp.x, shrimp.y, o.x, o.y) < shrimp.radius + o.maxRadius) {
            if (shrimp.airborne) {
              oilLevel -= CFG.OBSTACLE_AIR_DRAIN;
              o.hitOnce = true;
            } else {
              hitShrimp(CFG.PEPPER_DAMAGE); o.hitOnce = true;
            }
          }
        }
        break;
      }
      case 'oilpop': {
        if (o.phase === 'bubble' && o.timer >= o.bubbleDur) { o.phase = 'pop'; o.timer = 0; playSound('pop'); }
        if (o.phase === 'pop') {
          const r = (o.timer / o.popDur) * o.maxRadius;
          if (o.timer >= o.popDur) { o.done = true; break; }
          if (!o.hitOnce && dist(shrimp.x, shrimp.y, o.x, o.y) < shrimp.radius + r) {
            if (shrimp.airborne) {
              oilLevel -= CFG.OBSTACLE_AIR_DRAIN;
              o.hitOnce = true;
            } else {
              hitShrimp(CFG.OILPOP_DAMAGE); o.hitOnce = true;
            }
          }
        }
        break;
      }
    }
    if (o.done) obstacles.splice(i, 1);
  }
}

/* ═══ CHEF AI (Stage 2) ═══ */
function updateChef(dt) {
  if (!chef.active) return;
  chef.invuln = Math.max(0, chef.invuln - dt);
  chef.stateTimer -= dt;

  const rimDist = WOK.radius() + 30;
  const targetDist = WOK.radius() * 0.35;

  switch (chef.state) {
    case 'idle':
      chef.angle += 0.4 * dt;
      chef.reachProgress = 0;
      if (chef.stateTimer <= 0) {
        chef.state = 'reaching'; chef.stateTimer = CFG.CHEF_REACH_TIME; chef.reachProgress = 0;
      }
      break;
    case 'reaching':
      chef.reachProgress = 1 - (chef.stateTimer / CFG.CHEF_REACH_TIME);
      if (chef.stateTimer <= 0) {
        chef.state = 'holding'; chef.stateTimer = CFG.CHEF_HOLD_TIME; chef.reachProgress = 1;
      }
      break;
    case 'holding':
      chef.reachProgress = 1;
      // The chef's hand is IN the wok — drain oil while holding
      oilLevel -= 8 * dt; // Chef disrupts the oil
      if (shrimp.airborne && chef.invuln <= 0) {
        if (dist(shrimp.x, shrimp.y, chef.handX, chef.handY) < shrimp.radius * shrimp.scale + 18) {
          chef.hp -= CFG.RAM_DAMAGE; chef.invuln = 0.5;
          addShake(12); playSound('hit');
          spawnPopup(chef.handX, chef.handY, 'RAM!', '#ffaa33');
          for (let i = 0; i < 12; i++) spawnParticle(chef.handX, chef.handY, '#ffaa33', 8, 4);
          if (chef.hp <= 0) { chef.active = false; setTimeout(startTransition2, 600); }
        }
      }
      if (chef.stateTimer <= 0) {
        chef.state = 'recoiling'; chef.stateTimer = CFG.CHEF_RECOIL_TIME;
      }
      break;
    case 'recoiling':
      chef.reachProgress = chef.stateTimer / CFG.CHEF_RECOIL_TIME;
      if (chef.stateTimer <= 0) {
        chef.state = 'idle';
        chef.stateTimer = randRange(CFG.CHEF_IDLE_MIN, CFG.CHEF_IDLE_MAX);
        chef.angle += randRange(Math.PI * 0.3, Math.PI * 0.7) * (Math.random() > 0.5 ? 1 : -1);
      }
      break;
  }

  const handDist = lerp(rimDist, targetDist, chef.reachProgress);
  chef.handX = WOK.cx() + Math.cos(chef.angle) * handDist;
  chef.handY = WOK.cy() + Math.sin(chef.angle) * handDist;
}

/* ═══ CORE UPDATE ═══ */
let lastTime = performance.now();

function update() {
  const now = performance.now();
  const rawDt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  requestAnimationFrame(update);

  // Calibration cooldown
  if (calibration.cooldown > 0) calibration.cooldown -= rawDt;

  if (!gameRunning || stage === STAGE.TITLE || stage === STAGE.TRANSITION || stage === STAGE.TRANSITION2 || stage === STAGE.CALIBRATE || stage === STAGE.UPGRADE) {
    updateSensorDebug();
    return;
  }

  const dt = rawDt * timeScale;
  gameTime += dt;
  hitCooldown = Math.max(0, hitCooldown - dt);

  // Keyboard tilt override
  if (!hasDeviceOrientation && (keys['ArrowLeft'] || keys['ArrowRight'] || keys['ArrowUp'] || keys['ArrowDown'] || keys['KeyW'] || keys['KeyA'] || keys['KeyS'] || keys['KeyD'])) {
    tiltX = 0; tiltY = 0;
    if (keys['ArrowLeft'] || keys['KeyA']) tiltX = -0.8;
    if (keys['ArrowRight'] || keys['KeyD']) tiltX = 0.8;
    if (keys['ArrowUp'] || keys['KeyW']) tiltY = -0.8;
    if (keys['ArrowDown'] || keys['KeyS']) tiltY = 0.8;
  }

  // ─── Sizzle Audio Logic (Classmate feature) ───
  if (sizzleGain) {
    if (stage === STAGE.S1 || stage === STAGE.S2) {
      const speed = Math.sqrt(shrimp.vx ** 2 + shrimp.vy ** 2);
      // Volume increases as speed nears 0, representing resting on the hot wok
      const targetGain = Math.max(0, 0.12 - speed * 0.018);
      sizzleGain.gain.setTargetAtTime(shrimp.airborne ? 0 : targetGain, audioCtx.currentTime, 0.1);
    } else {
      sizzleGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    }
  }

  // ─── Shrimp physics (S1/S2 only — S3 handles its own) ───
  if (stage !== STAGE.S3) {
  const speedMul = 1 + getUpgradeBonus('speedBoost');
  if (!shrimp.airborne) {
    currentDrag = 0.75 + (0.13 * (oilLevel / CFG.OIL_MAX));
    shrimp.vx += tiltX * CFG.GRAVITY * speedMul * 60 * dt;
    shrimp.vy += tiltY * CFG.GRAVITY * speedMul * 60 * dt;
    if (Math.abs(shrimp.vx) > 0.1 || Math.abs(shrimp.vy) > 0.1) shrimp.angle = Math.atan2(shrimp.vy, shrimp.vx);
    const speed = Math.sqrt(shrimp.vx ** 2 + shrimp.vy ** 2);
    shrimp.wobble = Math.sin(gameTime * 15) * Math.min(speed * 0.1, 0.5);
    shrimp.vx *= currentDrag; shrimp.vy *= currentDrag;
    shrimp.x += shrimp.vx; shrimp.y += shrimp.vy;

    // Wok boundary
    const dx = shrimp.x - WOK.cx(), dy = shrimp.y - WOK.cy();
    const d = Math.sqrt(dx * dx + dy * dy);
    const maxD = WOK.radius() - shrimp.radius;
    if (d > maxD) {
      const nx = dx / d, ny = dy / d;
      shrimp.x = WOK.cx() + nx * maxD; shrimp.y = WOK.cy() + ny * maxD;
      const dot = shrimp.vx * nx + shrimp.vy * ny;
      shrimp.vx -= 2 * dot * nx * (1 - CFG.BOUNCE);
      shrimp.vy -= 2 * dot * ny * (1 - CFG.BOUNCE);
      spawnParticle(shrimp.x, shrimp.y, '#ffaa33', 3, 3);
    }

    // Oil drain
    let drain = CFG.OIL_DRAIN_BASE;
    if (speed > 1) drain += speed * CFG.OIL_DRAIN_MOVE;
    if (oilLevel > 0) { oilLevel -= drain * dt; burnMeter = Math.max(0, burnMeter - CFG.BURN_RATE_COOL * dt); }
    else { burnMeter += CFG.BURN_RATE_GROWTH * dt; }

  } else {
    // Airborne
    shrimp.airTime -= dt;
    const prog = 1 - (shrimp.airTime / CFG.AIR_DURATION);
    shrimp.scale = 1 + Math.sin(prog * Math.PI) * 1.5;
    shrimp.vx *= 0.96; // mostly locked but tiny drift gives arc feel
    shrimp.vx += tiltX * 0.35; // very light tilt influence during flight
    shrimp.vy *= 0.96;
    shrimp.x += shrimp.vx; shrimp.y += shrimp.vy;
    const dx = shrimp.x - WOK.cx(), dy = shrimp.y - WOK.cy(), d = Math.sqrt(dx * dx + dy * dy);
    if (d > WOK.radius() - shrimp.radius) {
      shrimp.x = WOK.cx() + (dx / d) * (WOK.radius() - shrimp.radius);
      shrimp.y = WOK.cy() + (dy / d) * (WOK.radius() - shrimp.radius);
    }
    // Air oil drain (costs more than before)
    if (oilLevel > 0) { oilLevel -= CFG.OIL_DRAIN_BASE * CFG.OIL_DRAIN_AIR_MULT * dt; burnMeter = Math.max(0, burnMeter - CFG.BURN_RATE_COOL * dt); }
    else { burnMeter += CFG.BURN_RATE_GROWTH * dt; }

    if (shrimp.airTime <= 0) { shrimp.airborne = false; shrimp.scale = 1; for (let i = 0; i < 8; i++) spawnParticle(shrimp.x, shrimp.y, '#ffd700', 6, 4); }
  }

  oilLevel = Math.max(0, Math.min(CFG.OIL_MAX, oilLevel));
  burnMeter = Math.max(0, Math.min(CFG.BURN_MAX, burnMeter));
  if (burnMeter >= CFG.BURN_MAX) { triggerGameOver(); return; }
  } // end S1/S2 shrimp physics guard

  // ─── Collectibles (S1/S2 only) ───
  if (stage !== STAGE.S3) {
    for (let i = oilItems.length - 1; i >= 0; i--) {
      const m = oilItems[i];
      if (m.collected) continue;

      m.age = (m.age || 0) + dt;
      if (m.age > 5.0) {
        for (let j = 0; j < 3; j++) spawnParticle(m.x, m.y, '#ffaa00', 2, 2);
        oilItems.splice(i, 1);
        continue;
      }

      const hitR = (shrimp.radius * shrimp.scale) + m.radius;
      if (shrimp.airborne && dist(shrimp.x, shrimp.y, m.x, m.y) < hitR) {
        m.collected = true;
        oilLevel = Math.min(CFG.OIL_MAX, oilLevel + CFG.OIL_REFILL);
        playSound('collect');
        spawnPopup(m.x, m.y, '+OIL', '#ffd700');
        for (let j = 0; j < 10; j++) spawnParticle(m.x, m.y, '#ffd700', 7, 4);
        oilItems.splice(i, 1);
      }
    }

    if (stage === STAGE.S1) {
      for (let i = msgItems.length - 1; i >= 0; i--) {
        const m = msgItems[i];
        if (m.collected) continue;
        const hitR = (shrimp.radius * shrimp.scale) + m.radius;
        if (shrimp.airborne && dist(shrimp.x, shrimp.y, m.x, m.y) < hitR) {
          m.collected = true;
          msgCollected++;
          totalMsgCollected++;
          playSound('collect');
          addShake(5);
          spawnPopup(m.x, m.y, `MSG ${msgCollected}/${CFG.MSG_TO_WIN}`, '#ffffff');
          for (let j = 0; j < 15; j++) spawnParticle(m.x, m.y, '#ffffff', 8, 5);
          msgItems.splice(i, 1);
          if (msgCollected >= CFG.MSG_TO_WIN) { triggerFinalMsgDive(); return; }
          if (msgCollected === CFG.MSG_TO_WIN - 1) { announce('ONE MORE!', 'One MSG to transform!'); }
        }
      }
    }
  } // end S1/S2 collectibles guard

  // ─── Obstacle & spawn (S1/S2 only — S3 uses wave system) ───
  if (stage !== STAGE.S3) {
    const isS2 = stage === STAGE.S2;
    spatulaTimer -= dt; pepperTimer -= dt; oilpopTimer -= dt;
    if (spatulaTimer <= 0) { spawnSpatula(); spatulaTimer = randRange(isS2 ? CFG.S2_SPATULA_MIN : CFG.SPATULA_INTERVAL_MIN, isS2 ? CFG.S2_SPATULA_MAX : CFG.SPATULA_INTERVAL_MAX); }
    if (pepperTimer <= 0) { spawnPepper(); pepperTimer = randRange(isS2 ? CFG.S2_PEPPER_MIN : CFG.PEPPER_INTERVAL_MIN, isS2 ? CFG.S2_PEPPER_MAX : CFG.PEPPER_INTERVAL_MAX); }
    if (oilpopTimer <= 0) { spawnOilPop(); oilpopTimer = randRange(isS2 ? CFG.S2_OILPOP_MIN : CFG.OILPOP_INTERVAL_MIN, isS2 ? CFG.S2_OILPOP_MAX : CFG.OILPOP_INTERVAL_MAX); }

    oilSpawnTimer += dt;
    if (oilSpawnTimer >= CFG.OIL_SPAWN_INTERVAL) { oilSpawnTimer = 0; if (oilItems.filter(m => !m.collected).length < CFG.OIL_MAX_ON_SCREEN) spawnOil(); }
    if (stage === STAGE.S1) {
      msgSpawnTimer += dt;
      if (msgSpawnTimer >= CFG.MSG_SPAWN_INTERVAL) { msgSpawnTimer = 0; if (msgItems.filter(m => !m.collected).length < CFG.MSG_MAX_ON_SCREEN) spawnMSG(); }
    }

    updateObstacles(dt);
  } // end S1/S2 obstacle & spawn guard

  if (stage === STAGE.S2) updateChef(dt);

  // Stage 3: Wave Defense
  if (stage === STAGE.S3) {
    updateS3(dt);
  }

  // Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.x += p.vx; p.y += p.vy; p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Screen shake decay
  if (screenShake.intensity > 0) {
    screenShake.x = (Math.random() - .5) * screenShake.intensity;
    screenShake.y = (Math.random() - .5) * screenShake.intensity;
    screenShake.intensity *= 0.85;
    if (screenShake.intensity < 0.5) screenShake.intensity = 0;
  }
  if (screenFlash > 0) screenFlash -= rawDt * 3;

  updateHUD();
  updateSensorDebug();

  // Route to correct draw function
  if (stage === STAGE.S3) {
    drawS3();
  } else {
    draw();
  }

  // Tilt feedback overlay (bottom-left)
  drawMiniCtrl();
}

/* ═══ HUD ═══ */
function updateHUD() {
  if (stage === STAGE.S1) {
    $('hud-left-label').textContent = 'MSG';
    $('hud-left-value').textContent = `${msgCollected} / ${CFG.MSG_TO_WIN}`;
  } else if (stage === STAGE.S2) {
    $('hud-left-label').textContent = 'CHEF HP';
    $('hud-left-value').textContent = `${Math.ceil(chef.hp)} / ${CFG.CHEF_MAX_HP}`;
    $('chef-bar').style.width = `${(chef.hp / CFG.CHEF_MAX_HP) * 100}%`;
  }
  $('hud-time').textContent = fmtTime(gameTime);

  const oilBar = $('oil-bar'), oilLabel = $('oil-label');
  if (oilLevel > 0) {
    const maxOil = CFG.OIL_MAX + getUpgradeBonus('oilCapacity');
    oilBar.style.width = `${Math.min(100, (oilLevel / maxOil) * 100)}%`;
    oilBar.style.background = oilLevel > 60 ? '#44ff44' : oilLevel > 25 ? '#ffd700' : '#ff4444';
    oilBar.style.boxShadow = '0 0 10px currentColor';
    oilLabel.textContent = 'OIL LEVEL';
    oilLabel.classList.remove('is-burning');
    document.body.classList.remove('burn-pulse');
  } else {
    oilBar.style.width = `${(burnMeter / CFG.BURN_MAX) * 100}%`;
    oilBar.style.background = 'repeating-linear-gradient(45deg,#f00,#f00 10px,#c00 10px,#c00 20px)';
    oilBar.style.boxShadow = '0 0 15px #f00';
    oilLabel.textContent = 'BURNING!';
    oilLabel.classList.add('is-burning');
    document.body.classList.add('burn-pulse');
  }
}

/* ═══ RENDERING ═══ */
/* ═══ MINI CONTROLLER — tilt feedback (bottom-left) ═══ */
function drawMiniCtrl() {
  const mc = $('mini-ctrl-canvas');
  if (!mc || mc.style.display === 'none') return;
  const mctx = mc.getContext('2d');
  const w = mc.width, h = mc.height;
  const cx = w / 2, cy = h / 2, r = w / 2 - 4;

  mctx.clearRect(0, 0, w, h);

  // Wok outline
  mctx.beginPath();
  mctx.arc(cx, cy, r, 0, Math.PI * 2);
  mctx.strokeStyle = 'rgba(255,255,255,0.15)';
  mctx.lineWidth = 1.5;
  mctx.stroke();

  // Crosshair
  mctx.strokeStyle = 'rgba(255,255,255,0.06)';
  mctx.lineWidth = 0.5;
  mctx.beginPath(); mctx.moveTo(cx - r, cy); mctx.lineTo(cx + r, cy); mctx.stroke();
  mctx.beginPath(); mctx.moveTo(cx, cy - r); mctx.lineTo(cx, cy + r); mctx.stroke();

  // Tilt dot — normalize tiltX/tiltY to the circle radius
  // tiltX/tiltY are roughly -1 to 1 based on calibration, clamp to circle
  const maxTilt = 0.8; // how far tilt can go before hitting edge
  const dotX = cx + Math.max(-1, Math.min(1, tiltX / maxTilt)) * r * 0.85;
  const dotY = cy + Math.max(-1, Math.min(1, tiltY / maxTilt)) * r * 0.85;

  // Glow
  mctx.beginPath();
  mctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
  mctx.fillStyle = 'rgba(247,201,72,0.25)';
  mctx.fill();

  // Dot
  mctx.beginPath();
  mctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
  mctx.fillStyle = '#f7c948';
  mctx.fill();
}

function draw() {
  const cx = WOK.cx(), cy = WOK.cy(), r = WOK.radius();
  ctx.fillStyle = '#0a0a10';
  ctx.fillRect(0, 0, WOK.size, WOK.size);
  ctx.save();
  ctx.translate(screenShake.x, screenShake.y);

  // Wok body
  const wokGrad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
  wokGrad.addColorStop(0, '#3e3e4a'); wokGrad.addColorStop(0.5, '#2a2a30'); wokGrad.addColorStop(1, '#15151a');
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = wokGrad; ctx.fill();

  // Metal texture
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
  for (let i = 0; i < r; i += 8) { ctx.beginPath(); ctx.arc(cx, cy, i, 0, Math.PI * 2); ctx.stroke(); }

  // Heat zone
  const heatIntensity = 0.15 + ((CFG.OIL_MAX - oilLevel) / CFG.OIL_MAX) * 0.4;
  const heatGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, WOK.innerRadius() * 2);
  heatGrad.addColorStop(0, `rgba(255,80,40,${heatIntensity})`); heatGrad.addColorStop(1, 'rgba(255,60,20,0)');
  ctx.globalCompositeOperation = 'screen';
  ctx.beginPath(); ctx.arc(cx, cy, WOK.innerRadius() * 2, 0, Math.PI * 2); ctx.fillStyle = heatGrad; ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  // Oil sheen
  const sx = cx - tiltX * 20, sy = cy - tiltY * 20;
  const sheenGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 0.6);
  sheenGrad.addColorStop(0, 'rgba(255,255,255,0.06)'); sheenGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = sheenGrad; ctx.fill();

  drawObstacles();

  // Oil drops
  for (const m of oilItems) {
    if (m.collected) continue;
    const bob = Math.sin(gameTime * 3 + m.bob) * 4;
    const breathe = 1 + 0.06 * Math.sin(gameTime * 2.8 + m.bob);
    ctx.save();
    ctx.translate(m.x, m.y + bob);
    ctx.scale(breathe, breathe);
    ctx.shadowBlur = 15; ctx.shadowColor = '#ffd700';
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath(); ctx.arc(0, 0, m.radius * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-m.radius * 0.15, -m.radius * 0.2, m.radius * 0.12, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // MSG crystals
  for (const m of msgItems) {
    if (m.collected) continue;
    const bob = Math.sin(gameTime * 3.5 + m.bob) * 3;
    // Proximity glow: pulse when shrimp is close but not yet airborne (near-miss feel)
    const mDist = dist(shrimp.x, shrimp.y, m.x, m.y);
    const proximityRange = m.radius * 5;
    if (mDist < proximityRange && !shrimp.airborne) {
      const proximity = 1 - mDist / proximityRange;
      const glowPulse = 0.5 + 0.5 * Math.sin(gameTime * 12);
      ctx.save();
      ctx.globalAlpha = proximity * glowPulse * 0.5;
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(m.x, m.y + bob, m.radius * 2.2, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    const breathe = 1 + 0.07 * Math.sin(gameTime * 2.5 + m.bob);
    ctx.save(); ctx.translate(m.x, m.y + bob); ctx.rotate(gameTime * 2 + m.bob); ctx.scale(breathe, breathe);
    const shadowSize = (mDist < proximityRange && !shrimp.airborne) ? 30 : 20;
    ctx.shadowBlur = shadowSize; ctx.shadowColor = '#ffffff';
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.moveTo(0, -m.radius); ctx.lineTo(m.radius * 0.6, 0); ctx.lineTo(0, m.radius); ctx.lineTo(-m.radius * 0.6, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(200,220,255,0.6)';
    ctx.beginPath(); ctx.moveTo(0, -m.radius * 0.5); ctx.lineTo(m.radius * 0.3, 0); ctx.lineTo(0, m.radius * 0.5); ctx.lineTo(-m.radius * 0.3, 0); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '10px Outfit'; ctx.textAlign = 'center';
    ctx.fillText('MSG', m.x, m.y + bob + m.radius + 12);
    if (Math.random() > 0.92) spawnParticle(m.x + (Math.random() - .5) * 20, m.y + bob + (Math.random() - .5) * 20, '#fff', 1, 2);
  }

  // Chef hand
  if (stage === STAGE.S2 && chef.active) drawChefHand();

  // Particles
  for (const p of particles) {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawShrimp();
  ctx.restore();

  // Screen flash
  if (screenFlash > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.max(0, screenFlash)})`; ctx.fillRect(0, 0, WOK.size, WOK.size); }
  // Hit vignette
  if (hitFlash > 0) {
    const vigGrad = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
    vigGrad.addColorStop(0, 'rgba(255,0,0,0)'); vigGrad.addColorStop(1, `rgba(255,0,0,${hitFlash})`);
    ctx.fillStyle = vigGrad; ctx.fillRect(0, 0, WOK.size, WOK.size);
    hitFlash -= 0.02;
  }
}

function drawObstacles() {
  const cx = WOK.cx(), cy = WOK.cy(), r = WOK.radius();
  for (const o of obstacles) {
    switch (o.type) {
      case 'spatula': {
        if (!o.active) {
          const alpha = (Math.sin(o.timer * 8) + 1) / 2 * 0.4;
          ctx.strokeStyle = `rgba(255,100,100,${alpha})`; ctx.lineWidth = 2; ctx.setLineDash([8, 4]);
          ctx.beginPath(); ctx.arc(cx, cy, r * 0.5, o.angle, o.angle + Math.PI); ctx.stroke(); ctx.setLineDash([]);
          ctx.strokeStyle = `rgba(255,50,50,${alpha})`; ctx.lineWidth = 3;
          const sx = cx + Math.cos(o.angle) * 20, sy = cy + Math.sin(o.angle) * 20;
          const ex = cx + Math.cos(o.angle) * r * 0.9, ey = cy + Math.sin(o.angle) * r * 0.9;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
        } else {
          const sweepAngle = o.angle + o.progress * Math.PI;
          const ex = cx + Math.cos(sweepAngle) * r * 0.92, ey = cy + Math.sin(sweepAngle) * r * 0.92;
          ctx.strokeStyle = 'rgba(255,68,68,0.25)'; ctx.lineWidth = 24;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
          ctx.strokeStyle = '#bbb'; ctx.lineWidth = 6; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
          ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.arc(ex, ey, 8, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }
      case 'pepper': {
        if (o.phase === 'warning') {
          const prog = o.timer / o.warningDur;
          const pulse = Math.sin(o.timer * 12) * 0.3 + 0.5;
          ctx.strokeStyle = `rgba(255,0,0,${pulse})`; ctx.lineWidth = 2; ctx.setLineDash([6, 3]);
          ctx.beginPath(); ctx.arc(o.x, o.y, o.maxRadius * prog, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
          ctx.strokeStyle = `rgba(255,0,0,${pulse * 0.7})`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(o.x - 6, o.y); ctx.lineTo(o.x + 6, o.y); ctx.moveTo(o.x, o.y - 6); ctx.lineTo(o.x, o.y + 6); ctx.stroke();
        } else {
          const fade = 1 - (o.timer / o.activeDur);
          ctx.fillStyle = `rgba(200,30,30,${fade * 0.35})`;
          ctx.beginPath(); ctx.arc(o.x, o.y, o.maxRadius, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `rgba(255,80,40,${fade})`;
          for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 + o.timer * 3, d = o.maxRadius * 0.5;
            ctx.beginPath(); ctx.arc(o.x + Math.cos(a) * d, o.y + Math.sin(a) * d, 3, 0, Math.PI * 2); ctx.fill();
          }
        }
        break;
      }
      case 'oilpop': {
        if (o.phase === 'bubble') {
          const bub = (o.timer / o.bubbleDur) * 8;
          ctx.fillStyle = 'rgba(255,200,50,0.5)';
          ctx.beginPath(); ctx.arc(o.x, o.y, bub, 0, Math.PI * 2); ctx.fill();
        } else {
          const prog = o.timer / o.popDur, rad = prog * o.maxRadius, fade = 1 - prog;
          ctx.strokeStyle = `rgba(255,180,50,${fade})`; ctx.lineWidth = 3 * fade;
          ctx.beginPath(); ctx.arc(o.x, o.y, rad, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = `rgba(255,220,100,${fade * 0.25})`;
          ctx.beginPath(); ctx.arc(o.x, o.y, rad * 0.6, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }
    }
  }
}

function drawChefHand() {
  const cx = WOK.cx(), cy = WOK.cy();
  const rimDist = WOK.radius() + 30;
  const elbowX = cx + Math.cos(chef.angle) * (rimDist + 25);
  const elbowY = cy + Math.sin(chef.angle) * (rimDist + 25);
  const hx = chef.handX, hy = chef.handY;

  // Arm (chef sleeve — white)
  ctx.strokeStyle = '#eee'; ctx.lineWidth = 24; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(elbowX, elbowY); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.strokeStyle = '#ddd'; ctx.lineWidth = 18;
  ctx.beginPath(); ctx.moveTo(elbowX, elbowY); ctx.lineTo(hx, hy); ctx.stroke();

  // Hand
  const hpRatio = chef.hp / CFG.CHEF_MAX_HP;
  const skin = `rgb(${232 - (1 - hpRatio) * 80},${184 - (1 - hpRatio) * 80},${152 - (1 - hpRatio) * 60})`;
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.arc(hx, hy, 15, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(hx, hy, 15, 0, Math.PI * 2); ctx.stroke();

  // Chopsticks
  const chopAngle = chef.angle - Math.PI;
  for (let i = -1; i <= 1; i += 2) {
    const ca = chopAngle + i * 0.15;
    ctx.strokeStyle = '#c4955a'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(ca) * 35, hy + Math.sin(ca) * 35); ctx.stroke();
  }

  // Swat zone (when holding)
  if (chef.state === 'holding') {
    const pulse = Math.sin(gameTime * 8) * 0.2 + 0.7;
    ctx.strokeStyle = `rgba(255,50,50,${pulse * 0.5})`; ctx.lineWidth = 3; ctx.setLineDash([8, 4]);
    ctx.beginPath(); ctx.arc(hx, hy, 40, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = `rgba(255,100,100,${pulse})`;
    ctx.font = 'bold 12px Outfit'; ctx.textAlign = 'center';
    ctx.fillText('SHAKE!', hx, hy - 50);
  }

  // Damage blink
  if (chef.invuln > 0 && Math.sin(chef.invuln * 30) > 0) {
    ctx.fillStyle = 'rgba(255,50,50,0.5)';
    ctx.beginPath(); ctx.arc(hx, hy, 20, 0, Math.PI * 2); ctx.fill();
  }
}

function drawShrimp() {
  const x = shrimp.x, y = shrimp.y;
  ctx.save(); ctx.translate(x, y); ctx.scale(shrimp.scale, shrimp.scale);
  if (!shrimp.airborne) ctx.rotate(shrimp.angle);

  // MSG Aura (Stage 2)
  if (stage === STAGE.S2) {
    ctx.save(); ctx.globalAlpha = 0.25 + Math.sin(gameTime * 5) * 0.1;
    const auraGrad = ctx.createRadialGradient(0, 0, shrimp.radius, 0, 0, shrimp.radius * 2.8);
    auraGrad.addColorStop(0, 'rgba(255,215,0,0.4)'); auraGrad.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath(); ctx.arc(0, 0, shrimp.radius * 2.8, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1; ctx.restore();
  }

  // Shadow (airborne)
  if (shrimp.airborne) {
    ctx.save(); ctx.translate(8, 16); ctx.scale(1, 0.5);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.arc(0, 0, shrimp.radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }

  // Dynamic color
  const burnTint = burnMeter / CFG.BURN_MAX;
  const isS2 = stage === STAGE.S2;
  const rr = isS2 ? 255 : Math.min(255, 255 * (0.8 + burnTint * 0.4));
  const gg = isS2 ? 180 : Math.max(50, 140 * (1 - burnTint));
  const bb = isS2 ? 80 : Math.max(50, 100 * (1 - burnTint));
  const bodyColor = `rgb(${rr},${gg},${bb})`;

  // Overhead stamina/oil bar (Classmate suggestion)
  if (stage === STAGE.S1 || stage === STAGE.S2) {
    ctx.save();
    ctx.translate(0, -shrimp.radius * 2.5); // Position above the shrimp
    const barW = 28, barH = 4;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(-barW/2 - 1, -barH/2 - 1, barW + 2, barH + 2);
    const fillRat = oilLevel / (CFG.OIL_MAX + getUpgradeBonus('oilCapacity'));
    ctx.fillStyle = fillRat > 0.6 ? '#44ff44' : fillRat > 0.25 ? '#ffd700' : '#ff4444';
    ctx.fillRect(-barW/2, -barH/2, barW * Math.min(1, Math.max(0, fillRat)), barH);
    ctx.restore();
  }

  // Body segments
  for (let i = 0; i < 5; i++) {
    const offset = Math.sin(gameTime * 20 + i) * (shrimp.airborne ? 2 : shrimp.wobble * 10);
    const sz = shrimp.radius * (1 - i * 0.15);
    ctx.fillStyle = bodyColor;
    ctx.beginPath(); ctx.arc(-i * 6, offset, sz, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2; ctx.stroke();
  }

  // Eyes
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(4, -4, 3, 0, Math.PI * 2); ctx.arc(4, 4, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(5, -5, 1, 0, Math.PI * 2); ctx.arc(5, 3, 1, 0, Math.PI * 2); ctx.fill();

  // Hit flash
  if (hitCooldown > CFG.HIT_INVULN_TIME - 0.15) {
    ctx.fillStyle = 'rgba(255,0,0,0.3)';
    ctx.beginPath(); ctx.arc(0, 0, shrimp.radius * 1.2, 0, Math.PI * 2); ctx.fill();
  }

  // Burn smoke
  if (burnTint > 0.5 && Math.random() > 0.7) spawnParticle(x, y, '#555', 2, 4);

  ctx.restore();
}

/* ═══ STAGE 3: WAVE DEFENSE — "The Shrimp Fried the Rice" ═══ */
// Same circular wok. Shrimp wears a chef hat. Multiple human hands
// reach in from the rim to steal ingredients. Tilt to dodge, toss to
// jump, shake hard to swat hands away. Survive 3 escalating waves.

function startS3Wave() {
  s3.wave++;
  s3.inBreak = false;
  const idx = Math.min(s3.wave - 1, CFG.S3_HANDS_PER_WAVE.length - 1);
  s3.handsToSpawn = CFG.S3_HANDS_PER_WAVE[idx];
  s3.handSpawnTimer = 0.5;
  announce(`WAVE ${s3.wave}`, `${s3.handsToSpawn} hands incoming!`);
}

function attemptS3Swat() {
  // Swat ALL hands currently in reaching/holding state
  let hit = false;
  for (const h of s3.hands) {
    if ((h.state === 'reaching' || h.state === 'holding') && h.invuln <= 0) {
      h.hp -= CFG.SWAT_DAMAGE;
      h.invuln = 0.3;
      if (h.hp <= 0) {
        h.state = 'swatted';
        h.stateTimer = 0.3;
        s3.handsSwatted++;
        // Reward: recover some oil per swat (keeps economy survivable)
        const oilReward = 8;
        oilLevel = Math.min(CFG.OIL_MAX + getUpgradeBonus('oilCapacity'), oilLevel + oilReward);
        spawnPopup(h.handX, h.handY, 'SWAT! +' + oilReward + ' OIL', '#ff4444');
        for (let j = 0; j < 15; j++) spawnParticle(h.handX, h.handY, '#ff6666', 10, 4);
      } else {
        spawnPopup(h.handX, h.handY, 'HIT!', '#ffaa44');
        for (let j = 0; j < 8; j++) spawnParticle(h.handX, h.handY, '#ffaa44', 6, 3);
      }
      hit = true;
    }
  }
  if (hit) {
    addShake(20);
    screenFlash = 0.3;
    playSound('slap');
    if (navigator.vibrate) navigator.vibrate(CFG.HAPTIC_SWAT);
    timeScale = CFG.SLOWMO_SCALE;
    setTimeout(() => { timeScale = 1; }, CFG.SLOWMO_DURATION_MS);
  }
}

function updateS3(dt) {
  // ── Shrimp physics (same wok, same controls + speed upgrade) ──
  const speedMul = 1 + getUpgradeBonus('speedBoost');
  if (!shrimp.airborne) {
    currentDrag = 0.75 + (0.13 * (oilLevel / CFG.OIL_MAX));
    shrimp.vx += tiltX * CFG.GRAVITY * speedMul * 60 * dt;
    shrimp.vy += tiltY * CFG.GRAVITY * speedMul * 60 * dt;
    if (Math.abs(shrimp.vx) > 0.1 || Math.abs(shrimp.vy) > 0.1) shrimp.angle = Math.atan2(shrimp.vy, shrimp.vx);
    const speed = Math.sqrt(shrimp.vx ** 2 + shrimp.vy ** 2);
    shrimp.wobble = Math.sin(gameTime * 15) * Math.min(speed * 0.1, 0.5);
    shrimp.vx *= currentDrag; shrimp.vy *= currentDrag;
    shrimp.x += shrimp.vx; shrimp.y += shrimp.vy;

    const dx = shrimp.x - WOK.cx(), dy = shrimp.y - WOK.cy();
    const d = Math.sqrt(dx * dx + dy * dy);
    const maxD = WOK.radius() - shrimp.radius;
    if (d > maxD) {
      const nx = dx / d, ny = dy / d;
      shrimp.x = WOK.cx() + nx * maxD; shrimp.y = WOK.cy() + ny * maxD;
      const dot = shrimp.vx * nx + shrimp.vy * ny;
      shrimp.vx -= 2 * dot * nx * (1 - CFG.BOUNCE);
      shrimp.vy -= 2 * dot * ny * (1 - CFG.BOUNCE);
    }
  } else {
    shrimp.airTime -= dt;
    const prog = 1 - (shrimp.airTime / CFG.AIR_DURATION);
    shrimp.scale = 1 + Math.sin(prog * Math.PI) * 1.5;
    shrimp.vx *= 0.96; // mostly locked but tiny drift gives arc feel
    shrimp.vx += tiltX * 0.35; // very light tilt influence during flight
    shrimp.vy *= 0.96;
    shrimp.x += shrimp.vx; shrimp.y += shrimp.vy;
    const dx = shrimp.x - WOK.cx(), dy = shrimp.y - WOK.cy(), d = Math.sqrt(dx * dx + dy * dy);
    if (d > WOK.radius() - shrimp.radius) {
      shrimp.x = WOK.cx() + (dx / d) * (WOK.radius() - shrimp.radius);
      shrimp.y = WOK.cy() + (dy / d) * (WOK.radius() - shrimp.radius);
    }

    // Airborne ram: damage any hand the shrimp touches
    for (const h of s3.hands) {
      if ((h.state === 'reaching' || h.state === 'holding') && h.invuln <= 0) {
        if (dist(shrimp.x, shrimp.y, h.handX, h.handY) < shrimp.radius * shrimp.scale + 18) {
          h.hp -= CFG.RAM_DAMAGE;
          h.invuln = 0.4;
          if (h.hp <= 0) {
            h.state = 'swatted'; h.stateTimer = 0.3; s3.handsSwatted++;
            spawnPopup(h.handX, h.handY, 'RAM!', '#ffd700');
          } else {
            spawnPopup(h.handX, h.handY, 'HIT', '#ffaa44');
          }
          for (let j = 0; j < 10; j++) spawnParticle(h.handX, h.handY, '#ffd700', 8, 4);
          addShake(8); playSound('hit');
        }
      }
    }

    if (shrimp.airTime <= 0) { shrimp.airborne = false; shrimp.scale = 1; for (let i = 0; i < 8; i++) spawnParticle(shrimp.x, shrimp.y, '#ffd700', 6, 4); }
  }

  // ── Oil drain (gentle — you're the chef now) ──
  const burnResist = getUpgradeBonus('tempResist');
  if (oilLevel > 0) {
    oilLevel -= CFG.OIL_DRAIN_BASE * CFG.S3_OIL_DRAIN_MULT * dt;
    burnMeter = Math.max(0, burnMeter - (CFG.BURN_RATE_COOL + burnResist) * dt);
  } else {
    burnMeter += Math.max(5, CFG.BURN_RATE_GROWTH - burnResist) * dt;
  }
  oilLevel = Math.max(0, Math.min(CFG.OIL_MAX + getUpgradeBonus('oilCapacity'), oilLevel));
  burnMeter = Math.max(0, Math.min(CFG.BURN_MAX, burnMeter));
  if (burnMeter >= CFG.BURN_MAX) { triggerGameOver(); return; }

  // ── Wave break ──
  if (s3.inBreak) {
    s3.waveBreakTimer -= dt;
    // Slowly refill oil during break
    oilLevel = Math.min(CFG.OIL_MAX + getUpgradeBonus('oilCapacity'), oilLevel + 10 * dt);
    if (s3.waveBreakTimer <= 0) startS3Wave();
    $('hud-left-label').textContent = 'WAVE';
    $('hud-left-value').textContent = `${s3.wave} / ${CFG.S3_WAVES}`;
    return;
  }

  // ── Spawn hands ──
  s3.handSpawnTimer -= dt;
  if (s3.handsToSpawn > 0 && s3.handSpawnTimer <= 0) {
    spawnS3Hand();
    s3.handsToSpawn--;
    s3.handSpawnTimer = randRange(CFG.S3_HAND_IDLE_MIN, CFG.S3_HAND_IDLE_MAX);
  }

  // ── Update each hand ──
  const cx = WOK.cx(), cy = WOK.cy(), r = WOK.radius();
  for (let i = s3.hands.length - 1; i >= 0; i--) {
    const h = s3.hands[i];
    h.invuln = Math.max(0, h.invuln - dt);
    h.stateTimer -= dt;

    const edgeX = cx + Math.cos(h.angle) * (r + 30);
    const edgeY = cy + Math.sin(h.angle) * (r + 30);
    const targetX = cx + Math.cos(h.angle) * r * 0.15;
    const targetY = cy + Math.sin(h.angle) * r * 0.15;

    switch (h.state) {
      case 'reaching':
        h.reachProgress = Math.min(1, h.reachProgress + dt / h.reachTime);
        if (h.reachProgress >= 1) { h.state = 'holding'; h.stateTimer = h.holdTime; }
        break;
      case 'holding':
        if (h.stateTimer <= 0) {
          h.state = 'retreating'; h.stateTimer = 0.5;
          oilLevel -= CFG.S3_HAND_STEAL;
          const avail = s3.ingredients.filter(ing => !ing.stolen);
          if (avail.length > 0) avail[Math.floor(Math.random() * avail.length)].stolen = true;
          addShake(8); playSound('hit');
          spawnPopup(h.handX, h.handY, `−${CFG.S3_HAND_STEAL} OIL!`, '#ff4444');
        }
        break;
      case 'retreating':
        h.reachProgress = Math.max(0, h.reachProgress - dt / 0.5);
        if (h.reachProgress <= 0) { s3.hands.splice(i, 1); continue; }
        break;
      case 'swatted':
        h.reachProgress = Math.max(0, h.reachProgress - dt / 0.3);
        if (h.reachProgress <= 0) { s3.hands.splice(i, 1); continue; }
        break;
    }

    h.handX = lerp(edgeX, targetX, h.reachProgress);
    h.handY = lerp(edgeY, targetY, h.reachProgress);

    // Hand pushes shrimp on contact
    if (h.state === 'holding' && !shrimp.airborne) {
      const d = dist(shrimp.x, shrimp.y, h.handX, h.handY);
      if (d < shrimp.radius + 20 && hitCooldown <= 0) {
        hitCooldown = CFG.HIT_INVULN_TIME;
        oilLevel -= 5;
        const pushA = Math.atan2(shrimp.y - h.handY, shrimp.x - h.handX);
        shrimp.vx += Math.cos(pushA) * 8;
        shrimp.vy += Math.sin(pushA) * 8;
        addShake(5); playSound('hit');
      }
    }
  }

  // ── Wave complete check ──
  if (s3.handsToSpawn <= 0 && s3.hands.length === 0) {
    if (s3.wave >= CFG.S3_WAVES) { triggerVictory(); return; }
    s3.inBreak = true;
    s3.waveBreakTimer = CFG.S3_WAVE_BREAK;
    announce('WAVE CLEAR!', `Next wave in ${CFG.S3_WAVE_BREAK}s`);
    playSound('ding');
  }

  // ── HUD ──
  $('hud-left-label').textContent = 'WAVE';
  $('hud-left-value').textContent = `${s3.wave} / ${CFG.S3_WAVES}`;
}

/* ═══ STAGE 3 DRAW ═══ */
function drawS3() {
  const cx = WOK.cx(), cy = WOK.cy(), r = WOK.radius();

  // Clear full canvas (prevent stale pixel artifacts outside the wok)
  ctx.fillStyle = '#0a0a10';
  ctx.fillRect(0, 0, WOK.size, WOK.size);

  ctx.save();
  ctx.translate(screenShake.x, screenShake.y);

  // Wok base
  const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  grad.addColorStop(0, '#2a2520');
  grad.addColorStop(0.6, '#1a1512');
  grad.addColorStop(1, '#0d0a08');
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grad; ctx.fill();

  // Wok rim
  ctx.strokeStyle = '#555'; ctx.lineWidth = 4; ctx.stroke();

  // Oil sheen
  if (oilLevel > 0) {
    const sheenA = Math.min(0.25, oilLevel / CFG.OIL_MAX * 0.3);
    const sheen = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r);
    sheen.addColorStop(0, `rgba(255,215,0,${sheenA})`);
    sheen.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.95, 0, Math.PI * 2);
    ctx.fillStyle = sheen; ctx.fill();
  }

  // Ingredients scattered in the wok
  for (const ing of s3.ingredients) {
    if (ing.stolen) continue;
    const bob = Math.sin(gameTime * 2 + ing.x * 0.1) * 2;
    ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(ing.type, ing.x, ing.y + bob);
  }

  // Hands
  for (const h of s3.hands) drawS3Hand(h);

  // Shrimp with chef hat
  drawS3Shrimp(shrimp.x, shrimp.y);

  // Particles
  for (const p of particles) {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Wave break overlay
  if (s3.inBreak) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f7c948'; ctx.font = 'bold 22px Outfit'; ctx.textAlign = 'center';
    ctx.fillText(`NEXT WAVE IN ${Math.ceil(s3.waveBreakTimer)}`, cx, cy);
    ctx.font = '13px Outfit'; ctx.fillStyle = '#aaa';
    ctx.fillText('Restoring oil…', cx, cy + 24);
  }

  // Wave counter on canvas
  ctx.fillStyle = '#f7c948'; ctx.font = 'bold 15px Outfit'; ctx.textAlign = 'center';
  ctx.fillText(`Wave ${s3.wave} / ${CFG.S3_WAVES}`, cx, cy - r + 22);

  const active = s3.hands.filter(h => h.state !== 'swatted' && h.state !== 'retreating').length;
  const remaining = active + s3.handsToSpawn;
  if (remaining > 0 && !s3.inBreak) {
    ctx.fillStyle = '#ff6666'; ctx.font = '12px Outfit';
    ctx.fillText(`${remaining} hand${remaining > 1 ? 's' : ''} remaining`, cx, cy - r + 40);
  }

  ctx.restore();

  // Screen flash
  if (screenFlash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.max(0, screenFlash)})`;
    ctx.fillRect(0, 0, WOK.size, WOK.size);
  }
}

function drawS3Hand(h) {
  const cx = WOK.cx(), cy = WOK.cy(), r = WOK.radius();
  const edgeX = cx + Math.cos(h.angle) * (r + 30);
  const edgeY = cy + Math.sin(h.angle) * (r + 30);

  ctx.save();
  // Arm
  ctx.strokeStyle = h.state === 'swatted' ? '#ff4444' : '#e8c9a0';
  ctx.lineWidth = h.state === 'holding' ? 14 : 10;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(edgeX, edgeY); ctx.lineTo(h.handX, h.handY); ctx.stroke();

  // Wrist
  ctx.strokeStyle = h.state === 'swatted' ? '#cc3333' : '#d4a574';
  ctx.lineWidth = 8;
  const wristX = lerp(edgeX, h.handX, 0.7), wristY = lerp(edgeY, h.handY, 0.7);
  ctx.beginPath(); ctx.moveTo(wristX, wristY); ctx.lineTo(h.handX, h.handY); ctx.stroke();

  // Hand blob
  ctx.fillStyle = h.state === 'swatted' ? '#ff6666' : (h.state === 'holding' ? '#ffddbb' : '#e8c9a0');
  ctx.beginPath(); ctx.arc(h.handX, h.handY, h.state === 'holding' ? 18 : 14, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1; ctx.stroke();

  // Grabbing fingers
  if (h.state === 'holding') {
    for (let f = 0; f < 4; f++) {
      const fa = h.angle + Math.PI + (f - 1.5) * 0.3;
      ctx.fillStyle = '#e8c9a0';
      ctx.beginPath(); ctx.arc(h.handX + Math.cos(fa) * 16, h.handY + Math.sin(fa) * 16, 5, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Telegraph warning
  if (h.state === 'reaching' && h.reachProgress < 0.5) {
    ctx.strokeStyle = `rgba(255,100,100,${0.5 - h.reachProgress})`;
    ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
    const tX = cx + Math.cos(h.angle) * r * 0.15, tY = cy + Math.sin(h.angle) * r * 0.15;
    ctx.beginPath(); ctx.arc(tX, tY, 25, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }

  // Invuln flash
  if (h.invuln > 0 && Math.floor(h.invuln * 10) % 2) {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.arc(h.handX, h.handY, 20, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawS3Shrimp(x, y) {
  ctx.save();
  ctx.translate(x, y);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, shrimp.radius * 0.6, shrimp.radius * 1.2, shrimp.radius * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  const s = shrimp.scale || 1;
  ctx.scale(s, s);
  ctx.rotate(shrimp.angle + Math.PI / 2);

  // Chef hat (big, white)
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(0, -shrimp.radius * 1.6, shrimp.radius * 0.85, shrimp.radius * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-shrimp.radius * 0.6, -shrimp.radius * 1.6, shrimp.radius * 1.2, shrimp.radius * 0.35);

  // Shrimp body (golden MSG-powered segments)
  for (let i = 0; i < 4; i++) {
    const rr = shrimp.radius * (1 - i * 0.15);
    const off = Math.sin(gameTime * 10 + i * 0.8) * 1.5;
    ctx.fillStyle = `rgb(${255 - i * 12}, ${180 - i * 15}, ${80 + i * 8})`;
    ctx.beginPath(); ctx.arc(off, i * shrimp.radius * 0.45, rr, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 0.5; ctx.stroke();
  }

  // Eyes
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(shrimp.radius * 0.3, -shrimp.radius * 0.2, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-shrimp.radius * 0.3, -shrimp.radius * 0.2, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(shrimp.radius * 0.35, -shrimp.radius * 0.25, 1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-shrimp.radius * 0.25, -shrimp.radius * 0.25, 1, 0, Math.PI * 2); ctx.fill();

  // MSG aura
  ctx.globalAlpha = 0.15 + Math.sin(gameTime * 4) * 0.08;
  const aG = ctx.createRadialGradient(0, 0, shrimp.radius, 0, 0, shrimp.radius * 2.5);
  aG.addColorStop(0, 'rgba(255,215,0,0.25)'); aG.addColorStop(1, 'rgba(255,215,0,0)');
  ctx.fillStyle = aG;
  ctx.beginPath(); ctx.arc(0, 0, shrimp.radius * 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Hit flash
  if (hitCooldown > CFG.HIT_INVULN_TIME - 0.15) {
    ctx.fillStyle = 'rgba(255,0,0,0.3)';
    ctx.beginPath(); ctx.arc(0, 0, shrimp.radius * 1.2, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();
}

/* ═══ SENSOR DEBUG OVERLAY ═══ */
function toggleDebug() {
  sensorDebug.visible = !sensorDebug.visible;
  $('sensor-debug').style.display = sensorDebug.visible ? 'block' : 'none';
  if (sensorDebug.visible) updateSensorDebug();   // Immediately populate
}

function updateSensorDebug() {
  if (!sensorDebug.visible) return;
  const o = sensorDebug.orient;
  const a = sensorDebug.accel;
  const noData = !sensorDebug.hasOrientation && !sensorDebug.hasMotion;
  $('dbg-orient').innerHTML = noData
    ? '<b>Orient</b> <span style="color:#888">no events yet (desktop?)</span>'
    : `<b>Orient</b> α:${o.alpha.toFixed(1)} β:${o.beta.toFixed(1)} γ:${o.gamma.toFixed(1)}`;
  $('dbg-accel').innerHTML = noData
    ? '<b>Accel</b> <span style="color:#888">waiting for sensor…</span>'
    : `<b>Accel</b> x:${a.x.toFixed(2)} y:${a.y.toFixed(2)} z:${a.z.toFixed(2)}`;

  const mag = sensorDebug.mag;
  const toss = calibration.tossThreshold;
  const swat = calibration.swatThreshold;
  const magColor = mag > swat ? '#ff4444' : mag > toss ? '#ffaa00' : '#44ff44';
  $('dbg-mag').innerHTML = `<b>Mag</b> <span style="color:${magColor}">${mag.toFixed(1)}</span> [toss:${toss.toFixed(1)} swat:${swat.toFixed(1)}]`;

  const bar = '█'.repeat(Math.min(20, Math.floor(mag)));
  $('dbg-thresh').innerHTML = `<span style="color:${magColor}">${bar}</span>`;

  $('dbg-device').innerHTML = `<b>Device</b> ${sensorDebug.device}`;
  const hasO = sensorDebug.hasOrientation;
  const hasM = sensorDebug.hasMotion;
  $('dbg-perm').innerHTML = `<b>Perm</b> ${sensorDebug.permission}<br>` +
    `<span class="${hasO ? 'dbg-ok' : 'dbg-warn'}">Orient: ${hasO ? 'YES' : 'NO'}</span> ` +
    `<span class="${hasM ? 'dbg-ok' : 'dbg-warn'}">Motion: ${hasM ? 'YES' : 'NO'}</span>`;
}

/* ═══ TITLE BACKGROUND PARTICLES ═══ */
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas ? bgCanvas.getContext('2d') : null;
let bgAnimId = null;

function initBgParticles() {
  if (!bgCanvas) return;
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
  bgParticles = [];
  for (let i = 0; i < 40; i++) {
    bgParticles.push({
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -Math.random() * 0.8 - 0.2,
      size: Math.random() * 3 + 1,
      alpha: Math.random() * 0.4 + 0.1,
      emoji: ['·','·','•','•','·'][Math.floor(Math.random() * 5)],
    });
  }
  animateBg();
}

function animateBg() {
  if (!bgCtx) return;
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  for (const p of bgParticles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.y < -20) { p.y = bgCanvas.height + 20; p.x = Math.random() * bgCanvas.width; }
    if (p.x < -20) p.x = bgCanvas.width + 20;
    if (p.x > bgCanvas.width + 20) p.x = -20;
    bgCtx.globalAlpha = p.alpha;
    bgCtx.font = `${p.size * 6}px sans-serif`;
    bgCtx.fillText(p.emoji, p.x, p.y);
  }
  bgCtx.globalAlpha = 1;
  bgAnimId = requestAnimationFrame(animateBg);
}

function stopBgParticles() {
  if (bgAnimId) { cancelAnimationFrame(bgAnimId); bgAnimId = null; }
  if (bgCtx) bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
}

// Start particles on load (title screen only)
initBgParticles();

// Start title shrimp animation + load high scores + restore calibration
startTitleShrimp();
loadScores();
hasSavedCalibration = loadCalibration();
updateHighScorePreview();

/* ═══ START ═══ */
requestAnimationFrame(update);
