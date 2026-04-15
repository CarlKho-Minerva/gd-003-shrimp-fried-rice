# The phone was the wok. The shrimp didn't know the difference.

*An alt-controller game with one design rule: the controller and the narrative are the same object.*

*Carl Kho · GDC Alt. Ctrl. Prototype · 2026*

---

Every alt-controller game at GDC has the same structural problem. The controller is interesting for exactly as long as it takes to understand what it does. After that — usually 30 seconds in — you're playing a game through a weird input device. The novelty was never the design. It was a skin over ordinary mechanics.

I made a game called Shrimp Fried Rice. It has one rule I tried never to break: the controller and the narrative are the same object.

The game runs on your phone. Your phone is a wok. Inside the wok, a pixel shrimp. When you tilt the phone, the shrimp slides toward the hot side. When you flick it upward — a quick spike in the beta axis of DeviceMotion — the shrimp goes airborne. Here's the part that took me longest to get right: if you were tilting slightly left when you jumped, the arc drifts left. Like a real toss. Because the gesture carries its own physics. You're not pressing a jump button. The trajectory comes from how you threw.

I'm not certain this is a good game. I'm reasonably certain it was the right game to build.

---

## The design argument

Most game controllers are encoding devices. The joystick encodes "I want the character to move here." The button encodes "I want this action." The input maps to an intention, which maps to an animation, which maps to a game state. Three abstraction layers, and the physical thing you hold is at the beginning, not inside.

The wok skips the first layer.

When you tilt the phone, you're not telling the shrimp to move left. You're moving the world the shrimp exists in. The shrimp slides because gravity. It goes airborne when you throw it because you threw it. The controller isn't inspired by the narrative — it is the narrative. A shrimp in a wok moves the way it does because you're holding the wok.

This sounds like marketing copy. It isn't.

During one of our in-class playtests, someone picked up the phone and started playing. About two minutes in, they stopped and said: "Wait, I'm moving the shrimp with my hand? Like — I'm the wok?"

That's not a UI discovery. You don't have that moment when you understand a button layout. It's a realization about what kind of game you're actually playing, and it happened without explanation, mid-play, on a first attempt.

---

## What the code actually is

The game is vanilla JavaScript and a Canvas 2D renderer. One game.js. No framework, no build step. The server is 230 lines — static file serving and WebSocket relay on a single port, no Express. The relay is a Map of room codes to socket pairs. Nothing about the relay understands what a shrimp is.

The sensor pipeline: the phone reads DeviceOrientation and DeviceMotion natively at 60Hz. You open a URL on your phone — scanned from a QR on the laptop screen, or typed manually, four digits. You're now in the room. The phone sends orientation data over WebSocket to the server, which forwards it to the game on the display. The game doesn't know whether the data came from a phone, a real wok with an MPU-6050 screwed to the handle, or a test script running locally.

No Bluetooth. No app install. No pairing ceremony. You type four numbers.

I explained this architecture to a friend who works in mobile dev. He said: "Why doesn't everyone do this?" I don't have a good answer. The technology has been in phones for years. It's possible everyone is waiting for a better reason.

---

## Infrastructure that had to survive the demo

The game is live at gd-003-shrimp-fried-rice.onrender.com. Render's free tier sleeps after 15 minutes of inactivity. A cold start takes about 30 seconds — which would kill a GDC demo if someone walked up between players.

The fix is UptimeRobot, which pings /health every 5 minutes. /health returns two bytes: "ok". That's enough to keep Render awake within its sleep threshold.

I tried cron-job.org first. It failed 26 times in a row, then auto-disabled itself. The reason took me a while to figure out: Render serves a large Cloudflare HTML page during cold starts, before Node.js boots. cron-job.org has a response body size limit. That Cloudflare page trips it before my /health ever responds. UptimeRobot only checks the HTTP status code. It never reads the body. Problem gone.

The leaderboard lives in Upstash Redis at key `sfr:scores`, on AWS North California. No SDK. Just fetch. The database instance is called modest-grizzly. Scores survive any restart or redeploy. The REST-only approach means zero new server dependencies and nothing to keep warm.

Total monthly infrastructure cost: $0.00. This is not a selling point. It's just true, and I think it matters for anyone trying to demo a prototype game repeatedly over several months without a budget.

---

## What playtesters actually said

After completing Stage 1 on a first attempt, one playtester immediately said: "Okay let me play it again. We gotta finish you know."

They had just won. They weren't frustrated. They wanted another run. That specific response — unprompted, right after completing the objective — happened more than once across different sessions.

Another: "The jump feels exactly right. Like tossing food." That's the drift mechanic working. When the gesture carries its physics into the arc, the toss feels accurate not because it was designed to, but because it was structurally true. You throw something with a leftward lean and it goes left. Physics doesn't need to be complicated to feel right.

A third, at the end of a session: "Can I send my score to my friend? I want them to try to beat it." I had no plans for a leaderboard. That question is the only reason one exists now.

---

## What's still unresolved

The calibration is fragile. Every person's "flick" is different in force and speed. The same gesture from two people produces completely different accelerometer values. My normalization routine — 3 quick flicks upward, take the average, set toss threshold at 60% and swat at 110% — works for most wrists. For some it's wrong in ways I haven't fully diagnosed. The sensor debug overlay (toggle with the bug button) shows you the raw values, but knowing what the numbers are doesn't always tell you what to do about them.

The tutorial explains the mechanics. I'm less sure it communicates what the game actually is. There's a gap between "tilt your phone to move" and "you are holding the world your character inhabits." I don't know how to close that gap without the explanation sounding absurd. Right now I'm relying on the physics to do it for me, which worked during the playtests, but that's a bet, not a design.

Stage 2 (the chef's hand) and Stage 3 (the role reversal, where you become the chef) aren't shipped. Stage 1 is the submitted prototype. The design argument gets its real test when the physical mechanic has to hold up two stages in, with higher stakes and a flipped perspective. I don't know if it will.

---

## The question

Does physicality change what a game means?

The implicit test for any alt-controller game is whether the physical input is necessary or decorative. A lot of them are decorative. You could replace the gimmick with a mouse and the game would be the same game.

What I found watching people play this one: when the controller is the game world, players understand the game the way they understand cooking — not by reading about it, but by doing it with their hands. You feel the hot side because you tilted toward it. The shrimp went crooked because you threw it crooked.

That sensation wasn't designed. It fell out of the physics. Which might be the actual point: the most interesting parts of this game are consequences of a structural decision about what the controller is. I didn't add them. I just didn't remove them.

I'm not sure what to do with that yet. The next two stages will either prove the thesis or break it.

---

*The game is live at [gd-003-shrimp-fried-rice.onrender.com](https://gd-003-shrimp-fried-rice.onrender.com). Scan the QR, enter the 4-digit code, hold the phone flat.*

*Source: [github.com/CarlKho-Minerva/gd-003-shrimp-fried-rice](https://github.com/CarlKho-Minerva/gd-003-shrimp-fried-rice)*

*Playtesters who held the phones: Benny, Dain, Chelsea, Angela, Manu, Laryssa, Jack, Nokutenda, Stiven, Artem.*
