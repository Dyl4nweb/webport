import { getSupabase } from "@/lib/supabase";
import {
  certificates as staticCertificates,
  type Certificate,
} from "@/data/certificates";

/**
 * DB-first certificate loading with static fallback.
 * The public Certifications page must never render blank:
 * a database error or an empty table falls back to the
 * existing static data untouched.
 */
export async function getCertificates(): Promise<Certificate[]> {
  try {
    const { data, error } = await getSupabase()
      .from("certificates")
      .select(
        "title, issuer, category, year, logo, image, description, verify_url"
      )
      .eq("published", true)
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((row) => {
        const r = row as {
          title: string | null;
          issuer: string | null;
          category: string | null;
          year: string | null;
          logo: string | null;
          image: string | null;
          description: string | null;
          verify_url: string | null;
        };

        return {
          title: r.title ?? "",
          issuer: r.issuer ?? "",
          category: r.category ?? "",
          year: r.year ?? "",
          logo: r.logo ?? "",
          image: r.image ?? "",
          description: r.description ?? "",
          ...(r.verify_url ? { verifyUrl: r.verify_url } : {}),
        };
      });
    }
  } catch (err) {
    console.error("[certificates-data] database load failed:", err);
  }

  return staticCertificates;
}
