https://docs.google.com/document/d/14i_sCoHF4eGbvvUeoiRJ26tLTpeNhFg4Dhc-7Ph1hlM/edit?pli=1&tab=t.0

| Name |  | Version Number | Date Uploaded |
| :---- | :---- | :---- | :---- |
| **[Carl Vincent Kho](mailto:kho@uni.minerva.edu)** |  | **7 (v0.7)** | **Apr 15, 2026** |
| **Individual Portfolio**  |  |  |  |
| **Notion Journal** |  |  |  |
| **Github Repository** | [https://github.com/CarlKho-Minerva/ShrimpFriedRice/](https://github.com/CarlKho-Minerva/ShrimpFriedRice/)  |  |  |
| **Itch.io Links** | [play](https://carlcrafterz.itch.io/shrimp-fried-rice) |  |  |
| **Live Game** | [gd-003-shrimp-fried-rice.onrender.com](https://gd-003-shrimp-fried-rice.onrender.com) |  |  |
| **GDC Slides** | [/docs/slides.html](docs/slides.html) |  |  |
| **Other Materials** | Looms in portfolio page; [Portfolio Site](../portfolio/shrimp-fried-rice.html); [Wok Controller Instructable](docs/instructables_wok_controller.html); [Medium Post](docs/MEDIUM_POST.md) |  |  |
| **HCs Tagged (max 3\)** | `#designthinking`, `#medium`, `#multimodalcommunication` |  |  |

Each time you upload a new version of your portfolio, complete the following:

1. **Without reference to scores or learning outcomes, describe in 1-2 sentences how the class has been going for you so far.**

   This iteration forced me to confront the gap between "the game works" and "the game works for someone who's never seen it." Preparing GDC presentation materials — slides and a presenter script — made me articulate design decisions I had only previously understood intuitively: why the controller IS the narrative, why the sensor pipeline had to be zero-friction, and what the "aha moment" actually is and when it reliably happens.

   The infrastructure work this cycle (persistent leaderboard via Upstash Redis, UptimeRobot keep-warm replacing a failed cron solution) also made me appreciate that deployment reliability is itself a design decision. A game that goes cold during a GDC demo has a broken user experience regardless of how good the mechanics are.

2. **Describe your weekly process. What has been effective? What are you planning to change?**

   This round was primarily polish and production-readiness rather than new mechanics. v0.7 added three things driven by playtester friction: MSG crystal breathing animation (objects that pulse feel collectible in a way static ones don't), the ROOM ACTIVE badge replacing a pressable button (players were clicking it expecting something to happen), and a skip/next button for tutorial step 3 (players were stuck waiting for auto-advance).

   The infrastructure track ran in parallel: moved from cron-job.org (failed with "output too large" — Render's cold-start HTML page is large enough to trip cron-job's response-size limit) to UptimeRobot, which checks HTTP status only and never auto-disables. Upstash Redis replaced in-memory leaderboard storage — scores now survive any restart or redeploy. The REST-only API approach (no SDK, just `fetch`) keeps the server at 230 lines with zero new dependencies.

   What was effective: treating production infrastructure as a design problem, not an ops problem. What I'd change: starting the GDC slide/script preparation earlier — the process of explaining the design to an audience revealed gaps in how the game frames itself.

3. **Which course objective is most worrying to you? Who is a classmate you think exemplifies this skill?**

   "Showing, not telling, why the physical controller matters." The slides and script are now polished, but the real test is the 30 seconds between someone picking up the phone and them understanding the loop — without me explaining anything. The tutorial covers the mechanics, but not the emotional core: *you are the wok, not just holding a controller*.

   **Classmate:** [insert name] — their project achieved immediate physical intuition without a tutorial, which is the benchmark I'm still reaching toward.

4. **Explain how this class will help in future endeavors.**

   The infrastructure pattern I built this cycle — zero-cost, zero-dependencies, REST-only, stateless-with-Redis persistence — is reusable for any future rapid prototype that needs to be publicly demo-able. More specifically, the UptimeRobot + Render stack is portable to any serverless-hostile free tier that needs to stay warm. I documented the failure mode (cron-job.org + Render = "output too large") so future projects don't repeat it.

   The GDC presentation preparation revealed something more useful: the ability to defend design decisions under time pressure to a technically literate audience. That skill — knowing *why* I chose WebSocket over Bluetooth, why I chose REST over SDK, why I chose Canvas over WebGL — transfers to any project where I have to justify architectural choices to judges, investors, or collaborators. Preparing these materials made the reasoning explicit in a way that in-project decisions never do.

5. **For each HC you tagged above, describe how it is related to the topic at hand. Alternatively, if your learning on this topic changed your understanding of an HC, or you think it's a bad fit, explain that mismatch instead.**

   **#designthinking:** Every v0.7 change came from watching people use the game, not from theory. The ROOM ACTIVE badge existed because a tester clicked the "ROOM ACTIVE" button expecting a UI response. The tutorial skip button existed because I watched a tester sit confused waiting for auto-advance. The MSG breathing animation came from noticing that players often missed crystals that were visually static against the dark background. Iteration driven by observed friction — not planned in advance, not guessed.

   **#medium:** This iteration didn't change the controller medium, but it clarified it for external audiences. Building the GDC slides forced me to articulate the medium argument precisely: the phone is not a prop, it is the game's world. When you tilt it, you're not *controlling* a character — you're *moving* the space the character inhabits. The leaderboard persistence also belongs here: a shared, durable leaderboard changes the game from a solo experience into a social artifact. "Can I send my score to my friend?" was not a feature request — it was a signal that the medium was working.

   **#multimodalcommunication:** The GDC presentation materials (slides + script) had to communicate the same design across three simultaneous channels: the visual slide (dark game aesthetic, real game UI elements as figures), the spoken script (specific, not generic — real quotes, real infrastructure details), and the live demo (phone in hand, no explanation, let the gesture speak). Getting all three channels to reinforce rather than repeat each other is the same problem the game itself solves: visual, audio, and kinesthetic feedback that all say the same thing at the same time.

---

## Appendix A: v0.7 Technical Changes

### MSG Crystal Breathing Animation

Added a scale-pulse to MSG crystals using `Math.sin(gameTime * freq + m.bob)` inside each crystal's existing `ctx.save()/ctx.restore()` draw block:

```javascript
const breathe = 1 + 0.07 * Math.sin(gameTime * 2.5 + m.bob);
ctx.save();
ctx.translate(m.x, m.y + bob);
ctx.rotate(gameTime * 2 + m.bob);
ctx.scale(breathe, breathe);
// ... draw crystal ...
ctx.restore();
```

The frequency (2.5 rad/s) and amplitude (7%) were tuned so the pulse is perceptible but not distracting. The `m.bob` phase offset ensures each crystal breathes independently.

### ROOM ACTIVE Badge

Replaced the pressable "ROOM ACTIVE" button with a non-interactive status badge. The CSS class `.btn-relay--active` converts the element:

```css
.btn-relay--active {
  background: rgba(76,217,100,.12);
  border-color: rgba(76,217,100,.45);
  color: #4cd964;
  pointer-events: none;
  cursor: default;
  padding-left: 28px;
  position: relative;
}
.btn-relay--active::before {
  content: '';
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
  width: 8px; height: 8px; border-radius: 50%;
  background: #4cd964; box-shadow: 0 0 6px #4cd964;
  animation: pulse-dot 1.8s ease-in-out infinite;
}
```

The badge is added on controller connect and removed on disconnect/error.

### Tutorial Step 3 Sub-phases

Stage 3 of the tutorial had three sub-phases that only advanced via timer. Added a Skip/Next button that calls `showStep3Phase(tutStep3Phase + 1)` if `tutorialStep === 3 && tutStep3Phase < 2`, short-circuiting the timeout. The button label updates per phase: "SKIP →" for phases 0 and 1, "NEXT →" for phase 2.

### Leaderboard Persistence — Upstash Redis

Replaced in-memory-only leaderboard with Upstash Redis via REST API (no SDK, no connection pool):

```javascript
// Read on boot
const r = await fetch(`${UPSTASH_URL}/get/${SCORES_KEY}`, {
  headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
});
const data = await r.json();
const scores = data.result ? JSON.parse(data.result) : null;

// Write on every new score
await fetch(UPSTASH_URL, {
  method: 'POST',
  headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(['SET', SCORES_KEY, JSON.stringify(serverScores)])
});
```

The key is `sfr:scores`. The database instance is `modest-grizzly` on AWS us-west-1 (North California). Scores cap at 50 entries; the top 10 are served to clients. Backwards compatible: if env vars are absent, falls back to in-memory.

### Infrastructure: UptimeRobot Keep-warm

Render free tier sleeps after 15 minutes of inactivity. Previous solution (cron-job.org) failed 26 consecutive times and auto-disabled:

**Root cause:** Render serves a large Cloudflare HTML "waking up" page before Node.js boots. cron-job.org has a response body size limit — the Cloudflare page trips it before `/health` ever responds with `"ok"`.

**Fix:** UptimeRobot checks HTTP status code only (never reads the body). 5-minute ping interval keeps Render warm within its 15-minute sleep threshold. Public status page: `stats.uptimerobot.com/9mdhaV2mYt`.

---

## Appendix B: GDC Presentation Materials

A 10-slide HTML presentation (`docs/slides.html`) was built for GDC Alt. Ctrl. demo context:

- Dark game aesthetic (same radial-gradient BG, scanlines, Pixelify Sans / VT323 / Outfit type system as the game)
- Exact game shrimp reproduced as SVG `<symbol>` (5 overlapping circles matching `drawStaticShrimp()` in `game.js`)
- Vertical scroll navigation (keyboard ↑↓, scroll wheel, touch swipe)
- Game UI elements used as proof-of-concept figures (oil bar, room code, leaderboard in VT323)
- Real playtester quotes, specific infrastructure details (Upstash Redis key `sfr:scores`, `modest-grizzly` instance)

A presenter script (`docs/SLIDES_SCRIPT.md`) covers per-slide timing, talking points, physical cues (when to hand the phone to the audience), and failure-recovery instructions.
