import { ProgressBadge } from "@/components/game/progress";
import { containerClass } from "@/components/layout/section";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { copy } from "@/content/copy";
import { profile } from "@/content/profile";
import type { Locale } from "@/lib/i18n";
import { anchor, sections } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { CopyEmail } from "./copy-email";

export function Contact({ locale }: { locale: Locale }) {
  const text = copy.contact;
  const year = new Date().getFullYear();

  return (
    <footer
      id={sections.contact}
      className="scroll-mt-16 bg-night text-(--footer-fg) [--cobalt:var(--cobalt-soft)] [--footer-fg:var(--night-fg)]"
    >
      <RevealGroup className={cn(containerClass, "pt-24 pb-10 md:pt-32")}>
        <RevealItem
          as="h2"
          className="max-w-[16ch] text-[clamp(2.5rem,6.5vw,6rem)] leading-[0.92] font-bold tracking-[-0.025em] [font-variation-settings:'wdth'_112]"
        >
          {text.title[locale]}
        </RevealItem>
        <RevealItem as="p" className="mt-6 max-w-[44ch] text-lg leading-relaxed text-(--footer-fg)/65">
          {text.lede[locale]}
        </RevealItem>

        <RevealItem className="mt-14 flex flex-wrap items-end gap-x-8 gap-y-6">
          <a
            href={`mailto:${profile.email}`}
            className="inline-block bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_3px] bg-left-bottom bg-no-repeat pb-2 text-[clamp(1.75rem,5vw,4.5rem)] leading-tight font-semibold tracking-[-0.02em] break-all transition-[background-size,color] duration-500 hover:bg-[length:100%_3px] hover:text-cobalt"
          >
            {profile.email}
          </a>
          <CopyEmail email={profile.email} labels={{ copy: text.copy[locale], copied: text.copied[locale] }} />
        </RevealItem>

        <div className="mt-20 flex flex-col gap-10 border-t border-(--footer-fg)/15 pt-8 md:flex-row md:items-end md:justify-between">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-[15px]">
            {profile.socials.map((social) => (
              <li key={social.label}>
                <a href={social.href} className="text-(--footer-fg)/70 transition-colors hover:text-(--footer-fg)">
                  {social.label}
                </a>
              </li>
            ))}
            <li>
              <a href={profile.resumeHref} className="text-(--footer-fg)/70 transition-colors hover:text-(--footer-fg)">
                {text.resume[locale]}
              </a>
            </li>
          </ul>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] text-(--footer-fg)/50">
            <p className="flex items-center gap-2">
              {text.progress[locale]}
              <ProgressBadge />
            </p>
            <p>
              © {year} {profile.firstName} {profile.lastName}. {copy.footer.rights[locale]}
            </p>
            <a href={anchor(sections.top)} className="transition-colors hover:text-(--footer-fg)">
              {copy.footer.top[locale]}
            </a>
          </div>
        </div>
      </RevealGroup>
    </footer>
  );
}
