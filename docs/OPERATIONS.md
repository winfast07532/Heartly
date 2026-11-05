# Heartly — deployment and verification

## Services

| Service | Identifier |
| --- | --- |
| Supabase | `kwtcdaapoqknerwvplze` |
| Netlify | `d186f40a-a3f8-43b6-ad9d-53db4fbfe948` |
| Production | https://heartly10.netlify.app |
| Source | `winfast07532/Heartly`, `main` |
| Private snapshots | `winfast07532/heartly-backups` |

Account allowlists live in `heartly_private.members`. Never put emails, passwords, service keys, private push keys, or backup tokens into source or handoff files.

## Deploy procedure

1. Inspect `git status` in `Heartly-publish` and preserve unrelated changes.
2. Run relevant tests and `git diff --check`.
3. Deploy changed Supabase functions with their shared dependencies. `pet-action` needs config/content/layout/core; `pet-notifications` needs those plus notifications.js.
4. Commit/push `main` to trigger Netlify. Verify the published deploy is `ready` **and its commit matches**.
5. Copy tracked files into the local `Heartly` mirror. Do not copy `.git` or secrets.

The Netlify connector can inspect deployments but does not expose a retry operation in this session. A new authorized commit/push triggers another build. If the contributor restriction persists, the owner must approve/link the contributor in Netlify; do not change Git authorship, make repositories public, or bypass the restriction.

## Function authentication

| Function | Gateway JWT | Handler check |
| --- | --- | --- |
| `pet-action` | On | Confirmed, non-anonymous allowlisted account |
| `backup-state` | Off | Member JWT or scoped backup cron credential; cron can only create snapshots |
| `pet-notifications` | Off | `x-pet-cron` secret checked through service-only RPC |

The pet cron secret is generated inside Supabase Vault under `heartly_pet_cron`; never print it. The worker uses the existing VAPID environment secrets. Its SQL is `supabase/sql/pet-notifications.sql`, applied as `pet_needs_notifications`. It adds delivery bookkeeping, service-only RPCs, a recovery trigger and `heartly-pet-needs` cron (`*/5 * * * *`). It does not delete or reset application data.

## Notification verification

- Unit test: `node scripts/test-pet-notifications.cjs`.
- Check `cron.job` for `heartly-pet-needs`, active every five minutes.
- Inspect `net._http_response` for the scheduled HTTP status and `{checked,sent,failed}` result. Do not print request headers containing secrets.
- Check unauthorized requests return 401; client roles cannot read delivery records or invoke claim/finish/auth RPCs.
- SQL lease checks were run inside a rolled-back transaction: independent stats, duplicate suppression, recovery, failed-send retry and stale-state rejection passed.
- First live check on 4 November returned HTTP 200, four checks, zero eligible sends and zero failures. **Physical device delivery was not proven by that check.** Do not lower the real pet's needs just to test push.
- RLS is intentionally enabled without client policies on the service-only delivery table. The advisor's informational no-policy finding is expected. Existing project advisories are not introduced by this feature.

## Browser test on this PC

```powershell
$env:PLAYWRIGHT_MODULE='C:/Users/Robert/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
$env:CHROME_PATH='C:/Program Files/Google/Chrome/Application/chrome.exe'
node scripts/test-pet-browser.cjs
```

Run from `Heartly-publish`. The test mocks backend traffic. Generated screenshots are review artifacts, not repository assets.

## Backups and recovery

The existing six-hour backup job snapshots all `couple_state.data`, including the pet and shared wallet, and mirrors to the private backup repository. Keep this mechanism intact. Notification changes do not require replacing the backup function.

Only perform resets/restores when explicitly requested. A pet-only reset must preserve every other JSON field, including point reconciliation totals, and be verified afterward. Never restore a prototype save over production.

## Safe shared writes and milestone migration

Apply `supabase/sql/safe-state-writes.sql`, `shared-game-rewards.sql`, and the updated `pet-integration.sql`. Publish the frontend, verify the exact deploy, then activate `heartly_require_safe_write` (the commented trigger statement in the SQL). The guard requires old tabs to refresh; service-role pet and backup operations remain supported. Apply `backfill-pet-history.sql` once to reconstruct retained pet ledger entries without changing money.

`heartly_save_state` uses the last confirmed baseline, merges distinct object fields, combines transaction logs, rejects incompatible field/list changes, and keeps the last 100 request receipts. Pet accounting is normalized during merge and reconstructed from authoritative totals. A same-field conflict is intentional protection, not a silent failed save: the UI offers a local JSON download and reload of the latest cloud save. The saved conflict copy survives refresh and is archived when the user loads the cloud version.

Milestone receipts are in `couple_state.data.gameMilestoneReceipts`, so existing full-state backups include them. Do not pay milestones in iframe localStorage code. Legacy receipts are imported without paying again; the migration seeds thresholds already reached by shared lifetime totals.
