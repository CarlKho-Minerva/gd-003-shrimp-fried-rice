# Loom Script — External Audience Demo
## "Shrimp Fried Rice: A Browser Game Controlled by Your Phone"
### Target: curious non-devs, indie game followers, social media, portfolio viewers
### Runtime: ~4 minutes | Format: screen recording with face cam

---

## PRE-RECORDING SETUP

**Have open:**
- Terminal with `./start.sh` already running (QR code visible)
- Browser with game at title screen
- Phone within arm's reach, Safari/Chrome ready

**Don't have open:** Sensor debug overlay, code editor, anything technical-looking. This is a player-facing demo.

---

## [0:00–0:15] COLD OPEN — Show the wok first

> *[Turn on face cam. Hold up the actual wok controller or your phone.]*

"This is my game controller."

> *[Beat. Let it sit.]*

"It's a wok."

> *[Smile. Cut to screen.]*

---

## [0:15–0:45] THE GAME IN 30 SECONDS

> *[Title screen is visible. Start talking over it.]*

"Shrimp Fried Rice is a browser game — you play as a shrimp trapped in a hot wok. You tilt your phone like you're actually cooking to move the shrimp. Shake it to jump. You collect MSG power-ups, fight the chef's hand that keeps reaching in, and then something weird happens in Stage 3 that I won't spoil."

> *[Click GENERATE ROOM CODE.]*

"Watch how you connect your phone."

---

## [0:45–1:30] THE QR CODE MOMENT — the demo centerpiece

> *[QR code appears on screen. Pick up your phone.]*

"Scan this."

> *[Point camera at screen. Controller page loads.]*

"That's it. No app download. No Bluetooth. No typing a URL. It just detected the room code and the relay server from the QR. I'm going to tap Connect Sensors now."

> *[Tap connect. Grant permissions on iOS if prompted.]*

"On iPhone, Safari asks for motion permission. I tap Allow. On Android, it just works. Now —"

> *[Game screen shows controller connected indicator.]*

"My phone is the wok controller."

---

## [1:30–2:45] ACTUALLY PLAY IT

> *[Tilt phone. Shrimp moves. Let this be natural — don't narrate everything.]*

"Okay so tilt moves the shrimp... collecting oil keeps me alive..."

> *[Flick upward. Shrimp jumps.]*

"That flick just triggered a toss. The game calibrates to your specific wrist strength — it's not a fixed threshold. So if you flick gently you get a toss, if you shake hard you swat."

> *[Try to collect MSG. Die if you die — that's fine, it's a demo.]*

"This is Stage 1. Collect five of those white orbs. If you run out of oil you get burned."

> *[Either get to Stage 2 or cut here.]*

---

## [2:45–3:20] THE TECHNICAL BIT (keep it light)

> *[Switch to screen-only for a moment. Show the 4-file build folder.]*

"The whole game is four files. No framework, no build step. Audio is procedurally generated — there are zero sound files. The sizzle gets louder when the shrimp is still, quieter when it's moving, because that's what frying actually sounds like."

> *[Briefly show the QR code code snippet or the architecture diagram.]*

"The QR code encodes the relay URL and room code. Your phone streams gyroscope data over WebSocket to the game at 60 frames per second. I tested this on 10 different phones — iPhones, Pixels, an iPhone SE."

---

## [3:20–4:00] CLOSE

> *[Back to face cam.]*

"I built this for a game design class at Minerva University. The assignment was: make an alternative controller. Most people picked interesting output mechanics. I got stuck on the input."

> *[Hold up wok again if available.]*

"This is what happens when you see a gyroscope module and a cooking wok at the same market stall."

"You can play it right now at carlcrafterz.itch.io/shrimp-fried-rice — just open it on your phone. If you want to build the actual wok hardware, there's an ESP32 build guide in the description. It costs about $25 in parts."

> *[Smile, end recording.]*

---

## OVERLAY TEXT / CAPTIONS TO ADD IN EDIT

- [0:15] "play in browser · no download"
- [0:45] "scan QR → phone becomes controller"
- [1:10] "iOS: tap Allow for motion sensors"
- [2:50] "4 files · zero audio samples · vanilla JS"
- [3:35] "play at carlcrafterz.itch.io/shrimp-fried-rice"

## THUMBNAIL OPTIONS

- Close-up of QR code with phone scanning it, wok visible in background
- Phone showing "ORDER UP! 🍤👨‍🍳" victory screen being held up (use Takaya's photo)
- Split: wok hardware on left, game running on right

---

## B-ROLL WORTH CAPTURING SEPARATELY

1. Phone slow-tilt — shrimp sliding across wok, timed to the sizzle audio ramping down
2. QR scan from phone's perspective (screen recording on phone while laptop runs game)
3. The actual wok hardware: ESP32 + MPU-6050 mounted on handle, piezos on the bottom
4. The "COOK AGAIN" button on a real phone someone's holding (use any of the playtest photos)
