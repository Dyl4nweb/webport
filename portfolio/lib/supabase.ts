import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type { SupabaseClient };

// Next.js dev can bundle this module into separate chunks per route,
// which would otherwise create duplicate GoTrueClient instances.
// Storing the singleton on globalThis keeps one client process-wide.
const globalForSupabase = globalThis as unknown as {
  __supabaseClient?: SupabaseClient;
};

export function getSupabase(): SupabaseClient {
  if (globalForSupabase.__supabaseClient) {
    return globalForSupabase.__supabaseClient;
  }

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  globalForSupabase.__supabaseClient = client;
  return client;
}

/**
 * Token-scoped client for server-side route handlers: carries the
 * caller's JWT so RLS (including the is_admin() allowlist) applies.
 */
export function getSupabaseWithToken(token: string): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );
}

const globalForSupabaseService = globalThis as unknown as {
  __supabaseServiceClient?: SupabaseClient;
};

/**
 * Server-only service-role client for background maintenance tasks
 * (visitor-data pruning). The key is read exclusively from a
 * server environment variable — never NEXT_PUBLIC, never shipped to
 * the browser, never logged or returned by any route. Returns null
 * when the key is not configured; callers must degrade gracefully.
 */
export function getSupabaseService(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;

  if (!globalForSupabaseService.__supabaseServiceClient) {
    globalForSupabaseService.__supabaseServiceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      key,
    );
  }

  return globalForSupabaseService.__supabaseServiceClient;
}
