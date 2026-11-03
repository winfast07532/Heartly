# Heartly deployment notes

The integrated app requires confirmed Supabase email accounts. The private account allowlist is stored in `heartly_private.members`; it must not be put in public frontend configuration. Developer accounts have `member_role='robert'`, regular access uses `member_role='ana'`.

Existing project setup was extended with these SQL changes, in order:

1. `sql/pet-integration.sql`: atomic pet/wallet commits and preservation during regular Heartly saves.
2. `sql/heartly-auth.sql`: private allowlist and caller-only membership lookup.
3. `sql/heartly-backup-auth.sql`: Vault-backed cron authentication, retaining the six-hour schedule and GitHub backup destination.
4. `sql/heartly-state-auth.sql`: restrict shared-state access to confirmed allowlisted users. Apply after the authenticated frontend is available.

No migration removes existing content or resets progress. Pet state uses the existing `couple_state` JSON snapshot. Only the pet Edge Function can call the pet commit RPC. Normal signed-in saves cannot replace pet progress or undo its point changes.

Deploy `pet-action` with JWT verification enabled. It additionally validates the user with Auth and checks membership. `backup-state` verifies either a confirmed member session or the separate server-only cron credential in its handler; gateway JWT verification stays off for the cron route. Cron can only create snapshots. Snapshot listing/restoration requires a developer account.

Email setup: enable Email Auth with confirmations, set the Site URL to `https://heartly10.netlify.app`, allow `https://heartly10.netlify.app/index.html`, and configure SMTP for delivery to the approved accounts. The built-in email service may restrict delivery to project-team recipients. Users create their own passwords through the app and confirm their email; do not store passwords in this repository.

Keep `winfast07532/heartly-backups` private: snapshots contain full application content. The GitHub backup token remains in Supabase Vault. The frontend repository contains neither backup tokens nor service-role credentials.
