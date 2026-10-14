# 💕 Heartly

**Love, unlocked daily.**

Heartly is a handcrafted, mobile-first web app built by Robert for Ana — a personal love-letter platform disguised as a native iOS app. Every letter, every surprise, every detail is made specifically for one person. It's not a template. It's not generic. It's theirs.

Open it every day. Read what he wrote. Feel close. That's all this is — and it's more than enough.

---

## ✨ Features

### 💌 Letters & Notes
- **Short Notes & Letters** — Real text content Robert writes for Ana, unlockable with points.
- **Surprises** — 15 real, interactive animations (`js/surprises.js`, `css/surprises.css`) instead of text — flower bouquet, growing flower, petal shower, gift unwrap, balloon pop, floating hearts, fireworks, confetti cannon, scratch card, music box, snow globe, candle blow-out, pop-up card, firefly jar, wax seal letter. Unlockable with points like any other Explore item, then opened in a shared full-screen player (`#surprise-player`). Each has an editable message and price:
  - **Message text**: edit directly in `js/surprises.js` — every entry in `SURPRISE_DEFS` has a `message` field marked `// EDIT MESSAGE:` right above it.
  - **Price**: edit from the app — Dev tab → Settings → 🎁 Surprises Pricing.
  - Seeded once per install as real catalog entries (`seedSurpriseCatalog()`, called after real state loads on login) — not fake demo data, and never re-seeds over a price you've already changed.
- **Letter Purchase System** — Ana earns Universal Points and spends them to unlock new letters in the Explore tab.
- **Favourites** — Save the most meaningful letters to revisit anytime.
- **Reactions** — React to letters with emoji.
- **Real push notifications** — When Robert sends a new unlocked letter from the Dev tab, Ana's device(s) get a genuine push notification (see [Push Notifications](#-push-notifications--supabase) below) *and* a real entry appears in her in-app Notifications panel — no placeholder/demo content, only things that actually happened.

### 🏠 Home
- **Welcome Screen** — A personal onboarding message from Robert when Ana first opens the app.
- **Daily Streak Tracker** — Tracks consecutive days Ana opens Heartly.
- **Mood Picker** — Ana picks how she's feeling today (Happy, Loved, Dreamy, Missing).
- **Goodnight Letter Countdown** — Live countdown to the next letter from Robert.
- **Progress Tracker** — Universal Points progress toward the next milestone.
- **Unified Home Hub** — Every owned shop feature (Couple Song, Countdown, Couple Goals, Date Night Picker, Daily Question, Flower Delivery, Photo of the Day, Puzzle of the Week, Mini Challenge, Streak Shield, Daily Bonus, Gift Box, Lucky Spin, Good Night Mode, Wish List, Memory Jar, Love Map, Write to Robert) renders through one consistent flush-row component (`renderHubFeatureCard()` in `js/themes.js`). Owning a feature always shows it — configured features show real content, unconfigured ones show an honest "Robert hasn't set this up yet 💤" placeholder instead of vanishing.

### 🔍 Explore
- **Searchable Letter Library** — Browse and search all letters across categories.
- **Sort Options** — Default, Newest, Oldest, or by Points cost.
- **Category Tabs** — Filter by Short Notes, Surprises, or Letters.

### 🎮 Play
- **Love Blast** (`loveblast/`) — A block-puzzle game (drag blocks onto a grid, clear rows & columns for combos).
- **Color by Number** (`pixelart/`) — Remade solo coloring game in Heartly’s rose arcade style. Includes pinch zoom, drag painting, connected fill, hints, a saved collection, custom picture imports, PNG export, and one-time Heartly rewards. Progress and custom pictures use the existing Supabase state sync. See `pixelart/README.md`.
- **Love Clicker** (`clicker/`) — Tap-to-grow idle clicker with upgrades and surprises. Runs in a same-origin iframe with a real cross-frame bridge back into the main app (`window.parent.reportClickerSession(...)`) — session count, best score, and lifetime score are reported into the main app's real persisted state, which is what makes real Love Clicker achievements possible (see [Achievements](#-achievements) below).
- All available games earn Universal Points.

### 🔄 Exchange
- **Universal Points Economy** — Earn points from reading letters, playing games, streaks, and challenges. A separate lifetime `totalPtsEarned` counter (only ever increases) tracks total points ever earned, independent of your spendable balance — used for points-based achievements.
- **Transaction History** — Full log of point earnings and spending.
- **Shop** — Spend points on themes, features, and unlockables:
  - 🎨 **Themes** — Midnight Rose, Royal Blue, Sakura, Golden Hour, Starlight
  - 🫙 **Memory Jar** — Shake for a random memory Robert wrote
  - 📍 **Love Map** — Places Robert pinned for Ana
  - 🎵 **Couple Song** — Set a relationship anthem
  - 📅 **Countdown Timer** — Count down to a special event
  - 🌙 **Good Night Mode** — Scheduled goodnight cards
  - 💑 **Couple Goals** — Shared goals tracker
  - 🎲 **Date Night Ideas** — Random date suggestions
  - 💬 **Daily Question** — A daily question from Robert, answered privately
  - 🌹 **Flower Delivery** — Virtual bouquet with a note
  - 📸 **Photo of the Day** — Daily photo from Robert, blurred until tapped
  - 🧩 **Puzzle of the Week** — Solve a puzzle to reveal a secret message
  - 🎪 **Mini Challenge** — Daily challenges for Ana
  - 🎁 **Daily Gift Box** — Daily reward box
  - 🎰 **Lucky Spin** — Daily spin-the-wheel reward
  - 🛡️ **Streak Shield** — Protects the streak once per week if a day is missed

### 🔔 Notifications
- **Real in-app notification log** (`js/notifications.js`) — driven entirely by actual events (a real letter sent, a real streak milestone hit). Nothing hardcoded or pre-seeded; if nothing real has happened yet, the panel honestly says "All caught up! 💕" instead of showing placeholder activity. Entries persist across sessions, track read/dismissed state for real, and tapping a letter notification opens that real letter.

### 📊 Logs
- **Relationship Timer** — Live counter showing days, hours, minutes, seconds together since the real relationship start date.
- **Stats Grid** — Letters read, points earned, day streak, letters sent.
- **Letter Breakdown** — Count by category (Notes, Surprises, Letters).
- **Relationship Timeline** — Visual milestone tracker (first day, first letter, streaks, anniversaries).
- **Achievements** — see below.
- **Updates & What's New** — In-app changelog.

### 🏆 Achievements
49 real, state-driven achievements across 8 categories (`js/achievements.js`) — **nothing is hardcoded as earned/locked**. Every achievement has a `check()` function that reads genuine app state:

| Category | Count | Driven by |
|---|---|---|
| Love Letters | 7 | `totalLettersSent` (real counter, incremented only when Robert actually sends a letter) |
| Streaks | 6 | `bestStreak` |
| Games | 5 | Real Love Clicker session data reported through the cross-frame bridge |
| Points | 5 | `totalPtsEarned` lifetime counter |
| Shop Collection | 5 | Live count of owned `SHOP_ITEMS`, generic — no item names hardcoded |
| Relationship | 10 | Real memory jar / love map / wish list / couple goals / puzzle / daily question data |
| Daily Habits | 6 | Real lifetime counts of Daily Bonus claims, Gift Box opens, Lucky Spins, Mini Challenges completed |
| Extras | 5 | Mood set, Robert's mood set, theme changed, streak shield used, flowers opened |

Earning is **permanent**: the moment a `check()` first passes, the achievement ID + real timestamp is written to `earnedAchievements` and persisted — it's never re-evaluated afterward, so it can't be "un-earned" by a later state change (e.g. a reset streak).

⚠️ **Important timing rule:** achievement checks only ever run *after* real state has been loaded (i.e. after `loadState()` + `initSync()` complete inside `doLogin()` in `js/login.js`) — never on page load / `DOMContentLoaded`. Checking earlier would evaluate against blank in-memory defaults (falsely earning date-based milestones instantly on every fresh boot), prematurely call `saveState()` before real local/synced data was ever loaded, and risk overwriting real Supabase-synced state with a blank default blob. This exact bug shipped once and was fixed — see [Changelog](#-version).

**Dev testing tool** (Robert's dashboard → Settings → Danger Zone):
- **🏆 Simulate All Achievement Stats** — temporarily stages every real stat high enough to pass every `check()`, runs the actual `checkAchievements()` pass (exercising the real logic, not a fake shortcut), permanently records whatever gets earned, then fully restores every real value/array/object exactly as it was. No fake data is left behind in the wishlist, memory jar, etc.
- **↩️ Reset Achievement Stats** — clears `earnedAchievements` back to empty so achievements can be re-tested from scratch. Does not touch real progress (streaks, points, letters, etc.).

### 👤 Profile
- **Couple Avatars & Names** — Ana & Robert displayed together.
- **Live Relationship Timer** — Days, hours, minutes, seconds together.
- **Stats Overview** — Letters read, streak, points, days together.
- **Love Languages** — Visual breakdown with animated progress bars.
- **Heartly Progress** — Points toward next milestone.
- **Favourite Letters** — Quick access to saved letters.
- **Achievements Preview** — Live snapshot of the 6 most recently earned real achievements.
- **Account Switching** — Switch between Ana and Developer accounts.

### ⚙️ Settings
- **Notifications** — Toggle real push notifications and in-app notification logging for letters, streaks, and other real event types (persisted for real — this used to silently reset every reload; fixed).
- **Appearance** — Theme selector, reduce motion toggle, language.
- **Display & Format** — Date format, time format, relationship timer toggle, confetti toggle.
- **Privacy & Security** — App lock (Face ID / WebAuthn), hide letter previews, screenshot protection, backup & restore.
- **Relationship** — Edit couple names, anniversary date, couple song, love language.

### 🛠️ Developer Mode (Robert's View)
- **Password-protected** access (`developer.login`).
- **Dev Tab** — Full developer console with:
  - Letter calendar with sent/scheduled indicators
  - Letter library management (add, edit, delete) — sending a real unlocked letter is what actually triggers the real push notification + real in-app notification log entry for Ana
  - Shop item configuration for every feature (Couple Song, Countdown, Memory Jar, Love Map, Couple Goals, Date Night, Daily Question, Flower Delivery, Photo of the Day, Puzzle, Mini Challenge, Good Night time, etc.)
  - Points management (add, reset)
  - Theme control
  - Notification testing
  - Push notification **Enable** card (mirrors Ana's) — status reflects the real per-device subscription on file in Supabase, not just OS-level permission; the button never gets permanently stuck, so a mismatched/stale device registration can always be fixed by tapping Enable again
  - **Danger Zone** — reset all data, force-unlock all shop items (for real, triggers real achievement checks), and the achievement testing tools described above
- **Ana Tab** — View Ana's mood, stats, activity feed, wish list, and messages from Ana.
- **Sent Tab** — Archive of all sent letters.
- **Settings Tab** — Theme, notifications, and account management.

---

## 🔔 Push Notifications & Supabase

Heartly has a real backend for two things: **push notifications** and **cross-device state sync**. Both run on a single free-tier Supabase project.

### Push notifications (`js/push.js` + `supabase/functions/send-push`)
- Each device that taps **Enable** registers a real Web Push subscription, stored as its own row in `push_subscriptions` (schema: `supabase/migrations/001_push_notifications.sql`, `002_push_multi_device.sql`).
- **Multi-device support**: the table's primary key is a generated `id`, not `role` — so Ana or Robert can have multiple real devices (phone, PC, a second browser) registered at once, and `send-push` notifies all of them, not just the most recently registered one. (Originally `role` was the primary key, meaning a second device silently evicted the first — fixed.)
- `send-push` is called directly from the client (`triggerPush()` in `js/push.js`) whenever something real happens — a letter sent, a streak milestone hit.
- `evening-check` runs on a Supabase Cron schedule (recommended every 5 min) for the two time-based notification types that aren't tied to a button click: the goodnight letter and an evening streak-at-risk reminder.
- Both edge functions trim their VAPID secrets defensively (`.trim()`) — a stray trailing newline in a pasted secret once caused every Apple/iOS push to silently fail with `403 BadJwtToken` while FCM/Android pushes worked fine, which looked like a deploy/cache problem for a long time before the real cause was found.

### State sync (`js/sync.js`)
- Real-time sync between Ana's and Robert's devices via a single shared Supabase row (table: `couple_state`, fixed row id `heartly-couple`).
- Moves the exact same JSON blob `saveState()` already builds — no separate data model for local vs. synced state.
- `initSync()` only runs *after* `loadState()` inside `doLogin()`, specifically so nothing writes/pushes a blank default state to Supabase before real data has actually been loaded (see the achievements timing note above for why that guard matters — a violation of this exact rule was a real, shipped bug).

### Setup
See `supabase/README.md` for full setup steps: creating the project, running the migrations, deploying both edge functions, and setting the `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` / `APP_TIMEZONE` secrets.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Markup** | HTML5 (semantic, single-page) |
| **Styling** | Pure CSS3 (custom properties / CSS tokens, animations, gradients, backdrop-filter, safe-area-inset) |
| **Logic** | Vanilla JavaScript (ES6+, no frameworks) |
| **State** | `localStorage` for all local persistence, synced in real time to Supabase Postgres |
| **Backend** | Supabase (Postgres + Realtime + Edge Functions) — push notifications and cross-device sync |
| **PWA** | Service Worker (`sw.js`) for push notification delivery |
| **Font** | [Nunito](https://fonts.google.com/specimen/Nunito) via Google Fonts |
| **Games** | Embedded via `<iframe>` — Love Blast (`loveblast/`), Color by Number (`pixelart/`), Love Clicker (`clicker/`, with a real cross-frame data bridge back into the main app) |
| **Icons** | Inline SVG throughout (no icon library dependencies) |

### File Structure

```
heartly/
├── index.html                        # Main app (single HTML file with all screens)
├── sw.js                             # Service Worker (push notification delivery)
├── readme.md                         # This file
├── claude.md                         # Project context/rules for AI-assisted development
├── assets/
│   └── icon.jpg                      # App icon (home screen, notifications)
├── css/
│   ├── tokens.css                    # Design tokens (CSS custom properties)
│   ├── intro.css                     # Intro / splash screen styles
│   ├── layout.css                    # Core layout, tab bar, cards, grid, hub rows
│   ├── profile.css                   # Profile page styles
│   ├── modals.css                    # Letter modal, buy sheet, overlays
│   ├── themes.css                    # Theme definitions (rose, royal, sakura, etc.)
│   ├── robert.css                    # Developer / Robert's view + unified home-hub feature card
│   ├── surprises.css                 # Surprise player overlay + all 15 animations
│   └── overlays.css                  # Game overlays, settings, notification status widget, misc
├── js/
│   ├── state.js                      # App state, localStorage, data model, lifetime achievement counters
│   ├── canvas.js                     # Animated background canvas
│   ├── utils.js                      # Utility functions, toast, ripple, mood pickers
│   ├── router.js                     # Tab navigation, screen switching
│   ├── profile.js                    # Profile page logic
│   ├── notifications.js              # Real in-app notification log + push permission UI
│   ├── exchange.js                   # Points, shop, transactions
│   ├── sync.js                       # Real-time Supabase state sync (Ana ↔ Robert)
│   ├── push.js                       # Web Push subscription + triggerPush()
│   ├── login.js                      # Login screen, account switching, post-load hooks
│   ├── dev.js                        # Dev panel logic, real letter-send pipeline
│   ├── themes.js                     # Theme application + unified home-hub feature cards + shop
│   ├── robert.js                     # Robert's view (dev tools, Ana activity, dev QA cheats)
│   ├── letters.js                    # Letter rendering, explore grid, search
│   ├── app.js                        # App initialization, password, price editor
│   ├── intro.js                      # Intro / loading screen (runs before login — no state access)
│   ├── wishlist.js                   # Wish list feature
│   ├── faceid.js                     # WebAuthn app-lock
│   ├── settings.js                   # Settings screens
│   ├── icons.js                      # Inline SVG icon helpers
│   ├── modal.js                      # Generic modal system
│   ├── achievements.js               # Real, state-driven achievement system (49 achievements)
│   └── surprises.js                  # 15 interactive surprise animations + pricing admin
├── clicker/
│   ├── index.html                    # Love Clicker game (iframe)
│   ├── clicker-script.js             # Game logic + real cross-frame bridge to the main app
│   └── clicker-styles.css
├── loveblast/
│   ├── index.html                    # Love Blast game (iframe)
│   ├── script.js
│   └── style.css
├── pixelart/
│   ├── index.html                    # Color by Number game (iframe) — solo coloring studio
│   ├── script.js
│   └── style.css
├── levels/
│   └── dog1.json                     # Color by Number level data
└── supabase/
    ├── README.md                     # Backend setup steps
    ├── migrations/
    │   ├── 001_push_notifications.sql
    │   └── 002_push_multi_device.sql # Multi-device push support (role no longer the primary key)
    └── functions/
        ├── send-push/index.ts        # Sends a real push to every device on file for a role
        └── evening-check/index.ts    # Scheduled goodnight + streak-risk notifications
```

### CSS Architecture

Styles are split into modular CSS files loaded in order:
1. **tokens.css** — All CSS custom properties (colors, radii, spacing, gradients)
2. **intro.css** — Splash screen, loading bar, onboarding slides
3. **layout.css** — App shell, tab bar, cards, grids, buttons, scrolling, `.hub-row` pattern
4. **profile.css** — Profile page, stats, love languages, achievements preview
5. **modals.css** — Letter modal, buy sheet, overlays, sheets
6. **themes.css** — Theme color overrides (rose, royal, sakura, golden, starlight)
7. **robert.css** — Developer view, dev console, unified `.hub-feature-card` component, notification status widget
8. **overlays.css** — Game overlays, settings panel, misc UI

### JavaScript Architecture

Scripts are loaded in dependency order (see the `<script>` tags at the bottom of `index.html` for the exact, current order):

1. **state.js** — Must load first (defines the entire data model, `saveState`/`applyState`, all persisted vars)
2. **canvas.js**, **utils.js**, **modal.js**, **router.js**, **profile.js**, **notifications.js**, **exchange.js**
3. **Supabase JS SDK** (CDN) — must load before `sync.js`
4. **sync.js** — real-time cross-device sync (needs `state.js` + the Supabase SDK)
5. **push.js** — Web Push subscription handling
6. **login.js** — real state loading (`loadState()`) and sync init (`initSync()`) happen here, inside `doLogin()`, triggered by real user login — **not** on page load
7. **dev.js**, **themes.js**, **robert.js**, **letters.js**, **app.js**, **faceid.js**, **settings.js**
8. **wishlist.js**
9. **intro.js** — runs on every page load (before login); intentionally has **no access to app state** — see the achievements timing note above for why that separation matters
10. **achievements.js** — real achievement engine; its checks are wired into `doLogin()` (post state-load) and the Logs tab, never into page load

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

> ⚠️ **Do not open `index.html` directly as a file** (`file://`). The Service Worker, Supabase sync, and push notifications all require HTTP(S).

Push notifications and real-time sync additionally require the Supabase backend to be set up — see `supabase/README.md`. Without it, the app still works fully offline (local-only state, no push).

---

## 📱 Deploy & Install as iOS Home Screen App

### Deploying

Heartly's frontend is a static site — no build step, no bundler. Deploy to any static hosting:

| Platform | Notes |
|----------|----------------|
| **Netlify** | Drag & drop the unzipped project folder onto the Deploys tab, or connect a git repo for automatic deploys (recommended — avoids accidentally re-dropping a stale local copy) |
| **Vercel** | `vercel --prod` or connect GitHub repo |
| **GitHub Pages** | Push to `main`, enable Pages in repo settings |
| **Cloudflare Pages** | Connect repo, set build output to `/` |
| **Any static web server** | Upload all files to the document root |

The Supabase backend (push + sync) is deployed separately — see `supabase/README.md`.

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
- Support real push notifications (iOS 16.4+) once a device taps **Enable**
- Sync in real time with the other person's device via Supabase
- Remember your data between sessions via `localStorage`, even fully offline

### PWA Behavior

Heartly uses these PWA meta tags for native-like behavior:
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Heartly">
<meta name="mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#08000f">
```

The Service Worker (`sw.js`) handles push notification delivery and click handling.

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

Developer mode is password-protected. Default password: `[removed developer password]`

---

## 📋 Version

**Current: v1.0** (launching August 10, 2026)

> Color by Number has been rebuilt and re-enabled. See `pixelart/README.md` for save compatibility and verification details.

### Recent changes

- **Fixed:** achievement checks were firing on page load (`DOMContentLoaded`), before login/real state was ever loaded — this could falsely "earn" date-based milestone achievements against blank defaults, prematurely save that blank state to `localStorage`, and flag local state dirty in a way that risked overwriting real Supabase-synced data. This is very likely the cause of a brief flash of a success/reaction animation over the intro loading screen, and of the app seeming disconnected from Supabase. Achievement checks now only run after `loadState()` + `initSync()` genuinely complete, inside `doLogin()`.
- **Fixed:** a duplicate `</head>` closing tag in `index.html`.
- Real, 49-achievement system across 8 categories replacing the old hardcoded 30-achievement list — see [Achievements](#-achievements). (Originally shipped with 55 achievements across 9 categories including a relationship-time "Milestones" category; that category and the matching purchasable shop feature were later removed as not fitting the app's real-launch tone, and their date logic issue below was found in the process.)
- **Fixed:** the relationship start date used to exist as two separate, disconnected values — one hardcoded `2024-08-10` (used only by the now-removed Milestones features) and a different hardcoded default of `2023-08-10` stored in a raw `localStorage` key completely outside the app's sync system (used by the real Profile/Logs timer). Consolidated into one real, synced `relationshipStartDate` value, now editable from Robert's Dev tab (Settings → Relationship) as well as Ana's Settings.
- Real cross-frame bridge from Love Clicker into the main app's persisted state (games played, best score, lifetime score), enabling real game-based achievements.
- Unified home-hub feature card component — every owned shop feature now renders consistently (flush rows, one accent style) instead of each feature inventing its own layout/color.
- Real, persisted in-app notification log replacing hardcoded example notifications.
- Push notifications: multi-device support (a second device no longer evicts the first), VAPID secrets are now trimmed defensively, Robert's dashboard has its own notification Enable card mirroring Ana's, and the Enable button never gets permanently stuck in a stale "Enabled" state.
- Home hub cards now render in a consistent, stable order.
- Streak Shield implemented — protects your streak once/week if you miss a day.
- Tapping the streak card shows time remaining until the next +1.
- Dev panel consolidated into one interface, tab-switching bugs fixed.
- Shop items reorganized into clearer categories.
- Reset All Data now actually resets shared/synced data, not just local.
- Home screen cards merged into one hub.
- Love Clicker game added to Play.
- Updates log added to Logs.
- Lucky Spin daily reward.
- Daily Gift Box unlockable in shop.
- Mood Tracker for Robert.

---

## 💡 Design Philosophy

- **Mobile-first, always** — Designed for iPhone Safari, optimized for touch
- **No frameworks** — Pure HTML/CSS/JS for maximum speed and zero dependencies
- **Feels native** — Full-screen PWA, iOS-style animations, haptic-like feedback via CSS
- **Personal, not generic** — Every screen, every word is crafted for one specific person
- **Real over hardcoded** — Achievements, notifications, and home-hub content are driven by genuine app state and real events, not seed/demo data standing in for the real thing
- **Offline-capable** — All data lives in `localStorage` first, syncing to Supabase when available; the app keeps working without internet
- **Beautiful by default** — Glassmorphism, gradient accents, smooth transitions, animated backgrounds

---

## 📄 License

This is a personal project. Not intended for redistribution.

Made with 💕 by Robert, for Ana.
#   H e a r t l y  
 #   H e a r t l y  
 