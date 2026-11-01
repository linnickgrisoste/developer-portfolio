import { ExplorerHud } from "@/components/game/hud";
import { containerClass } from "@/components/layout/section";
import { copy } from "@/content/copy";
import { profile } from "@/content/profile";
import type { Locale } from "@/lib/i18n";
import { sections } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { LocaleToggle, ThemeToggle } from "./controls";
import { HeaderName } from "./header-name";
import { SectionNav } from "./section-nav";

export function SiteHeader({ locale }: { locale: Locale }) {
  const nav = copy.nav;
  const links = [
    { id: sections.work, label: nav.work[locale] },
    { id: sections.about, label: nav.about[locale] },
    { id: sections.experience, label: nav.experience[locale] },
    { id: sections.contact, label: nav.contact[locale] },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-rule/70 bg-paper/85 backdrop-blur-md">
      <div className={cn(containerClass, "flex h-16 items-center justify-between gap-3 sm:gap-6")}>
        <HeaderName name={`${profile.firstName} ${profile.lastName}`} />
        <SectionNav label={nav.label[locale]} links={links} />
        <div className="flex items-center gap-1">
          <ExplorerHud />
          <LocaleToggle label={copy.toggles.language[locale]} />
          <ThemeToggle label={copy.toggles.theme[locale]} />
        </div>
      </div>
    </header>
  );
}
