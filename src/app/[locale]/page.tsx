import { GameLayer } from "@/components/game/game-layer";
import { About } from "@/components/sections/about/about";
import { Contact } from "@/components/sections/contact/contact";
import { Experience } from "@/components/sections/experience/experience";
import { SiteHeader } from "@/components/sections/header/site-header";
import { Hero } from "@/components/sections/hero/hero";
import { StackMarquee } from "@/components/sections/stack/stack-marquee";
import { WorkIndex } from "@/components/sections/work/work-index";
import type { Locale } from "@/lib/i18n";

// O layout já garante que o idioma é válido (as rotas são só /pt e /en).
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;

  return (
    <GameLayer>
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
