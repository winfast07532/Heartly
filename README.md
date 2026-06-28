# 💕 Heartly

**Love, unlocked daily.**

Heartly is a handcrafted, mobile-first web app built by Robert for Ana — a personal love-letter platform disguised as a native iOS app. Every letter, every surprise, every detail is made specifically for one person. It's not a template. It's not generic. It's theirs.

Open it every day. Read what he wrote. Feel close. That's all this is — and it's more than enough.

---

## ✨ Features

### 💌 Letters & Notes
- **Short Notes, Surprises & Letters** — Three categories of content Robert writes for Ana, each with its own style and unlock cost.
- **Letter Purchase System** — Ana earns Universal Points and spends them to unlock new letters in the Explore tab.
- **Favourites** — Save the most meaningful letters to revisit anytime.
- **Reactions** — React to letters with emoji.

### 🏠 Home
- **Welcome Screen** — A personal onboarding message from Robert when Ana first opens the app.
- **Daily Streak Tracker** — Tracks consecutive days Ana opens Heartly.
- **Mood Picker** — Ana picks how she's feeling today (Happy, Loved, Dreamy, Missing).
- **Goodnight Letter Countdown** — Live countdown to the next letter from Robert.
- **Progress Tracker** — Universal Points progress toward the next milestone.
- **Hub Card** — Centralized access to Wish List, Memory Jar, Love Map, Write to Robert, and more.

### 🔍 Explore
- **Searchable Letter Library** — Browse and search all letters across categories.
- **Sort Options** — Default, Newest, Oldest, or by Points cost.
- **Category Tabs** — Filter by Short Notes, Surprises, or Letters.

### 🎮 Play
- **Love Blast** — A block-puzzle game (drag blocks onto a grid, clear rows & columns for combos).
- **Color by Number** — Pixel-art painting game with fill tool and point rewards.
- **Love Clicker** — Tap-to-grow idle clicker with upgrades and surprises.
- All games earn Universal Points.

### 🔄 Exchange
- **Universal Points Economy** — Earn points from reading letters, playing games, streaks, and challenges.
- **Transaction History** — Full log of point earnings and spending.
- **Shop** — Spend points on themes, features, and unlockables:
  - 🎨 **Themes** — Midnight Rose, Royal Blue, Sakura, Golden Hour, Starlight
  - 🫙 **Memory Jar** — Shake for a random memory Robert wrote
  - 📍 **Love Map** — Places Robert pinned for Ana
  - 🎵 **Couple Song** — Set a relationship anthem
  - 📅 **Countdown Timer** — Count down to a special event
  - 🌙 **Good Night Mode** — Scheduled goodnight cards
  - 💑 **Couple Goals** — Shared goals tracker
  - 🗓️ **Memory Timeline** — Relationship milestones
  - 🎲 **Date Night Ideas** — Random date suggestions
  - 💬 **Daily Question** — A daily question from Robert
  - 🎵 **Playlist Builder** — Build a shared playlist
  - 🌹 **Flower Delivery** — Virtual bouquet with a note
  - 📸 **Photo of the Day** — Daily photo from Robert
  - 🧩 **Puzzle of the Week** — Solve a puzzle to reveal a secret message
  - 🎪 **Mini Challenge** — Daily challenges for Ana
  - 🎁 **Daily Gift Box** — Daily reward box
  - 🎰 **Lucky Spin** — Daily spin-the-wheel reward

### 📊 Logs
- **Relationship Timer** — Live counter showing days, hours, minutes, seconds together since August 10, 2023.
- **Stats Grid** — Letters read, points earned, day streak, letters sent.
- **Letter Breakdown** — Count by category (Notes, Surprises, Letters).
- **Relationship Timeline** — Visual milestone tracker (first day, first letter, streaks, anniversaries).
- **Achievements** — 30 unlockable achievements across multiple categories with progress tracking.
- **Updates & What's New** — In-app changelog.

### 👤 Profile
- **Couple Avatars & Names** — Ana & Robert displayed together.
- **Live Relationship Timer** — Days, hours, minutes, seconds together.
- **Stats Overview** — Letters read, streak, points, days together.
- **Love Languages** — Visual breakdown with animated progress bars.
- **Heartly Progress** — Points toward next milestone.
- **Favourite Letters** — Quick access to saved letters.
- **Achievements Preview** — Snapshot of unlocked achievements.
- **Account Switching** — Switch between Ana and Developer accounts.

### ⚙️ Settings
- **Notifications** — Toggle push notifications for letters, streaks, goodnight letters, milestones, surprises, and points.
- **Appearance** — Theme selector, reduce motion toggle, language.
- **Display & Format** — Date format, time format, relationship timer toggle, confetti toggle.
- **Privacy & Security** — App lock (Face ID), hide letter previews, screenshot protection, backup & restore.
- **Relationship** — Edit couple names, anniversary date, couple song, love language.

### 🛠️ Developer Mode (Robert's View)
- **Password-protected** access (`developer.login`).
- **Write Tab** — Compose and send letters to Ana with type selection, preview, and scheduling.
- **Ana Tab** — View Ana's mood, stats, activity feed, wish list, and messages from Ana.
- **Dev Tab** — Full developer console with:
  - Letter calendar with sent/scheduled indicators
  - Letter library management (add, edit, delete)
  - Shop item configuration
  - Feature configuration (Memory Jar, Countdown, Couple Song, etc.)
  - Points management (add, reset)
  - Theme control
  - Notification testing
  - Danger zone (reset data, force unlock shop)
- **Sent Tab** — Archive of all sent letters.
- **Settings Tab** — Theme and account management.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Markup** | HTML5 (semantic, single-page) |
| **Styling** | Pure CSS3 (custom properties / CSS tokens, animations, gradients, backdrop-filter, safe-area-inset) |
| **Logic** | Vanilla JavaScript (ES6+, no frameworks) |
| **State** | `localStorage` for all persistent data |
| **PWA** | Service Worker (`sw.js`) for push notifications and offline-ready behavior |
| **Font** | [Nunito](https://fonts.google.com/specimen/Nunito) via Google Fonts |
| **Games** | Embedded via `<iframe>` — Love Blast (`blockblast.html`), Color by Number (`colornum.html`), Love Clicker (`clicker.html`) |
| **Icons** | Inline SVG throughout (no icon library dependencies) |

### File Structure

```
heartly/
├── index.html              # Main app (single HTML file with all screens)
├── sw.js                   # Service Worker (push notifications, caching)
├── blockblast.html         # Love Blast game (iframe)
├── colornum.html           # Color by Number game (iframe)
├── clicker.html            # Love Clicker game (iframe)
├── clicker-script.js       # Love Clicker game logic
├── clicker-styles.css      # Love Clicker game styles
├── assets/
│   └── icon.jpg            # App icon (home screen, notifications)
├── css/
│   ├── tokens.css          # Design tokens (CSS custom properties)
│   ├── intro.css           # Intro / splash screen styles
│   ├── layout.css          # Core layout, tab bar, cards, grid
│   ├── profile.css         # Profile page styles
│   ├── modals.css          # Letter modal, buy sheet, overlays
│   ├── themes.css          # Theme definitions (rose, royal, sakura, etc.)
│   ├── robert.css          # Developer / Robert's view styles
│   └── overlays.css        # Game overlays, settings, misc overlays
├── js/
│   ├── state.js            # App state, localStorage, data model
│   ├── canvas.js           # Animated background canvas
│   ├── utils.js            # Utility functions, toast, ripple
│   ├── router.js           # Tab navigation, screen switching
│   ├── profile.js          # Profile page logic
│   ├── notifications.js    # Notification panel, push notifications
│   ├── exchange.js         # Points, shop, transactions
│   ├── login.js            # Login screen, account switching
│   ├── dev.js              # Dev panel logic
│   ├── themes.js           # Theme application
│   ├── robert.js           # Robert's view (write, activity, dev tools)
│   ├── letters.js          # Letter rendering, explore grid, search
│   ├── app.js              # App initialization, password, price editor
│   ├── intro.js            # Intro / onboarding flow
│   ├── wishlist.js         # Wish list feature
│   └── achievements.js     # Achievement system
└── levels/
    └── dog1.json           # Color by Number level data
```

### CSS Architecture

Styles are split into modular CSS files loaded in order:
1. **tokens.css** — All CSS custom properties (colors, radii, spacing, gradients)
2. **intro.css** — Splash screen, loading bar, onboarding slides
3. **layout.css** — App shell, tab bar, cards, grids, buttons, scrolling
4. **profile.css** — Profile page, stats, love languages, achievements
5. **modals.css** — Letter modal, buy sheet, overlays, sheets
6. **themes.css** — Theme color overrides (rose, royal, sakura, golden, starlight)
7. **robert.css** — Developer view, dev console, Robert's tabs
8. **overlays.css** — Game overlays, settings panel, misc UI

### JavaScript Architecture

Scripts are loaded in dependency order:
1. **state.js** — Must load first (defines `ED`, points, localStorage helpers)
2. **canvas.js** — Animated particle background
3. **utils.js** — Shared utilities (`T()` toast, `R()` ripple, helpers)
4. **router.js** — `go()` function for tab switching
5. Remaining modules load in any order after the above
6. **app.js** — Runs last, initializes everything
7. **intro.js**, **wishlist.js**, **achievements.js** — Post-init features

---

## 🚀 How to Run Locally

### Prerequisites
- Any modern web browser (Chrome, Safari, Firefox, Edge)
- A local HTTP server (required for Service Worker registration)

### Quick Start

**Option 1 — Python (built-in)**
```bash
cd heartly
python3 -m http.server 8000
# Open http://localhost:8000
```

**Option 2 — Node.js**
```bash
npx serve .
# Open http://localhost:3000
```

**Option 3 — PHP**
```bash
php -S localhost:8000
# Open http://localhost:8000
```

**Option 4 — VS Code**
- Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
- Right-click `index.html` → "Open with Live Server"

> ⚠️ **Do not open `index.html` directly as a file** (`file://`). The Service Worker and some features require HTTP.

---

## 📱 Deploy & Install as iOS Home Screen App

### Deploying

Heartly is a static site — no build step, no bundler, no server-side code. Deploy to any static hosting:

| Platform | Command / Steps |
|----------|----------------|
| **Vercel** | `vercel --prod` or connect GitHub repo |
| **Netlify** | Drag & drop the project folder, or connect repo |
| **GitHub Pages** | Push to `main`, enable Pages in repo settings |
| **Cloudflare Pages** | Connect repo, set build output to `/` |
| **Any web server** | Upload all files to the document root |

### Installing on iPhone (Add to Home Screen)

1. Open the deployed URL in **Safari** on your iPhone
2. Tap the **Share** button (square with arrow) at the bottom of Safari
3. Scroll down and tap **"Add to Home Screen"**
4. Name it **"Heartly"** (or keep the default)
5. Tap **"Add"**

The app will now:
- Appear on your home screen with the Heartly icon
- Launch in **full-screen mode** (no Safari browser UI)
- Feel like a native iOS app
- Support push notifications (iOS 16.4+)
- Remember your data between sessions via `localStorage`

### PWA Behavior

Heartly uses these PWA meta tags for native-like behavior:
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Heartly">
<meta name="mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#08000f">
```

The Service Worker (`sw.js`) handles:
- Push notification delivery and click handling
- Background notification display with custom icons

---

## 🎨 Themes

| Theme | Description |
|-------|-------------|
| 🌹 **Midnight Rose** | Default — deep dark with rose/pink accents |
| 💎 **Royal Blue** | Deep blue with indigo/violet tones |
| 🌸 **Sakura** | Soft pink cherry blossom aesthetic |
| ☀️ **Golden Hour** | Warm amber and gold sunset tones |
| ✨ **Starlight** | Purple/violet cosmic night sky |

Themes are applied via CSS custom property overrides in `css/themes.css` and can be switched from Settings or the Shop.

---

## 🔐 Accounts

| Account | Handle | Access |
|---------|--------|--------|
| **Ana** | `nevasta.lui.robert` | Main user — reads letters, plays games, earns points, shops |
| **Developer** | `developer.login` | Robert's view — writes letters, manages content, dev tools |

Developer mode is password-protected. Default password: `heartly.dev`

---

## 📋 Version

**Current: v4.3.11**

Recent changes:
- Home screen cards merged into one hub
- Love Clicker game added to Play
- Updates log added to Logs
- Lucky Spin daily reward
- Daily Gift Box unlockable in shop
- Relationship Milestones card
- Mood Tracker for Robert

---

## 💡 Design Philosophy

- **Mobile-first, always** — Designed for iPhone Safari, optimized for touch
- **No frameworks** — Pure HTML/CSS/JS for maximum speed and zero dependencies
- **Feels native** — Full-screen PWA, iOS-style animations, haptic-like feedback via CSS
- **Personal, not generic** — Every screen, every word is crafted for one specific person
- **Offline-capable** — All data lives in `localStorage`, works without internet after first load
- **Beautiful by default** — Glassmorphism, gradient accents, smooth transitions, animated backgrounds

---

## 📄 License

This is a personal project. Not intended for redistribution.

Made with 💕 by Robert, for Ana.
#   H e a r t l y  
 