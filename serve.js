#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
 *  SERVE.JS — Combined Static Server + WebSocket Relay
 *  Shrimp Fried Rice — Self-Sufficient Local Setup
 *
 *  One process. One port. Serves build/ AND relays sensor data.
 *
 *  Usage:
 *    node serve.js                  # starts on port 3000
 *    PORT=8080 node serve.js        # custom port
 * ═══════════════════════════════════════════════════════════════ */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = parseInt(process.env.PORT || '3000', 10);
const BUILD_DIR = path.join(__dirname, 'build');

// ── In-memory Leaderboard ──
const DEFAULT_SCORES = [
  { name: 'YUKI',   time: 28, stage: 1 },
  { name: 'CARL',   time: 34, stage: 1 },
  { name: 'WATSON', time: 41, stage: 1 },
  { name: 'SHRIMP', time: 55, stage: 1 },
  { name: 'WOK',    time: 72, stage: 1 },
];
let serverScores = DEFAULT_SCORES.map(s => ({ ...s }));

// ── MIME Types ──
const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

// ── Static File Server ──
const server = http.createServer((req, res) => {
  // Health check endpoint for Render keep-alive
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }

  // Shared leaderboard — GET /scores
  if (req.url === '/scores' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(serverScores.sort((a, b) => a.time - b.time).slice(0, 10)));
    return;
  }

  // Shared leaderboard — POST /scores  { name, time, stage }
  if (req.url === '/scores' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const entry = JSON.parse(body);
        const name  = String(entry.name  || 'SHRIMP').toUpperCase().slice(0, 8);
        const time  = Math.round(Number(entry.time)  || 999);
        const stage = Number(entry.stage) || 1;
        serverScores.push({ name, time, stage });
        serverScores.sort((a, b) => a.time - b.time);
        if (serverScores.length > 50) serverScores = serverScores.slice(0, 50);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400); res.end('Bad Request');
      }
    });
    return;
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.end();
    return;
  }

  // Sanitize the URL to prevent directory traversal
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(BUILD_DIR, safePath === '/' ? 'index.html' : safePath);

  // Ensure the resolved path is within BUILD_DIR
  if (!filePath.startsWith(BUILD_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not Found');
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

// ── WebSocket Relay (same as relay-server.js, on same port) ──
const wss = new WebSocketServer({ server });
const rooms = new Map();

function generateCode() {
  let code;
  do {
    code = String(Math.floor(1000 + Math.random() * 9000));
  } while (rooms.has(code));
  return code;
}

wss.on('connection', (ws) => {
  let assignedRoom = null;
  let role = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

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
      if (room.display && room.display.readyState === 1) {
        room.display.send(JSON.stringify({ type: 'controller-connected', count: room.controllers.size }));
      }
      console.log(`[Room ${msg.code}] Controller joined (${room.controllers.size} total)`);
      return;
    }

    // Forward sensor data from controller → display
    if (role === 'controller' && assignedRoom) {
      const room = rooms.get(assignedRoom);
      if (room && room.display && room.display.readyState === 1) {
        room.display.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
    }
  });

  ws.on('close', () => {
    if (!assignedRoom) return;
    const room = rooms.get(assignedRoom);
    if (!room) return;

    if (role === 'display') {
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

  ws.on('error', (err) => console.error('[WS Error]', err.message));
});

// ── Get local network IP ──
function getLocalIP() {
  const os = require('os');
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

server.listen(PORT, () => {
  const ip = getLocalIP();
  console.log('');
  console.log('  🍤 Shrimp Fried Rice — Self-Sufficient Server');
  console.log('  ══════════════════════════════════════════════');
  console.log(`  Local:     http://localhost:${PORT}`);
  console.log(`  Network:   http://${ip}:${PORT}`);
  console.log('');
  console.log('  Static files + WebSocket relay on ONE port.');
  console.log('  For phone sensors, run ngrok:');
  console.log(`    ngrok http ${PORT}`);
  console.log('');
  console.log('  Or use ./start.sh to auto-launch everything.');
  console.log('');
});
