const WebSocket = require('ws');

// Get device name from arguments, default to iPhone Unknown
const deviceName = process.argv[2] || "iPhone Unknown";

const PORT = process.env.PORT || 3000;
const HOST = `ws://localhost:${PORT}`;

console.log(`\n[START] Starting ${deviceName} Compatibility Test Suite...`);
console.log(`Connecting to ${HOST}\n`);

const displayWs = new WebSocket(HOST);
let controllerWs = null;
let roomCode = null;
let passCount = 0;
let failCount = 0;

displayWs.on('open', () => {
  console.log('[Display] Connected. Requesting room code...');
  displayWs.send(JSON.stringify({ role: 'display' }));
});

displayWs.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.type === 'room') {
    roomCode = msg.code;
    console.log(`[PASS] Display assigned Room Code: ${roomCode}`);
    passCount++;
    connectController();
  } else if (msg.type === 'controller-connected') {
    console.log(`[Display] Controller successfully paired.`);
  } else if (msg.type === 'orientation' || msg.type === 'motion') {
    console.log(`[Display] Received Sensor Event ->`, msg.type, `[x:${msg.x||msg.alpha||0}, y:${msg.y||msg.beta||0}, z:${msg.z||msg.gamma||0}]`);
  }
});

displayWs.on('error', (err) => {
  console.error(`[FAIL] Display WebSocket error: ${err.message}`);
  failCount++;
  process.exit(1);
});

function connectController() {
  controllerWs = new WebSocket(HOST);

  controllerWs.on('open', () => {
    console.log(`[Controller] Connecting to Room: ${roomCode}`);
    controllerWs.send(JSON.stringify({ role: 'controller', code: roomCode }));
  });

  controllerWs.on('message', (data) => {
    const msg = JSON.parse(data);
    if (msg.type === 'joined') {
      console.log(`[PASS] Controller successfully joined room.\n`);
      passCount++;
      runTestSequence();
    } else if (msg.type === 'error') {
      console.error(`[FAIL] Error parsing controller connection: ${msg.message}`);
      failCount++;
      process.exit(1);
    }
  });

  controllerWs.on('error', (err) => {
    console.error(`[FAIL] Controller WebSocket error: ${err.message}`);
    failCount++;
    process.exit(1);
  });
}

// -- Test Sequence --
function runTestSequence() {
  console.log(`[RUN] Commencing Core Motion & Device Compatibility tests (${deviceName} Profile)...\n`);

  const sequence = [
    { delay: 200,  name: 'Early Orientation (pre-tilt-step gesture)', action: sendOrientation, args: [0, 5, 3] },
    { delay: 500,  name: 'Flat Position (Calibration Base)', action: sendOrientation, args: [0, 0, 0] },
    { delay: 1000, name: 'Tilt Left (Slide Shrimp Left)', action: sendOrientation, args: [0, 0, -45] },
    { delay: 1500, name: 'Tilt Right (Slide Shrimp Right)', action: sendOrientation, args: [0, 0, 45] },
    { delay: 2000, name: 'Back to Flat', action: sendOrientation, args: [0, 0, 0] },
    { delay: 2500, name: 'Calibration Flick 1 (Toss/Jump)', action: sendMotion, args: [0, 15.5, 5.2] },
    { delay: 3000, name: 'Calibration Flick 2 (Toss/Jump)', action: sendMotion, args: [0, 16.2, 4.8] },
    { delay: 3500, name: 'Calibration Flick 3 (Toss/Jump)', action: sendMotion, args: [0, 17.1, 5.5] },
    { delay: 4000, name: 'Hard Shake (Swat Hand)', action: sendMotion, args: [25.0, -10.0, 30.0] },
    { delay: 5000, name: 'Calibration Completion Verification (3rd flick)', action: sendMotion, args: [0, 18.0, 6.0] },
    { delay: 5500, name: 'Test Complete. Disconnecting.', action: () => {
      console.log(`\n[DONE] ${deviceName} device compatibility tests complete.`);
      console.log(`       Passed: ${passCount} | Failed: ${failCount}`);
      process.exit(failCount > 0 ? 1 : 0);
    }, args: [] }
  ];

  sequence.forEach(stepReq => {
    setTimeout(() => {
      console.log(`[Step] ${stepReq.name}`);
      try {
        stepReq.action(...stepReq.args);
        if (stepReq.action !== (() => {})) passCount++;
      } catch (e) {
        console.error(`[FAIL] ${stepReq.name}: ${e.message}`);
        failCount++;
      }
    }, stepReq.delay);
  });
}

function sendOrientation(alpha, beta, gamma) {
  const py = { type: 'orientation', alpha, beta, gamma };
  controllerWs.send(JSON.stringify(py));
  console.log(`   [Sent] Orientation [alpha:${alpha}, beta:${beta}, gamma:${gamma}]`);
}

function sendMotion(x, y, z) {
  const py = { type: 'motion', x, y, z };
  controllerWs.send(JSON.stringify(py));
  console.log(`   [Sent] Motion (Accel) [X:${x}, Y:${y}, Z:${z}]`);
}
