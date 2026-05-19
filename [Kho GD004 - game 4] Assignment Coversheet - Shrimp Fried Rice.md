https://docs.google.com/document/d/14i_sCoHF4eGbvvUeoiRJ26tLTpeNhFg4Dhc-7Ph1hlM/edit?pli=1&tab=t.0

***
None selected

Skip to content
Using Minerva University Mail with screen readers

5 of 22,888
Reminder: Upstash Redis Database Inactivity First Notice
External
Inbox

Upstash <support@upstash.com> Unsubscribe
8:02 AM (5 hours ago)
to me


Inactive Database Notice
Hi there,

We've noticed that your free tier Database ShrimpFriedRice_GD004, has not received any traffic in the past few weeks.

To optimize our services, we periodically archive databases that remain inactive for extended periods. Archiving involves:

Backing up your data
Removing the database instance (you can still restore your data later if needed)
If you wish to keep this database, please keep it active by sending it traffic through your apps or upgrade to a fixed plan. We will notify you one more time before archiving this database. You can always check your database status on Upstash Console.

 
Thank you for choosing Upstash. If you need assistance or have any questions, our support team is here to help at support@upstash.com

Best,
Upstash Support Team

Twitter	LinkedIn	Discord
About     Terms     Contact

The email was sent to kho@uni.minerva.edu.

To no longer receive these emails, unsubscribe here.

©2026 Upstash, Inc
upstash.com

Displaying New QR.jpg.
***

| Name |  | Version Number | Date Uploaded |
| :---- | :---- | :---- | :---- |
| **[Carl Vincent Kho](mailto:kho@uni.minerva.edu)** |  | **7 (v0.7)** | **Apr 15, 2026** |
| **Individual Portfolio**  |  |  |  |
| **Notion Journal** |  |  |  |
| **Github Repository** | [https://github.com/CarlKho-Minerva/gd-003-shrimp-fried-rice](https://github.com/CarlKho-Minerva/gd-003-shrimp-fried-rice)  |  |  |
| **Itch.io Links** | [play](https://carlcrafterz.itch.io/shrimp-fried-rice) |  |  |
| **Live Game** | [gd-003-shrimp-fried-rice.onrender.com](https://gd-003-shrimp-fried-rice.onrender.com) |  |  |
| **Slides** | [/docs/slides.html](docs/slides.html) |  |  |
| **Other Materials** | Looms in portfolio page; [Portfolio Site](../portfolio/shrimp-fried-rice.html); [Wok Controller Instructable](docs/instructables_wok_controller.html); [Medium Post (GD-003)](docs/MEDIUM_POST.md); [Medium Post (GD-004)](docs/gd004/MEDIUM_POST.md) |  |  |
| **HCs Tagged (max 3\)** | `#designthinking`, `#medium`, `#constraints` |  |  |

Each time you upload a new version of your portfolio, complete the following:

1. **Without reference to scores or learning outcomes, describe in 1-2 sentences how the class has been going for you so far.**

   Game 3 and the user interviews taught me that the invisible scaffolding — onboarding clarity, backend persistence, keep-warm infrastructure — matters as much as the game itself. The sharpest thing I learned this cycle wasn't technical: it was that when everyone failed to jump despite the instructions, that wasn't on them — it was on me.

2. **Describe your weekly process. What has been effective? What are you planning to change?**

   The first week was the scope decision. I had three stages designed. Stage 2 (chef's hand) and Stage 3 (role reversal) existed as design documents and partially-built prototypes. I cut both and committed to shipping Stage 1 properly. This was not a fun decision. The three-stage arc is the actual design argument of the game. But Stage 1 was finished, and Stages 2 and 3 weren't, and I'd rather ship something complete than demo something half-built.

   Week two was infrastructure. Deploying to Render was straightforward until I learned about the sleep problem. Free instances go cold after 15 minutes. I set up cron-job.org to ping `/health` every 5 minutes. It failed. 26 times. Auto-disabled. The error said "output too large." Took me a day to realize: Render's cold-start page is a large Cloudflare HTML response, and cron-job.org has a body size limit. Switched to UptimeRobot, which only checks the status code. Hasn't failed since.

   Week three was the leaderboard and polish — and the week I got the most useful feedback. Two users gave me things I couldn't have gotten from staring at the code. User 1 was technical and pointed at specific friction points. User 2 was non-technical, and watching them play was the more important session: they tilted, they avoided hazards, they read the screen — but they didn't jump. Not once. The instructions said to jump. I was standing right there. They still didn't do it. That's not a user problem; that's an onboarding failure. It also raised something I hadn't thought about: why would someone jump? Not how — why. The answer was competition. The leaderboard was born from that question, not from a feature backlog.

   The process was weak in one obvious way: the backend decision was last-minute. I should have started deployment two weeks earlier. Every session I ran with ngrok was a session where the game wasn't testable by anyone who wasn't physically in the room. What worked was treating user feedback as design data, not as a checklist. I still think the onboarding needs more work.

3. **Which course objective is most worrying to you? Who is a classmate you think exemplifies this skill?**

   The setup friction. Between "I want to play" and "I'm playing," there is one mandatory step: tap the button, scan the QR, grant motion permissions. That's not many steps, but it's exactly where attention leaks — especially on mobile, where the expectation is instant. I can shorten it, but I can't remove it. Every playtester who bounced at that moment was a player I lost before the game started, and that's the part I haven't solved.

   **Classmate:** [insert name] — their game had no setup gap. You opened it and you were already playing. That's what I'm still working toward.

4. **Explain how this class will help in future endeavors.**

   The honest answer is that this class would have been more useful before my Dell internship, which was heavily backend and infrastructure work. I already had the skills — I just learned them in a pure engineering context where the incentive was "pass the project." Learning the same skills here, where the incentive is "make the game work for real players," is a completely different experience. The game gives you a reason to care that a bare backend course doesn't.

   The three-service stack I built (Render hosting, UptimeRobot monitoring, Upstash Redis persistence) costs nothing and runs without me. I'm going to reuse this exact setup for SOMACH (my capstone, sub-vocal brain-computer interface). Both projects have the same core problem: getting a noisy signal from a physical sensor into a browser and making it mean something. The wok uses a 3-flick calibration routine to normalize accelerometer spikes. SOMACH uses a similar protocol to normalize EMG electrode readings from the throat. I noticed this halfway through building the calibration screen. The sensor normalization pattern transferred directly.

5. **For each HC you tagged above, describe how it is related to the topic at hand. Alternatively, if your learning on this topic changed your understanding of an HC, or you think it's a bad fit, explain that mismatch instead.**

   **#designthinking:** The biggest design decision this cycle was cutting content, not adding it. Dropping Stage 2 and Stage 3 let me focus on making one complete thing instead of three incomplete things. Every other v0.7 change came from watching a specific person get stuck on a specific thing: crystals being invisible (added breathing animation), the ROOM ACTIVE button looking clickable (changed it to a badge), the tutorial making people wait (added skip). None of these were on a roadmap. They came from sitting in the room and watching.

   **#medium:** The phone is the medium, and this cycle clarified something: the phone controller argument works better as a mobile-first experience than as a hardware build. The ESP32 wok is compelling as a physical object, but the barrier to entry — custom PCB, soldering, sourcing parts — made it untestable outside of a controlled demo. What actually traveled, in practice, was the browser version on someone's personal phone. The leaderboard reinforced this: it turned a solo local experience into something with social proof. Someone in a different timezone can open a URL, hold their phone, and play. The hardware build is still interesting as a showcase piece, but the mobile-first version is the real medium.

   **#multimodalcommunication:** *(Replaced with #constraints — see below.)*

   **#constraints:** Every architectural choice in v0.7 was shaped by a constraint, not a preference. Render's free tier sleeps after 15 minutes — that's a constraint, not an obstacle, because I can't change Render's pricing. The constraint satisfaction was UptimeRobot pinging `/health` every 5 minutes. cron-job.org's response body limit is a constraint. It can't be negotiated. The fix was switching to a tool that doesn't read the body. Upstash Redis's free tier caps at 10k commands/day — that shaped the decision to write scores only on submission and read only on boot, not to cache per-request. The no-SDK/no-framework architecture (230 lines, just `fetch`) isn't minimalism for its own sake. It's the direct consequence of needing zero dependencies on a platform where the deployment boundary is `git push` and the budget is $0. Each of these is a case of identifying what cannot be changed and building around it, which is what distinguishes constraint satisfaction from just coping.

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

---

## Appendix C: Changes implemented for v0.7 submission

| Category | Change | File(s) | Detail |
|----------|--------|---------|--------|
| **Tutorial** | "GENERATE ROOM CODE" → "PLAY WITH PHONE CONTROLLER" | `build/index.html`, `build/game.js` | Button text and all reset states updated |
| **Tutorial** | Flick step hint added | `build/index.html` | "If you see the bar move, you're good — hit NEXT" |
| **Tutorial** | MSG collection made explicit | `build/index.html`, `build/game.js` | "JUMP to collect 5 MSG crystals" + sub-phase title "JUMP FOR MSG" |
| **Tutorial** | Oil/hazard descriptions clarified | `build/index.html` | Oil = health, hazards = tilt away |
| **Gameplay** | Jump prompt at Stage 1 start | `build/game.js` | "FLICK UP TO JUMP!" announcement after Stage 1 title |
| **UX** | MSG crystal breathing animation | `build/game.js` | 7% scale pulse at 2.5 rad/s for visibility |
| **UX** | ROOM ACTIVE badge (non-clickable) | `build/style.css` | `pointer-events: none`, green pulse dot |
| **UX** | Tutorial step 3 skip button | `build/game.js` | Short-circuits auto-advance timer |
| **Infra** | Deployed to Render (public HTTPS) | `serve.js`, `package.json` | `gd-003-shrimp-fried-rice.onrender.com` |
| **Infra** | UptimeRobot keep-warm | config-only | 5-min ping to `/health`, replaced cron-job.org |
| **Infra** | Upstash Redis leaderboard | `serve.js` | REST API, no SDK, key `sfr:scores` |
| **Slides** | Typography fix | `docs/slides.html` | Outfit for headings, Pixelify only for game title |
| **Slides** | Gold reduced | `docs/slides.html` | Gold limited to game title, top score, active dot |
| **Slides** | Collect & Survive icons readable | `docs/slides.html` | Replaced tiny icons with labeled rows |
| **Docs** | GD-004 Medium post | `docs/gd004/MEDIUM_POST.md` | Scope cut, three cloud systems, leaderboard story |
| **Docs** | Presenter script | `docs/SLIDES_SCRIPT.md` | Per-slide timing, physical cues, failure recovery |
| **Docs** | GD-004 README | `docs/gd004/README.md` | Submission index with links |
| **Portfolio** | Shrimp Fried Rice card updated | `portfolio/index.html` | Live URL, GDC Slides, GD-004 Essay, Wok Build Guide links |
| **HC** | Swapped `#multimodalcommunication` → `#constraints` | coversheet | Free tier shaped architecture — constraint satisfaction, not preference |
