// ─────────────────────────────────────────────────────────────────
//  MPU-6050 Air Brush  —  p5.js sketch
//  Paste this into https://editor.p5js.org/
//
//  Requires: Chrome or Edge (Web Serial API — Safari/Firefox unsupported)
//  ESP32 must be running mpu6050_smoke_test.ino in CSV mode @ 115200 baud
//
//  CSV format expected from ESP32:
//    ax,ay,az,gx,gy,gz   (raw int16, 50 Hz)
//
//  Controls:
//    Click canvas  → open port picker, start streaming
//    Press C       → clear canvas
//    Press S       → save PNG snapshot
// ─────────────────────────────────────────────────────────────────

let port, reader;
let lineBuffer = "";

let posX, posY;
let brushSize = 5;
let hue = 0;             // slowly cycles through colours

// How fast gyro values move the brush. Tune up/down to taste.
const GYRO_SCALE = 0.0005;

// Accel magnitude range → brush size range
const ACCEL_STILL  = 16000;  // ~1 G (resting)
const ACCEL_HARD   = 36000;  // hard flick
const BRUSH_MIN    = 2;
const BRUSH_MAX    = 50;

// ─── Setup ────────────────────────────────────────────────────────
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  background(0, 0, 10);   // near-black
  noStroke();

  posX = width  / 2;
  posY = height / 2;

  // Prompt user to select Serial port on first canvas click
  canvas.addEventListener("click", openSerial, { once: true });
}

// ─── Draw loop ────────────────────────────────────────────────────
function draw() {
  // Nothing here — painting happens asynchronously in readLoop()
}

// ─── Serial open ─────────────────────────────────────────────────
async function openSerial() {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    reader = port.readable.getReader();
    readLoop();
  } catch (err) {
    console.warn("Serial port not opened:", err);
  }
}

// ─── Async read loop  ─────────────────────────────────────────────
async function readLoop() {
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    lineBuffer += decoder.decode(value, { stream: true });

    // Process every complete line
    let newline;
    while ((newline = lineBuffer.indexOf("\n")) !== -1) {
      const line = lineBuffer.slice(0, newline).trim();
      lineBuffer  = lineBuffer.slice(newline + 1);
      processLine(line);
    }
  }
}

// ─── Parse one CSV line and paint ────────────────────────────────
function processLine(line) {
  const parts = line.split(",");
  if (parts.length < 6) return;

  const ax = parseInt(parts[0]);
  const ay = parseInt(parts[1]);
  const az = parseInt(parts[2]);
  const gx = parseInt(parts[3]);
  const gy = parseInt(parts[4]);
  // gz (parts[5]) not used — no in-plane rotation mapping yet

  if (isNaN(ax) || isNaN(gx)) return;

  // ── 1. POSITION  (integrate angular velocity) ─────────────────
  //   gy → horizontal movement,  gx → vertical movement
  posX += gy * GYRO_SCALE;
  posY += gx * GYRO_SCALE;

  // Wrap around edges (feels more natural than hard-clamp for painting)
  posX = ((posX % width)  + width)  % width;
  posY = ((posY % height) + height) % height;

  // ── 2. BRUSH SIZE  (acceleration magnitude = flick intensity) ──
  const mag = sqrt(ax * ax + ay * ay + az * az);
  const targetSize = map(mag, ACCEL_STILL, ACCEL_HARD, BRUSH_MIN, BRUSH_MAX, true);
  brushSize = lerp(brushSize, targetSize, 0.12);   // smooth lag

  // ── 3. COLOUR  (slow hue rotation, full saturation) ───────────
  hue = (hue + 0.4) % 360;

  // ── 4. PAINT ──────────────────────────────────────────────────
  fill(hue, 80, 95, 70);
  ellipse(posX, posY, brushSize);
}

// ─── Keyboard shortcuts ───────────────────────────────────────────
function keyPressed() {
  if (key === "c" || key === "C") {
    background(0, 0, 10);
    posX = width  / 2;
    posY = height / 2;
  }
  if (key === "s" || key === "S") {
    saveCanvas("wok_painting_" + year() + nf(month(),2) + nf(day(),2), "png");
  }
}

// ─── Resize ───────────────────────────────────────────────────────
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0, 0, 10);
  posX = width  / 2;
  posY = height / 2;
}
