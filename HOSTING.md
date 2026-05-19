# 🌐 Hosting Shrimp Fried Rice — Complete Guide

> **TL;DR** — The static game (4 files) can go on any free host. But for the **phone controller + QR code flow**, you need a WebSocket relay server somewhere. This guide covers both.

---

## Table of Contents

1. [Understanding What You're Deploying](#understanding-what-youre-deploying)
2. [Option A: itch.io (Best for Students)](#option-a-itchio-best-for-students)
3. [Option B: Vercel + Free Relay (Full Feature)](#option-b-vercel--free-relay-full-feature)
4. [Option C: Netlify](#option-c-netlify)
5. [Option D: Cloudflare Pages](#option-d-cloudflare-pages)
6. [Option E: GitHub Pages](#option-e-github-pages)
7. [The Relay Problem (Important!)](#the-relay-problem)
8. [Free Relay Hosting Options](#free-relay-hosting-options)
9. [After Deploying: Testing Sensors](#after-deploying-testing-sensors)
10. [Publishing on Game Stores (Steam, GOG, Epic)](#publishing-on-game-stores)
11. [Troubleshooting](#troubleshooting)

---

## Understanding What You're Deploying

There are **two parts** to this game:

### Part 1: The Game (Static Files) — FREE to host anywhere
```
build/
├── index.html       ← Entry point (game display)
├── controller.html  ← Phone controller page
├── config.js        ← Tunable constants
├── game.js          ← Game engine
└── style.css        ← Styling
```

These files need: HTTPS + a static file server. That's it. Every option below provides this for free.

### Part 2: The WebSocket Relay — Needs a server
```
serve.js             ← Combined static server + WebSocket relay
relay/relay-server.js ← Standalone relay (same logic, no static serving)
```

The relay pairs phones (controllers) with the game display via 4-digit room codes. **If you only deploy the static files, the game works in desktop mode and on-device phone mode, but the QR code → phone controller flow won't work** because there's no WebSocket server to relay sensor data.

**For local demos:** `./start.sh` handles everything (server + ngrok tunnel). This is what you've been using.

**For permanent hosting:** You need to host the relay somewhere too. See the [Free Relay Hosting Options](#free-relay-hosting-options) section.

---

## Option A: itch.io (Best for Students) 🎮

**Why itch.io?** Free, instant, the indie game community lives here, no credit card needed, and you get a page with screenshots/description/comments. This is the standard for student and jam games.

**Cost: $0.** Forever.

### Step 1: Prepare the Upload

```bash
# From the game-3 directory
cd build
zip -r ../shrimp-fried-rice.zip .
cd ..
# You now have shrimp-fried-rice.zip in game-3/
```

> **Important:** Zip the *contents* of `build/`, not the folder itself. When unzipped, `index.html` should be at the root level, not inside a `build/` subfolder.

### Step 2: Create the itch.io Project

1. Go to [itch.io/game/new](https://itch.io/game/new) (create account if needed — free)
2. Fill in:

| Field | Value |
|-------|-------|
| **Title** | Shrimp Fried Rice |
| **Project URL** | `shrimp-fried-rice` (auto-fills) |
| **Kind of project** | HTML |
| **Classification** | Game |
| **Pricing** | No payments (or "Donations" if you want a tip jar) |

3. **Upload:**
   - Click "Upload files"
   - Select `shrimp-fried-rice.zip`
   - **Check ☑️ "This file will be played in the browser"**
   - Wait for upload to complete

4. **Embed options:**

| Setting | Value |
|---------|-------|
| **Viewport dimensions** | Width: `420`, Height: `800` |
| **☑️ Mobile friendly** | Checked |
| **☑️ Automatically start on page load** | Checked |
| **Fullscreen button** | Checked |
| **SharedArrayBuffer support** | Not required |

5. **Add details:**
   - **Cover image:** Screenshot of the title screen (use one of the playtest photos)
   - **Description:** Copy the first two paragraphs from the Medium post
   - **Tags:** `experimental`, `alt-ctrl`, `cooking`, `mobile`, `sensor`, `web`
   - **Genre:** Action

6. Click **"Save & view page"**

### Step 3: Test It

1. Open your itch.io page on your laptop
2. The game should load in the iframe
3. Test **Desktop Mode** (arrow keys + space)
4. Test on your phone — open the same itch.io URL in Safari/Chrome

### ⚠️ The itch.io Sensor/iframe Caveat

itch.io wraps your game in an `<iframe>`. On some browsers, phone sensors are blocked inside iframes. Here are the workarounds, in order of ease:

1. **"Open in new tab"** — Most itch.io pages have a fullscreen/pop-out option. In a new tab, sensors work normally.
2. **Add a direct link** — In your itch.io page description, add:
   > **📱 For phone controller mode, [open the game directly](https://carlcrafterz.itch.io/shrimp-fried-rice)** and use fullscreen.
3. **iframe permissions** — itch.io has started adding `allow="accelerometer; gyroscope"` to their iframes for HTML games marked as "mobile friendly." Check if sensors work inside the iframe first.

### Step 4: Updating

1. Re-zip the `build/` folder
2. Go to your itch.io project → Edit
3. Delete the old upload, re-upload the new zip
4. Save

---

## Option B: Vercel + Free Relay (Full Feature)

**Why Vercel?** One-click deploy from GitHub, instant HTTPS, global CDN, free tier is generous, auto-deploys on every push.

**Cost: $0** on the Hobby tier.

### Steps

1. **Push the `build/` folder to GitHub** (if not already):
   ```bash
   cd build
   git init && git add . && git commit -m "shrimp fried rice v0.6"
   git remote add origin https://github.com/YOUR_USERNAME/shrimp-fried-rice.git
   git push -u origin main
   ```
   Or use the existing repo: `CarlKho-Minerva/ShrimpFriedRice`

2. **Go to [vercel.com](https://vercel.com)** → Sign in with GitHub

3. **Click "Add New Project"** → Import your repo

4. **Configure:**
   | Setting | Value |
   |---------|-------|
   | Framework Preset | `Other` |
   | Root Directory | `build` (click "Edit" to change) |
   | Build Command | *(leave empty — no build step)* |
   | Output Directory | `.` |

5. **Click Deploy** → Wait ~15 seconds

6. **Done!** Your URL: `https://shrimp-fried-rice-XXXX.vercel.app`

### Auto-Deploy
Every `git push` to `main` auto-deploys. No manual steps.

> **Note:** Vercel serves static files only. For the QR code phone controller flow, you still need a WebSocket relay. See [Free Relay Hosting Options](#free-relay-hosting-options).

---

## Option C: Netlify

### Drag-and-Drop (Easiest — No GitHub Required)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the entire `build/` folder onto the page
3. Done — instant deploy with HTTPS
4. URL: `https://random-name.netlify.app` (click "Site settings" to rename)

### From GitHub

1. Go to [netlify.com](https://netlify.com) → Sign in with GitHub
2. "Add new site" → "Import an existing project"
3. Configure: Base directory: `build`, Build command: *(empty)*, Publish directory: `build`
4. Click "Deploy site"

---

## Option D: Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create
2. Connect to Git → Select your repo
3. Configure: Production branch: `main`, Build command: *(empty)*, Output directory: `build`
4. Click "Save and Deploy"
5. URL: `https://shrimp-fried-rice.pages.dev`

---

## Option E: GitHub Pages

1. Go to your repo on GitHub → Settings → Pages
2. Source: Deploy from a branch
3. If your `index.html` is inside `build/`, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: build
      - id: deployment
        uses: actions/deploy-pages@v4
```

4. URL: `https://YOUR_USERNAME.github.io/REPO_NAME/`

---

## The Relay Problem

Here's the thing most hosting guides don't tell you: **static hosts can't run WebSocket servers.**

Vercel, Netlify, itch.io, GitHub Pages — they all serve files. That's it. They don't run persistent processes. Your `serve.js` WebSocket relay needs a **runtime**.

**What this means:**
- ✅ **Desktop mode**: Works on any static host
- ✅ **On-device phone mode**: Open the game URL directly on a phone → sensors work (HTTPS required)
- ❌ **QR code → separate phone controller**: Needs the WebSocket relay running somewhere

**For local demos and class presentations:** Just use `./start.sh` — it runs the relay locally + ngrok tunnel. This is the best option for GDC-style demos.

**For permanent online hosting:** You need a relay server. Here are free options:

---

## Free Relay Hosting Options

### Option 1: Render.com (Recommended for Students)

**Cost: $0.** Free tier includes a web service with WebSocket support.

1. Push `serve.js` + `relay/package.json` + `build/` to a GitHub repo
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo
4. Configure:
   | Setting | Value |
   |---------|-------|
   | Runtime | Node |
   | Build Command | `cd relay && npm install` |
   | Start Command | `node serve.js` |
   | Plan | Free |
5. Deploy. You get a URL like `https://shrimp-fried-rice.onrender.com`
6. This serves BOTH the game AND the WebSocket relay on one URL

> **Caveat:** Render free tier spins down after 15 minutes of inactivity. First load takes ~30s to wake up. Fine for demos, not for 24/7 availability.

### Option 2: Railway.app

**Cost: $0** with $5/month free credit (more than enough).

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo
3. Railway auto-detects Node.js, runs `node serve.js`
4. Done. URL: `https://shrimp-fried-rice.up.railway.app`

> Railway keeps the process alive 24/7 within the free credit. WebSockets work natively.

### Option 3: Fly.io

**Cost: $0** for small apps.

```bash
# Install fly CLI
brew install flyctl

# From game-3/ directory
fly launch --name shrimp-fried-rice
# Select free tier, nearest region
fly deploy
```

### Option 4: Keep Using ngrok (Free, Ephemeral)

For class presentations and playtesting, `./start.sh` + ngrok is honestly the simplest option:
- Run `./start.sh` on your laptop
- Share the ngrok URL
- Session lasts ~2 hours on free tier
- No deployment, no configuration

---

## After Deploying: Testing Sensors

### iOS (Safari)
1. Open the deployed HTTPS URL in Safari
2. Tap **COOK** → Permission dialog appears
3. Tap **Allow** for both motion and orientation
4. Tilt and shake!

> If you denied: Settings → Safari → Advanced → Website Data → clear the domain → reload

### Android (Chrome)
1. Open the HTTPS URL in Chrome
2. Sensors auto-grant over HTTPS — no dialog
3. If sensors don't work: address bar → lock icon → Permissions → Motion sensors → Allow
4. Still nothing? `chrome://flags` → "Generic Sensor Extra Classes" → Enabled → Relaunch

### Desktop
- Arrow keys / WASD to tilt
- Space = toss (S1) or swat (S3)
- Enter = swat (S2/S3)
- Escape = skip calibration

---

## Publishing on Game Stores

### Steam

**Cost: $100** one-time fee per title (Steamworks partner registration).

Steam doesn't host HTML games directly — you'd need to wrap the game in an Electron or NW.js shell to create a native executable.

1. **Wrap in Electron:**
   ```bash
   npm init -y
   npm install electron --save-dev
   ```
   Create `main.js`:
   ```javascript
   const { app, BrowserWindow } = require('electron');
   app.whenReady().then(() => {
     const win = new BrowserWindow({ width: 420, height: 800, webPreferences: { nodeIntegration: false } });
     win.loadFile('build/index.html');
   });
   ```
   Build with `electron-builder` for macOS/Windows/Linux.

2. **Create a Steamworks account** at [partner.steamgames.net](https://partner.steamgames.net)
3. **Pay the $100 app fee** (refunded after $1,000 in revenue)
4. Upload your build via Steam's ContentBuilder
5. Fill out store page, screenshots, description
6. Submit for review (~2–5 business days)

> **Honest take for a student:** The $100 fee + Electron wrapper complexity is not worth it for an experimental prototype. itch.io is the right platform for this stage. Consider Steam if you continue development into a full game.

### Epic Games Store

**Cost: $0** (Epic removed the $100 fee). Submit at [store.epicgames.com/publish](https://store.epicgames.com/en-US/publish). Same Electron wrapper requirement. Review process is stricter.

### GOG.com

By invitation or application. Curated, so they need to accept your game. Submit at [gog.com/indie](https://www.gog.com/indie). Very unlikely for a prototype — they focus on finished games.

### Recommendation for Students
1. **itch.io** — publish now, free, game jam community, HTML games native
2. **GitHub Pages or Vercel** — free, permanent link for your portfolio
3. **Steam** — only if you develop this into a full, polished release

---

## Quick Comparison

| Host | Cost | WebSocket Relay | Auto-Deploy | Best For |
|------|------|----------------|-------------|----------|
| **itch.io** | Free | ❌ (use ngrok for demos) | Manual | Game community, portfolios |
| **Vercel** | Free | ❌ (static only) | ✅ on push | Portfolio site, fast CDN |
| **Render** | Free | ✅ | ✅ on push | Full game + relay, cheap |
| **Railway** | $5 free credit | ✅ | ✅ on push | Persistent relay |
| **Netlify** | Free | ❌ (static only) | ✅ on push | Drag-and-drop simplicity |
| **ngrok** | Free | ✅ (local) | N/A | Class demos, playtesting |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Sensors don't work | Make sure you're on **HTTPS**, not HTTP |
| QR code scan → nothing happens | The relay server isn't running. Use `./start.sh` locally or deploy to Render/Railway |
| itch.io sensors blocked in iframe | Use "Open in new tab" or fullscreen button |
| Old version showing | Hard refresh: Cmd+Shift+R |
| "Permission denied" on iOS | Close tab, reopen, tap Allow this time |
| ngrok session expired | Restart `./start.sh` — free tier lasts ~2 hours |
| Render app sleeping | First load takes ~30s to wake. Wait and reload. |

---

*Last updated: v0.6 — Shrimp Fried Rice*
