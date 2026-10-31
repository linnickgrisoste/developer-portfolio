import type { CSSProperties } from "react";
import { ArrowDown, Gamepad2 } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { copy } from "@/content/copy";
import { achievements, gameCopy } from "@/content/game";
import { profile } from "@/content/profile";
import type { Locale } from "@/lib/i18n";
import { anchor, sections } from "@/lib/sections";
import { HeroFrame } from "./hero-frame";

export function Hero({ locale }: { locale: Locale }) {
  const text = copy.hero;

  return (
    <HeroFrame firstName={profile.firstName} lastName={profile.lastName}>
      <div className="grid gap-10 md:grid-cols-12">
        <div className="rise-in md:col-span-7 lg:col-span-6">
          <p className="text-[15px] font-semibold text-neon">{text.role[locale]}</p>
          <p className="mt-3 max-w-[44ch] text-xl leading-[1.55] text-pretty sm:text-2xl">{text.intro[locale]}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Magnetic intensity={0.25}>
              <a
                href={anchor(sections.work)}
                className="inline-flex h-12 items-center rounded-full bg-ink px-6 text-[15px] font-semibold text-paper transition-[background-color,scale] hover:bg-neon active:scale-[0.97]"
              >
                {text.ctaWork[locale]}
              </a>
            </Magnetic>
            <a
              href={anchor(sections.experience)}
              className="text-[15px] font-semibold underline decoration-rule decoration-2 underline-offset-[6px] transition-colors hover:decoration-neon"
            >
              {text.ctaAbout[locale]}
            </a>
          </div>
        </div>

        <div
          className="rise-in grid content-end gap-4 text-[15px] md:col-span-4 md:col-start-9 lg:col-span-3 lg:col-start-10"
          style={{ "--delay": "750ms" } as CSSProperties}
        >
          <dl className="grid gap-4">
            <div className="flex items-center gap-2.5">
              <dt className="sr-only">{text.statusLabel[locale]}</dt>
              <span aria-hidden className="size-2 rounded-full bg-neon" />
              <dd>{text.status[locale]}</dd>
            </div>
            <div>
              <dt className="sr-only">{text.locationLabel[locale]}</dt>
              <dd className="text-graphite">{text.location[locale]}</dd>
            </div>
            <div className="mt-4 flex items-start gap-2.5 border-t border-rule pt-4">
              <dt className="sr-only">{gameCopy.title[locale]}</dt>
              <Gamepad2 className="mt-0.5 size-4 shrink-0 text-neon" strokeWidth={1.75} aria-hidden />
              <dd className="text-graphite">{gameCopy.hint[locale].replace("{count}", String(achievements.length))}</dd>
            </div>
          </dl>
          <a href={anchor(sections.work)} className="mt-2 inline-flex items-center gap-2 text-[13px] font-semibold text-ink">
            <ArrowDown className="scroll-cue size-4" strokeWidth={2} aria-hidden />
            {text.scroll[locale]}
          </a>
        </div>
      </div>
    </HeroFrame>
  );
}
