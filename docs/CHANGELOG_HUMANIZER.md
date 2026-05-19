# Shrimp Fried Rice — Humanizer Changelog
## What changed, why, and what NOTAI patterns were caught

---

## MEDIUM_POST.md

### Opening paragraph — rewritten
**Pattern caught:** Formulaic AI opener ("There's a moment in every X where...") + "This is the story of how I got here" narrative framing + inflated significance

**Before:**
> There's a moment in every experimental hardware project where the thing you built stops being a prototype and starts being *an experience*. For me, it happened when...
> This is the story of how I got here, what broke along the way, and what I learned about the strange, under-appreciated gap between *input devices* and *game design*.

**After:**
> Benny tilted his phone, watched a pixel shrimp slide across a virtual wok, flicked upward, and grinned. Half the sensor pipeline was still held together with ngrok and a prayer, but the toss *felt right*...
> Here's what I built, what broke, and the specific gap between *input devices* and *game design* that nobody tells you about.

**Why:** Opens with a concrete moment instead of a vague thesis. "Here's what" is direct; "the story of how I" is a ChatGPT warm-up run.

---

### "Tilt, toss, and shake" paragraph
**Pattern caught:** "This turns out to be a more interesting design question than it sounds" (hedging + filler), rule of three over-explaining, em dash mid-sentence

**Before:**
> This turns out to be a more interesting design question than it sounds. Tilt, toss, and shake are three distinct physical gestures that map naturally onto three game mechanics: movement, jump, and attack. But "naturally" is doing enormous heavy lifting in that sentence.

**After:**
> Tilt, toss, and shake map onto three game mechanics: movement, jump, and attack. "Naturally" is doing a lot of work in that sentence.

**Why:** Removed the hedging sentence entirely — the point about "naturally" does the work itself better without the setup.

---

### Juice/audio paragraph
**Pattern caught:** "This sounds overcomplicated until you realize..." (formulaic reveal structure), inflated significance ("Every hit of feedback makes the physical gesture feel more connected to the virtual response"), bold emphasis on Watson quote felt AI-applied

**Before:**
> This sounds overcomplicated until you realize it means the game *sounds* like frying in real-time... Watson's note: **"juice."** Screen shake, slow-mo on swat, procedural audio. Every hit of feedback makes the physical gesture feel more connected to the virtual response.

**After:**
> It sounds overcomplicated until you realize the game literally *sounds* like frying in real-time... Watson calls this "juice": screen shake, slow-mo on swat, procedural audio. Individually they're fine. Together, each physical gesture feels like it actually landed.

**Why:** "Individually/Together" contrast is more specific than "every hit of feedback makes the gesture feel more connected." That phrase is vague and self-important.

---

### QR code paragraph
**Pattern caught:** "This sounds trivial, but it solved the hardest problem of the project" — negative parallelism + superlative framing

**Before:**
> No app install. No Bluetooth pairing. No configuration. **Scan, allow sensors, play.** The entire connection process takes about 5 seconds.
> This sounds trivial, but it solved the hardest problem of the project: *getting a phone's sensors into a desktop browser over HTTPS*.

**After:**
> **Scan, allow sensors, play.** Five seconds total.
> This solved the actual hard problem: *getting a phone's sensors into a desktop browser over HTTPS*.

**Why:** "The entire connection process takes about 5 seconds" is filler. "This sounds trivial, but" is a classic LLM transition. Cut both.

---

### "What I Actually Learned" section
**Pattern caught:** Inline-header vertical list (bold + colon), rule of three in structure, "single most important" superlative, "The connection wasn't planned. It was obvious in retrospect" — AI-style dramatic reveal

**Before:**
> 1. **The controller IS the design.** A tilt-based game on a keyboard is...
> 2. **Calibration is invisible UX.** My 3-flick normalization routine—...is the single most important piece of code in the entire project.
> 5. **This feeds my capstone.** ...The connection wasn't planned. It was obvious in retrospect.

**After:**
> The controller is the design, not a delivery mechanism for the design. [paragraph prose]
> Calibration is UX nobody sees. [paragraph prose]
> The part I didn't anticipate: this project is structurally identical to my capstone thesis.

**Why:** Converted Bold+Colon list to flowing prose. "The single most important piece of code" is a superlative AI pattern. "Obvious in retrospect" is a weasel reveal. Replaced with "I only realized it halfway through building the calibration screen" — specific moment, not dramatic synthesis.

---

### Section heading
**Before:** `## What I Actually Learned`
**After:** `## What I actually took away`

**Why:** Title case in headings is a NOTAI flag. Also "actually learned" is a slightly condescending frame (implies everything before was fake learning).

---

## Assignment Coversheet — Q4

**Pattern caught:** "Beyond that, Watson's insistence on... taught me that even in serious research interfaces, *feel* matters" — "Beyond that" is a NOTAI-flagged transition word; "owes its polish to the lessons from" is inflated connective language

**Before:**
> Beyond that, Watson's insistence on "juice" (screen shake, slow-mo, procedural audio) taught me that even in serious research interfaces, *feel* matters. My capstone's biological HUD owes its polish to the lessons from making a shrimp satisfying to toss.

**After:**
> Watson's insistence on "juice" (screen shake, slow-mo, procedural audio) also changed how I think about serious research interfaces. My capstone's biological HUD has better feedback design because I spent three weeks making a shrimp feel satisfying to toss.

**Why:** "Owes its polish to the lessons from" is AI synonym cycling. "Has better feedback design because I spent three weeks..." is direct causation.

---

## Assignment Coversheet — #medium HC

**Pattern caught:** "The wok IS the medium" (all-caps emphasis is an AI decoration), "isn't just novelty" (negative parallelism), "forced creative solutions that wouldn't exist in"

**Before:**
> The wok IS the medium... The constraint of browser-only deployment (no Unity, no native app) forced creative solutions that wouldn't exist in a traditional game engine.

**After:**
> The wok is the medium... The constraint of no Unity, no native app forced solutions that wouldn't exist in a traditional game engine.

**Why:** All-caps is NOTAI emojis-equivalent in written prose. "Creative solutions" → "solutions" (the detail is already in the constraint description; "creative" is decorative).

---

## What was NOT changed

- All code blocks, technical details, architecture diagrams — factual, no AI patterns
- The bug breakdown section ("Cross-Device Compatibility: The Boring Miracle") — already human voice, specific bugs, no AI isms
- The stage descriptions (Stage 1/2/3) — direct and concrete
- The technical specs table
- The Appendix A/B in the coversheet — technical documentation doesn't need to "sound human"
- The Instructables HTML — was written with direct technical language, only the step 5 → 8 additions I wrote were already concrete

---

## v0.6 Full Change Summary (all files)

| File | Change Type | Summary |
|------|-------------|---------|
| `build/index.html` | Code — FTUE | Added 5-step walkthrough (step 0 welcome + step 4 calibrate preview); expanded from 3 steps to 5 |
| `build/game.js` | Code — FTUE | `startTutorial()` now starts from step 0; `TUTORIAL_TOTAL_STEPS = 5`; controller-connected on title now triggers tutorial instead of `skipCalibration()` |
| `docs/MEDIUM_POST.md` | New file → humanized | Full Medium blog post; 7 NOTAI patterns fixed |
| `docs/MEDIA_GUIDE.md` | New file | Screenshot/image guide for Medium post and portfolio |
| `docs/LOOM_SCRIPT_EXTERNAL.md` | New file | Demo script for general audiences |
| `docs/LOOM_SCRIPT_GDC_2027.md` | New file | Demo script for GDC Alt. Ctrl. 2027 submission |
| `docs/CHANGELOG_HUMANIZER.md` | New file | This document |
| `docs/instructables_wok_controller.html` | Expanded | Added steps 6 (troubleshooting), 7 (wiring reference + BOM), 8 (calibration tips) |
| `HOSTING.md` | Rewritten | Full itch.io guide, relay hosting options, Steam/GOG/Epic section |
| `CHANGELOG.md` | Updated | v0.6 entry added |
| `[Kho GD003...] Assignment Coversheet...md` | Updated | Version bump to v0.6, added Appendix A (QR pipeline) + Appendix B (FTUE); humanized Q4 and #medium HC |
| `session-10/CHEAT_SHEET.md` | New file | Class discussion prep for Brown + Doherty readings, Dave the Diver, Frog Factions |
