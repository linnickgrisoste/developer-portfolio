import { AchievementTrigger } from "@/components/game/triggers";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { copy } from "@/content/copy";
import { experience, rolePeriod } from "@/content/experience";
import type { Locale } from "@/lib/i18n";
import { sections } from "@/lib/sections";
import { Timeline } from "./timeline";

export function Experience({ locale }: { locale: Locale }) {
  const text = copy.experience;

  return (
    <Section id={sections.experience} className="grid gap-12 md:grid-cols-12">
      <AchievementTrigger id="quest-log" />
      <SectionHeading text={text.title[locale]} className="md:col-span-4" />
      <Timeline
        entries={experience.map((job) => ({
          company: job.company,
          role: job.role[locale],
          period: rolePeriod(job, locale),
          note: job.note[locale],
          current: !job.end,
        }))}
        labels={{ current: text.current[locale], done: text.done[locale] }}
      />
    </Section>
  );
}
