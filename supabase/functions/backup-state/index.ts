// ═══════════════════════════════════════════════════════════
// Heartly — backup-state
//
// Built after a real incident on 2026-08-25 where the "Reset All
// Data" dev tool overwrote the entire couple_state row (including
// real written letters/notes) with no way to recover it — no
// Supabase backups on the free plan, no usable local copy either.
//
// This function is the fix: an independent, append-only history of
// couple_state that nothing else in the app can ever overwrite,
// mirrored to a private GitHub repo so it doesn't even depend on
// this Supabase project staying healthy.
//
// Actions (POST body: { action, ... }):
//   { action: "run" }                 → take a snapshot now (used by cron AND the "Backup Now" button)
//   { action: "list" }                → last 30 snapshot summaries (for the Dev tab UI)
//   { action: "restore", id: <int> }  → restore a specific snapshot back into couple_state
//                                        (takes a safety snapshot of the CURRENT state first)
//
// Deploy:  supabase functions deploy backup-state --no-verify-jwt
// Schedule (Dashboard → Edge Functions → backup-state → Cron):
//   0 */6 * * *   (every 6 hours)
// Secrets: none required directly — the GitHub token lives in
// Postgres Vault (see migration github_backup_token_vault) and is
// fetched via the get_github_backup_token() RPC, which only
// service_role can call.
// ═══════════════════════════════════════════════════════════

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SYNC_TABLE  = "couple_state";
const SYNC_ROW_ID = "heartly-couple";

const GITHUB_OWNER = "winfast07532";
const GITHUB_REPO  = "heartly-backups";
const GITHUB_BRANCH = "main";

// BUG (fixed): this function is called directly from the browser
// (the Dev tab's Cloud Backups card), exactly like send-push — but
// unlike send-push, it never sent CORS headers. Browsers silently
// discard any cross-origin fetch() response missing
// Access-Control-Allow-Origin, and never even reach this code for
// the preflight OPTIONS request without a matching handler. That's
// the entire "could not load backups / couldn't fetch" error.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SHOP_FLAG_KEYS = [
  "shopStreakShield", "shopDailyBonus", "shopDailyGiftBox", "shopHotStreak",
  "shopVIPPass", "shopCoupleSong", "shopAnniversaryCard", "shopMemoryJar",
  "shopLoveMap", "shopCountdown", "shopGoodNight", "shopCoupleGoals",
  "shopDateNight", "shopDailyQuestion", "shopPhotoOfDay", "shopLuckySpin",
  "shopPuzzleOfWeek", "shopMood", "shopWishList", "shopWriteToRob",
];

function contentCounts(data: any) {
  const ED = data?.ED || {};
  const shopOwned = SHOP_FLAG_KEYS.filter((k) => !!data?.[k]).length;
  return {
    // Letter Library — the actual written content
    notes: Array.isArray(ED.notes) ? ED.notes.length : 0,
    surprises: Array.isArray(ED.surprises) ? ED.surprises.length : 0,
    letters: Array.isArray(ED.letters) ? ED.letters.length : 0,
    // Progress
    pts: data?.ptsVal ?? null,
    streak: data?.currentStreak ?? null,
    bestStreak: data?.bestStreak ?? null,
    achievements: data?.earnedAchievements ? Object.keys(data.earnedAchievements).length : 0,
    // Shop — how many features are owned, out of how many exist
    shopItemsOwned: shopOwned,
    shopItemsTotal: SHOP_FLAG_KEYS.length,
    // Other real content collections
    memories: Array.isArray(data?.memoryJarItems) ? data.memoryJarItems.length : 0,
    goals: Array.isArray(data?.coupleGoalsList) ? data.coupleGoalsList.length : 0,
    dateNightIdeas: Array.isArray(data?.dateNightIdeas) ? data.dateNightIdeas.length : 0,
    sentLetters: Array.isArray(data?.sentLetters) ? data.sentLetters.length : 0,
    loveLangsSet: Array.isArray(data?.currentLoveLangs) && data.currentLoveLangs.length > 0,
  };
}

async function commitToGithub(supabase: any, snapshot: any, takenAt: string) {
  const { data: token, error: tokenErr } = await supabase.rpc("get_github_backup_token");
  if (tokenErr || !token) {
    console.warn("[backup-state] no GitHub token available:", tokenErr?.message);
    return { ok: false, reason: tokenErr?.message || "no token" };
  }

  const safeName = takenAt.replace(/[:.]/g, "-");
  const path = `backups/${safeName}.json`;
  const body = JSON.stringify({ takenAt, counts: contentCounts(snapshot), data: snapshot }, null, 2);
  const b64 = btoa(unescape(encodeURIComponent(body)));

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "heartly-backup-function",
      },
      body: JSON.stringify({
        message: `Backup ${takenAt}`,
        content: b64,
        branch: GITHUB_BRANCH,
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.warn("[backup-state] GitHub commit failed:", res.status, errText);
    return { ok: false, reason: `GitHub ${res.status}` };
  }
  return { ok: true, path };
}

async function runBackup(supabase: any, source: string) {
  const { data: row, error } = await supabase
    .from(SYNC_TABLE)
    .select("data")
    .eq("id", SYNC_ROW_ID)
    .maybeSingle();

  if (error || !row?.data) {
    return { ok: false, reason: error?.message || "couple_state row not found" };
  }

  const takenAt = new Date().toISOString();

  const { error: insertErr } = await supabase
    .from("couple_state_backups")
    .insert({ snapshot: row.data, source, taken_at: takenAt });
  if (insertErr) {
    return { ok: false, reason: `db insert failed: ${insertErr.message}` };
  }

  await supabase.rpc("prune_old_backups");

  const github = await commitToGithub(supabase, row.data, takenAt);

  return { ok: true, takenAt, counts: contentCounts(row.data), github };
}

async function listBackups(supabase: any) {
  const { data, error } = await supabase
    .from("couple_state_backups")
    .select("id, taken_at, source, snapshot")
    .order("taken_at", { ascending: false })
    .limit(30);
  if (error) return { ok: false, reason: error.message };

  const items = (data || []).map((row: any) => ({
    id: row.id,
    takenAt: row.taken_at,
    source: row.source,
    counts: contentCounts(row.snapshot),
  }));
  return { ok: true, items };
}

async function restoreBackup(supabase: any, id: number) {
  const { data: backup, error } = await supabase
    .from("couple_state_backups")
    .select("snapshot, taken_at")
    .eq("id", id)
    .maybeSingle();
  if (error || !backup) return { ok: false, reason: error?.message || "backup not found" };

  // Safety snapshot of whatever is live RIGHT NOW, before we overwrite
  // it — so a restore can never itself be an unrecoverable mistake.
  await runBackup(supabase, "pre-restore");

  const { error: updateErr } = await supabase
    .from(SYNC_TABLE)
    .upsert({
      id: SYNC_ROW_ID,
      data: backup.snapshot,
      updated_by: "backup-restore",
      updated_at: new Date().toISOString(),
    });
  if (updateErr) return { ok: false, reason: updateErr.message };

  return { ok: true, restoredFrom: backup.taken_at };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let action = "run";
  let body: any = {};
  try {
    body = await req.json();
    if (body?.action) action = body.action;
  } catch {
    // No/empty body (e.g. the cron trigger) — default action "run".
  }

  let result;
  if (action === "list") {
    result = await listBackups(supabase);
  } else if (action === "restore") {
    if (typeof body.id !== "number") {
      result = { ok: false, reason: "missing numeric 'id'" };
    } else {
      result = await restoreBackup(supabase, body.id);
    }
  } else {
    result = await runBackup(supabase, body.source || "cron");
  }

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
