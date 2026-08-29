import { getSupabase } from "@/lib/supabase";

export interface ActivityItem {
  /** Unique key — prefixed by source so ids never collide. */
  id: string;
  type: string;
  title: string;
  created_at: string;
}

/**
 * Unified, real-data activity feed.
 *
 * Sources:
 *   • activity_log   — booking syncs, project publishes/removals
 *   • inquiries      — contact-form arrivals (activity_log has no
 *                      anon-write path by design, so inquiry events
 *                      are derived from the table itself)
 *
 * No synthetic or demo events are ever produced: an empty database
 * simply yields an empty feed.
 */
export async function fetchActivityFeed(limit = 50): Promise<ActivityItem[]> {
  const supabase = getSupabase();

  const [logsResult, inquiriesResult] = await Promise.all([
    supabase
      .from("activity_log")
      .select("id, type, title, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("inquiries")
      .select("id, name, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  const items: ActivityItem[] = [];

  for (const log of (logsResult.data as Array<Record<string, unknown>>) ?? []) {
    items.push({
      id: `log-${log.id}`,
      type: String(log.type ?? "visitor"),
      title: String(log.title ?? ""),
      created_at: String(log.created_at),
    });
  }

  for (const inquiry of (inquiriesResult.data as Array<Record<string, unknown>>) ?? []) {
    const name = String(inquiry.name ?? "someone");
    items.push({
      id: `inquiry-${inquiry.id}`,
      type: "inquiry",
      title: `New inquiry from ${name}`,
      created_at: String(inquiry.created_at),
    });
  }

  return items
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}
