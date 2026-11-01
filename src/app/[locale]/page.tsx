import { preload } from "react-dom";
import { GameLayer } from "@/components/game/game-layer";
import { SiteBackground } from "@/components/layout/site-background";
import { About } from "@/components/sections/about/about";
import { Contact } from "@/components/sections/contact/contact";
import { Experience } from "@/components/sections/experience/experience";
import { SiteHeader } from "@/components/sections/header/site-header";
import { Hero } from "@/components/sections/hero/hero";
import { StackMarquee } from "@/components/sections/stack/stack-marquee";
import { WorkIndex } from "@/components/sections/work/work-index";
import { FONT_EXTRUDED } from "@/components/three/fonts";
import type { Locale } from "@/lib/i18n";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  preload(FONT_EXTRUDED, {
    as: "fetch",
    crossOrigin: "anonymous",
    media: "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  });

  return (
    <GameLayer>
      <SiteBackground />
      <SiteHeader locale={locale} />
      <main>
        <Hero locale={locale} />
        <StackMarquee />
        <WorkIndex locale={locale} />
        <About locale={locale} />
        <Experience locale={locale} />
      </main>
      <Contact locale={locale} />
    </GameLayer>
  );
}
