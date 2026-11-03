# Little Home in Heartly

Robert and Ana share one pink-ribbon cat, room, collection and Heartly points balance. Open it from Play → Little Home. Basic care is free. The standalone prototype remains separate; its test wallet and saves are never imported.

## Change prices and rewards

Edit **pet/config.js**. `dailyReward` controls the daily feed/play/clean reward; `care` contains cooldown hours and gains; `xpPerCare` and `xpDailyCap` control bond progress. `items` lists every item ID, readable name and price. Edit the price, not the ID. All 643 items are included. Changing a price never removes something already owned.

Increment `version` whenever changing rules. Publish the site AND redeploy `pet-action` with this same file. A mismatched version is rejected instead of charging an outdated price. The browser cannot set the server’s price or mint points.

From the repository root, after signing in to the Supabase CLI:

    supabase functions deploy pet-action --remote=kwtcdaapoqknerwvplze --use-api

The function requires a verified Supabase user session and checks the confirmed email against the private account allowlist. No service key belongs in this repository. Then commit and push to main to publish the frontend through Netlify.

## Saving and backup

The Edge Function executes the same pure rules as the UI using server time. A row-locked database function commits the pet and wallet together, retrying if another Heartly save wins first. Repeated request IDs do not charge twice. Requests expire after 24 hours; receipts are retained for 48 hours. Unknown network outcomes are retried using the original ID.

`couple_state.data.petState` contains pet progress; `petWalletTotal` tracks cumulative pet wallet changes so stale ordinary Heartly saves cannot undo those changes. Very old app versions must refresh after points are spent in Little Home. Other Heartly features retain their existing sync behavior.

The six-hour `backup-state` job snapshots the whole JSON, including these fields, into Supabase and the private `winfast07532/heartly-backups` repository. Restoring a snapshot restores pet, inventory, layout and points together. Restoring a snapshot from before integration gives a fresh, unadopted pet. A successful pre-restore safety snapshot is required. Listing and restoring backups requires a confirmed developer account; cron uses a separate credential stored in Vault and cannot restore snapshots.

## Account access

Create an account using an approved email, confirm the email, then sign in. The two developer emails can use both Robert’s Studio and Ana’s view. Ana’s account can use the shared app and pet. The private `heartly_private.members` table holds the allowlist; it is not part of frontend code or progress snapshots. Device Face ID/app-lock remains an optional local convenience and never replaces the server session.

Live actions require connectivity. Reading the last cached room is allowed; spending, rewards and care are never queued speculatively offline. Fullscreen uses native fullscreen where supported and an in-game room-only view on iPhone.

Run `node scripts/test-pet.cjs` for rule/config tests and `node scripts/test-pet-auth.cjs` on Node 22.6+ for endpoint authorization checks. `scripts/test-pet-browser.cjs` runs the integrated browser regression with Playwright (set `PLAYWRIGHT_MODULE` and `CHROME_PATH` when using an existing local installation). These tests mock cloud traffic and never change real progress.
