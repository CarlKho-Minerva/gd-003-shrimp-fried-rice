https://docs.google.com/document/d/14i_sCoHF4eGbvvUeoiRJ26tLTpeNhFg4Dhc-7Ph1hlM/edit?pli=1&tab=t.0

| Name |  | Version Number | Date Uploaded |
| :---- | :---- | :---- | :---- |
| **[Carl Vincent Kho](mailto:kho@uni.minerva.edu)** |  | **6 (v0.6)** | **Mar 18, 2026** |
| **Individual Portfolio**  |  |  |  |
| **Notion Journal** |  |  |  |
| **Github Repository** | [https://github.com/CarlKho-Minerva/ShrimpFriedRice/](https://github.com/CarlKho-Minerva/ShrimpFriedRice/)  |  |  |
| **Itch.io Links** | [play](https://carlcrafterz.itch.io/shrimp-fried-rice) |  |  |
| **Other Materials** | Looms in portfolio page; [Portfolio Site](../portfolio/shrimp-fried-rice.html); [Wok Controller Instructable](docs/instructables_wok_controller.html); [Medium Post](docs/MEDIUM_POST.md) |  |  |
| **HCs Tagged (max 3\)** | `#designthinking`, `#medium`, `#multimodalcommunication` |  |  |

Each time you upload a new version of your portfolio, complete the following:

1. **Without reference to scores or learning outcomes, describe in 1-2 sentences how the class has been going for you so far.**

   This game forced me to think about input devices as part of the design, not an afterthought. Building a wok controller with IMU sensors made me appreciate that the *medium* of play (tilt, toss, shake) fundamentally changes how a game feels — the same mechanic on a keyboard versus a physical wok are two completely different experiences.

   I also confronted the reality that the narrative punch of "The Shrimp Fried the Rice" (role reversal → Ratatouille moment → wave defense) only works if the physical embodiment is convincing. The calibration system became the invisible hero of the project — without it, tossing a wok just feels random.

2. **Describe your weekly process. What has been effective? What are you planning to change?**

   Week 1 was pure brainstorming — dozens of non-shrimp concepts (vampire cooking show, durian defense, etc.) before committing to the wok-as-controller idea. Week 2 was building the core tilt/toss physics and sensor pipeline (ESP32 → WebSocket → browser). Week 3 was the Stage 3 redesign — Watson's feedback on "Froggy's Battle" as a model for upgrade systems led to a complete wave-defense rework (v0.4 → v0.5).

   What was effective: cross-device testing via ngrok across 7 real phones caught bugs no emulator would find (iPhone sensor permissions, Android Chrome sensor settings). What I'd change: I underestimated the Stage 3 design time and had to cut Kitchen Pandemonium (the original 4-column system) entirely for wave defense. Plan earlier, cut earlier.

3. **Which course objective is most worrying to you? Who is a classmate you think exemplifies this skill?**

   "Making the controller feel intuitive, not gimmicky." The wok toss calibration system works, but the gap between "I understand the mechanic" and "this feels *natural*" is still wide. There's a moment in playtesting where someone grins because the toss *worked* — that moment needs to happen in the first 10 seconds, not after a tutorial.

   **Classmate:** [insert name] — their project had a physical input mechanic that felt immediately intuitive without explanation.

4. **Explain how this class will help in future endeavors.**

   This game is directly feeding into my capstone thesis — SOMACH, a sub-vocal brain-computer interface. Both projects have the same core problem: mapping noisy biological signals (EMG from the throat in capstone, IMU from the wrist/wok here) into discrete, meaningful digital commands. The calibration system I built for this game (3-flick normalization) is structurally identical to the electrode normalization protocol in my capstone. I plan to publish an **arXiv paper** regarding these Human-Computer Interaction principles, further bridging the gap between game design and physiological research.

   Watson's insistence on "juice" (screen shake, slow-mo, procedural audio) also changed how I think about serious research interfaces. My capstone's biological HUD has better feedback design because I spent three weeks making a shrimp feel satisfying to toss. Additionally, writing comprehensive testing suites for device compatibilities (e.g., verifying core IMU motion on the iPhone 16 Pro) gave me a huge appreciation for maximizing coverage size before deploying to live venues like GDC and Alt.Ctrl.GDC.

5. **For each HC you tagged above, describe how it is related to the topic at hand. Alternatively, if your learning on this topic changed your understanding of an HC, or you think it's a bad fit, explain that mismatch instead.**

   **#designthinking:** The entire project was iterative prototyping under constraint. The wok sensor pipeline required 4 major pivots: (1) BLE → WiFi when Bluetooth latency was too high, (2) raw accelerometer → calibrated toss threshold when every person's "toss" force was different, (3) Kitchen Pandemonium → Wave Defense when the 4-column system was too complex for GDC's 1–3 minute sessions, (4) phone gyroscope fallback when the ESP32 hardware wasn't portable enough. Each pivot was driven by user testing, not speculation.

   **#medium:** The wok is the medium. Using a physical cooking wok as the input device isn't just novelty — it connects the game's narrative (you are a shrimp being cooked) to the player's body (you are literally tossing food). The procedural audio (100% Web Audio API, no samples) and the browser-native deployment both belong to the medium of "alt-control web games." The constraint of no Unity, no native app forced solutions that wouldn't exist in a traditional game engine.

   **#multimodalcommunication:** The game communicates across multiple channels simultaneously: visual (pixel-art wok, chef hat, screen flash), haptic (physical wok movement), auditory (procedural sizzle, toss whoosh, MSG collect chime), and kinesthetic (the player's body tilt maps 1:1 to the shrimp's movement). The "Ratatouille moment" in Stage 2→3 transition relies on ALL of these modalities hitting at once to land the emotional beat of "you are the chef now."

---

## Appendix A: QR Code Connection Pipeline — Technical Breakdown

### The Problem
Phone sensors (`DeviceMotionEvent`, `DeviceOrientationEvent`) require HTTPS. Local development uses ngrok, which generates a new random URL every session. Asking players to manually type a 40+ character URL on their phone is a non-starter for a 1–3 minute GDC demo.

### The Solution: One-Scan QR Connection
The entire connection pipeline is built on a **combined server** (`serve.js`) that handles both static file serving and WebSocket relay on a single port:

```
┌─────────────┐     HTTPS (ngrok)     ┌───────────────────┐
│  Phone      │◄──────────────────────►│  serve.js         │
│  (controller│    WebSocket relay     │  port 3000        │
│   .html)    │                        │  ┌─ Static files  │
└─────────────┘                        │  └─ WS relay      │
       │                               └───────────────────┘
       │  sensor data (orientation,           ▲
       │  motion, piezo hits)                 │
       ▼                               ┌─────┴─────┐
  Game display (index.html)             │  Laptop    │
  receives data, drives shrimp          │  browser   │
                                        └───────────┘
```

**Step-by-step flow:**
1. `serve.js` starts on port 3000, serving `build/` as static files AND running a WebSocket relay.
2. The game display (`index.html`) opens and the player clicks **GENERATE ROOM CODE**.
3. The display connects via WebSocket (`wss://{host}`) and sends `{ role: 'display' }`.
4. The server generates a random 4-digit room code, sends it back, and holds the connection.
5. The game generates a QR code encoding: `https://{host}/controller.html?relay={host}&code={room}`.
6. The player scans the QR code with any phone camera.
7. `controller.html` auto-fills the relay URL and room code from URL params.
8. The controller requests iOS/Android sensor permissions, connects via WebSocket with `{ role: 'controller', code: '1234' }`.
9. The relay server pairs controller → display by room code.
10. Sensor data streams at ~60Hz: `{ type: 'orientation', alpha, beta, gamma }` and `{ type: 'motion', x, y, z }`.
11. Game's `processMotion()` function handles all input identically regardless of source (local sensors, remote phone, or ESP32 hardware).

**Key code — QR generation** (`game.js`):
```javascript
function generateQRCode(text, container, size) {
  const img = document.createElement('img');
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=000000&color=4cd964`;
  container.innerHTML = '';
  container.appendChild(img);
}
```

**Key code — Relay pairing** (`serve.js`):
```javascript
if (msg.role === 'display') {
  const code = generateCode(); // random 4-digit
  rooms.set(code, { display: ws, controllers: new Set() });
  ws.send(JSON.stringify({ type: 'room', code }));
}
if (msg.role === 'controller' && msg.code) {
  const room = rooms.get(msg.code);
  room.controllers.add(ws);
  // Forward all subsequent messages to display
}
```

### Why This Architecture Matters
- **Zero configuration**: No Bluetooth pairing, no app install, no manual URL entry.
- **Cross-device**: Works on any phone with a camera and a browser (tested: iPhone 12–16 Pro Max, Pixel 6 Pro, Pixel 9a, iPhone SE 2024).
- **Scalable**: The room code system supports multiple simultaneous controllers—the multiplayer infrastructure is already built.

### Multiplayer Extension (Future Work)
The relay architecture already supports multiple controllers per room. `remoteControllerCount` tracks connected controllers, and `msg.count` updates on each connect/disconnect. To extend this to multiplayer:
1. Assign each controller a player ID on join (`controller-0`, `controller-1`, etc.)
2. Tag sensor messages with the player ID
3. Spawn multiple shrimps in the wok, each driven by a different controller
4. The wave defense stage (Stage 3) becomes cooperative: multiple shrimps defending the wok together

This is not speculative—the WebSocket relay already handles N controllers per room. The only missing piece is the game logic to render and drive multiple shrimp entities.

---

## Appendix B: FTUE Walkthrough (v0.6)

Added a 5-step first-time user experience (FTUE) onboarding slideshow that triggers automatically when a controller connects or when the player taps COOK:

| Step | Content | Purpose |
|------|---------|---------|
| 0 — Welcome | "You are a shrimp trapped in a sizzling wok." | Set narrative premise |
| 1 — Tilt | "Tilt your phone like a wok to slide." | Core movement mechanic |
| 2 — Flick & Swat | "Flick upward to toss. Shake hard to swat." | Secondary mechanics |
| 3 — The Goal | "Collect 5 MSG orbs. Yellow = health. Red = damage." | Objective + hazard system |
| 4 — Calibrate | "Hold flat, flick upward 3 times." | Calibration preview |

**Critical fix**: v0.5 skipped the tutorial entirely when a remote controller connected (`skipCalibration()` was called on `controller-connected` even from `STAGE.TITLE`). v0.6 routes through the full FTUE before entering calibration.
