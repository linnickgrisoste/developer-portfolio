import type { Metadata } from "next";
import { HeroScene } from "@/components/lab/hero-scene";
import { LabShell } from "@/components/lab/lab-shell";
import { containerClass } from "@/components/layout/section";
import { copy } from "@/content/copy";
import { profile } from "@/content/profile";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Lab · Hero 3D", robots: { index: false } };

export default async function LabHeroPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;

  return (
    <LabShell locale={locale} current="hero" hint="Mexa o mouse · passe sobre as letras · clique numa letra · clique no ponto">
      <h1 className="sr-only">
        {profile.firstName} {profile.lastName}
      </h1>
      <div className="absolute inset-0">
        <HeroScene />
      </div>
      {/* O texto de apoio do hero real, para ver a cena composta com o resto da página. */}
      <div className={cn(containerClass, "pointer-events-none absolute inset-x-0 bottom-16")}>
        <p className="text-[15px] font-semibold text-cobalt">{copy.hero.role[locale]}</p>
        <p className="mt-3 max-w-[44ch] text-xl leading-[1.55] text-pretty">{copy.hero.intro[locale]}</p>
      </div>
    </LabShell>
  );
}
