import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { copy } from "@/content/copy";
import { stats } from "@/content/profile";
import { stack } from "@/content/stack";
import type { Locale } from "@/lib/i18n";
import { sections } from "@/lib/sections";
import { CharacterSheet } from "./character-sheet";
import { CountUp } from "./count-up";

export function About({ locale }: { locale: Locale }) {
  const text = copy.about;

  return (
    <Section id={sections.about} className="grid gap-12 md:grid-cols-12">
      <SectionHeading text={text.title[locale]} className="md:col-span-4" />

      <RevealGroup className="md:col-span-8">
        <RevealItem
          as="p"
          className="max-w-[34ch] text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.3] font-medium tracking-[-0.01em] text-pretty"
        >
          {text.body[locale]}
        </RevealItem>
        <RevealItem as="p" className="mt-8 max-w-[56ch] text-lg leading-relaxed text-graphite">
          {text.body2[locale]}
        </RevealItem>

        <RevealItem as="dl" className="mt-14 grid grid-cols-3 gap-6 border-t border-rule pt-6">
          {stats.map((stat) => (
            <div key={stat.label.en}>
              <dt className="sr-only">{stat.label[locale]}</dt>
              <dd className="text-[clamp(2.25rem,5vw,4rem)] leading-none font-bold tracking-[-0.03em] [font-variation-settings:'wdth'_125]">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </dd>
              <dd aria-hidden className="mt-2 text-[14px] leading-snug text-graphite">
                {stat.label[locale]}
              </dd>
            </div>
          ))}
        </RevealItem>

        <CharacterSheet
          classes={stack.map((group) => ({
            id: group.group.en,
            name: group.group[locale],
            role: group.role[locale],
            items: group.items,
          }))}
          labels={{ title: text.stackTitle[locale], hint: text.stackHint[locale], level: text.levelLabel[locale] }}
        />
      </RevealGroup>
    </Section>
  );
}
