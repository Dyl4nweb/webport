import { getSupabase } from "@/lib/supabase";
import { projects as staticProjects } from "@/data/projects";
import type { Project } from "@/types";

interface ProjectRow {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  role: string;
  year: string;
  category: string;
  image: string;
  screenshots: Project["screenshots"];
  tech_stack: string[];
  live_url: string | null;
  repo_url: string | null;
  featured: boolean;
  overview: string;
  features: string[];
}

/**
 * Map a portfolio_projects row to the public Project shape.
 * Defensive: any malformed field degrades to a safe default rather
 * than throwing — the public site must never break on bad data.
 */
function rowToProject(row: ProjectRow): Project {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    role: row.role ?? "",
    year: row.year ?? "",
    category: row.category ?? "Web App",
    image: row.image ?? "",
    screenshots: Array.isArray(row.screenshots) ? row.screenshots : [],
    techStack: Array.isArray(row.tech_stack) ? row.tech_stack : [],
    liveUrl: row.live_url ?? undefined,
    repoUrl: row.repo_url ?? undefined,
    featured: Boolean(row.featured),
    overview: row.overview ?? "",
    features: Array.isArray(row.features) ? row.features : [],
  };
}

/**
 * All projects, database-first.
 *
 * SAFETY CONTRACT: if Supabase is unreachable, errors out, or simply
 * has no rows yet, this ALWAYS falls back to data/projects.ts so the
 * public site can never show an empty or broken project list.
 */
export async function getAllProjects(): Promise<Project[]> {
  try {
    const { data, error } = await getSupabase()
      .from("portfolio_projects")
      .select(
        "slug, name, tagline, description, role, year, category, image, screenshots, tech_stack, live_url, repo_url, featured, overview, features"
      )
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return (data as ProjectRow[]).map(rowToProject);
    }
  } catch {
    // Supabase unavailable — fall through to static data.
  }

  return staticProjects;
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getAllProjects()).filter((p) => p.featured);
}

export async function getProjectsByCategory(
  category: string
): Promise<Project[]> {
  return (await getAllProjects()).filter((p) => p.category === category);
}
