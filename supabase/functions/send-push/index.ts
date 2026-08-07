// ═══════════════════════════════════════════════════
// Heartly — send-push
// Called directly from the client (fetch) whenever something
// notification-worthy happens: a new letter, a streak milestone, etc.
//
// POST body: { role: 'ana'|'robert', title: string, body: string, tag?: string }
//
// Deploy:  supabase functions deploy send-push
// Secrets: supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@example.com
// ═══════════════════════════════════════════════════

import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const VAPID_PUBLIC_KEY  = (Deno.env.get("VAPID_PUBLIC_KEY") || "").trim();
const VAPID_PRIVATE_KEY = (Deno.env.get("VAPID_PRIVATE_KEY") || "").trim();
const VAPID_SUBJECT     = (Deno.env.get("VAPID_SUBJECT") || "mailto:heartly@example.com").trim();

const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Set up VAPID here (not at module top-level) so a malformed secret
    // returns a normal JSON error instead of crashing the whole worker
    // before it can even respond to OPTIONS.
    try {
      webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    } catch (vapidErr: any) {
      return new Response(
        JSON.stringify({
          error: "invalid VAPID configuration",
          detail: vapidErr?.message || String(vapidErr),
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { role, title, body, tag } = await req.json();

    if (!role || !["ana", "robert"].includes(role) || !title || !body) {
      return new Response(
        JSON.stringify({ error: "role ('ana'|'robert'), title, and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("role", role);

    if (error) throw error;
    if (!subs || subs.length === 0) {
      return new Response(
        JSON.stringify({ error: `no push subscription stored for role "${role}" yet` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = JSON.stringify({ title, body, tag: tag || "heartly-general", icon: "/assets/icon.jpg" });
    const results = await Promise.all(subs.map(async (sub) => {
      const pushSubscription = { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } };
      try {
        await webpush.sendNotification(pushSubscription, payload);
        return { id: sub.id, ok: true };
      } catch (pushErr: any) {
        // Subscription is stale/expired (browser unsubscribed, device reset, etc.) — clean up just this one device.
        if (pushErr?.statusCode === 404 || pushErr?.statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
        return { id: sub.id, ok: false, statusCode: pushErr?.statusCode, message: pushErr?.message };
      }
    }));

    return new Response(JSON.stringify({ ok: true, sent: results.filter(r => r.ok).length, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
