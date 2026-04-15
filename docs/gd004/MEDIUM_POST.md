# The game works is not the same sentence as the game lives

*GD-004 — Shrimp Fried Rice v0.7, shipped to the internet*

*Carl Kho · April 2026*

---

For three months, every class session started the same way. Open terminal. Run ngrok. Copy the URL it generated. Paste it into the QR code generator. Wait for students to connect before the 20-minute ngrok free tier kicked them out.

The game worked. It just worked in a way that required me to be in the same room, running a process, watching it.

That's not a shipped game. That's a demo that needs a babysitter.

This is the story of what it actually took to leave the room.

---

## The scope decision first

Before any of the infrastructure, I made a choice that changed what the infrastructure needed to do.

Shrimp Fried Rice was designed with three stages. Stage 1: survive the wok as a shrimp. Stage 2: swat the chef's hand. Stage 3: the role reversal, where you become the chef. The full arc was the point — the shrimp fried the rice.

For GD-004, I cut Stage 2 and Stage 3. They're not shipped. Stage 1 is.

The reason is unglamorous: Stage 1 is complete. The jump physics are right, the oil bar works, the MSG crystals breathe now. Playtesters complete it and immediately ask to play again. Stages 2 and 3 exist as design documents and don't exist as running code. Shipping them would have required two more months of work at the cost of the one thing that's actually finished.

Shipping a reduced thing completely is different from shipping a full thing badly. I think that's true. I'm less certain the full arc didn't matter.

---

## Three cloud systems for one game

Getting Shrimp Fried Rice off my laptop required three separate services doing three things I couldn't do myself.

**Render** hosts the server. Auto-deploys on a git push. The game at `gd-003-shrimp-fried-rice.onrender.com` is whatever is on the main branch. I push a commit, Render builds it, done. No configuration after the first setup.

The problem with Render's free tier is that it sleeps after 15 minutes of inactivity. A cold start takes about 30 seconds. Before anyone connects, that's fine. At a GDC demo table, with someone standing there watching a spinner, it's a session-killer.

**UptimeRobot** pings `/health` every 5 minutes. The endpoint returns two bytes: `"ok"`. That's enough to keep Render within its wake threshold without ever actually sleeping. The game has stayed live through every in-class session since I set this up.

I tried cron-job.org first. It failed 26 times, then auto-disabled itself.

The failure mode took me a while to understand. Render serves a large Cloudflare HTML page during cold starts — a "service is waking up" page — before Node.js actually boots. cron-job.org has a response body size limit. That Cloudflare page is large enough to trip it before my `/health` endpoint ever gets to respond with `"ok"`. UptimeRobot doesn't read the response body at all. It checks the HTTP status code. Never trips. Never auto-disables. Problem gone.

**Upstash Redis** appeared because of one sentence from a playtester: "Can I send my score to my friend? I want them to try to beat it."

Before that, the leaderboard was in memory on the server. Every time Render restarted — which it does on redeploys, on crashes, whenever — the scores cleared. The persistent leaderboard didn't exist because I planned it. It exists because someone wanted something to show a friend, and I had no good answer for why that wasn't possible.

The implementation is a REST API, no SDK. The server reads `sfr:scores` on boot, writes it on every new submission. Zero new dependencies. The database instance is called modest-grizzly, which I find unreasonably charming. Scores from every session since deployment are still there.

---

## What v0.7 actually changed

Shipping required making Stage 1 worth shipping. Three things changed:

MSG crystals now breathe. A 7% scale pulse at 2.5 radians per second, with each crystal slightly out of phase with the others. Before this, playtesters sometimes walked past crystals without registering them. Static objects on a dark background are easy to ignore. The pulse makes them feel alive. This is a small thing that shouldn't matter as much as it does.

The "ROOM ACTIVE" button became a badge. When a controller connects, the button used to sit there looking pressable but doing nothing. Playtesters clicked it. Nothing happened. Now it's a non-interactive status indicator — green pulse dot, `pointer-events: none`. The visual language matches the reality. Nobody clicks it anymore.

Tutorial step 3 got a skip button. The sub-phases auto-advanced on a timer. If you understood the mechanic before the timer expired, you sat waiting. The skip button short-circuits the timer. Small thing. The friction it removed was real.

---

## What the infrastructure cost

$0.00 per month. Render free tier, UptimeRobot free tier, Upstash Redis free tier. The game has been publicly accessible since March 2026. It has survived every class session, multiple demo contexts, and at least one 3-day stretch where nobody played it at all and it woke right back up when someone did.

I want to be clear this is not a design choice about frugality. It's a constraint that shaped what I built. The architecture — no SDK, just fetch, 230 lines of server, no framework — is a consequence of needing something that would run indefinitely on a free plan without becoming a maintenance burden. Those constraints produced something more legible than what I would have built without them.

---

## What the leaderboard showed

The top score is 28 seconds, held by Yuki. It has been there since the first session after Redis was deployed. Every subsequent playtester has seen it. Most of them try to beat it.

That competitive pressure wasn't designed. The leaderboard is barely a feature — it's a sorted list of names and times, rendered in VT323 monospace on a dark background. But knowing that a real person set a real score on this specific machine, and that score is still there, changes the game. You're not just playing. You're playing against someone who played before you left.

I didn't design that. I preserved it by not clearing the list on restart.

---

## What's still not working

The calibration is fragile for some wrists. My normalization routine — 3 flicks upward, set thresholds at 60% and 110% of the average — breaks down for people with unusually strong or weak flick gestures. I know when it's wrong because the shrimp either barely leaves the ground or rockets off-screen. I don't always know how to fix it for a specific person in real-time.

The tutorial explains the mechanics but doesn't communicate what the game is. "Tilt your phone to move" is accurate. "You are the wok and the shrimp lives inside your hands" is also accurate but sounds insane as a tutorial step. Right now the game relies on physics to communicate the second thing. That works often enough. It isn't a solution.

Stage 2 and Stage 3 are still design documents.

---

## The actual question

Is shipping Stage 1 completely the same as shipping the game?

The design of Shrimp Fried Rice is a three-act argument: you are the shrimp, you become the resistance, you become the power. Without the full arc, Stage 1 is a survival minigame with good physics. The central role-reversal never happens. The title is still the punchline, but you never get to it.

I think Stage 1 is worth shipping on its own. The jump drift mechanic, the persistent leaderboard, the feeling of holding a wok that a shrimp is actually inside — that's real. It works.

Whether it's the game I meant to make is a different question. The answer is no. The game I meant to make is still in the design documents.

---

*Play Stage 1 at [gd-003-shrimp-fried-rice.onrender.com](https://gd-003-shrimp-fried-rice.onrender.com). Scan the QR, enter 4 digits, hold flat.*

*Source: [github.com/CarlKho-Minerva/gd-003-shrimp-fried-rice](https://github.com/CarlKho-Minerva/gd-003-shrimp-fried-rice)*
