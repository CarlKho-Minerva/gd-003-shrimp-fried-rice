# Shrimp Fried Rice — GDC Alt. Ctrl. Prototype

A browser-based, sensor-driven arcade game where you play as a shrimp fighting for survival in a wok. Built for the GDC Alt. Ctrl. showcase, designed for both phone (motion controls) and desktop (keyboard fallback).

## Play Now
- Open `build/index.html` in your browser (mobile recommended)
- Or upload the zipped build to itch.io for public play

## Features
- **Tilt & Flick**: Use your phone's sensors to move and toss the shrimp
- **MSG Collectibles**: Gather MSG to power up and transform
- **Chef Boss Fight**: Survive the wok, then swat the chef's hand to escape
- **Calibration**: Personalized motion thresholds for every player
- **Desktop Mode**: Keyboard controls for testing/demo
- **Procedural Audio**: All sound effects generated in-browser

## Build Structure
```
game-3/
  build/
    index.html      # Main HTML shell
    config.js       # Tunable game constants
    style.css       # All styles
    game.js         # Game logic
  shrimp-fried-rice-v03.zip  # Itch.io-ready build
  CHANGELOG.md     # Full release notes
  README.md        # (this file)
```

## How to Run Locally
1. `cd game-3/build`
2. `python3 -m http.server 8089` (or use any static server)
3. Visit [http://localhost:8089](http://localhost:8089) on your phone or desktop

## Controls
- **Phone**: Tilt to move, flick up to toss, hard flick to swat chef
- **Desktop**: Arrow keys to move, Space to toss, Enter to swat

## Hardware Roadmap
- Piezo sensor for swat detection (impact)
- IMU (MPU-6050) for tilt/toss (hardware version)
- FSR for chef grab detection (optional)

## Credits
- Design & Code: Carl Vincent Kho (@cvk)
- Instructor: Prof. Watson, Minerva University
- For GDC Alt. Ctrl. 2026

---

See `CHANGELOG.md` for full release notes and design commentary.
