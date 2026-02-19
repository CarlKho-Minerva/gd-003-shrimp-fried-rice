# 🌐 Hosting Shrimp Fried Rice on the Edge

> **TL;DR** — This game is 4 static files (`index.html`, `game.js`, `config.js`, `style.css`). No server, no build step, no database. Drop the `build/` folder into **any** static host and it works.

---

## Table of Contents

1. [What You're Deploying](#what-youre-deploying)
2. [Option A: Vercel (Recommended)](#option-a-vercel-recommended)
3. [Option B: Netlify](#option-b-netlify)
4. [Option C: Cloudflare Pages](#option-c-cloudflare-pages)
5. [Option D: GitHub Pages](#option-d-github-pages)
6. [Option E: itch.io](#option-e-itchio)
7. [After Deploying: Testing Sensors](#after-deploying-testing-sensors)
8. [Custom Domain (Optional)](#custom-domain-optional)
9. [Troubleshooting](#troubleshooting)

---

## What You're Deploying

```
build/
├── index.html    ← Entry point
├── config.js     ← Tunable constants
├── game.js       ← Game engine
└── style.css     ← Styling
```

**Requirements from the host:**
- HTTPS (required for phone sensor APIs — `DeviceMotionEvent` / `DeviceOrientationEvent`)
- Serves static files (no server-side runtime needed)

All the options below provide HTTPS by default. ✅

---

## Option A: Vercel (Recommended)

**Why Vercel?** One-click deploy, instant HTTPS, global CDN, free tier is generous.

### Steps

1. **Push to GitHub** (if not already):
   ```bash
   # From the game-3/ directory
   cd build
   git init
   git add .
   git commit -m "deploy shrimp fried rice"
   git remote add origin https://github.com/YOUR_USERNAME/shrimp-fried-rice.git
   git push -u origin main
   ```
   Or use the existing repo: `CarlKho-Minerva/gd-003-shrimp-fried-rice`

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

6. **Done!** Your URL is `https://shrimp-fried-rice-XXXX.vercel.app`

### Updating

Every `git push` to `main` auto-deploys. No manual steps needed.

---

## Option B: Netlify

### Steps

1. **Go to [netlify.com](https://netlify.com)** → Sign in with GitHub

2. **Click "Add new site" → "Import an existing project"**

3. **Connect your GitHub repo**

4. **Configure:**
   | Setting | Value |
   |---------|-------|
   | Base directory | `build` |
   | Build command | *(leave empty)* |
   | Publish directory | `build` |

5. **Click "Deploy site"**

6. **Done!** URL: `https://random-name.netlify.app`
   - Click "Site settings" → "Change site name" to customize

### Drag-and-Drop Alternative (No GitHub)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the entire `build/` folder onto the page
3. Done — instant deploy with HTTPS

---

## Option C: Cloudflare Pages

### Steps

1. **Go to [dash.cloudflare.com](https://dash.cloudflare.com)** → Workers & Pages → Create

2. **Connect to Git** → Select your repo

3. **Configure:**
   | Setting | Value |
   |---------|-------|
   | Production branch | `main` |
   | Build command | *(leave empty)* |
   | Build output directory | `build` |

4. **Click "Save and Deploy"**

5. **Done!** URL: `https://shrimp-fried-rice.pages.dev`

---

## Option D: GitHub Pages

### Steps

1. **Go to your repo on GitHub** → Settings → Pages

2. **Source:** Deploy from a branch

3. **Branch:** `main` → Folder: `/` (root)
   - ⚠️ This means `index.html` must be at the repo root. If it's inside `build/`, you have two options:
     - **Option 1:** Use GitHub Actions (see below)
     - **Option 2:** Push only the `build/` contents as the repo root

4. **Using GitHub Actions** (if your files are in `build/`):

   Create `.github/workflows/deploy.yml`:
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

5. **Done!** URL: `https://YOUR_USERNAME.github.io/REPO_NAME/`

---

## Option E: itch.io

Best for game jams and reaching the indie game community.

### Steps

1. **Zip the `build/` folder:**
   ```bash
   cd game-3
   zip -r shrimp-fried-rice.zip build/
   ```

2. **Go to [itch.io/game/new](https://itch.io/game/new)**

3. **Fill in:**
   | Field | Value |
   |-------|-------|
   | Title | Shrimp Fried Rice |
   | Kind of project | HTML |
   | Upload | `shrimp-fried-rice.zip` |
   | ☑️ This file will be played in the browser | Checked |

4. **Viewport dimensions:** `400 x 400` (or `100% x 100%` for fullscreen)

5. **Check "SharedArrayBuffer support"** if available (not required)

6. **Save & view page** → Test it

### ⚠️ itch.io Sensor Caveat

itch.io wraps your game in an `<iframe>`. Phone sensors (`DeviceMotionEvent`) may be blocked by the iframe sandbox. To fix this:

- Add `allow="accelerometer; gyroscope"` to the iframe ... but **you can't control itch.io's iframe attributes**.
- **Workaround:** Add a "Fullscreen" button on your itch.io page description linking directly to the game files, or use the "Open in new tab" feature.

---

## After Deploying: Testing Sensors

### iOS (Safari)

1. Open the deployed URL in Safari
2. Tap **COOK** → A permission dialog appears:
   > "shrimpfriedrice.vercel.app would like to access motion and orientation"
3. Tap **Allow**
4. Tilt and shake!

### Android (Chrome)

1. Open the deployed URL in Chrome
2. Sensors auto-grant over HTTPS — no permission dialog
3. If sensors don't work:
   - Go to `chrome://flags`
   - Search: `Generic Sensor Extra Classes`
   - Set to **Enabled** → Relaunch Chrome

### Desktop

1. Open the URL in any browser
2. Use **arrow keys / WASD** to tilt
3. **Space** = toss (S1/S3) or swat (S2)
4. **Enter** = swat (S2/S3)
5. Click/tap also tosses

---

## Custom Domain (Optional)

All hosts above support custom domains. General steps:

1. Buy a domain (Namecheap, Cloudflare, Google Domains)
2. In your host's dashboard, add the custom domain
3. Update DNS:
   - **Vercel/Netlify/Cloudflare:** Add a CNAME record pointing to the host's URL
4. Wait for DNS propagation (~5 min for Cloudflare, ~24h for others)
5. HTTPS certificate auto-provisions

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Sensors don't work | Make sure you're on **HTTPS**, not HTTP |
| "Not secure" warning | Your host isn't serving HTTPS — switch hosts |
| 404 on page load | Check that `index.html` is in the root of your publish directory |
| Old version showing | Hard refresh: Ctrl+Shift+R / Cmd+Shift+R |
| itch.io sensors broken | Use "Open in new tab" or link to deployed URL directly |
| Blank screen on phone | Check browser console for JS errors — may be a syntax issue in older Safari |
| "Permission denied" on iOS | User tapped "Don't Allow" — close tab, reopen, tap Allow this time |

---

## Quick Comparison

| Host | Deploy Time | Auto-Deploy | Custom Domain | Best For |
|------|------------|-------------|---------------|----------|
| **Vercel** | ~15s | ✅ on push | ✅ Free | Fastest workflow |
| **Netlify** | ~20s | ✅ on push | ✅ Free | Drag-and-drop option |
| **Cloudflare** | ~30s | ✅ on push | ✅ Free | Global performance |
| **GitHub Pages** | ~60s | ✅ via Actions | ✅ Free | Already using GitHub |
| **itch.io** | ~30s | ❌ Manual | ❌ | Game community reach |

---

*Last updated: v0.5 — Shrimp Fried Rice*
