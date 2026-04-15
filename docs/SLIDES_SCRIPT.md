# Shrimp Fried Rice — GD-003 Presenter Script
**GDC Alt. Ctrl. Prototype · Carl Kho · Minerva 2026**

---

> **How to use this:** Each slide section has a target duration, cues for physical actions, and the actual words. The words are a starting point — say them in your own voice, not like you're reading. The goal is one minute per slide, ten minutes total, with two minutes of live play at the end.

---

## Slide 01 — Title
**Target:** 45 seconds

*[Stand next to the screen. The shrimp is bobbing. Don't rush past this.]*

"This is Shrimp Fried Rice. It's a game where your phone is a wok and a shrimp is trapped inside it.

The design thesis is one sentence: **the controller and the narrative are the same object.** When you tilt the wok, you're not pressing a button. You're physically moving the world the character lives in.

It's live right now. You can play it. We'll get to that."

---

## Slide 02 — The Design Argument
**Target:** 60 seconds

*[Gesture to the wok circle illustration with the shrimp inside.]*

"Here's the core argument.

Traditional alt controllers are props. You hold a guitar. You balance on a board. The input is physical but the character's world is still just a screen. There's still a layer of abstraction between your body and what's happening.

This removes that layer.

When I tilt the wok, the shrimp slides toward the hot side. When I flick it up, the shrimp actually goes airborne — and because it's a real toss, not a perfect throw, there's drift mid-air. The physics comes from the gesture, not from a joystick emulating a gesture.

The controller isn't inspired by the narrative. It *is* the narrative."

---

## Slide 03 — Stage 1 Mechanics
**Target:** 75 seconds

*[Point to each of the three columns in turn. This is the densest technical slide — keep it concrete.]*

"Stage 1 is what's shipped. Three mechanics.

**Tilt.** The phone reads `DeviceOrientation` — gamma for left-right, beta for forward-back. That maps directly to shrimp position. It's fully analog. Slow tilts, slow movement.

**Jump.** A rapid spike in the beta axis triggers the jump. The game reads acceleration, not just position. And the drift carries through mid-air — if you were tilting slightly left when you jumped, the arc drifts left. Because that's what a real toss does.

**Collect and survive.** Five MSG crystals and you're done. Oil drops are health. Red hazards drain it. Your time is your score.

*[Point to the oil bar.]*

That bar at the bottom is pulled directly from the game. Green when you're healthy. It gets anxious-looking when it drops."

---

## Slide 04 — Sensor Pipeline
**Target:** 60 seconds

*[Read the pipeline left to right. Pause on the room code.]*

"Here's how the phone actually talks to the game.

No Bluetooth. No USB. No app install. You open a URL on your phone.

The display generates a 4-digit room code. You type it in on the controller page. Done. Your phone is now sending orientation data over WebSocket to a Node.js relay, which forwards it to the browser running the game.

*[Point to the room code: 3124.]*

The relay is a Map of room codes to two WebSockets — one display, one controller. The relay doesn't know anything about the game. It just routes. The whole server is 230 lines.

The reason I went WebSocket over the phone's accelerometer was: I wanted nothing between the player and the sensor data. DeviceMotion has 60Hz native. That's plenty for a game at 60fps."

---

## Slide 05 — Playtester Feedback
**Target:** 75 seconds

*[Take a breath. These quotes are the proof. Let them land.]*

"These are real quotes from in-class sessions. I'm going to read them straight.

*'Okay let me play it again. We gotta finish you know.'*

That's the one. That happened after completing Stage 1 on the first try. They weren't stuck, they weren't frustrated — they had just won, and immediately wanted to replay. That's the design working.

*'Wait, I'm moving the shrimp with my hand? Like — I'm the wok?'*

That moment, realizing the input model mid-game — I cannot script that. That's why the controller-narrative connection works. It's not explained. It's discovered.

*[Pause.]*

The jump quote is the one I'm most proud of. 'The jump feels exactly right. Like tossing food.' That's the accelerometer drift doing its job.

And the leaderboard? That one wasn't planned. Someone asked where they could see their score and send it to a friend. That's why it exists."

---

## Slide 06 — Technical Stack
**Target:** 60 seconds

*[Keep this crisp. You're proving you made deliberate, justified choices, not random ones.]*

"Zero framework. Zero build step. This is a deliberate choice, not a limitation.

**Frontend:** One `game.js` file. Canvas 2D. Web Audio API for the procedural sound effects. I didn't need React — I needed a render loop and some DOM manipulation. Adding a framework would have made this worse.

**Server:** `serve.js`. 230 lines. HTTP static serving and WebSocket relay on the same port, no Express. It's faster than anything with dependencies and it's readable by any JavaScript developer in three minutes.

**Hosting:** Render free tier with auto-deploy on GitHub push. The build step is `git push`.

**Persistence:** Upstash Redis via REST API. No SDK, no connection pool. Just `fetch`. The leaderboard survives any restart or redeploy."

---

## Slide 07 — Infrastructure
**Target:** 60 seconds

*[This is the moment where you show you actually thought about production. It's not throwing it on a laptop.]*

"Render free tier spins down after 15 minutes of inactivity. That would kill a live demo session if someone walks up between players.

The fix: UptimeRobot pings `/health` every 5 minutes. `/health` returns two bytes: `ok`. That's enough to keep the process warm.

I tried cron-job.org first. It failed — 26 times in a row, auto-disabled itself. The reason: Render serves a large Cloudflare HTML page during cold starts, before Node.js boots. cron-job's response-size limit tripped on that. UptimeRobot only checks the HTTP status code. Never trips.

*[Point to 'Connected · modest-grizzly'.]*

Upstash Redis is on AWS North California. The instance is called modest-grizzly. Leaderboard stored as JSON at key `sfr:scores`. Written on every score submission, read on boot.

Total monthly cost: **$0.00.**"

---

## Slide 08 — Leaderboard
**Target:** 45 seconds

*[This is the social hook. Keep it light.]*

"Every score from every session is in here. Survives restarts. Survives redeploys. If you play right now and set a top time, it'll be on this board when the next person opens the game tomorrow.

Right now Yuki is holding first at 28 seconds. That's the benchmark. If you beat it at the demo, it's on the board.

The leaderboard was the last feature I built, because a playtester asked for it. I had no plans for it. That's the kind of feedback that's worth acting on."

---

## Slide 09 — Demo
**Target:** 30 seconds + however long the play session runs

*[This is the most important slide. Stop talking and hand over the phone.]*

"Okay.

*[Open the game on the laptop. Click Generate Room Code.]*

Here's the room code. Scan the QR with your phone — or just go to the URL and type it in. Hold the phone flat. Tilt to move. Flick up to jump.

Five MSG crystals and you're done.

*[Step back. Let them play. Don't narrate over the experience.]*

*[If they complete it, call out their time and mention the leaderboard.]*"

---

## Slide 10 — Next + Thanks
**Target:** 45 seconds

*[This is the close. Keep forward momentum, but don't oversell the roadmap — you shipped Stage 1, that's real.]*

"Stage 1 is done. What's built is what you just played.

Stage 2 adds the chef's hand — same wok, same phone, but now it's fighting back. Stage 3 flips the camera — you become the chef, the perspective inverts, the controller stays identical. That's the game.

The hardware path is an ESP32 with an MPU-6050 accelerometer wired to a real wok. Same WebSocket protocol. No code changes. That's the GDC submission.

The question I'm trying to answer is: **does physicality change what the game means?** After watching people play this — yes. It does.

*[Let the slide sit for a moment.]*

Links are there if you want them. Thanks."

---

## Timing Summary

| Slide | Topic | Time |
|---|---|---|
| 01 | Title | 0:45 |
| 02 | Design argument | 1:00 |
| 03 | Stage 1 mechanics | 1:15 |
| 04 | Sensor pipeline | 1:00 |
| 05 | Playtester feedback | 1:15 |
| 06 | Tech stack | 1:00 |
| 07 | Infrastructure | 1:00 |
| 08 | Leaderboard | 0:45 |
| 09 | Demo | 0:30 + play |
| 10 | Next + thanks | 0:45 |
| **Total** | | **~9:30 + play** |

---

## Things to have ready before you start

- Laptop open at `gd-003-shrimp-fried-rice.onrender.com` — game loaded, not at room code yet
- Your phone already at the controller URL (or bookmark it)
- Know Yuki's score (currently 28s) so you can say it naturally on slide 08
- If presenting at GDC: have a second phone charged as backup controller

## If something breaks

- **Room code not connecting:** refresh both pages, generate a new code
- **Phone not showing DeviceOrientation:** iOS needs HTTPS + the permission prompt to have been accepted; reload the controller page and try again
- **Render cold start (takes 30s):** go to slide 07, explain the infrastructure story while it warms up. It proves the point.
