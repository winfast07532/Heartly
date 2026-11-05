# Heartly — start here

Last updated: **5 November 2026**, Europe/Bucharest.

This is the production Heartly app, including **Little Home**, a shared cat game. Read this file, `docs/PET-GAME.md`, and `docs/OPERATIONS.md` before changing it. Older prototype notes may describe behavior that no longer exists.

## Workspace and source of truth

| Location | Purpose |
| --- | --- |
| `Heartly-publish/` | Active Git checkout; make and commit changes here |
| `Heartly/` | Local mirror of tracked production files; not another development branch |
| `Heartly-Pet-standalone/` | Historical standalone prototype; do not deploy its wallet or saves |
| Desktop `Sprite Assets/PetMobileGameAsset` | User's original sprite pack; shipped copies are in `pet/assets/pack/` |
| `verification/` outside the repo | Local investigation helpers and screenshots; not production content |

Repository: `winfast07532/Heartly`, branch `main`. Production: https://heartly10.netlify.app. Backups: **private** `winfast07532/heartly-backups`.

## User decisions to preserve

- One default cream cat with a pink ribbon. No pet selection.
- Match Heartly themes. Keep mobile controls readable, scrolling usable, sprites proportional, and decorations collision-safe.
- No mini-games and no memory book.
- Food, care kits and cat toys are purchased with universal Heartly points and consumed once. Play and tapping the cat use the same selected toy. No care cooldowns.
- Care kits 1/2/3 replace separate shampoo and toilet paper. Buying a bed enables sleeping.
- Use the user's sprite pack for food and cat toys. Do not replace it with unrelated artwork.
- The default bowl has been removed, including its invisible collision boundary. Purchased bowl decorations remain available.
- Never reset other Heartly data when changing or resetting the pet. The requested one-time pet reset was completed; do not repeat it.
- Confirmed, allowlisted Supabase accounts are required. Do not restore the old public-key-only pet access model.

## Recent work

1. `1fe0911`: consumable toys, no care cooldowns, pack food sprites, tutorial.
2. `b4de3de`: mobile UI polish, default bowl removal, Collection actions consume the clicked item rather than the Home selector.
3. Current notification change: independent below-30% alerts for hunger, happiness, cleanliness and energy; five-minute server checks; per-device deduplication and recovery rearming; notification taps open Little Home after login/sync.

**Deployment verified:** `8501f90` is published on Netlify (deploy `6aeb7aa3721e671d6da3519b`, ready on 4 November 2026). The following documentation-only commit uses `[skip netlify]`; the live application code remains `8501f90`. The notification worker is version 2 and its five-minute cron is active.

The previous Netlify build for `b4de3de` failed because the Git contributor was unrecognized for a private repository. **A successful Git push is not proof of a successful deployment.** Check the exact latest commit against the published Netlify deploy; see `docs/OPERATIONS.md`.

## Validation

Run the relevant scripts in `scripts/`: `test-pet.cjs`, `test-play.cjs`, `test-care.cjs`, `test-pet-auth.cjs`, `test-pet-notifications.cjs`, and `test-pet-browser.cjs`.

The integrated browser test uses mocked cloud requests; it does not spend real points. It covers login dismissal, adoption, shared wallet, lost-response retries, offline errors, responsive widths, fullscreen exit, restore, care kits and correct Collection consumption. It generates two screenshots in `scripts/`; inspect/remove those before committing.

No framework or build-system migration is needed. Follow `claude.md`: plain HTML/CSS/JavaScript, preserve working features, avoid broad rewrites.

## Audit fixes — 5 November

The user explicitly wants Little Home to cost points, not generate income. Keep all prices and rewards unchanged: the cheapest care cycle costs 70 and rewards 50.

- Normal saves now use `heartly_save_state(base_data,next_data,request_id)`: row-locked three-way merge, retry receipts and explicit conflicts. The browser keeps a downloadable local conflict copy; it does not overwrite the cloud. Direct legacy writes are blocked after publishing the compatible frontend. Never revert to whole-row upserts.
- `js/state-merge.js` mirrors the server merge rules. Pet fields and shared milestone receipts are protected. Simultaneous changes to the same list/field can require manual reconciliation; separate fields merge automatically.
- Pet decay now continues beyond 24 hours, still with a 20% floor. Config version is **5**. Both pet functions must carry the same core/config.
- Milestones use `heartly_claim_game_milestones`; existing lifetime thresholds are marked already claimed without paying again. Session payouts and all milestone amounts remain unchanged.
- Pet wallet events also write main transaction and weekly logs. Retained historical ledger entries are backfilled without awarding or refunding points.
- Zero prices use a missing-value fallback; failed purchases no longer show success. Goodnight eligibility uses Bucharest dates; Gift Box says once per calendar day.
- Added `scripts/test-audit-fixes.cjs` and `scripts/test-app-saves.cjs`. Database tests use transactions that roll back all simulated data changes.
