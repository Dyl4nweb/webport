import type { SupabaseClient } from "@supabase/supabase-js";

const PROVIDER = "gmail";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";
const SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

export const GMAIL_STATE_COOKIE = "gmail_oauth_state";

export interface StoredTokens {
  access_token: string | null;
  refresh_token: string | null;
  expires_at: string | null;
}

export interface InboxMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  date: string;
  snippet: string;
  unread: boolean;
}

export function isGmailConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI
  );
}

export function buildConsentUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

interface GoogleTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

/** Exchange an authorization code for tokens. Server-side only. */
export async function exchangeCodeForTokens(
  code: string
): Promise<{ accessToken: string; refreshToken: string | null; expiresAt: string } | null> {
  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`[gmail] token exchange failed (${response.status})`);
      return null;
    }

    const json = (await response.json()) as GoogleTokenResponse;
    if (!json.access_token) return null;

    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token ?? null,
      expiresAt: new Date(Date.now() + (json.expires_in ?? 3600) * 1000).toISOString(),
    };
  } catch {
    console.error("[gmail] token exchange threw");
    return null;
  }
}

async function readTokens(
  supabase: SupabaseClient
): Promise<StoredTokens | null> {
  const { data } = await supabase.rpc("admin_get_integration_token", {
    p_provider: PROVIDER,
  });

  // Composite-type RPCs may arrive as an object or a single-element array.
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || !row.access_token) return null;
  return row as StoredTokens;
}

async function writeTokens(
  supabase: SupabaseClient,
  accessToken: string,
  refreshToken: string | null,
  expiresAt: string
): Promise<void> {
  await supabase.rpc("admin_set_integration_token", {
    p_provider: PROVIDER,
    p_access_token: accessToken,
    p_refresh_token: refreshToken,
    p_expires_at: expiresAt,
  });
}

/**
 * Return a valid access token, refreshing it via the stored refresh
 * token when expired. Tokens are read from and written to the
 * integration_tokens table through the admin-guarded RPCs — they are
 * never returned anywhere except into the Authorization header of the
 * outgoing Google API call.
 */
export async function getValidAccessToken(
  supabase: SupabaseClient
): Promise<string | null> {
  const tokens = await readTokens(supabase);
  if (!tokens) return null;

  const notExpired =
    tokens.expires_at &&
    new Date(tokens.expires_at).getTime() > Date.now() + 60_000;

  if (notExpired && tokens.access_token) {
    return tokens.access_token;
  }

  if (!tokens.refresh_token) return null;

  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: tokens.refresh_token,
        grant_type: "refresh_token",
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`[gmail] token refresh failed (${response.status})`);
      return null;
    }

    const json = (await response.json()) as GoogleTokenResponse;
    if (!json.access_token) return null;

    const expiresAt = new Date(
      Date.now() + (json.expires_in ?? 3600) * 1000
    ).toISOString();

    await writeTokens(supabase, json.access_token, json.refresh_token ?? null, expiresAt);
    return json.access_token;
  } catch {
    console.error("[gmail] token refresh threw");
    return null;
  }
}

function parseFromHeader(raw: string): { name: string; email: string } {
  const match = raw.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>\s*$/);

  if (match) {
    const name = match[1].trim();
    const email = match[2].trim();
    return { name: name || email.split("@")[0], email };
  }

  const email = raw.trim();
  return { name: email.split("@")[0] || email, email };
}

function toInboxMessage(meta: Record<string, unknown>): InboxMessage | null {
  const id = typeof meta.id === "string" ? meta.id : null;
  if (!id) return null;

  const payload = meta.payload as
    | { headers?: Array<{ name: string; value: string }> }
    | undefined;
  const headers = payload?.headers ?? [];

  const header = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name)?.value ?? "";

  const from = parseFromHeader(header("from"));
  const internalDate =
    typeof meta.internalDate === "string" ? Number(meta.internalDate) : NaN;
  const date = Number.isFinite(internalDate)
    ? new Date(internalDate).toISOString()
    : new Date().toISOString();

  const labelIds = Array.isArray(meta.labelIds) ? meta.labelIds : [];

  return {
    id,
    senderName: from.name,
    senderEmail: from.email,
    subject: header("subject") || "(no subject)",
    date,
    snippet: typeof meta.snippet === "string" ? meta.snippet : "",
    unread: labelIds.includes("UNREAD"),
  };
}

/** Fetch the latest inbox messages. Returns null on any failure. */
export async function fetchInbox(
  accessToken: string,
  max = 25
): Promise<InboxMessage[] | null> {
  try {
    const listResponse = await fetch(
      `${GMAIL_API_BASE}/messages?maxResults=${max}&labelIds=INBOX`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!listResponse.ok) {
      console.error(`[gmail] message list failed (${listResponse.status})`);
      return null;
    }

    const list = (await listResponse.json()) as {
      messages?: Array<{ id: string }>;
    };

    const ids = (list.messages ?? []).map((m) => m.id);

    const messages = await Promise.all(
      ids.map(async (id) => {
        const response = await fetch(
          `${GMAIL_API_BASE}/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: AbortSignal.timeout(10000),
          }
        );

        if (!response.ok) return null;
        return toInboxMessage(await response.json());
      })
    );

    return messages.filter((m): m is InboxMessage => m !== null);
  } catch {
    console.error("[gmail] inbox fetch threw");
    return null;
  }
}

/** Lightweight profile call used for the connected-state email display. */
export async function fetchProfileEmail(
  accessToken: string
): Promise<string | null> {
  try {
    const response = await fetch(`${GMAIL_API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;

    const json = (await response.json()) as { emailAddress?: string };
    return json.emailAddress ?? null;
  } catch {
    return null;
  }
}
