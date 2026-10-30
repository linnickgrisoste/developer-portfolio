import { AchievementTrigger } from "@/components/game/triggers";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { copy } from "@/content/copy";
import { gameCopy } from "@/content/game";
import { projects } from "@/content/projects";
import type { Locale } from "@/lib/i18n";
import { sections } from "@/lib/sections";
import { FeaturedProjects } from "./featured-project";
import { ProjectList } from "./project-list";
import { toCard } from "./project-card";

// Os destaques aparecem como pôsteres no topo; os demais, na lista com prévia que segue o cursor.
const featuredProjects = projects.filter((project) => project.featured);
const listedProjects = projects.filter((project) => !project.featured);

export function WorkIndex({ locale }: { locale: Locale }) {
  const text = copy.work;
  const cols = text.columns;

  return (
    <Section id={sections.work}>
      <AchievementTrigger id="first-step" />
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <SectionHeading text={text.title[locale]} className="md:col-span-7" />
        <p className="max-w-[40ch] text-lg leading-relaxed text-graphite md:col-span-4 md:col-start-9">
          {text.lede[locale]}
        </p>
      </div>

      <FeaturedProjects items={featuredProjects.map((project) => toCard(project, locale))} total={projects.length} />

      <ProjectList
        items={listedProjects.map((project) => toCard(project, locale))}
        total={projects.length}
        labels={{
          project: cols.project[locale],
          segment: cols.segment[locale],
          stack: cols.stack[locale],
          year: cols.year[locale],
          seen: gameCopy.seen[locale],
        }}
      />
    </Section>
  );
}
