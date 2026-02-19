# 🍤 Shrimp Fried Rice

**GDC Alt. Ctrl. Prototype / Experimental Game — v0.5**

An experimental video game where you play as a shrimp navigating a wok, then *become* the chef. This project is designed for use with an actual cooking wok equipped with IMU sensors, translating natural cooking motions (tossing, rotating, tilting) into gameplay mechanics.

---

## 🎮 The Concept

1.  **Stage 1 — Survive**: You are a shrimp being fried. Tilt to slide, toss to collect MSG.
2.  **Stage 2 — Fight Back**: The chef reaches into the wok. Ram him while airborne, swat his hand away!
3.  **Upgrade Shop**: Spend your MSG on jump height, temperature resistance, oil capacity, or speed.
4.  **Stage 3 — Defend Your Wok**: The shrimp fried the rice. You're the chef now — wear the hat, defend your ingredients from waves of human hands reaching into the wok. Same tilt/toss/swat mechanics, no new cognitive load. 3 escalating waves.

Inspired by the "Ratatouille moment"—the absurd chaos that erupts when the culinary world realizes *who* is actually doing the cooking.

---

## 🛠 Features

-   **Three-stage progression**: Wok survival → chef battle → kitchen management with upgrade shop in between.
-   **Alt. Ctrl. Support**: Designed for IMU-equipped wok hardware (or phone sensors).
-   **Procedural Audio**: 100% code-generated sound effects via Web Audio API (10 sound types).
-   **Mobile Sensors**: Play in the browser on your phone—uses `DeviceMotionEvent` + `DeviceOrientationEvent` for tilt & shake.
-   **iOS + Android**: Full compatibility — requests both orientation AND motion permissions on iOS; auto-grants on Android.
-   **Calibration System**: Built-in 3-flick calibration to map your physical tossing strength to game logic.
-   **Sensor Debug Overlay**: Real-time accelerometer/orientation viewer (🐛 toggle) for cross-device testing.
-   **Upgrade System**: MSG currency → 4 upgrade paths (Watson's Froggy's Battle model).
-   **Modular Design**: Clean separation of configuration (`config.js`), logic (`game.js`), and presentation (`style.css`).

---

## 🚀 Getting Started

### Play on Phone via ngrok (Recommended)

Sensors require HTTPS. The easiest cross-device method is [ngrok](https://ngrok.com/):

```bash
# Terminal 1 — local server
cd game-3/build
python3 -m http.server 8080

# Terminal 2 — ngrok tunnel (gives you an HTTPS URL)
ngrok http 8080
```

ngrok prints a forwarding URL like:
```
Forwarding    https://abcd-12-34-56-78.ngrok-free.app -> http://localhost:8080
```

**On any phone**, open exactly that `https://abcd-…ngrok-free.app` URL. Do NOT use `http://<mac-ip>:8080` — that's plain HTTP and sensors won't work.

#### Android (Chrome) — Enabling Sensors
1.  Open the ngrok HTTPS URL in Chrome.
2.  In the address bar, tap the **lock icon** (or **tune/sliders icon** on newer Chrome).
3.  Tap **Permissions** → **Site settings**.
4.  Find **Motion sensors** (or **Sensors**) → set to **Allow**.
5.  Reload the page. Tilt should now work.

> If the sensor debug HUD still says "no events yet" after allowing, force-close Chrome and reopen.

#### iOS (Safari) — Enabling Sensors
1.  Open the ngrok HTTPS URL in Safari.
2.  The game will show a **"Grant Sensor Access"** button.
3.  Tap it — iOS will prompt for both orientation and motion permissions. **Allow** both.
4.  If you accidentally denied, go to **Settings → Safari → Advanced → Website Data** → clear the ngrok domain, then reload.

#### Sharing with Remote Playtesters
- The ngrok URL works from **anywhere in the world** — just send the link.
- Keep the `ngrok http 8080` terminal running on your Mac.
- Free ngrok sessions expire after ~2 hours; restart if needed.
- For a permanent URL, consider deploying to **itch.io** (see below), or see **[HOSTING.md](HOSTING.md)** for step-by-step guides for Vercel, Netlify, Cloudflare Pages, GitHub Pages, and itch.io.

### Hosting on itch.io
1.  Zip the `build/` folder contents (index.html, game.js, config.js, style.css).
2.  Upload to [itch.io](https://itch.io/) as an **HTML** game.
3.  Set viewport to **480×800** (portrait).
4.  itch.io serves over HTTPS, so sensors work automatically.
5.  On iOS, Safari will still prompt for sensor permissions.
6.  On Android Chrome, sensors should auto-grant over HTTPS.

> **Note**: itch.io embeds games in an iframe. If sensors are blocked, the player may need to click "Run game" or open in a new tab.

### Desktop Mode
If you don't have a phone/sensors available:
1.  Click **Desktop Mode** on the title screen.
2.  **Controls**:
    -   **Arrow Keys / WASD**: Tilt/Slide
    -   **Spacebar**: Toss (S1/S2), Swat hands (S3)
    -   **Enter**: Swat (Stages 2 & 3)
    -   **Escape**: Skip calibration

### Debug Overlay
-   Tap the **🐛** button (bottom-right) to show/hide the sensor debug panel.
-   Shows real-time orientation, acceleration, magnitude, threshold, device type, and permission status.
-   Works on **all screens** (title, calibration, gameplay) — useful for diagnosing sensor issues before starting a game.

---

## 🏗 Project Structure

-   `build/`: The core game build for web/itch.io.
    -   `index.html`: Main entry point (title screen, HUD, upgrade shop, S3 HUD, debug overlay).
    -   `game.js`: Game engine and logic (~1900 lines).
    -   `config.js`: Tunable constants, difficulty balance, and upgrade definitions.
    -   `style.css`: Visual styling (animated title, kitchen theme, debug panel).
    -   `index_v02_backup.html`: Preserved monolithic v0.2 backup.
-   `CHANGELOG.md`: Detailed history of versions, Watson feedback integration, and hardware roadmap.

---

## 🔧 Hardware Roadmap (GDC Alt. Ctrl.) — Not Yet Implemented

For the full arcade experience (future build):
-   **Wok**: A standard cooking wok.
-   **Sensors**:
    -   **MPU-6050 (IMU)**: For 6-axis motion tracking.
    -   **Piezo Element**: Attached to the wok exterior for impact detection (swats).
    -   **FSR (Force-Sensitive Resistor)**: Under the wok feet to detect pressure.
-   **ESP32**: To stream sensor data to the browser via WebSockets.

See [CHANGELOG.md](CHANGELOG.md) for full roadmap notes.

---

## 📜 Acknowledgments

Developed as part of the Gamedev course at Minerva University.
Special thanks to **Professor Watson** for the upgrade-system feedback (Froggy's Battle model, "every subsystem must be fun") and the **Gong Hua Digital Plaza** electronics community in Taiwan for hardware inspiration.

### Compatibility Playtesters

Tested across multiple iOS and Android devices via ngrok HTTPS tunnel (Feb 19, 2026):

| Device | Tester |
| :--- | :--- |
| iPhone 16 Pro | **Benny** (also helped debug sensor permission flow) |
| iPhone 14 Pro | **Dain** |
| iPhone 12 | **Chelsea** |
| iPhone SE (2024) | **Angela** |
| iPhone 16 | **Manu** |
| Pixel 6 Pro | Carl (dev) |
| M4 MacBook Air | Carl (dev, desktop mode) |

*"If the shrimp can fry the rice, the shrimp can fry the chef... and then the shrimp can defend the whole kitchen."*
