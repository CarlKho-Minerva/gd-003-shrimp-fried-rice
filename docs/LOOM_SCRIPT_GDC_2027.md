# Loom Script — GDC Alt. Ctrl. 2027 Submission
## "Shrimp Fried Rice: Wok Controller + WebSocket Sensor Pipeline"
### Target: GDC Alt. Ctrl. judges, hardware game devs, experimental controller community
### Runtime: ~6 minutes | Format: screen + face cam + physical hardware close-ups
### Tone: confident, design-literate, shows decisions not just results

---

## WHAT GDC ALT. CTRL. JUDGES ARE LOOKING FOR

- **Novel input device** — not "weird for weird's sake" but grounded in design intent
- **Design coherence** — controller mechanics and game mechanics reinforce each other
- **Playability** — can a stranger pick it up and feel something in under 60 seconds?
- **Technical credibility** — you solved real problems, not just got it working once

The review question they're actually asking: *Does the physicality of the controller change what the game means?*

Your answer is yes, and here's why: a wok toss is the game's core power move *because* tossing food in a wok is exactly what you'd do to cook a shrimp.

---

## PRE-RECORDING SETUP

**Have ready:**
- Physical wok with ESP32 hardware mounted (if built), OR phone on wok handle with rubber band
- Terminal showing `./start.sh` output (QR visible, room code visible)
- Game running on a visible monitor (not just laptop screen — external display if possible)
- Second phone as the controller

**Key: the physical object should be the first thing they see.**

---

## [0:00–0:20] OPEN ON THE OBJECT

> *[No face cam yet. Just the wok in frame, preferably on a table with the circuit board visible on the handle.]*

> *[10 seconds of silence. Let them read the hardware.]*

> *[Then:]*

"This is the Shrimp Fried Rice wok controller. ESP32, MPU-6050 gyroscope, four piezo discs for hit zone detection. You toss it — the shrimp jumps. You hit the rim with a spatula — it registers which quadrant hit hardest and maps it to a world coordinate."

> *[Bring face cam in.]*

"But I want to talk about the design first, before the hardware. Because the hardware only matters if the design is coherent."

---

## [0:20–1:00] THE DESIGN ARGUMENT — why a wok specifically

"The game has three stages. Stage 1: you're a shrimp being cooked. Tilt the wok to move, toss to jump over obstacles, collect MSG to progress. Stage 2: the chef reaches into the wok — you swat his hand. Stage 3: role reversal. You become the chef. Same wok, same gestures, completely different meaning."

"The wok is the game's central image. The player is literally holding the thing their character is trapped inside. When you tilt it, you're not pressing a joystick — you're tilting the world. That's a different input paradigm."

"I could have used any gyroscope controller. A Joy-Con, a DualSense, a phone. But the wok ties the controller to the narrative in a way that a generic controller doesn't — the friction of holding a real cooking wok while navigating a virtual cooking wok creates the game's core emotional beat."

---

## [1:00–2:00] THE SENSOR PIPELINE — show it working

> *[Switch to game on monitor. QR code visible on title screen.]*

"The sensor pipeline supports three modes simultaneously: phone gyroscope over WebSocket, the ESP32 hardware wok over WiFi, or desktop keyboard fallback. All three feed into the same `processMotion()` function. The game has no idea which one is running."

> *[Pick up phone. Scan QR code.]*

"For demo contexts — GDC floor, playtesting — the phone mode is the practical path. Scan the QR, grant motion permissions, and you have a wok controller from any phone with a browser. No app install. I distributed this to 10 phones in under two minutes during our class demo."

> *[QR scanned, controller connected. Now play.]*

---

## [2:00–3:30] PLAY THROUGH ALL THREE STAGES (or accelerate through them)

> *[You've done this before. The key things to show per stage:]*

**Stage 1 (~45 seconds):**
- Tilt for movement — commentate the physical gesture mapping
- One successful toss to collect MSG — show the scale-up animation
- Mention calibration: "The game ran a 3-flick calibration before this and set my personal toss threshold. That normalization is why it doesn't feel like a fixed threshold."

**Stage 2 (~30 seconds):**
- Chef reaching in frame — swat it with a hard shake
- Comment: "Same gesture as the toss, just harder. No new verb to learn."

**Stage 3 (~30 seconds if you get there):**
"Now I'm the chef. The hands reaching in from outside — those are human players in a multiplayer context, or AI hands in the single player version. Same wok. Same gestures. Inverted power dynamic."

---

## [3:30–4:30] CALIBRATION SYSTEM — the technical decision that actually matters

> *[Switch to code or show the calibration screen.]*

"The hardest unsolved problem in alt-control games is inter-player variance. My flick force is different from yours. Most alt-control games solve this by making the threshold high enough that anyone triggers it, which kills precision."

"I built a 3-flick normalization system. Before the game starts, you flick the wok upward three times. The game averages your peak acceleration magnitudes, sets the toss threshold at 60% of your average, and sets the swat threshold at 110%. The game now speaks your specific biomechanical language."

"This is structurally identical to the electrode normalization in my capstone thesis on sub-vocal BCIs. The wok was the prototype for a method I'm using in a completely different domain."

---

## [4:30–5:15] CROSS-DEVICE COMPATIBILITY — the boring miracle

"I tested on 10 devices: iPhone 12 through 16 Pro Max, Pixel 6 Pro, Pixel 9a, iPhone SE 2024. Each one had a different failure mode."

"iOS requires separate explicit permission requests for `DeviceOrientationEvent` and `DeviceMotionEvent`. The v0.3 only asked for orientation. Tilt worked. Toss didn't. 45 minutes to find a one-line bug."

"Android Chrome auto-grants sensors over HTTPS, but some builds silently require a flag in `chrome://flags`. No error. No event. Just... silence."

"Every single failure mode was found by a human playtester. None of them would have shown up in automated testing because no emulator has an accelerometer."

"The sensor debug overlay I built — toggle with the bug button — shows real-time orientation, acceleration magnitude, threshold, device type, and permission status. I left it in the shipped build because demo conditions always produce edge cases."

---

## [5:15–6:00] CLOSE — what you're actually submitting

> *[Face cam, relaxed.]*

"For Alt. Ctrl. 2027, I'd be submitting the physical wok controller — the ESP32 build is documented in an Instructable — plus the browser game running locally via `./start.sh` on a MacBook."

"Setup for floor demo: laptop on table, game display on external monitor, wok on the table next to it. Player picks up the wok. That's the whole experience."

"The QR code adds a multiplayer dimension that I haven't fully explored yet — the relay architecture already supports N simultaneous controllers. Multiple shrimps, one wok, cooperative wave defense. That's what I'm building toward."

"Source is at github.com/CarlKho-Minerva/ShrimpFriedRice. Hardware build guide is in the repo. Play the browser version at carlcrafterz.itch.io/shrimp-fried-rice."

---

## SUPPLEMENTARY MATERIAL TO INCLUDE IN SUBMISSION

- Instructable PDF (from `docs/instructables_wok_controller.html` → print to PDF)
- Bill of materials table (~$25-45 total)
- Video of the physical wok toss triggering an in-game toss (close-up, slo-mo preferred)
- Cross-device compatibility testing photos (the Telegram screenshots are perfect)
- The calibration screen (screenshot showing the 3-dot progress UI)

## QUESTIONS TO PREP FOR (GDC judges often ask these)

**"Why not just use an existing alt-controller product?"**
Because the object needs to carry meaning. The wok isn't a novelty — it's the setting your character lives in. The controller is the narrative environment.

**"How does a first-time player discover the calibration mechanic?"**
The FTUE walkthrough added in v0.6 shows a calibration preview step (Step 4 of 5) before entering the actual calibration screen. Players see what's coming and understand why they're flicking before they have to.

**"What happens when the wok hardware isn't available?"**
Phone sensors work identically. The game has three fallback modes — it degrades gracefully all the way to keyboard controls.

**"What's the multiplayer path?"**
The relay already supports N controllers per room. The only missing piece is rendering multiple shrimps and assigning player IDs to sensor streams. That's game logic, not infrastructure.
