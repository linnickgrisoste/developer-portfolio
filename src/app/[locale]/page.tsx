import { preload } from "react-dom";
import { GameLayer } from "@/components/game/game-layer";
import { About } from "@/components/sections/about/about";
import { Contact } from "@/components/sections/contact/contact";
import { Experience } from "@/components/sections/experience/experience";
import { SiteHeader } from "@/components/sections/header/site-header";
import { Hero } from "@/components/sections/hero/hero";
import { StackMarquee } from "@/components/sections/stack/stack-marquee";
import { WorkIndex } from "@/components/sections/work/work-index";
import { FONT_EXTRUDED } from "@/components/three/fonts";
import type { Locale } from "@/lib/i18n";

// O layout já garante que o idioma é válido (as rotas são só /pt e /en).
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  // A fonte das letras 3D do hero começa a baixar junto com o resto, mas só nos aparelhos que vão usá-la.
  // (Pela API do React, e não por um <link> no JSX: escrito à mão, o React o repetia no topo do <head>.)
  preload(FONT_EXTRUDED, {
    as: "fetch",
    crossOrigin: "anonymous",
    media: "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  });

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
