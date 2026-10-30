import type { Project } from "@/content/projects";
import type { Locale } from "@/lib/i18n";

/** Projeto já no idioma da página. É o que as ilhas da seção recebem, em vez dos dois idiomas. */
export type ProjectCard = Omit<Project, "segment" | "summary"> & { segment: string; summary: string };

export const toCard = (project: Project, locale: Locale): ProjectCard => ({
  ...project,
  segment: project.segment[locale],
  summary: project.summary[locale],
});
