"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { useGame, xpOf } from "@/components/game/store";
import { useCapabilities } from "@/components/motion/drivers/capabilities";
import { useLocale } from "@/components/providers";
import { containerClass } from "@/components/layout/section";
import { useStageAllowed } from "@/components/three/gate";
import { levelFor, totalXp, type AchievementId } from "@/content/game";
import { htmlLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { TrophyList, type TrophyCard, type TrophyEntry } from "./trophy-list";

// A cena 3D só é baixada aqui (ou antes, no hover de um link para a sala: ver three/trophies/preload.ts).
const TrophyScene = dynamic(() => import("@/components/three/trophies/trophy-scene"), { ssr: false });

export type TrophyRoomLabels = {
  title: string;
  intro: string;
  hint: string;
  hintTouch: string;
  done: string;
  locked: string;
  level: string;
  close: string;
};

// A sala de troféus: lê o progresso salvo e mostra cada conquista como troféu. Em aparelho capaz,
// a cena 3D assume o lugar da lista quando fica pronta; a lista continua no DOM para leitores de tela.
// Sem WebGL, ou com movimento reduzido, a lista é a sala.
export function TrophyRoom({ entries, labels }: { entries: TrophyEntry[]; labels: TrophyRoomLabels }) {
  const { locale } = useLocale();
  const unlocked = useGame((game) => game.unlocked);
  const allowed = useStageAllowed();
  const { finePointer, reducedMotion } = useCapabilities();
  const [focused, setFocused] = useState<AchievementId | null>(null);
  const [hovered, setHovered] = useState<AchievementId | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const onReady = useCallback(() => setSceneReady(true), []);
  const dismiss = useCallback(() => setFocused(null), []);
  const in3d = allowed && sceneReady;

  const cards = useMemo<TrophyCard[]>(() => {
    const format = new Intl.DateTimeFormat(htmlLang[locale], { dateStyle: "medium" });
    return entries.map((entry) => {
      const at = unlocked[entry.id];
      return { ...entry, unlocked: at !== undefined, date: at ? format.format(at) : null };
    });
  }, [entries, unlocked, locale]);

  const items = useMemo(
    () =>
      cards.map((card) => ({
        id: card.id,
        label: card.unlocked || !card.secret ? card.name : "???",
        unlocked: card.unlocked,
      })),
    [cards],
  );

  const count = cards.filter((card) => card.unlocked).length;
  const xp = xpOf(unlocked);
  const { level } = levelFor(xp);
  const focusedCard = cards.find((card) => card.id === focused);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setFocused(null);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  return (
    <main className="flex flex-1 flex-col">
      <div className={cn(containerClass, "flex w-full flex-wrap items-end justify-between gap-x-8 gap-y-3 pt-4 pb-6")}>
        <div>
          <h1 className="text-[clamp(1.75rem,3.5vw,2.75rem)] leading-none font-bold tracking-[-0.02em] [font-variation-settings:'wdth'_112]">
            {labels.title}
          </h1>
          <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-night-fg/65">{labels.intro}</p>
        </div>
        <p className="font-pixel text-[12px] text-cobalt">
          {labels.level}
          {level} · {xp}/{totalXp} XP · {count}/{cards.length}
        </p>
      </div>

      <div className={cn("relative", allowed && "min-h-[28rem] flex-1")}>
        {/* A lista é a sala sem 3D e o que aparece enquanto a cena carrega. Com a cena pronta, sai da vista
            (mas não da árvore de acessibilidade: é o que leitores de tela leem). */}
        <div
          className={cn(
            containerClass,
            "w-full transition-opacity duration-500",
            in3d ? "pointer-events-none absolute inset-0 overflow-hidden opacity-0" : "pb-16",
          )}
        >
          <TrophyList cards={cards} labels={{ done: labels.done, locked: labels.locked }} />
        </div>

        {allowed && (
          <div aria-hidden className={cn("absolute inset-0 transition-opacity duration-700", in3d ? "opacity-100" : "opacity-0")}>
            <TrophyScene
              items={items}
              focused={focused}
              hovered={hovered}
              reduceMotion={reducedMotion}
              onHover={setHovered}
              onSelect={(id) => setFocused((current) => (current === id ? null : id))}
              onDismiss={dismiss}
              onReady={onReady}
            />
          </div>
        )}

        {/* Ficha do troféu em foco. */}
        {in3d && focusedCard && (
          <div className="absolute right-4 bottom-4 left-4 rounded-lg bg-night/90 p-5 ring-1 ring-white/10 backdrop-blur sm:left-auto sm:w-[22rem] lg:right-12">
            <button
              type="button"
              onClick={dismiss}
              aria-label={labels.close}
              className="absolute top-3 right-3 grid size-8 place-items-center rounded-full text-night-fg/60 hover:bg-white/10 hover:text-night-fg"
            >
              <X className="size-4" aria-hidden />
            </button>
            <p className="text-[13px] text-night-fg/60">
              {focusedCard.unlocked ? labels.done : labels.locked}
              {focusedCard.date && ` · ${focusedCard.date}`}
            </p>
            <p className="mt-1 text-xl font-semibold tracking-[-0.01em]">
              {focusedCard.unlocked || !focusedCard.secret ? focusedCard.name : "???"}
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-night-fg/70">
              {!focusedCard.unlocked && focusedCard.hint ? focusedCard.hint : focusedCard.description}
            </p>
            <p className="font-pixel mt-4 text-[12px] text-cobalt">+{focusedCard.xp} XP</p>
          </div>
        )}
      </div>

      {in3d && (
        <p className={cn(containerClass, "w-full pt-2 pb-6 text-center text-[13px] text-night-fg/65")}>
          {finePointer ? labels.hint : labels.hintTouch}
        </p>
      )}
    </main>
  );
}
