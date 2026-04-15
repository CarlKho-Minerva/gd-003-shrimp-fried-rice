https://docs.google.com/document/d/14i_sCoHF4eGbvvUeoiRJ26tLTpeNhFg4Dhc-7Ph1hlM/edit?pli=1&tab=t.0

| Name |  | Version Number | Date Uploaded |
| :---- | :---- | :---- | :---- |
| **[Carl Vincent Kho](mailto:kho@uni.minerva.edu)** |  | **7 (v0.7)** | **Apr 15, 2026** |
| **Individual Portfolio**  |  |  |  |
| **Notion Journal** |  |  |  |
| **Github Repository** | [https://github.com/CarlKho-Minerva/gd-003-shrimp-fried-rice](https://github.com/CarlKho-Minerva/gd-003-shrimp-fried-rice)  |  |  |
| **Itch.io Links** | [play](https://carlcrafterz.itch.io/shrimp-fried-rice) |  |  |
| **Live Game** | [gd-003-shrimp-fried-rice.onrender.com](https://gd-003-shrimp-fried-rice.onrender.com) |  |  |
| **GDC Slides** | [/docs/slides.html](docs/slides.html) |  |  |
| **Other Materials** | Looms in portfolio page; [Portfolio Site](../portfolio/shrimp-fried-rice.html); [Wok Controller Instructable](docs/instructables_wok_controller.html); [Medium Post (GD-003)](docs/MEDIUM_POST.md); [Medium Post (GD-004)](docs/gd004/MEDIUM_POST.md) |  |  |
| **HCs Tagged (max 3\)** | `#designthinking`, `#medium`, `#multimodalcommunication` |  |  |

Each time you upload a new version of your portfolio, complete the following:

1. **Without reference to scores or learning outcomes, describe in 1-2 sentences how the class has been going for you so far.**

   I spent most of this cycle not writing game code. I was debugging a cron job that failed 26 times before I understood why, setting up a Redis database so a playtester's score would survive a redeploy, and figuring out that Render's free tier serves a Cloudflare HTML page before Node.js boots. The thing I kept coming back to was this: making the game work in class was a code problem, but making it work on the internet without me in the room was a completely different kind of problem.

2. **Describe your weekly process. What has been effective? What are you planning to change?**

   The first week was the scope decision. I had three stages designed. Stage 2 (chef's hand) and Stage 3 (role reversal) existed as design documents and partially-built prototypes. I cut both and committed to shipping Stage 1 properly. This was not a fun decision. The three-stage arc is the actual design argument of the game. But Stage 1 was finished, and Stages 2 and 3 weren't, and I'd rather ship something complete than demo something half-built.

   Week two was infrastructure. Deploying to Render was straightforward until I learned about the sleep problem. Free instances go cold after 15 minutes. I set up cron-job.org to ping `/health` every 5 minutes. It failed. 26 times. Auto-disabled. The error said "output too large." Took me a day to realize: Render's cold-start page is a large Cloudflare HTML response, and cron-job.org has a body size limit. Switched to UptimeRobot, which only checks the status code. Hasn't failed since.

   Week three was the leaderboard and polish. Someone asked "Can I send my score to my friend?" during a playtest. I didn't have persistence. Upstash Redis was the fix: REST API only, no SDK, just `fetch`. Scores now survive restarts and redeploys. The v0.7 polish was small stuff that mattered more than I expected: MSG crystals breathing so they're visible, the ROOM ACTIVE button becoming a non-clickable badge (people kept pressing it), and a skip button on the tutorial.

   What worked: treating the infrastructure decisions like design decisions. What I'd change: I should have started the deployment work two weeks earlier. Every day spent running ngrok in class was a day the game wasn't testable outside my presence.

3. **Which course objective is most worrying to you? Who is a classmate you think exemplifies this skill?**

   Communicating the game's design to someone who isn't holding the phone. The GDC slides are done, the script is written, but the hardest thing to convey is what it feels like when you realize you're the wok. I can't put that in a tutorial. The game relies on physics to deliver that realization, which worked during playtests but is a bet, not a guarantee.

   **Classmate:** [insert name] — their project didn't need an explanation. Physical intuition was immediate. I'm still trying to get there.

4. **Explain how this class will help in future endeavors.**

   The three-service stack I built (Render hosting, UptimeRobot monitoring, Upstash Redis persistence) costs nothing and runs without me. I'm going to reuse this exact setup for SOMACH (my capstone, sub-vocal brain-computer interface). Both projects have the same core problem: getting a noisy signal from a physical sensor into a browser and making it mean something. The wok uses a 3-flick calibration routine to normalize accelerometer spikes. SOMACH uses a similar protocol to normalize EMG electrode readings from the throat. I noticed this halfway through building the calibration screen. The sensor normalization pattern transferred directly.

   Preparing the GDC presentation also taught me something I didn't expect. Building slides about the design forced me to actually say, out loud, why every technical decision was made. Why WebSocket over Bluetooth (latency and zero pairing). Why no framework (230 lines doesn't need React). Why REST over SDK (zero dependencies on a free tier). I knew these reasons, but I'd never had to defend them to an audience. That's a different skill from just making the choices.

5. **For each HC you tagged above, describe how it is related to the topic at hand. Alternatively, if your learning on this topic changed your understanding of an HC, or you think it's a bad fit, explain that mismatch instead.**

   **#designthinking:** The biggest design decision this cycle was cutting content, not adding it. Dropping Stage 2 and Stage 3 let me focus on making one complete thing instead of three incomplete things. Every other v0.7 change came from watching a specific person get stuck on a specific thing: crystals being invisible (added breathing animation), the ROOM ACTIVE button looking clickable (changed it to a badge), the tutorial making people wait (added skip). None of these were on a roadmap. They came from sitting in the room and watching.

   **#medium:** The phone is still the medium. Nothing about the core controller argument changed this cycle. What changed is that the game now exists outside the room I'm standing in. Someone in a different timezone can open a URL and hold the wok. The persistent leaderboard changed too, in a way I didn't anticipate: a leaderboard with real names from real sessions turns the game from a solo toy into a shared artifact. "Can I send my score to my friend?" is a question about the medium, not the feature.

   **#multimodalcommunication:** The GDC presentation materials required three channels to work at once: the visual slides (dark game aesthetic, actual game UI as proof figures), the spoken script (specific technical details, real playtester quotes, not generalities), and the live demo (phone in hand, no explanation, let the gesture do the work). Getting those three channels to reinforce each other instead of repeating each other is the same problem the game itself has. Visual feedback, audio feedback, and physical feedback all have to say the same thing, or the experience feels disconnected.

---

## Appendix A: v0.7 technical changes

### MSG crystal breathing

Added a scale pulse to each MSG crystal in the existing `ctx.save()/ctx.restore()` draw block:

```javascript
const breathe = 1 + 0.07 * Math.sin(gameTime * 2.5 + m.bob);
ctx.save();
ctx.translate(m.x, m.y + bob);
ctx.rotate(gameTime * 2 + m.bob);
ctx.scale(breathe, breathe);
// draw crystal
ctx.restore();
```

Frequency is 2.5 rad/s, amplitude is 7%. The `m.bob` offset makes each crystal pulse independently. The purpose was visibility: static objects on a dark background were getting ignored during playtests.

### ROOM ACTIVE badge

Replaced the pressable button with a non-interactive status indicator:

```css
.btn-relay--active {
  background: rgba(76,217,100,.12);
  border-color: rgba(76,217,100,.45);
  color: #4cd964;
  pointer-events: none;
  cursor: default;
}
.btn-relay--active::before {
  /* pulsing green dot */
  width: 8px; height: 8px; border-radius: 50%;
  background: #4cd964;
  animation: pulse-dot 1.8s ease-in-out infinite;
}
```

Applied on controller connect, removed on disconnect. Playtesters stopped clicking it.

### Tutorial step 3 skip

The tutorial's third step had three sub-phases that only advanced on a timer. Added a button that calls `showStep3Phase(tutStep3Phase + 1)`, short-circuiting the timeout if the player already gets it. Label shows "SKIP" for phases 0/1, "NEXT" for phase 2.

### Leaderboard persistence (Upstash Redis)

REST API, no SDK. Server reads `sfr:scores` on boot, writes on every submission:

```javascript
// read
const r = await fetch(`${UPSTASH_URL}/get/${SCORES_KEY}`, {
  headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
});
const data = await r.json();
const scores = data.result ? JSON.parse(data.result) : null;

// write
await fetch(UPSTASH_URL, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${UPSTASH_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(['SET', SCORES_KEY, JSON.stringify(serverScores)])
});
```

Database: modest-grizzly, AWS us-west-1. Key: `sfr:scores`. Cap: 50 entries, top 10 served to clients. Falls back to in-memory if env vars are absent.

### UptimeRobot keep-warm

Render free tier sleeps after 15 minutes. Previous solution (cron-job.org) failed because Render's cold-start Cloudflare page exceeded cron-job.org's response body limit. UptimeRobot checks HTTP status code only, 5-minute interval. Public status: `stats.uptimerobot.com/9mdhaV2mYt`.

---

## Appendix B: GDC presentation materials

10-slide HTML presentation at `docs/slides.html`. Built with the game's own visual language: same radial-gradient background, scanlines overlay, Pixelify Sans for the game title, Outfit for body headings, VT323 for arcade data. The game's shrimp is reproduced as an SVG symbol (5 overlapping circles matching `drawStaticShrimp()` in game.js). Navigation is vertical scroll only. Real playtester quotes on slide 5. Specific infrastructure details on slides 6-7.

Presenter script at `docs/SLIDES_SCRIPT.md`. Per-slide talking points, timing (9:30 total + demo), physical cues (when to hand the phone to the audience), and failure-recovery instructions.
