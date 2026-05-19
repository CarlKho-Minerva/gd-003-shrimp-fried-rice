# Media Guide — Shrimp Fried Rice
## What to photograph, screenshot, and capture for external use

*Covers: Medium post, itch.io page, GDC submission, social posts, assignment portfolio*

---

## PRIORITY 1 — Critical (every platform needs these)

### 1. Physical wok controller close-up
- **What:** Full top-down shot of the wok with ESP32 circuit on handle, 4 piezo disc sensors visible on the inner rim
- **Lighting:** Natural light or diffused — avoid flash glare on the circuit board
- **Why:** This is the thumbnail shot. It's the reason someone clicks on anything about this project.
- **Placeholder for now:** Use the Telegram screenshot of the hardware build if you have it

### 2. QR scan in action
- **What:** Someone pointing a phone camera at the laptop screen showing the QR code
- **Key detail:** Show both screens — laptop QR on the left, phone camera viewfinder on the right (over the shoulder shot)
- **Why:** Communicates the "zero install" UX story in one image

### 3. Person tilting the phone mid-gameplay
- **What:** Close-up of hands tilting a phone, with the game visible on a background screen
- **Crop:** Cut out the player's face if possible — focus the frame on the hands + tilt gesture
- **From playtest:** Benny or Dain — whoever showed the biggest tilt

### 4. Title screen with QR code displayed
- **Screenshot:** `SHRIMP FRIED RICE` title with the QR code generated and visible on screen
- **Resolution:** Full screen capture, not a phone photo of the screen

---

## PRIORITY 2 — Strong to have

### 5. The grin mid-game
- **What:** Candid face-reaction from playtest session — someone in the moment of tossing
- **Why:** This is the emotional proof point. The game is fun. The grin is the evidence.
- **From playtest:** "Angela or the guy with dreads mid-ORDER UP screen" (Watson session notes)

### 6. Stage 3 gameplay screenshot — wave defense
- **Screenshot:** Stage 3 active, multiple hands visible reaching from the rim, chef hat overlay, wave counter showing "WAVE 2" or "WAVE 3"
- **Why:** Shows the role-reversal payoff — the escalation that justifies the whole design

### 7. ESP32 wiring diagram photo
- **What:** Top-down of the protoboard or breadboard showing the MPU-6050 + piezo disc connections before they were mounted in the wok
- **Caption use:** For Instructable, HOSTING.md hardware section, any technical writeup

### 8. "ORDER UP!" victory screen
- **Screenshot:** The final win screen, ideally with a player reaction visible in the corner
- **Why:** Shows the game has a resolution — this is the emotional endpoint to contrast against the wok boot screen

---

## PRIORITY 3 — Nice for completeness

### 9. Calibration screen (3 flick progress)
- **Screenshot:** Calibration overlay showing 2 of 3 dots filled, the motion prompt visible
- **Why:** Proves the calibration UX exists — relevant for GDC submission, Instructable, and any technical write-up about normalization

### 10. Sensor debug overlay (🐛 mode)
- **Screenshot:** Title screen or gameplay with the debug panel showing real-time values — orientation alpha/beta/gamma, magnitude, threshold, device type
- **Why:** This is the "I'm a serious developer" signal. Shows you built real tooling, not just got it working once.
- **Tip:** Capture on an iPhone to show the iOS device type label

### 11. Terminal QR code output
- **Screenshot:** Terminal showing `./start.sh` output — room code, URLs, and the ASCII QR code in the terminal itself
- **Why:** Useful for the itch.io devlog, the HOSTING.md file, and any post about the workflow
- **How to capture:** Run `./start.sh` in a terminal, resize it to 100 columns, `cmd+shift+4` screenshot

---

## Architecture Diagram (already exists)

Use the ASCII architecture diagram from **Appendix A** of the assignment coversheet. Export it as an image for the Medium post and GDC submission. For a cleaner version, paste it into Excalidraw or draw.io and export as SVG.

---

## Platform-Specific Notes

### Medium post
Use in this order: title screen with QR → QR scan in action → person tilting phone → Stage 3 screenshot → terminal QR → hardware close-up

### itch.io page header
Wide-crop of the hardware wok controller (Priority 1 item #1). itch.io recommends 315×250px cover + 1920×1080 screenshots.

### GDC Alt. Ctrl. submission
The physical controller photo is the centerpiece. Annotate with labels pointing to ESP32, MPU-6050, piezo sensors. Export from Keynote or Figma with minimal overlaid text.

### Assignment portfolio
Include calibration screen + sensor debug overlay — these show the technical depth that isn't visible in regular gameplay screenshots.

---

## What You Probably Already Have

From the class playtest Telegram thread:
- Hardware build photos (pre-assembly and mounted)
- Phone tilt shots
- At least one grin photo

From your screen recording history:
- Title screen with QR
- Stage 3 gameplay
- ORDER UP screen

**Missing and worth staging:** The QR-scan-in-action photo (two-device shot). Takes 5 minutes to set up.
