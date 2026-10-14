# Heartly Pixel Art

Solo color-by-number, rebuilt to match the burgundy, rose, rounded controls and Nunito typography of Love Clicker and Love Blast. Plain HTML, CSS and JavaScript; no build step.

Open Heartly → Play → Start Coloring for cloud progress and points. Opening `pixelart/index.html` directly provides a device-only game. The UI tells the player where their progress is saved.

## Playing

- Discover, In progress and Completed collections, category filters and a resume card.
- Ten built-in pictures: seven compatible originals and three new Heartly designs.
- Numbered color palette, correct-color-only painting, continuous drag strokes and automatic next color after a stroke.
- Pinch/scroll zoom, two-finger pan, Move tool, fit and zoom buttons.
- Connected-region fill and a hint that centers the next matching square. Tools do not cost points.
- Completed picture view, PNG export (up to approximately 1024 px), and reward-free replay.
- Keyboard: Tab to controls/canvas; arrow keys move around cells; Space/Enter paints; +/- zoom.
- Reduced-motion support, safe-area spacing and phone landscape layout.

## My Artwork

Open Pictures for Ana from the coloring collection. Upload PNG, JPEG, WebP, GIF or BMP (12 MB maximum), adjust the square crop, select 16–1000 pixels and 4–100 colors, and update the preview. Sharp-edge sampling preserves pixel art; exact colors are kept when the sampled image fits the palette limit. Only the converted pixel design is saved; the original photo stays on the device.

Draw your own starts a 16–64 pixel draft. Pencil, cream eraser, connected fill, color picker/swatches, Move, zoom, keyboard painting and 30-step undo/redo (3 full snapshots for large imported designs) are available. Drawing and names autosave. Drafts are excluded from playable collections and rewards until published. Published designs can be renamed; duplicate them to change their pixels without disturbing existing coloring progress. My Artwork also provides PNG export at the original grid resolution and confirmed deletion.

Publish for Ana adds the design to the shared playable collection. The game iframe allows native page scrolling; painting still captures canvas gestures. Large artwork grids use base64 byte arrays in device/cloud JSON, and large progress sets use bitmaps. Runtime validation restores the normal grid and cell arrays. Color sampling uses a bounded histogram; low-zoom coloring uses an overview canvas and high-zoom rendering only draws visible cells.

Draft and published artwork share the existing couple collection, not a private per-person account. Up to 60 custom pictures are supported. Artwork revisions use timestamps with deterministic tie-breaking to resist stale cloud snapshots; simultaneous edits of the same draft resolve as whole-design last-write-wins, not per-pixel collaborative editing. Deletion tombstones take precedence. Existing imported artwork remains published.

## Saved data and database integration

`core.js` validates and merges the version-3 save. `js/pixelart-bridge.js` connects the iframe to the parent app. `js/state.js` includes `pixelArtState` in the existing `couple_state.data` JSON column; `js/sync.js` carries it through the existing Supabase save, load and Realtime paths. No new table, credential or database migration is needed.

Saved fields: colored cell indices, completion timestamps, reward receipts, last-opened artwork, imported picture definitions and deletion tombstones. Colored-cell sets merge rather than replace each other. Deleted custom pictures do not reappear from an older device.

The original `pixelhue_v2` and `ph_custom_artworks` saves are imported without deleting them. Already-completed legacy pictures are treated as already rewarded. New local backup key: `heartly_pixel_v3`. A small `heartly_pixel_pending_rewards` journal recovers rewards after a failed write followed by a newer remote balance.

Rewards are calculated by the parent from the picture's actual size (30–120 points), recorded once, and included in Heartly's balance, lifetime earnings, points history and transaction feed. The initial cloud pull must be confirmed before new rewards are applied. Offline saves are retried after reconnection. Replaying or reopening a completed picture does not grant a second reward.

Robert's existing dashboard importer uses the same image converter whether the game iframe is open or closed. Imports use a center crop and a balanced color palette; accepted formats are PNG, JPEG, WebP, GIF and BMP, up to 12 MB. Dimensions are bounded to 8–1000 per side and palette size to 2–100. The collection allows up to 60 custom pictures. Imported titles are inserted as text, not HTML.

## Verification and scope

The workspace's `verification/pixelart.test.cjs` exercises the real browser UI and the actual Heartly state/sync scripts against an intercepted, simulated Supabase transport. Tests cover painting, invalid-color rejection, pinch without accidental paint, fill, hints, reload/resume, migration, merge validation, completion, replay, export, imports, removal, iframe close/reopen, reward deduplication, offline recovery and a fresh browser context receiving cloud data. Viewport screenshots cover 320, 390, 430, 844 and 1280 px widths.

Tests do not contact production Supabase, send pushes or modify real relationship data. Real iPhone Safari hardware has not been tested. Opening the new build through Heartly will use the already-configured Supabase project.

The existing shared anonymous-access database policy is unchanged. This update does not secure the entire application. Painted cells merge safely, but Heartly still synchronizes its overall balance and unrelated app fields as one shared JSON document; this is not a server-authoritative transactional rewards service. The access-control and whole-app concurrency findings in `HEARTLY-INSPECTION.md` remain follow-up work.
