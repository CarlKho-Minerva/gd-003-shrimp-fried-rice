# 🍤 Shrimp Fried Rice

**GDC Alt. Ctrl. Prototype / Experimental Game**

An experimental video game where you play as a shrimp navigating a wok. This project is designed for use with an actual cooking wok equipped with IMU sensors, translating natural cooking motions (tossing, rotating, tilting) into gameplay mechanics.

---

## 🎮 The Concept

1.  **Survive**: You are a shrimp being fried. Tilt to slide, shake to toss.
2.  **Transform**: Collect MSG to gain power and transform.
3.  **Retribution**: The chef takes matters into his own hands. Fight back and give them a taste of their own medicine!

Inspired by the "Ratatouille moment"—the absurd chaos that erupts when the culinary world realizes *who* is actually doing the cooking.

---

## 🛠 Features

-   **Alt. Ctrl. Support**: Designed for IMU-equipped wok hardware (or phone sensors).
-   **Procedural Audio**: 100% code-generated sound effects via Web Audio API.
-   **Mobile Sensors**: Play in the browser on your phone—uses `DeviceMotionEvent` for tilt & shake.
-   **Calibration System**: Built-in 3-flick calibration to map your physical tossing strength to game logic.
-   **Modular Design**: Clean separation of configuration (`config.js`), logic (`game.js`), and presentation (`style.css`).

---

## 🚀 Getting Started

### Play on Phone (Recommended)
1.  Host the `/build` directory on a local server (e.g., `python3 -m http.server`).
2.  Open the URL on your mobile browser.
3.  **Calibrate**: Follow the on-screen prompts (flick your phone up 3 times).

### Desktop Mode
If you don't have a phone/sensors available:
1.  Click **Desktop Mode** on the title screen.
2.  **Controls**:
    -   **Arrow Keys / WASD**: Tilt/Slide
    -   **Spacebar**: Toss
    -   **Enter**: Swat (Stage 2)
    -   **Escape**: Skip calibration

---

## 🏗 Project Structure

-   `build/`: The core game build for web/itch.io.
    -   `index.html`: Main entry point.
    -   `game.js`: Game engine and logic.
    -   `config.js`: Tunable constants and difficulty balance.
    -   `style.css`: Visual styling.
-   `CHANGELOG.md`: Detailed history of versions and hardware roadmap.
-   `shrimp-fried-rice-v03.zip`: Production-ready bundle.


---

## 🔧 Hardware Roadmap (GDC Alt. Ctrl.) — Not Yet Implemented

For the full arcade experience (future build):
-   **Wok**: A standard cooking wok.
-   **Sensors**:
    -   **MPU-6050 (IMU)**: For 6-axis motion tracking.
    -   **Piezo Element**: Attached to the wok exterior for impact detection (swats).
    -   **FSR (Force-Sensitive Resistor)**: Under the wok feet to detect pressure.
-   **ESP32**: To stream sensor data to the browser via WebSockets.

See [CHANGELOG.md](CHANGELOG.md) for full roadmap notes including Stage 3 "Kitchen Pandemonium" concept.

---

## 📜 Acknowledgments

Developed as part of the CS156 / Gamedev curriculum at Minerva University.
Special thanks to **Professor Watson** and the **Gong Hua Digital Plaza** electronics community in Taiwan for hardware inspiration.

*"If the shrimp can fry the rice, the shrimp can fry the chef."*
