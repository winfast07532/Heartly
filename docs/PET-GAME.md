# Little Home — implementation guide

## State and points

The shared save is `public.couple_state`, row `heartly-couple`. Pet progress is `data.petState`. `ptsVal` is the shared wallet; `petWalletTotal` and `petEarnedTotal` reconcile pet transactions with ordinary Heartly saves.

`js/pet-bridge.js` opens the pet iframe and sends authenticated commands. `pet/adapters.js` connects it to the game. `supabase/functions/pet-action/index.ts` validates identity and membership, runs the shared game rules, then commits wallet and pet together using `heartly_commit_pet` with optimistic locking. Request receipts prevent double spending after a lost response.

**Do not directly overwrite pet state from the browser or import standalone balances.** The database preservation trigger protects pet changes during unrelated app saves.

## Files to change

| File | Responsibility |
| --- | --- |
| `pet/config.js` | Editable prices/rewards; currently version 5 |
| `pet/core.js` | Validation, decay, transactions, catalog and migration |
| `pet/game.js` | UI rendering, selections and actions |
| `pet/care.css` | Final UI overrides, square/opaque cat frames, readable controls |
| `pet/heartly.css` | Theme variables and shared visual integration |
| `pet/layout.js`, `movement.js`, `room-life.js` | Placement rules and safe cat movement |
| `pet/studio.js`, `designer.js`, `room-view.js` | Canvas rendering, editing and fullscreen |
| `pet/help.js` | Tutorial beside Settings |
| `pet/notifications.js` | Pure low-needs notification policy |

When changing config/core/layout, deploy matching files with the server worker(s). A price/config change should increment the config version so stale clients cannot buy at old prices. Layout changes also affect server validation.

## Care economy

| Item | Price | Effect |
| --- | ---: | --- |
| Cat yarn ball | 20 | +20 happiness |
| Cat toy mouse | 40 | +40 happiness |
| Cat chase ball | 60 | +60 happiness |
| Care Kit 1 | 25 | +20 cleanliness |
| Care Kit 2 | 55 | +50 cleanliness |
| Care Kit 3 | 90 | +90 cleanliness |

`config.js` is authoritative if values change. Food/toy sprites are crops from `Furnitures,Playgrounds,Toys.png`. Permanent room toys are decorations, distinct from consumable play supplies. Full needs must not consume supplies. A daily care reward is still once per day; this is separate from removed action cooldowns.

## Notifications

- Four independent checks: hunger, happiness, cleanliness, energy. Strictly **below 30%**, not at 30%.
- `pet-notifications` runs every five minutes using the same `PetCore.advance` as gameplay. It does not persist decayed state or change points.
- All existing subscribed Ana and Robert devices receive applicable alerts. Permission/installation uses the existing Heartly notification setup.
- Each pet/stat/device has its own delivery record. One stat cannot suppress another. Each tag is distinct so four notifications can coexist.
- Successful delivery suppresses repeats until recovery to at least 30%. A trigger rearms on saved care, and scans rearm naturally recovered needs such as sleeping energy.
- No adopted pet or vacation means no alert. A newly adopted pet has a new ID and fresh alert tracking.
- Failed deliveries retry on later scans. A two-minute lease prevents overlapping workers from sending the same alert simultaneously. A crash after push acceptance but before recording success can still produce a retry; push delivery is not exactly-once.
- Devices can delay or suppress notifications through OS settings. Server acceptance does not prove a notification was displayed.
- Tapping an alert focuses Heartly and requests the pet screen after login/cloud sync. New windows use `index.html?pet=1`.

Delivery bookkeeping lives in `pet_alert_delivery`, separately from gameplay. It is not included in the full-state GitHub backup and contains no game inventory/wallet. Restoring gameplay can rearm needs; a restore is not a restore of past notification delivery.

Offline decay is continuous (no 24-hour elapsed-time cap), with the existing gentle 20% minimum. Pet wallet transactions now also populate main Exchange history and weekly points logs atomically.
