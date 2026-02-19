/* ═══════════════════════════════════════════════════════════════
 *  GAME.JS — Shrimp Fried Rice — v0.4.0
 *  GDC Alt. Ctrl. Prototype
 *  Hardware target: Wok + IMU (Arduino/ESP32) + Piezo
 *  This build:  Phone tilt + shake via browser sensors
 *  Depends on:  config.js (loaded first)
 *  Stage 3: Kitchen Pandemonium — shrimp becomes the chef
 *  Watson feedback: upgrade system, "every subsystem must be fun"
 *  Ref: Froggy's Battle, Cookie Clicker progressive reveal
 * ═══════════════════════════════════════════════════════════════ */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

/* ═══ AUDIO ENGINE (Procedural — no files) ═══ */
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

// Upgrades (Watson: "buy upgrades with MSG and oil")
let upgrades = {
  jumpHeight: 0,
  tempResist: 0,
  oilCapacity: 0,
  speedBoost: 0,
};

// Stage 3: Kitchen Pandemonium
let kitchen = {
  // Chef-shrimp position (top-down kitchen)
  chef: { x: 0, y: 0, angle: 0 },
  // Stations: stove, wok, fridge, pass (serving window)
  stations: [],
  orders: [],       // Active orders to fill
  ordersServed: 0,
  orderTimer: 0,
  hazards: [],      // Floor grease, steam bursts, etc.
  hazardTimer: 0,
  // 4-column split: col 0 = shrimp cam, cols 1-3 = kitchen lanes
  splitView: true,
  wokMiniState: null,   // Tiny wok replay showing where you came from
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
  ['title-screen','calibration-screen','transition-screen','transition2-screen','upgrade-screen','gameover-screen','victory-screen'].forEach(id => $(id).style.display = 'none');
  $('hud').style.display = 'none';
  $('oil-label').style.display = 'none';
  $('oil-bar-wrap').style.display = 'none';
  $('chef-label').style.display = 'none';
  $('chef-bar-wrap').style.display = 'none';
  $('s3-hud').style.display = 'none';
  $('stage-announce').style.opacity = '0';
  document.body.classList.remove('burn-pulse');
  document.body.classList.remove('stage3-active');
}

function showScreen(id) { hideAllScreens(); if (id) $(id).style.display = 'flex'; }

function showHUD() {
  $('hud').style.display = 'flex';
  $('oil-label').style.display = 'block';
  $('oil-bar-wrap').style.display = 'block';
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

function updatePhoneStatus(mode) {
  const el = $('phone-status');
  el.style.display = 'block';
  el.className = '';
  if (mode === 'phone') { el.textContent = '📱 Sensors Connected'; el.classList.add('connected'); }
  else { el.textContent = '🖱️ Mouse/Keyboard'; el.classList.add('desktop'); }
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
  window.addEventListener('deviceorientation', e => {
    if (e.gamma === null || e.beta === null) return;
    hasDeviceOrientation = true;
    sensorDebug.hasOrientation = true;
    sensorDebug.orient = { alpha: e.alpha || 0, beta: e.beta || 0, gamma: e.gamma || 0 };
    tiltX = Math.max(-1, Math.min(1, (e.gamma || 0) / 45));
    tiltY = Math.max(-1, Math.min(1, (e.beta || 0) / 45));
    updatePhoneStatus('phone');
  });
}

function setupDeviceMotion() {
  window.addEventListener('devicemotion', e => {
    const a = e.accelerationIncludingGravity;
    if (!a) return;
    sensorDebug.hasMotion = true;
    sensorDebug.accel = { x: a.x || 0, y: a.y || 0, z: a.z || 0 };
    const dx = a.x - lastAccel.x, dy = a.y - lastAccel.y, dz = a.z - lastAccel.z;
    accelMagnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);
    sensorDebug.mag = accelMagnitude;
    lastAccel = { x: a.x, y: a.y, z: a.z };

    // Calibration mode
    if (calibration.active) {
      handleCalibrationFlick(accelMagnitude);
      return;
    }

    if (!gameRunning) return;

    if (accelMagnitude > calibration.swatThreshold && stage === STAGE.S2) {
      attemptSwat();
    } else if (accelMagnitude > calibration.tossThreshold && !shrimp.airborne) {
      tossShrimp();
    }
  });
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
  if (!shrimp.airborne) tossShrimp();
}, { passive: false });

window.addEventListener('mousedown', () => {
  if (!gameRunning) return;
  if (stage === STAGE.S2 && chef.state === 'holding') { attemptSwat(); return; }
  if (!shrimp.airborne) tossShrimp();
});

window.addEventListener('keydown', e => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  keys[e.code] = true;
  if (e.code === 'Space' && gameRunning) {
    if (stage === STAGE.S2 && chef.state === 'holding') attemptSwat();
    else if (!shrimp.airborne) tossShrimp();
  }
  if (e.code === 'Enter' && gameRunning && stage === STAGE.S2) attemptSwat();
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
  const dots = document.querySelectorAll('#calibration-screen .cal-dot');
  dots.forEach((dot, i) => {
    if (i < calibration.flicks.length) {
      dot.classList.add('done');
      dot.textContent = '✓';
    } else {
      dot.classList.remove('done');
      dot.textContent = (i + 1);
    }
  });
  const hint = $('cal-hint');
  if (hint) {
    const remaining = CFG.CALIBRATION_FLICKS - calibration.flicks.length;
    hint.textContent = remaining > 0 ? `FLICK UP! (${remaining} left)` : 'CALIBRATING...';
  }
}

function finishCalibration() {
  calibration.active = false;
  const avg = calibration.flicks.reduce((a, b) => a + b, 0) / calibration.flicks.length;
  // Set thresholds relative to the user's natural flick strength
  calibration.tossThreshold = avg * 0.6;   // 60% of average = toss
  calibration.swatThreshold = avg * 1.1;   // 110% of average = hard swat
  console.log(`[Calibration] Avg flick: ${avg.toFixed(1)}, Toss: ${calibration.tossThreshold.toFixed(1)}, Swat: ${calibration.swatThreshold.toFixed(1)}`);
  startGameplay();
}

function skipCalibration() {
  calibration.active = false;
  calibration.tossThreshold = CFG.TOSS_THRESHOLD;
  calibration.swatThreshold = CFG.SWAT_THRESHOLD;
  startGameplay();
}

/* ═══ GAME FLOW ═══ */
function initGame() {
  ensureAudio();
  stopBgParticles();

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

function startGameplay() {
  resetAll();
  stage = STAGE.S1;
  gameRunning = true;
  hideAllScreens();
  showHUD();
  announce('STAGE 1', 'SURVIVE THE WOK');
  spawnOil();
}

function restartGame() {
  // Re-use existing calibration — don't recalibrate
  resetAll();
  stage = STAGE.S1;
  gameRunning = true;
  hideAllScreens();
  showHUD();
  announce('STAGE 1', 'SURVIVE THE WOK');
  spawnOil();
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
  kitchen.orders = []; kitchen.ordersServed = 0; kitchen.hazards = [];
  document.body.classList.remove('burn-pulse');
  document.body.classList.remove('stage3-active');
}

function triggerGameOver() {
  gameRunning = false;
  stage = STAGE.GAMEOVER;
  $('go-title').textContent = burnMeter >= CFG.BURN_MAX ? 'BURNT!' : 'GAME OVER';
  $('go-stats').innerHTML = `MSG: <span>${msgCollected}</span> / ${CFG.MSG_TO_WIN}<br>Time: <span>${fmtTime(gameTime)}</span>`;
  $('go-flavor').textContent = burnMeter >= CFG.BURN_MAX ? 'The oil ran dry... crispy shrimp.' : 'The chef got you.';
  showScreen('gameover-screen');
}

function triggerVictory() {
  gameRunning = false;
  stage = STAGE.VICTORY;
  playSound('victory');
  const served = kitchen.ordersServed || 0;
  $('vic-stats').innerHTML = `Time: <span>${fmtTime(gameTime)}</span><br>Orders Served: <span>${served}</span><br>The shrimp fried the rice... became the chef... and served the world.`;
  showScreen('victory-screen');
}

function triggerS3Victory() {
  triggerVictory();
}

function startTransition() {
  stage = STAGE.TRANSITION;
  gameRunning = false;
  obstacles = [];
  const el = $('transition-text');
  showScreen('transition-screen');

  el.innerHTML = '<span style="color:#f7c948;font-size:32px">✨</span><br>The MSG... it\'s changing you...';
  setTimeout(() => {
    el.innerHTML = '<span style="font-size:40px">🍤💪</span><br><span style="color:#f7c948;font-weight:800">Wait—the chef noticed you.<br>He reaches into the wok...</span><br><span style="font-size:18px;color:#ff6b35;margin-top:8px;display:inline-block;font-weight:700">FIGHT BACK!</span><br><span style="font-size:14px;opacity:.6;margin-top:8px;display:inline-block">Swat his hand away! Shake hard or tap!</span>';
  }, 2500);
  setTimeout(() => {
    hideAllScreens();
    showHUD();
    showChefBar();
    gameRunning = true;
    stage = STAGE.S2;
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
  }, 5000);
}

/* ═══ TRANSITION 2: S2 → UPGRADE SHOP → S3 ═══ */
function startTransition2() {
  stage = STAGE.TRANSITION2;
  gameRunning = false;
  obstacles = [];
  const el = $('transition2-text');
  showScreen('transition2-screen');

  el.innerHTML = '<span style="font-size:48px">🍤⚡👨‍🍳</span><br><span style="color:#f7c948;font-weight:800;font-size:28px">ROLE REVERSAL</span><br><span style="color:#ddd;margin-top:12px;display:inline-block">The MSG courses through you...<br>You\'re not the ingredient anymore.</span>';
  setTimeout(() => {
    el.innerHTML = '<span style="font-size:56px">👨‍🍳</span><br><span style="color:#ff6b35;font-weight:800;font-size:24px">YOU ARE THE CHEF NOW</span><br><span style="color:#ddd;margin-top:8px;display:inline-block;font-size:16px">Run the kitchen. Serve the orders.<br>Don\'t let anything burn.</span>';
  }, 3000);
  setTimeout(() => {
    showUpgradeShop();
  }, 6000);
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
  // Jump height: increase AIR_DURATION
  // Temp resist: slow burn rate
  // Oil capacity: increase OIL_MAX (effective)
  // Speed boost: increase tilt sensitivity
  // These are applied dynamically in the update loop
}

function getUpgradeBonus(key) {
  const cfg = CFG.UPGRADES[key];
  return upgrades[key] * cfg.effect;
}

function closeUpgradeShop() {
  startS3();
}

/* ═══ STAGE 3: KITCHEN PANDEMONIUM ═══ */
// The shrimp is now the chef! Top-down kitchen view.
// 4-column layout: col 1 = shrimp close-up, cols 2-4 = kitchen floor

const KITCHEN_DISHES = [
  { name: 'Fried Rice', emoji: '🍚', color: '#ffd700' },
  { name: 'Ramen', emoji: '🍜', color: '#ff8844' },
  { name: 'Dumplings', emoji: '🥟', color: '#88cc44' },
  { name: 'Tempura', emoji: '🍤', color: '#ff6b35' },
  { name: 'Miso Soup', emoji: '🍲', color: '#aa88ff' },
];

const KITCHEN_STATIONS = [
  { id: 'fridge', x: 0.15, y: 0.15, label: '🧊 FRIDGE', color: '#4488ff' },
  { id: 'stove',  x: 0.5,  y: 0.12, label: '🔥 STOVE',  color: '#ff4444' },
  { id: 'wok',    x: 0.85, y: 0.15, label: '🍳 WOK',     color: '#ff8800' },
  { id: 'pass',   x: 0.5,  y: 0.88, label: '🔔 PASS',    color: '#44ff44' },
];

function initKitchen() {
  kitchen.chef = { x: WOK.cx(), y: WOK.cy(), angle: 0, carrying: null, cookTimer: 0, atStation: null };
  kitchen.stations = KITCHEN_STATIONS.map(s => ({
    ...s,
    worldX: WOK.size * s.x,
    worldY: WOK.size * s.y,
  }));
  kitchen.orders = [];
  kitchen.ordersServed = 0;
  kitchen.orderTimer = CFG.S3_ORDER_INTERVAL * 0.5; // First order comes sooner
  kitchen.hazards = [];
  kitchen.hazardTimer = CFG.S3_OBSTACLE_INTERVAL;
}

function spawnOrder() {
  if (kitchen.orders.filter(o => !o.done).length >= 4) return; // Max 4 active orders
  const dish = KITCHEN_DISHES[Math.floor(Math.random() * KITCHEN_DISHES.length)];
  kitchen.orders.push({
    dish,
    deadline: CFG.S3_ORDER_DEADLINE,
    state: 'new', // new → cooking → ready → served | expired
    done: false,
    progress: 0,
  });
  playSound('ding');
}

function startS3() {
  hideAllScreens();
  stage = STAGE.S3;
  gameRunning = true;
  document.body.classList.add('stage3-active');

  // Change canvas to rectangular for kitchen
  resizeKitchen();

  initKitchen();
  showHUD();
  $('s3-hud').style.display = 'block';
  $('hud-left-label').textContent = 'ORDERS';
  $('hud-left-value').textContent = `0 / ${CFG.S3_ORDER_COUNT}`;
  $('oil-label').style.display = 'block';
  $('oil-bar-wrap').style.display = 'block';
  oilLevel = CFG.OIL_MAX + getUpgradeBonus('oilCapacity');
  burnMeter = 0;
  announce('STAGE 3', 'KITCHEN PANDEMONIUM');
}

function resizeKitchen() {
  const maxW = 600, maxH = 500;
  const w = Math.min(window.innerWidth - 32, maxW);
  const h = Math.min(window.innerHeight - 140, maxH);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  WOK.size = Math.min(w, h); // Use for station positioning
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
  shrimp.scale = 1.6;
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

  spawnPopup(chef.handX, chef.handY, '💥 SWAT!', '#ff4444');
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
          spawnPopup(chef.handX, chef.handY, '💢 RAM!', '#ffaa33');
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

  if (!gameRunning || stage === STAGE.TITLE || stage === STAGE.TRANSITION || stage === STAGE.TRANSITION2 || stage === STAGE.CALIBRATE || stage === STAGE.UPGRADE) return;

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

  // ─── Shrimp physics (S1/S2 only — S3 uses kitchen.chef) ───
  if (stage !== STAGE.S3) {
  if (!shrimp.airborne) {
    currentDrag = 0.75 + (0.13 * (oilLevel / CFG.OIL_MAX));
    shrimp.vx += tiltX * CFG.GRAVITY * 60 * dt;
    shrimp.vy += tiltY * CFG.GRAVITY * 60 * dt;
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
    shrimp.vx += tiltX * CFG.GRAVITY * 0.1;
    shrimp.vy += tiltY * CFG.GRAVITY * 0.1;
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
          if (msgCollected >= CFG.MSG_TO_WIN) { startTransition(); return; }
        }
      }
    }
  } // end S1/S2 collectibles guard

  // ─── Obstacle & spawn (S1/S2 only — S3 uses kitchen system) ───
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

  // Stage 3: Kitchen Pandemonium
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
    oilBar.style.width = `${(oilLevel / CFG.OIL_MAX) * 100}%`;
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
    ctx.shadowBlur = 15; ctx.shadowColor = '#ffd700';
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath(); ctx.arc(m.x, m.y + bob, m.radius * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(m.x - m.radius * 0.15, m.y + bob - m.radius * 0.2, m.radius * 0.12, 0, Math.PI * 2); ctx.fill();
  }

  // MSG crystals
  for (const m of msgItems) {
    if (m.collected) continue;
    const bob = Math.sin(gameTime * 3.5 + m.bob) * 3;
    ctx.save(); ctx.translate(m.x, m.y + bob); ctx.rotate(gameTime * 2 + m.bob);
    ctx.shadowBlur = 20; ctx.shadowColor = '#ffffff';
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

/* ═══ STAGE 3 UPDATE ═══ */
function updateS3(dt) {
  const speed = CFG.S3_MOVE_SPEED + getUpgradeBonus('speedBoost') * 10;
  const kc = kitchen.chef;

  // Move chef-shrimp with tilt/keys
  if (!hasDeviceOrientation && (keys['ArrowLeft'] || keys['ArrowRight'] || keys['ArrowUp'] || keys['ArrowDown'] || keys['KeyW'] || keys['KeyA'] || keys['KeyS'] || keys['KeyD'])) {
    tiltX = 0; tiltY = 0;
    if (keys['ArrowLeft'] || keys['KeyA']) tiltX = -0.8;
    if (keys['ArrowRight'] || keys['KeyD']) tiltX = 0.8;
    if (keys['ArrowUp'] || keys['KeyW']) tiltY = -0.8;
    if (keys['ArrowDown'] || keys['KeyS']) tiltY = 0.8;
  }

  kc.x += tiltX * speed;
  kc.y += tiltY * speed;
  // Clamp to kitchen bounds
  const margin = 20;
  const kW = parseInt(canvas.style.width) || WOK.size;
  const kH = parseInt(canvas.style.height) || WOK.size;
  kc.x = Math.max(margin, Math.min(kW - margin, kc.x));
  kc.y = Math.max(margin, Math.min(kH - margin, kc.y));
  if (Math.abs(tiltX) > 0.05 || Math.abs(tiltY) > 0.05) {
    kc.angle = Math.atan2(tiltY, tiltX);
  }

  // Order spawning
  kitchen.orderTimer -= dt;
  if (kitchen.orderTimer <= 0) {
    spawnOrder();
    kitchen.orderTimer = CFG.S3_ORDER_INTERVAL;
  }

  // Order deadlines
  for (const order of kitchen.orders) {
    if (order.done) continue;
    order.deadline -= dt;
    if (order.deadline <= 0 && order.state !== 'served') {
      order.done = true;
      order.state = 'expired';
      oilLevel -= CFG.S3_BURN_PENALTY;
      addShake(10);
      playSound('fail');
    }
  }

  // Station proximity / interaction
  kc.atStation = null;
  for (const station of kitchen.stations) {
    const d = dist(kc.x, kc.y, station.worldX, station.worldY);
    if (d < CFG.S3_STATION_RADIUS * 1.5) {
      kc.atStation = station.id;

      // Auto-interact when close enough
      if (d < CFG.S3_STATION_RADIUS) {
        handleStationInteraction(station, dt);
      }
    }
  }

  // Kitchen hazards
  kitchen.hazardTimer -= dt;
  if (kitchen.hazardTimer <= 0) {
    spawnKitchenHazard();
    kitchen.hazardTimer = CFG.S3_OBSTACLE_INTERVAL;
  }

  // Update hazards
  for (let i = kitchen.hazards.length - 1; i >= 0; i--) {
    const h = kitchen.hazards[i];
    h.timer -= dt;
    if (h.timer <= 0) { kitchen.hazards.splice(i, 1); continue; }
    // Collision with chef-shrimp
    if (!h.hit && dist(kc.x, kc.y, h.x, h.y) < 25) {
      h.hit = true;
      oilLevel -= 8;
      addShake(5);
      playSound('hit');
    }
  }

  // Oil drain (slower in kitchen — you're the chef now!)
  const burnResist = getUpgradeBonus('tempResist');
  if (oilLevel > 0) {
    oilLevel -= CFG.OIL_DRAIN_BASE * 0.3 * dt;
    burnMeter = Math.max(0, burnMeter - (CFG.BURN_RATE_COOL + burnResist) * dt);
  } else {
    burnMeter += Math.max(5, CFG.BURN_RATE_GROWTH - burnResist) * dt;
  }
  oilLevel = Math.max(0, Math.min(CFG.OIL_MAX + getUpgradeBonus('oilCapacity'), oilLevel));
  burnMeter = Math.max(0, Math.min(CFG.BURN_MAX, burnMeter));
  if (burnMeter >= CFG.BURN_MAX) { triggerGameOver(); return; }

  // Check victory
  if (kitchen.ordersServed >= CFG.S3_ORDER_COUNT) {
    triggerS3Victory();
    return;
  }

  // HUD
  $('hud-left-label').textContent = 'ORDERS';
  $('hud-left-value').textContent = `${kitchen.ordersServed} / ${CFG.S3_ORDER_COUNT}`;

  updateS3OrderCards();
}

function handleStationInteraction(station, dt) {
  const kc = kitchen.chef;
  const activeOrder = kitchen.orders.find(o => !o.done && o.state !== 'served');
  if (!activeOrder) return;

  switch (station.id) {
    case 'fridge':
      if (activeOrder.state === 'new') {
        activeOrder.state = 'prepping';
        activeOrder.progress = 0;
        kc.carrying = activeOrder.dish.emoji;
        playSound('collect');
      }
      break;
    case 'stove':
    case 'wok':
      if (activeOrder.state === 'prepping') {
        activeOrder.progress += dt / CFG.S3_COOK_TIME;
        if (activeOrder.progress >= 1) {
          activeOrder.state = 'cooked';
          playSound('pop');
        }
      }
      break;
    case 'pass':
      if (activeOrder.state === 'cooked') {
        activeOrder.state = 'served';
        activeOrder.done = true;
        kitchen.ordersServed++;
        kc.carrying = null;
        playSound('ding');
        addShake(5);
        const sX = station.worldX, sY = station.worldY;
        spawnPopup(sX, sY, `✅ ${activeOrder.dish.name}!`, '#44ff44');
        for (let i = 0; i < 12; i++) spawnParticle(sX, sY, '#44ff44', 6, 4);
      }
      break;
  }
}

function spawnKitchenHazard() {
  const kW = parseInt(canvas.style.width) || WOK.size;
  const kH = parseInt(canvas.style.height) || WOK.size;
  kitchen.hazards.push({
    x: Math.random() * (kW - 40) + 20,
    y: Math.random() * (kH - 40) + 20,
    type: Math.random() > 0.5 ? 'grease' : 'steam',
    timer: 3 + Math.random() * 2,
    hit: false,
  });
}

function updateS3OrderCards() {
  const container = $('s3-orders');
  container.innerHTML = '';
  for (const order of kitchen.orders) {
    if (order.done && order.state !== 'expired') continue;
    if (order.done) continue;
    const card = document.createElement('div');
    card.className = 'order-card';
    if (order.deadline < 4) card.classList.add('urgent');
    card.innerHTML = `<div class="order-emoji">${order.dish.emoji}</div>
      <div style="font-size:11px;color:${order.dish.color}">${order.dish.name}</div>
      <div class="order-timer">${order.deadline.toFixed(1)}s</div>
      <div style="font-size:10px;color:#888">${order.state}</div>`;
    container.appendChild(card);
  }
}

/* ═══ STAGE 3 DRAW ═══ */
function drawS3() {
  const kW = parseInt(canvas.style.width) || WOK.size;
  const kH = parseInt(canvas.style.height) || WOK.size;

  // Kitchen floor
  ctx.fillStyle = '#1a1a1e';
  ctx.fillRect(0, 0, kW, kH);

  // 4-column split lines
  const colW = kW / 4;
  ctx.save();
  ctx.translate(screenShake.x, screenShake.y);

  // Column 0: Shrimp cam (close-up view of the shrimp-as-chef)
  drawShrimpCam(0, 0, colW, kH);

  // Columns 1-3: Kitchen floor
  ctx.save();
  ctx.beginPath();
  ctx.rect(colW, 0, kW - colW, kH);
  ctx.clip();

  // Tile floor pattern
  const tileSize = 30;
  for (let tx = colW; tx < kW; tx += tileSize) {
    for (let ty = 0; ty < kH; ty += tileSize) {
      const isLight = ((Math.floor(tx / tileSize) + Math.floor(ty / tileSize)) % 2 === 0);
      ctx.fillStyle = isLight ? '#22222a' : '#1e1e26';
      ctx.fillRect(tx, ty, tileSize, tileSize);
    }
  }

  // Draw stations
  for (const station of kitchen.stations) {
    const sx = colW + (kW - colW) * station.x;
    const sy = kH * station.y;
    station.worldX = sx; station.worldY = sy; // Update for collision

    // Station glow
    const isNear = dist(kitchen.chef.x, kitchen.chef.y, sx, sy) < CFG.S3_STATION_RADIUS * 1.5;
    ctx.fillStyle = isNear ? station.color + '44' : station.color + '22';
    ctx.beginPath();
    ctx.arc(sx, sy, CFG.S3_STATION_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Station border
    ctx.strokeStyle = isNear ? station.color : station.color + '66';
    ctx.lineWidth = isNear ? 3 : 1;
    ctx.beginPath();
    ctx.arc(sx, sy, CFG.S3_STATION_RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    // Station label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText(station.label, sx, sy + 4);
  }

  // Draw hazards
  for (const h of kitchen.hazards) {
    const alpha = Math.min(1, h.timer / 1);
    if (h.type === 'grease') {
      ctx.fillStyle = `rgba(100,80,20,${alpha * 0.5})`;
      ctx.beginPath(); ctx.arc(h.x, h.y, 15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,200,50,${alpha})`;
      ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('💧', h.x, h.y + 5);
    } else {
      ctx.fillStyle = `rgba(200,200,200,${alpha * 0.3})`;
      ctx.beginPath(); ctx.arc(h.x, h.y, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.font = '16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('💨', h.x, h.y + 5);
    }
  }

  // Draw chef-shrimp
  drawChefShrimp(kitchen.chef.x, kitchen.chef.y, kitchen.chef.angle, kitchen.chef.carrying);

  // Particles
  for (const p of particles) {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.restore(); // Clip restore

  // Column divider
  ctx.strokeStyle = 'rgba(255,255,255,.15)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(colW, 0); ctx.lineTo(colW, kH); ctx.stroke();

  ctx.restore(); // shake restore

  // Screen flash
  if (screenFlash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.max(0, screenFlash)})`;
    ctx.fillRect(0, 0, kW, kH);
  }
}

function drawShrimpCam(x, y, w, h) {
  // Dark background for shrimp close-up
  ctx.fillStyle = '#0d0d12';
  ctx.fillRect(x, y, w, h);

  // Title
  ctx.fillStyle = '#f7c948';
  ctx.font = 'bold 11px Outfit';
  ctx.textAlign = 'center';
  ctx.fillText('🍤 CHEF SHRIMP', x + w / 2, y + 20);

  // Big animated shrimp
  const cx = x + w / 2;
  const cy = y + h * 0.4;
  const sz = Math.min(w, h) * 0.2;

  ctx.save();
  ctx.translate(cx, cy);
  const bob = Math.sin(gameTime * 3) * 5;
  ctx.translate(0, bob);

  // Chef hat
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(0, -sz * 1.5, sz * 0.7, sz * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-sz * 0.5, -sz * 1.5, sz, sz * 0.3);

  // Shrimp body (golden — transformed by MSG)
  for (let i = 0; i < 5; i++) {
    const offset = Math.sin(gameTime * 8 + i) * 2;
    const r = sz * (1 - i * 0.12);
    ctx.fillStyle = `rgb(${255 - i * 10}, ${180 - i * 15}, ${80 + i * 5})`;
    ctx.beginPath(); ctx.arc(-i * sz * 0.3, offset, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.stroke();
  }

  // Eyes
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(sz * 0.2, -sz * 0.3, sz * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sz * 0.2, sz * 0.3, sz * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(sz * 0.25, -sz * 0.35, sz * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sz * 0.25, sz * 0.25, sz * 0.05, 0, Math.PI * 2); ctx.fill();

  // MSG aura
  ctx.globalAlpha = 0.2 + Math.sin(gameTime * 4) * 0.1;
  const aGrad = ctx.createRadialGradient(0, 0, sz, 0, 0, sz * 3);
  aGrad.addColorStop(0, 'rgba(255,215,0,0.3)'); aGrad.addColorStop(1, 'rgba(255,215,0,0)');
  ctx.fillStyle = aGrad;
  ctx.beginPath(); ctx.arc(0, 0, sz * 3, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();

  // Carrying indicator
  if (kitchen.chef.carrying) {
    ctx.fillStyle = '#fff';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(kitchen.chef.carrying, cx, y + h * 0.72);
    ctx.font = '11px Outfit';
    ctx.fillStyle = '#888';
    ctx.fillText('CARRYING', cx, y + h * 0.72 + 20);
  }

  // Upgrade levels
  ctx.fillStyle = '#666';
  ctx.font = '10px Outfit';
  ctx.textAlign = 'center';
  let uy = y + h * 0.84;
  for (const [key, level] of Object.entries(upgrades)) {
    if (level > 0) {
      const cfg = CFG.UPGRADES[key];
      ctx.fillText(`${cfg.label} Lv${level}`, cx, uy);
      uy += 14;
    }
  }
}

function drawChefShrimp(x, y, angle, carrying) {
  ctx.save();
  ctx.translate(x, y);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 3, 14, 8, 0, 0, Math.PI * 2); ctx.fill();

  // Body (golden, chef mode)
  ctx.rotate(angle);
  for (let i = 0; i < 3; i++) {
    const sz = 10 - i * 2;
    const offset = Math.sin(gameTime * 10 + i) * 1;
    ctx.fillStyle = `rgb(${255 - i * 15}, ${180 - i * 20}, ${80 + i * 5})`;
    ctx.beginPath(); ctx.arc(-i * 5, offset, sz, 0, Math.PI * 2); ctx.fill();
  }

  // Chef hat (tiny)
  ctx.fillStyle = '#fff';
  ctx.fillRect(-4, -16, 8, 6);
  ctx.beginPath(); ctx.ellipse(0, -18, 6, 4, 0, 0, Math.PI * 2); ctx.fill();

  // Eyes
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(4, -3, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4, 3, 2, 0, Math.PI * 2); ctx.fill();

  ctx.restore();

  // Carrying emoji above head
  if (carrying) {
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(carrying, x, y - 22);
  }
}

/* ═══ SENSOR DEBUG OVERLAY ═══ */
function toggleDebug() {
  sensorDebug.visible = !sensorDebug.visible;
  $('sensor-debug').style.display = sensorDebug.visible ? 'block' : 'none';
}

function updateSensorDebug() {
  if (!sensorDebug.visible) return;
  const o = sensorDebug.orient;
  const a = sensorDebug.accel;
  $('dbg-orient').innerHTML = `<b>Orient</b> α:${o.alpha.toFixed(1)} β:${o.beta.toFixed(1)} γ:${o.gamma.toFixed(1)}`;
  $('dbg-accel').innerHTML = `<b>Accel</b> x:${a.x.toFixed(2)} y:${a.y.toFixed(2)} z:${a.z.toFixed(2)}`;

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
      emoji: ['✨','🔥','🍤','💫','🫧'][Math.floor(Math.random() * 5)],
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

/* ═══ START ═══ */
requestAnimationFrame(update);
