---
title: "Shrimp Fried Rice: Wok-Based Experimental Game"
shortTitle: "Shrimp Fried Rice"
date: "2025-03-15"
type: "PROJECT"
tech: "IMU Sensors, Accelerometer, Gyroscope, Arduino/ESP32, Game Development, Unity, Wok Controller"
venue: "GDC (Game Developers Conference) - Experimental Games Section"
location: "Taiwan (Development), San Francisco (Presentation)"
featured: true
status: "In Development"
---

## Key Achievements

- **Pioneered a novel game controller using an actual cooking wok** equipped with IMU sensors, translating natural cooking motions (tossing, rotating, tilting) into gameplay mechanics for submission to GDC's prestigious Experimental Games section.
- **Sourced and assembled custom hardware** by purchasing sensors and wok from Gong Hua Digital Plaza in Taiwan, demonstrating hands-on hardware prototyping skills beyond pure software development.
- **Designed a creative narrative game concept** where players experience role reversal—starting as a shrimp being cooked, gaining power through MSG, transforming into the chef, and "giving them a taste of their own medicine"—showcasing storytelling through gameplay.

## Overview

An experimental video game where players use an actual cooking wok equipped with IMU sensors as the controller. You play as a shrimp navigating a wok, eating MSG power-ups, gaining chef abilities, and ultimately giving the chef "a taste of his own medicine." Developed for submission to GDC's Experimental Games section.

## Game Concept

### The Story
1. **You are a shrimp** being cooked in a wok
2. **Eat MSG** to gain power and transform
3. **Become the chef** - role reversal
4. **The Discovery** - like Ratatouille's climax, chaos erupts when they realize WHO is cooking
5. **Kitchen Pandemonium** - staff panic, customers scream, health inspectors arrive
6. **Eliminate the chef** - give them a taste of their own medicine

### The Ratatouille Moment
Inspired by the iconic scene in *Ratatouille* where the kitchen discovers a rat has been cooking their food—**that moment of horrified realization** followed by absolute chaos:

- **The Reveal**: Customers/staff discover the chef is actually a transformed shrimp
- **Cascading Chaos**: Kitchen erupts—pans flying, people screaming, orders burning
- **Escalation**: Health department called, news crews arrive, social media explodes
- **Your Advantage**: Use the chaos to your benefit—dodge panicked chefs, weaponize flying ingredients, turn the pandemonium into your arena

The humor comes from the absurdity: they were *eating* your kind, and now *you're* in charge. The chaos isn't just environmental—it's psychological. The tables have turned, literally and figuratively.

### Physical Controller
- **Real wok** purchased from Gong Hua Digital Plaza in Taiwan
- **IMU sensors** attached to the wok
- **Natural wok movements** mapped to game controls:
  - Tossing motion → Jump/flip
  - Rotation → Character movement
  - Tilting → Direction control
  - Six-axis acceleration → Special abilities

## Technical Implementation

### Hardware
- **IMU Sensor Package**: 6-axis accelerometer and gyroscope
- **Microcontroller**: Arduino or ESP32 for sensor reading
- **Wok**: Actual cooking wok from Taiwanese electronics market
- **Wireless Communication**: Bluetooth or WiFi for sensor data streaming

### Sensor Mapping
- **Rotation (Yaw)**: Character horizontal movement
- **Tilting (Pitch/Roll)**: Camera angle or special movement
- **Acceleration**: Jump height, power-ups, chef abilities
- **Natural cooking motions**: Directly translated to gameplay mechanics

### Game Development
- **Engine**: Unity (planned) or similar game engine
- **Physics**: Realistic wok physics simulation
- **Controls**: Real-time sensor data to game input mapping
- **Visuals**: Stylized cooking/food aesthetic

## Materials Acquired

✅ **Wok**: Purchased from Gong Hua Digital Plaza
✅ **IMU Sensors**: 6-axis accelerometer/gyroscope modules
✅ **Microcontroller**: For sensor data processing
✅ **Components**: Wiring, power, communication modules

_Note: Frequent visitor to Gong Hua Digital Plaza for electronics components_

## Development Status

### Completed
- [x] Concept design and game mechanics
- [x] Hardware components acquired from Gong Hua Digital Plaza
- [x] IMU sensor selection and testing

### In Progress
- [ ] Sensor calibration and movement mapping
- [ ] Game engine setup and physics simulation
- [ ] Wok controller assembly and integration
- [ ] Gameplay programming
- [ ] Visual design and assets
- [ ] Testing and refinement

### Planned
- [ ] GDC submission to Experimental Games section
- [ ] Public demo and playtesting
- [ ] Documentation and showcase materials

## Target Venue: GDC Experimental Games

**Game Developers Conference (GDC)** is one of the world's largest professional game industry events. The **Experimental Games** section showcases innovative, boundary-pushing game designs that explore new interaction methods and gameplay concepts.

### Why This Game Fits
- **Novel Controller**: Using actual cooking equipment as input device
- **Physical Interaction**: Bridges digital and physical cooking experience
- **Cultural Element**: Incorporates Asian cooking culture and movements
- **Humor**: Playful narrative with role-reversal twist
- **Accessibility**: Intuitive, natural movements anyone can understand

## Design Philosophy

### Natural Motion
The wok controller uses movements that are already familiar to anyone who has cooked or seen Asian cooking:
- Tossing ingredients (common in stir-fry)
- Rotating the wok
- Tilting for sauce distribution
- Quick flipping motions

### Cultural Context
- Authentic wok purchased in Taiwan
- Celebrates Asian cooking culture
- MSG as a playful cultural reference
- Chef-shrimp relationship as game narrative

## Technical Challenges

1. **Sensor Calibration**: Mapping real-world wok movements to game controls
2. **Latency**: Ensuring responsive real-time gameplay
3. **Movement Recognition**: Distinguishing between different cooking motions
4. **Wireless Stability**: Reliable sensor data transmission during active play
5. **Player Safety**: Ensuring the wok controller is safe for energetic movement

## Related Projects

- **SoMach Biosensor Gaming** - Capstone project exploring alternative input methods
- **ESP32 NTU Makers Club** - Hardware prototyping experience
- **Watch for Silksong** - IMU sensor game control experience
- **GDC Line Queue Counter** - Other GDC-related tooling

## Inspiration

The project combines:
- **Ratatouille (Pixar)**: The core narrative arc mirrors Remy's journey—a creature society views as "food" or "pest" becoming the one in control of the kitchen. The key scene where the kitchen discovers a rat has been cooking, triggering mass panic and chaos, directly inspires the game's climactic "Discovery" phase. The thematic heart: *what if your food fought back?*
- **Alternative Controllers Movement**: Games like *Johann Sebastian Joust*, *Makey Makey*, and *Line Wobbler* prove unconventional input creates unforgettable experiences
- **Cultural Gaming**: Incorporating authentic Asian cooking culture and the controversial/beloved MSG
- **Physical Computing**: Bridging digital and physical worlds through embodied play
- **Experimental Gameplay**: GDC's spirit of "what if?" innovation
- **Food Horror Comedy**: The absurdist tradition of *Sausage Party*, *Food Fight*, and animated food narratives

## Exhibition Plan

Planning to demonstrate at GDC 2025:
- Live playable demo with actual wok controller
- Setup station for attendees to try
- Documentation of sensor data visualization
- Behind-the-scenes technical breakdown
- Cultural context and inspiration presentation

## Links

- GitHub: _In development_
- Demo Video: _Coming soon_
- GDC Submission: _Pending_
- Build Log: _In progress_

## Source

Project concept and hardware acquisition details from voice transcriptions (Oct 30, 2024). Technical development ongoing in Taiwan.

---

_"I'm gonna be making for GDC is shrimp fried rice it's a shrimp fried rice video game using an actual wok and some IMU sensors I bought here in Taiwan... you playing as a shrimp in a wok and then eating MSG and then you become the chef and then... you have to eliminate the chef and treat the chef basically give the chef a taste of his own medicine quite fun game uses a lot of rotation six accelerations and natural wok stuff"_ - Carl Kho
