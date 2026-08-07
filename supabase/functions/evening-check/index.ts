// ═══════════════════════════════════════════════════
// Heartly — evening-check
// Runs on a schedule (Supabase Cron, every 5 min recommended).
// Handles the two notification types that aren't tied to a
// button click: Goodnight Letter (time-based) and the
// evening "your streak is at risk" reminder.
//
// Deploy:  supabase functions deploy evening-check --no-verify-jwt
// Schedule (Dashboard → Edge Functions → evening-check → Cron):
//   */5 * * * *
// Secrets: same VAPID_* ones as send-push, plus optionally:
//   APP_TIMEZONE=Europe/Bucharest   (default UTC — set this to your real timezone!)
// ═══════════════════════════════════════════════════

import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const VAPID_PUBLIC_KEY  = (Deno.env.get("VAPID_PUBLIC_KEY") || "").trim();
const VAPID_PRIVATE_KEY = (Deno.env.get("VAPID_PRIVATE_KEY") || "").trim();
const VAPID_SUBJECT     = (Deno.env.get("VAPID_SUBJECT") || "mailto:heartly@example.com").trim();
const APP_TIMEZONE      = (Deno.env.get("APP_TIMEZONE") || "UTC").trim();

const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SYNC_TABLE  = "couple_state";
const SYNC_ROW_ID = "heartly-couple";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

function nowParts(tz: string) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const parts: Record<string, string> = {};
  for (const p of fmt.formatToParts(new Date())) parts[p.type] = p.value;
  return {
    dateStr: `${parts.year}-${parts.month}-${parts.day}`, // YYYY-MM-DD in tz
    minutesSinceMidnight: parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10),
  };
}

function hhmmToMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

async function sendTo(supabase: any, role: "ana" | "robert", title: string, body: string, tag: string) {
  const { data: subs } = await supabase.from("push_subscriptions").select("*").eq("role", role);
  if (!subs || subs.length === 0) return false;
  let sentAny = false;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title, body, tag, icon: "/assets/icon.jpg" })
      );
      sentAny = true;
    } catch (err: any) {
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }
  }
  return sentAny;
}

async function alreadySentToday(supabase: any, key: string, todayStr: string) {
  const { data } = await supabase.from("push_log").select("sent_date").eq("key", key).maybeSingle();
  return !!data && data.sent_date === todayStr;
}

async function markSent(supabase: any, key: string, todayStr: string) {
  await supabase.from("push_log").upsert({ key, sent_date: todayStr });
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { dateStr, minutesSinceMidnight } = nowParts(APP_TIMEZONE);

  const { data: row } = await supabase
    .from(SYNC_TABLE)
    .select("data")
    .eq("id", SYNC_ROW_ID)
    .maybeSingle();

  const state = row?.data || {};
  const results: Record<string, string> = {};

  // ── Goodnight Letter ──
  // Fires once, in the ~5-minute window right after the configured time.
  if (state.shopGoodNight && state.shopGoodNightTime) {
    const targetMin = hhmmToMinutes(state.shopGoodNightTime);
    const diff = minutesSinceMidnight - targetMin;
    const inWindow = diff >= 0 && diff < 10; // tolerant of the cron's 5-min cadence
    if (inWindow && !(await alreadySentToday(supabase, "goodnight", dateStr))) {
      const ok = await sendTo(supabase, "ana", "Goodnight 🌙", "Robert left you a goodnight letter.", "heartly-goodnight");
      if (ok) await markSent(supabase, "goodnight", dateStr);
      results.goodnight = ok ? "sent" : "no subscription";
    }
  }

  // ── Streak-at-risk reminder ──
  // Only after 20:00 local, only if she hasn't opened the app yet today,
  // only if there's an active streak worth protecting.
  const lastOpenInTz = state.lastOpenDate
    ? new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" })
        .format(new Date(state.lastOpenDate))
    : null;

  const openedToday = lastOpenInTz === dateStr;
  const isEvening = minutesSinceMidnight >= 20 * 60; // after 8pm local

  if (isEvening && !openedToday && (state.currentStreak || 0) > 0) {
    if (!(await alreadySentToday(supabase, "streak_reminder", dateStr))) {
      const ok = await sendTo(
        supabase,
        "ana",
        "🔥 Don't lose your streak!",
        `Your ${state.currentStreak}-day streak is waiting — open Heartly before midnight.`,
        "heartly-streak-reminder"
      );
      if (ok) await markSent(supabase, "streak_reminder", dateStr);
      results.streak_reminder = ok ? "sent" : "no subscription";
    }
  }

  return new Response(JSON.stringify({ ok: true, dateStr, minutesSinceMidnight, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
