import { ArrowRight } from "lucide-react";
import { ProgressBadge } from "@/components/game/progress";
import { TrophyRoomLink } from "@/components/game/trophy-room-link";
import { containerClass } from "@/components/layout/section";
import { KineticText } from "@/components/motion/kinetic-text";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { copy } from "@/content/copy";
import { gameCopy } from "@/content/game";
import { profile } from "@/content/profile";
import type { Locale } from "@/lib/i18n";
import { anchor, sections } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { CopyEmail } from "./copy-email";

const socialLinkClass = "text-(--footer-fg)/70 transition-colors hover:text-(--footer-fg)";

export function Contact({ locale }: { locale: Locale }) {
  const text = copy.contact;
  const year = new Date().getFullYear();

  return (
    <footer
      id={sections.contact}
      className="scroll-mt-16 bg-night text-(--footer-fg) [--neon:var(--neon-soft)] [--footer-fg:var(--night-fg)]"
    >
      <RevealGroup className={cn(containerClass, "pt-24 pb-10 md:pt-32")}>
        <KineticText
          as="h2"
          level="title"
          text={text.title[locale]}
          width={112}
          extrude
          className="max-w-[16ch] text-[clamp(2.5rem,6.5vw,6rem)] leading-[0.92] tracking-[-0.025em]"
        />
        <RevealItem as="p" className="mt-6 max-w-[44ch] text-lg leading-relaxed text-(--footer-fg)/65">
          {text.lede[locale]}
        </RevealItem>

        <RevealItem className="mt-14 flex flex-wrap items-end gap-x-8 gap-y-6">
          <a
            href={`mailto:${profile.email}`}
            className="inline-block bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_3px] bg-left-bottom bg-no-repeat pb-2 text-[clamp(1.75rem,5vw,4.5rem)] leading-tight tracking-[-0.02em] transition-[background-size] duration-500 hover:bg-[length:100%_3px]"
          >
            <KineticText
              text={profile.email}
              level="title"
              weight={600}
              extrude
              entrance={false}
              wrap="anywhere"
              engageWith="a"
            />
          </a>
          <CopyEmail email={profile.email} labels={{ copy: text.copy[locale], copied: text.copied[locale] }} />
        </RevealItem>

        <div className="mt-20 flex flex-col gap-10 border-t border-(--footer-fg)/15 pt-8 md:flex-row md:items-end md:justify-between">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-[15px]">
            {profile.socials.map((social) => (
              <li key={social.label}>
                <a href={social.href} className={socialLinkClass}>
                  <LinkLabel text={social.label} />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] text-(--footer-fg)/65">
            <TrophyRoomLink className="group inline-flex items-center gap-2 transition-colors hover:text-(--footer-fg)">
              <LinkLabel text={gameCopy.trophyRoom[locale]} />
              <ProgressBadge />
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </TrophyRoomLink>
            <p>
              © {year} {profile.firstName} {profile.lastName}. {copy.footer.rights[locale]}
            </p>
            <a href={anchor(sections.top)} className="transition-colors hover:text-(--footer-fg)">
              <LinkLabel text={copy.footer.top[locale]} />
            </a>
          </div>
        </div>
      </RevealGroup>
    </footer>
  );
}

function LinkLabel({ text }: { text: string }) {
  return <KineticText text={text} level="detail" weight={500} extrude entrance={false} engageWith="a" />;
}
