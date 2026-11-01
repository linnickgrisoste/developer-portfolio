import { AchievementTrigger } from "@/components/game/triggers";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { copy } from "@/content/copy";
import { projects } from "@/content/projects";
import type { Locale } from "@/lib/i18n";
import { sections } from "@/lib/sections";
import { toCard } from "./project-card";
import { ProjectSphere } from "./project-sphere";

export function WorkIndex({ locale }: { locale: Locale }) {
  const text = copy.work;

  return (
    <Section id={sections.work}>
      <AchievementTrigger id="first-step" />
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <SectionHeading text={text.title[locale]} className="md:col-span-7" />
        <p className="max-w-[40ch] text-lg leading-relaxed text-graphite md:col-span-4 md:col-start-9">
          {text.lede[locale]}
        </p>
      </div>

      <ProjectSphere
        items={projects.map((project) => toCard(project, locale))}
        labels={{
          open: text.sphere.open[locale],
          drag: text.sphere.drag[locale],
          swipe: text.sphere.swipe[locale],
          stores: { android: text.sphere.android[locale], ios: text.sphere.ios[locale] },
        }}
      />
    </Section>
  );
}
