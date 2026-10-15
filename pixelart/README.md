# Heartly Pixel Art

Solo color-by-number, rebuilt to match the burgundy, rose, rounded controls and Nunito typography of Love Clicker and Love Blast. Plain HTML, CSS and JavaScript; no build step.

Open Heartly → Play → Start Coloring for cloud progress and points. Opening `pixelart/index.html` directly provides a device-only game. The UI tells the player where their progress is saved.

## Playing

- Discover, In progress and Completed collections, category filters and a resume card.
- The collection contains only pictures published from Developer Studio. The bundled drawings are removed; an empty collection remains usable.
- Numbered color palette, correct-color-only painting, continuous drag strokes and automatic next color after a stroke.
- Pinch/scroll zoom, two-finger pan, automatic pan when dragging from a nonmatching/colored square or outside the picture, fit and zoom buttons.
- Connected-region fill and a hint that centers the next matching square. Find costs 50 points per use; Fill costs 100 points per successful connected region. The balance and prices are visible. Invalid targets and insufficient funds do not charge. Developer previews are free; standalone pages require opening Heartly for paid tools.
- Completed picture view, PNG export (up to approximately 1024 px), and reward-free replay.
- Keyboard: Tab to controls/canvas; arrow keys move around cells; Space/Enter paints; +/- zoom.
- Reduced-motion support, safe-area spacing and phone landscape layout.

## My Artwork

Open Robert’s Studio → Artwork. The dedicated developer iframe hosts the upload/editor workspace; Ana’s embedded game does not display management controls. On phones the workspace opens expanded so its dialogs stay reachable; Close expanded view returns to the dashboard. Standalone local previews retain management controls. Upload PNG, JPEG, WebP, GIF or BMP (12 MB maximum), adjust the square crop, select 16–1000 pixels and 4–100 colors, and update the preview. Sharp-edge sampling preserves pixel art; exact colors are kept when the sampled image fits the palette limit. Only the converted pixel design is saved; the original photo stays on the device.

Draw your own starts a 16–64 pixel draft. Pencil, cream eraser, connected fill, color picker/swatches, Move, zoom, keyboard painting and 30-step undo/redo (3 full snapshots for large imported designs) are available. Drawing and names autosave. Drafts are excluded from playable collections and rewards until published. Published designs have editable names and completion rewards (0–1,000,000 whole points); duplicate them to change their pixels without disturbing existing coloring progress. The artwork workspace includes name search, draft/published filters, an unpublish action that preserves coloring progress, and PNG export at the original grid resolution and confirmed deletion.

Publish for Ana adds the design to the shared playable collection. The game iframe allows native page scrolling; painting still captures canvas gestures. Large artwork grids use base64 byte arrays in device/cloud JSON, and large progress sets use bitmaps. Runtime validation restores the normal grid and cell arrays. Color sampling uses a bounded histogram; low-zoom coloring uses an overview canvas and high-zoom rendering only draws visible cells.

Draft and published artwork share the existing couple collection, not a private per-person account. Up to 60 custom pictures are supported. Artwork revisions use timestamps with deterministic tie-breaking to resist stale cloud snapshots; simultaneous edits of the same draft resolve as whole-design last-write-wins, not per-pixel collaborative editing. Deletion tombstones take precedence. Existing imported artwork remains published.

## Saved data and database integration

`core.js` validates and merges the version-3 save. `js/pixelart-bridge.js` connects the iframe to the parent app. `js/state.js` includes `pixelArtState` in the existing `couple_state.data` JSON column; `js/sync.js` carries it through the existing Supabase save, load and Realtime paths. No new table, credential or database migration is needed.

Saved fields: colored cell indices, completion timestamps, reward receipts, last-opened artwork, imported picture definitions and deletion tombstones. Colored-cell sets merge rather than replace each other. Deleted custom pictures do not reappear from an older device.

The original `pixelhue_v2` and `ph_custom_artworks` saves are imported without deleting them. Already-completed legacy pictures are treated as already rewarded. New local backup key: `heartly_pixel_v3`. A small `heartly_pixel_pending_rewards` journal recovers rewards after a failed write followed by a newer remote balance. Paid tools have unique receipts in `pixelArtState.assists` and a `heartly_pixel_pending_assists` journal to preserve deductions across failed writes and cloud pulls. New paid tool use is blocked while known offline.

Rewards use each picture's configured completion points, with a size-based 30–120 default for older artwork. They are recorded once, and included in Heartly's balance, lifetime earnings, points history and transaction feed. The initial cloud pull must be confirmed before new rewards are applied. Offline saves are retried after reconnection. Replaying or reopening a completed picture does not grant a second reward.

Robert's existing dashboard importer uses the same image converter whether the game iframe is open or closed. Imports use a center crop and a balanced color palette; accepted formats are PNG, JPEG, WebP, GIF and BMP, up to 12 MB. Dimensions are bounded to 8–1000 per side and palette size to 2–100. The collection allows up to 60 custom pictures. Imported titles are inserted as text, not HTML.

## Verification and scope

The workspace's `verification/pixelart.test.cjs` exercises the real browser UI and the actual Heartly state/sync scripts against an intercepted, simulated Supabase transport. Tests cover painting, invalid-color rejection, pinch without accidental paint, fill, hints, reload/resume, migration, merge validation, completion, replay, export, imports, removal, iframe close/reopen, reward deduplication, offline recovery and a fresh browser context receiving cloud data. Viewport screenshots cover 320, 390, 430, 844 and 1280 px widths.

Tests do not contact production Supabase, send pushes or modify real relationship data. Real iPhone Safari hardware has not been tested. Opening the new build through Heartly will use the already-configured Supabase project.

The existing shared anonymous-access database policy is unchanged. This update does not secure the entire application. Painted cells merge safely, but Heartly still synchronizes its overall balance and unrelated app fields as one shared JSON document; this is not a server-authoritative transactional rewards service. The access-control and whole-app concurrency findings in `HEARTLY-INSPECTION.md` remain follow-up work.

## Developer dashboard

The Studio overview links to Letters & notes, Artwork, Features, Points and Maintenance. Existing editor and configuration handlers are retained. Letter editing is placed first, tab groups wrap on narrow screens, and section navigation stays visible while scrolling. Maintenance resets and bulk changes live in a collapsed Advanced controls section. The dashboard and editor use larger text, stronger contrast and touch-sized controls.

Both the player iframe and developer artwork iframe receive shared-state updates through the existing parent bridge. Published custom pictures are featured ahead of unstarted built-in designs, and Ana can search the coloring collection. Role-based management visibility uses the app’s existing currentUser convention; it does not introduce server-side authorization or repair the previously documented anonymous database policy.

Verification includes simulated-cloud browser tests of the developer navigation, letter saving, artwork publishing, preview, search, filters, unpublish/republish, expansion, and Ana’s player-only view. Large-artwork import, compact saving, reload, 100-color palettes and million-cell progress remain covered.

## Regression fixes (October 2026)

Developer previews are now replay-only: they cannot change Ana’s painted cells, rewards or last-opened picture. The embedded editor retains a visible Back control. Upload setting changes disable saving/publishing until the preview is regenerated; superseded conversions cannot replace a newer edit or leave controls disabled. Saving a stale artwork revision is rejected with a reopen message, and the Back action offers to discard unsavable edits. Remote unpublishing/deletion closes an active player canvas, and remote renames update its heading. Reopening the developer workspace restores its manager view.

Targeted browser regressions live in the local verification/audit-creator.test.cjs and verification/audit-studio.test.cjs harnesses, in addition to the existing gameplay and large-artwork suites. These use simulated cloud transport and do not modify production data.

The October 15 interaction update fixes privacy blur caused by focus entering a game iframe. Exiting closes open game dialogs and always releases the overlay even if saving fails. `verification/economy.test.cjs` checks configured rewards, exact tool charges, insufficient funds, retry recovery, free developer previews, empty collections, automatic pan, pinch, responsive controls and exit cleanup using simulated cloud data.
