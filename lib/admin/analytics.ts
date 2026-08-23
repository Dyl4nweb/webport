import { getSupabase } from "@/lib/supabase";

export type Device = "mobile" | "tablet" | "desktop";

export interface PageViewRow {
  id: number;
  path: string;
  referrer: string | null;
  device: Device;
  created_at: string;
}

/**
 * Fetch raw page-view rows for the last `days` days, newest first.
 * Portfolio-scale volume makes client-side aggregation the simplest
 * correct approach — no SQL views or RPCs required.
 */
export async function fetchRecentViews(days: number): Promise<PageViewRow[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await getSupabase()
    .from("page_views")
    .select("id, path, referrer, device, created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) throw error;
  return (data as PageViewRow[]) ?? [];
}

/** Total all-time page views via a cheap head count. */
export async function countAllViews(): Promise<number> {
  const { count } = await getSupabase()
    .from("page_views")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export interface TallyEntry<T extends string> {
  key: T;
  count: number;
}

/** Group rows by a derived key and sort by descending count. */
export function tally<T extends string>(
  rows: PageViewRow[],
  keyOf: (row: PageViewRow) => T | null
): Array<TallyEntry<T>> {
  const map = new Map<T, number>();

  for (const row of rows) {
    const key = keyOf(row);
    if (key === null) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

function localDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Local-date string (YYYY-MM-DD) for an ISO timestamp. */
export function dayKeyOf(iso: string): string {
  return localDayKey(new Date(iso));
}

/** The last `n` local day keys, oldest first (today last). */
export function lastNDayKeys(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    keys.push(localDayKey(day));
  }

  return keys;
}

/** Midnight at the start of today, local time. */
export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Short weekday + date label for trend axes, e.g. "Mon 12". */
export function shortDayLabel(dayKey: string): string {
  const date = new Date(`${dayKey}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
