"use client";

import { useState, useMemo } from "react";
import { Project } from "@/types";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectModal from "@/components/projects/ProjectModal";
import Reveal from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

interface CategorySection {
  label: string;
  projects: Project[];
}

interface ProjectsGridProps {
  sections?: CategorySection[];
  projects?: Project[];
  showSearch?: boolean;
  showFilters?: boolean;
}

export default function ProjectsGrid({
  sections,
  projects,
  showSearch = true,
  showFilters = true,
}: ProjectsGridProps) {
  const [selected, setSelected] = useState<Project | null>(null);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const allProjects = useMemo<Project[]>(() => {
    if (projects && projects.length > 0) return projects;
    if (sections && sections.length > 0) {
      return sections.flatMap((s) => s.projects);
    }
    return [];
  }, [sections, projects]);

  const categories = useMemo(() => {
    const list = ["All"];
    if (sections && sections.length > 0) {
      sections.forEach((s) => {
        if (s.label && !list.includes(s.label)) list.push(s.label);
      });
    } else {
      allProjects.forEach((p) => {
        if (p.category && !list.includes(p.category)) list.push(p.category);
      });
    }
    return list;
  }, [sections, allProjects]);

  const filteredProjects = useMemo(() => {
    const cleanQuery = query.toLowerCase().trim();

    return allProjects.filter((p) => {
      const matchCategory =
        activeFilter === "All" ||
        (p.category && p.category.toLowerCase() === activeFilter.toLowerCase()) ||
        (sections &&
          sections.find((s) => s.label?.toLowerCase() === activeFilter.toLowerCase())?.projects.some(
            (proj) => proj.slug === p.slug
          ));

      if (!matchCategory) return false;

      if (!cleanQuery) return true;

      const nameMatch = p.name?.toLowerCase().includes(cleanQuery);
      const taglineMatch = p.tagline?.toLowerCase().includes(cleanQuery);
      const descMatch = p.description?.toLowerCase().includes(cleanQuery);
      const categoryMatch = p.category?.toLowerCase().includes(cleanQuery);
      const stackMatch = p.techStack?.some((t) => typeof t === "string" && t.toLowerCase().includes(cleanQuery));
      const roleMatch = p.role?.toLowerCase().includes(cleanQuery);

      return Boolean(nameMatch || taglineMatch || descMatch || categoryMatch || stackMatch || roleMatch);
    });
  }, [allProjects, query, activeFilter, sections]);

  const hasControls = showSearch || (showFilters && categories.length > 1);

  return (
    <>
      <div className="flex flex-col gap-10 sm:gap-12">
        {/* Search & Category Filter Controls */}
        {hasControls && (
          <Reveal>
            <div className="flex flex-col gap-4 sm:gap-5">
              {/* Search Input Bar */}
              {showSearch && (
                <div className="relative mx-auto w-full max-w-2xl">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink-tertiary dark:text-ink-dark-secondary">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>

                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search projects by name, tech stack, or keywords..."
                    className={cn(
                      "w-full rounded-2xl sm:rounded-full bg-surface-card dark:bg-surface-dark-card border border-line/70 dark:border-line-dark/70 py-3.5 pl-11 pr-10 text-[14px] sm:text-[15px] text-ink dark:text-ink-dark shadow-sm backdrop-blur-md transition-all placeholder:text-ink-tertiary focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10 dark:focus:border-white dark:focus:ring-white/10"
                    )}
                  />

                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink-tertiary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark transition-colors"
                      title="Clear search"
                      aria-label="Clear search"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Category Filter Tabs & Result Count */}
              {showFilters && categories.length > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {categories.map((cat) => {
                      const isSelected = activeFilter === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setActiveFilter(cat)}
                          className={cn(
                            "rounded-full px-3.5 py-1.5 text-[12px] sm:text-[12.5px] font-mono font-medium transition-all select-none border",
                            isSelected
                              ? "bg-ink text-surface dark:bg-ink-dark dark:text-surface-dark border-ink dark:border-ink-dark shadow-sm"
                              : "bg-surface-card dark:bg-surface-dark-card border-line/60 dark:border-line-dark/60 text-ink-secondary dark:text-ink-dark-secondary hover:border-black/30 dark:hover:border-white/30 hover:text-ink dark:hover:text-ink-dark"
                          )}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  <span className="font-mono text-[11.5px] text-ink-tertiary dark:text-ink-dark-secondary">
                    Showing {filteredProjects.length} of {allProjects.length} projects
                  </span>
                </div>
              )}
            </div>
          </Reveal>
        )}

        {/* Projects Grid Result */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 justify-center gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-sm sm:max-w-none mx-auto w-full">
            {filteredProjects.map((project, index) => (
              <Reveal key={project.slug} delay={index * 45} className="h-full">
                <ProjectCard
                  project={project}
                  priority={index < 3}
                  onOpen={setSelected}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center rounded-3xl border border-line/60 dark:border-line-dark/60 bg-surface-card/60 dark:bg-surface-dark-card/60 p-10 text-center backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt dark:bg-[#18181b] text-ink-secondary dark:text-ink-dark-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-ink dark:text-ink-dark">
              No projects found
            </h3>
            <p className="mt-1.5 text-xs text-ink-secondary dark:text-ink-dark-secondary">
              We couldn&apos;t find any project matching &ldquo;{query}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveFilter("All");
              }}
              className="mt-5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-surface hover:opacity-90 dark:bg-ink-dark dark:text-surface-dark"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {selected && (
        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}