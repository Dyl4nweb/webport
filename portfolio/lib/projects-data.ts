import {
  projects as staticProjects,
  getFeaturedProjects as getStaticFeaturedProjects,
  getProjectsByCategory as getStaticProjectsByCategory,
} from "@/data/projects";
import type { Project } from "@/types";

/**
 * All projects sourced directly from the local codebase (data/projects.ts).
 * 100% reliable, instantaneous, and completely independent of any external database.
 */
export async function getAllProjects(): Promise<Project[]> {
  return staticProjects;
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return getStaticFeaturedProjects();
}

export async function getProjectsByCategory(
  category: string
): Promise<Project[]> {
  return getStaticProjectsByCategory(category);
}
