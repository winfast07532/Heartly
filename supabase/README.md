> Keep the VAPID private key only in Supabase secrets. Replace `YOUR_VAPID_PRIVATE_KEY` with your own private key when configuring the backend; never commit it. If the previously embedded key is in use, rotate the VAPID key pair and re-register device push subscriptions.

# Heartly — Real Push Notifications Setup

This wires up actual cross-device push (works even when the phone's locked or
the app is fully closed) for three things:
- **New letter from Robert** → pushes to Ana, right when he hits send
- **Streak milestone** (7 / 14 / 30 / 60 / 100 days) → pushes to Robert
- **Goodnight letter** → pushes to Ana at the time Robert configured
- (bonus, included for free since it needed the same cron) **Streak-at-risk reminder** →
  pushes to Ana in the evening if she hasn't opened the app that day

Everything client-side is already wired in this zip (`js/push.js`, plus small
hooks in `robert.js`, `state.js`, `notifications.js`). What's left is three
one-time setup steps in your Supabase project — I can't run these myself since
I don't have network access or your project credentials in this environment.

## Already generated for you

A VAPID keypair (needed for Web Push) — generate once, reuse forever:

```
VAPID_PUBLIC_KEY=BOCB-Y0qVmC7xRN-1Wb8AcN5LoVddYyTNneTnKL-PXzyXk3w2k_uYkoG37xa7Oghv7ta99nUdt-lhbtfvHt06ug
VAPID_PRIVATE_KEY=YOUR_VAPID_PRIVATE_KEY
```

The public key is already embedded in `js/push.js` — nothing to do there.
The private key must **only** live in Supabase secrets (step 2) — never put
it in client code.

## Step 1 — Create the tables

Supabase Dashboard → your project → **SQL Editor** → New query → paste the
contents of `supabase/migrations/001_push_notifications.sql` → Run.

## Step 2 — Deploy the two Edge Functions

You have two options here — pick whichever's easier for you.

### Option A — On your phone, no CLI (Supabase Dashboard)

Everything below is just tapping around in Supabase's web dashboard in your
phone's browser — no computer, no terminal, no installs.

1. **Secrets first.** Dashboard → your project → **Edge Functions** → **Secrets**
   tab → add these four, one at a time:
   ```
   VAPID_PUBLIC_KEY   = BOCB-Y0qVmC7xRN-1Wb8AcN5LoVddYyTNneTnKL-PXzyXk3w2k_uYkoG37xa7Oghv7ta99nUdt-lhbtfvHt06ug
   VAPID_PRIVATE_KEY  = YOUR_VAPID_PRIVATE_KEY
   VAPID_SUBJECT      = mailto:your-real-email@example.com
   APP_TIMEZONE       = Europe/Bucharest
   ```
2. Dashboard → **Edge Functions** → **Deploy a new function** → **Via Editor**.
   Name it `send-push`, delete the template code, and paste in the full
   contents of `supabase/functions/send-push/index.ts` from this zip (open the
   zip on your phone, open that file, select all, copy). Tap **Deploy**.
3. Repeat for the second one: name it `evening-check`, paste in
   `supabase/functions/evening-check/index.ts`, deploy. Then open its
   **Settings** (or the function's config) and turn **off** "Enforce JWT
   Verification" — this one runs on a schedule with no caller, so there's no
   auth header to check.
4. Open `evening-check` → **Cron** tab → set the schedule to `*/5 * * * *` →
   save.

That's the entire backend, done on a phone, no CLI.

### Option B — On a computer (Supabase CLI)

Only worth it if you're already comfortable in a terminal — the CLI is a
bit more forgiving for iterating/debugging, but not required.

```bash
cd heartly

supabase secrets set VAPID_PUBLIC_KEY=BOCB-Y0qVmC7xRN-1Wb8AcN5LoVddYyTNneTnKL-PXzyXk3w2k_uYkoG37xa7Oghv7ta99nUdt-lhbtfvHt06ug
supabase secrets set VAPID_PRIVATE_KEY=YOUR_VAPID_PRIVATE_KEY
supabase secrets set VAPID_SUBJECT=mailto:your-real-email@example.com
supabase secrets set APP_TIMEZONE=Europe/Bucharest

supabase functions deploy send-push
supabase functions deploy evening-check --no-verify-jwt
```

Cron scheduling isn't a CLI command — even if you deploy this way, go set
`evening-check`'s schedule in the Dashboard (**Edge Functions** → `evening-check`
→ **Cron** tab → `*/5 * * * *`).

## Step 3 — Turn on notifications in the app

Open Heartly on **both** Ana's and Robert's devices/home-screen installs, go to
Settings → Notifications → enable. That's the existing "Enable Notifications"
button — it now also silently subscribes the device for real push behind the
scenes (`subscribeToPush()` in `js/push.js`).

Each role only needs to do this once per device. If someone reinstalls the PWA
or clears browser data, they'll need to hit that button again.

## Testing

- **New letter**: log in as Robert, write and send a letter (not scheduled) →
  Ana's device should get a push within a couple seconds, even backgrounded.
- **Streak milestone**: hard to trigger for real without waiting days — easiest
  is to temporarily set `currentStreak` in Ana's browser console to `6` before
  logging in, so the next login pushes it to `7`.
- **Goodnight**: set the goodnight time (Shop → Good Night Mode, or Dev panel)
  to a few minutes from now and wait for the next `evening-check` run.

If a push fails because a subscription went stale (uninstalled the PWA,
cleared data, etc.), `send-push` automatically deletes the dead row — the
next "Enable Notifications" tap on that device re-subscribes it.

## What's NOT covered here (from the original list, deprioritized for now)

- Surprises (flowers, memory jar drops, mini challenges, etc.)
- Ana's messages → Robert

Same pattern as "new letter" — a `triggerPush('robert', ...)` call added at
each send point — happy to wire these up the same way whenever you want them.
