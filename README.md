# 🍤 Shrimp Fried Rice

**GDC Alt. Ctrl. Prototype / Experimental Game — v0.4**

An experimental video game where you play as a shrimp navigating a wok, then *become* the chef. This project is designed for use with an actual cooking wok equipped with IMU sensors, translating natural cooking motions (tossing, rotating, tilting) into gameplay mechanics.

---

## 🎮 The Concept

1.  **Stage 1 — Survive**: You are a shrimp being fried. Tilt to slide, toss to collect MSG.
2.  **Stage 2 — Fight Back**: The chef reaches into the wok. Ram him while airborne, swat his hand away!
3.  **Upgrade Shop**: Spend your MSG on jump height, temperature resistance, oil capacity, or speed.
4.  **Stage 3 — Kitchen Pandemonium**: The shrimp becomes the chef. Top-down kitchen management — pick up ingredients, cook dishes, serve orders before they expire.

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

### Play on Phone (Recommended)
1.  Host the `/build` directory on a local server (e.g., `python3 -m http.server 8089`).
2.  Open the URL on your mobile browser (HTTPS required for sensors on some Android browsers).
3.  **Calibrate**: Follow the on-screen prompts (flick your phone up 3 times).

### Desktop Mode
If you don't have a phone/sensors available:
1.  Click **Desktop Mode** on the title screen.
2.  **Controls**:
    -   **Arrow Keys / WASD**: Tilt/Slide (S1/S2) or Move chef (S3)
    -   **Spacebar**: Toss (S1/S2) or Interact with station (S3)
    -   **Enter**: Swat (Stage 2)
    -   **Escape**: Skip calibration

### Debug Overlay
-   Tap the **🐛** button (bottom-right) to show/hide the sensor debug panel.
-   Shows real-time orientation, acceleration, magnitude, threshold, device type, and permission status.

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

*"If the shrimp can fry the rice, the shrimp can fry the chef... and then the shrimp can run the kitchen."*
