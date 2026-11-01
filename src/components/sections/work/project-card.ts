import type { Project } from "@/content/projects";
import type { Locale } from "@/lib/i18n";

export type ProjectCard = Omit<Project, "segment" | "summary"> & { segment: string; summary: string };

export const toCard = (project: Project, locale: Locale): ProjectCard => ({
  ...project,
  segment: project.segment[locale],
  summary: project.summary[locale],
});
