import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { containerClass } from "@/components/layout/section";
import { TrophyRoom } from "@/components/sections/trophies/trophy-room";
import { achievements, gameCopy } from "@/content/game";
import { profile } from "@/content/profile";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  return {
    title: `${gameCopy.trophyRoom[locale]} · ${profile.firstName} ${profile.lastName}`,
    description: gameCopy.roomIntro[locale],
  };
}

// A sala de troféus tem rota própria: pacote separado, o botão voltar funciona e o link pode ser compartilhado.
// É sempre noturna, como o rodapé de onde se chega a ela.
export default async function TrophiesPage({ params }: PageProps) {
  const locale = (await params).locale as Locale;

  return (
    <div className="flex min-h-svh flex-col bg-night text-night-fg [--cobalt:var(--cobalt-soft)]">
      <header className={cn(containerClass, "flex h-16 w-full shrink-0 items-center")}>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-[15px] font-semibold text-night-fg/80 transition-colors hover:text-night-fg"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {gameCopy.backToSite[locale]}
        </Link>
      </header>
      <TrophyRoom
        entries={achievements.map((achievement) => ({
          id: achievement.id,
          name: achievement.name[locale],
          description: achievement.description[locale],
          hint: achievement.hint?.[locale],
          secret: Boolean(achievement.secret),
          xp: achievement.xp,
        }))}
        labels={{
          title: gameCopy.trophyRoom[locale],
          intro: gameCopy.roomIntro[locale],
          hint: gameCopy.roomHint[locale],
          hintTouch: gameCopy.roomHintTouch[locale],
          done: gameCopy.done[locale],
          locked: gameCopy.locked[locale],
          level: gameCopy.level[locale],
          close: gameCopy.close[locale],
        }}
      />
    </div>
  );
}
