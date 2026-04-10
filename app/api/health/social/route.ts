import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/cron-auth";
import { TwitterApi } from "twitter-api-v2";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, { valid: boolean; error?: string; expiresAt?: string }> = {};

  // --- Facebook (META_PAGE_ACCESS_TOKEN) ---
  const fbToken = process.env.META_PAGE_ACCESS_TOKEN?.trim();
  const fbPageId = process.env.META_PAGE_ID?.trim();
  if (fbToken && fbPageId) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v24.0/${fbPageId}?fields=name,id&access_token=${fbToken}`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (res.ok) {
        const debugRes = await fetch(
          `https://graph.facebook.com/v24.0/debug_token?input_token=${fbToken}&access_token=${fbToken}`,
          { signal: AbortSignal.timeout(10000) }
        );
        const debugData = debugRes.ok ? await debugRes.json() : null;
        const expiresAt = debugData?.data?.expires_at;
        results.facebook = {
          valid: true,
          ...(expiresAt && expiresAt > 0 && { expiresAt: new Date(expiresAt * 1000).toISOString() }),
        };
      } else {
        const body = await res.json().catch(() => ({})) as { error?: { message?: string } };
        results.facebook = { valid: false, error: body?.error?.message || `HTTP ${res.status}` };
      }
    } catch (err) {
      results.facebook = { valid: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  // --- Instagram (INSTAGRAM_USER_ID + META_PAGE_ACCESS_TOKEN) ---
  const igUserId = process.env.INSTAGRAM_USER_ID?.trim();
  if (igUserId && fbToken) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v24.0/${igUserId}?fields=name,username&access_token=${fbToken}`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (res.ok) {
        results.instagram = { valid: true };
      } else {
        const body = await res.json().catch(() => ({})) as { error?: { message?: string } };
        results.instagram = { valid: false, error: body?.error?.message || `HTTP ${res.status}` };
      }
    } catch (err) {
      results.instagram = { valid: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  // --- X / Twitter (OAuth1a via twitter-api-v2) ---
  const xApiKey = process.env.TWITTER_API_KEY?.trim();
  const xApiSecret = process.env.TWITTER_API_SECRET?.trim();
  const xAccessToken = process.env.TWITTER_ACCESS_TOKEN?.trim();
  const xAccessSecret = process.env.TWITTER_ACCESS_SECRET?.trim();
  if (xApiKey && xApiSecret && xAccessToken && xAccessSecret) {
    try {
      const client = new TwitterApi({
        appKey: xApiKey,
        appSecret: xApiSecret,
        accessToken: xAccessToken,
        accessSecret: xAccessSecret,
      });
      await client.v2.me();
      results.x = { valid: true };
    } catch (err) {
      results.x = { valid: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  const allValid = Object.values(results).every((r) => r.valid);
  const hasExpiringSoon = Object.values(results).some((r) => {
    if (!r.expiresAt) return false;
    return (new Date(r.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 30;
  });

  return NextResponse.json({ ok: allValid && !hasExpiringSoon, platforms: results, hasExpiringSoon });
}
