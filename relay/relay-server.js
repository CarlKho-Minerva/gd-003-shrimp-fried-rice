/* ═══════════════════════════════════════════════════════════════
 *  RELAY SERVER — Shrimp Fried Rice
 *  Routes sensor data from controller (phone/ESP32) to display.
 *
 *  Usage:
 *    cd relay/
 *    npm install
 *    node relay-server.js
 *
 *  Protocol:
 *    1. Display connects, sends: { "role": "display" }
 *       → Server assigns a 4-digit room code, responds: { "type": "room", "code": "4829" }
 *    2. Controller connects, sends: { "role": "controller", "code": "4829" }
 *       → Server responds: { "type": "joined", "code": "4829" }
 *       → Display receives: { "type": "controller-connected" }
 *    3. Controller sends sensor data → Server forwards to display:
 *       { "type": "orientation", "alpha": 45, "beta": 12, "gamma": -3 }
 *       { "type": "motion", "x": 0.5, "y": -1.2, "z": 9.6 }
 *       { "type": "action", "action": "toss" | "swat" | "s3swat" }
 *       { "type": "hit", "zone": 3 }   ← future: piezo disc
 * ═══════════════════════════════════════════════════════════════ */

const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8765;
const wss = new WebSocketServer({ port: PORT });

// Room storage: code → { display: ws, controllers: Set<ws> }
const rooms = new Map();

function generateCode() {
  let code;
  do {
    code = String(Math.floor(1000 + Math.random() * 9000));
  } while (rooms.has(code));
  return code;
}

function broadcast(room, data, excludeWs = null) {
  const msg = typeof data === 'string' ? data : JSON.stringify(data);
  if (room.display && room.display !== excludeWs && room.display.readyState === 1) {
    room.display.send(msg);
  }
}

wss.on('connection', (ws) => {
  let assignedRoom = null;
  let role = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    // ── Registration ──
    if (msg.role === 'display') {
      const code = generateCode();
      assignedRoom = code;
      role = 'display';
      rooms.set(code, { display: ws, controllers: new Set() });
      ws.send(JSON.stringify({ type: 'room', code }));
      console.log(`[Room ${code}] Display connected`);
      return;
    }

    if (msg.role === 'controller' && msg.code) {
      const room = rooms.get(msg.code);
      if (!room) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
        return;
      }
      assignedRoom = msg.code;
      role = 'controller';
      room.controllers.add(ws);
      ws.send(JSON.stringify({ type: 'joined', code: msg.code }));
      // Notify display
      if (room.display && room.display.readyState === 1) {
        room.display.send(JSON.stringify({ type: 'controller-connected', count: room.controllers.size }));
      }
      console.log(`[Room ${msg.code}] Controller joined (${room.controllers.size} total)`);
      return;
    }

    // ── Sensor data: forward from controller → display ──
    if (role === 'controller' && assignedRoom) {
      const room = rooms.get(assignedRoom);
      if (room) broadcast(room, msg, ws);
    }
  });

  ws.on('close', () => {
    if (!assignedRoom) return;
    const room = rooms.get(assignedRoom);
    if (!room) return;

    if (role === 'display') {
      // Notify all controllers
      room.controllers.forEach(c => {
        if (c.readyState === 1) c.send(JSON.stringify({ type: 'display-disconnected' }));
      });
      rooms.delete(assignedRoom);
      console.log(`[Room ${assignedRoom}] Display disconnected — room closed`);
    } else if (role === 'controller') {
      room.controllers.delete(ws);
      if (room.display && room.display.readyState === 1) {
        room.display.send(JSON.stringify({ type: 'controller-disconnected', count: room.controllers.size }));
      }
      console.log(`[Room ${assignedRoom}] Controller left (${room.controllers.size} remaining)`);
    }
  });

  ws.on('error', (err) => {
    console.error('[WS Error]', err.message);
  });
});

console.log(`🍤 Shrimp Fried Rice Relay Server running on ws://localhost:${PORT}`);
console.log(`   Game display connects → gets a room code`);
console.log(`   Controller joins with that code → sensor data flows`);
