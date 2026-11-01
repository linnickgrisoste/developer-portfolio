"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { styleVars, trophyStyles } from "@/lib/trophy-styles";
import { useCrownParty } from "@/components/game/crown-party";
import { isTrophyUnlocked, unlockedCount, useGame, xpOf } from "@/components/game/store";
import { containerClass } from "@/components/layout/section";
import { useCapabilities } from "@/components/motion/drivers/capabilities";
import { useLocale } from "@/components/providers";
import { useStageAllowed } from "@/components/three/gate";
import { achievements, levelFor, totalXp, type TrophyId } from "@/content/game";
import { htmlLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { TrophyList, type TrophyCard, type TrophyEntry } from "./trophy-list";

// Limite para falha (GPU fraca, rede muito lenta), não para carga lenta: em dev a primeira compilação do 3D já passa de 5 s.
const FALLBACK_AFTER_MS = 12000;
const subscribeNever = () => () => {};

// Baixada só aqui ou antes, no hover de um link para a sala (three/trophies/preload.ts).
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

const visibleName = (card: TrophyCard) => (card.unlocked || !card.secret ? card.name : "???");

// Cena 3D em aparelho capaz, vitrine em DOM nos demais (ver .trophy-fallback em globals.css).
export function TrophyRoom({ entries, labels }: { entries: TrophyEntry[]; labels: TrophyRoomLabels }) {
  const { locale } = useLocale();
  const unlocked = useGame((game) => game.unlocked);
  const allowed = useStageAllowed();
  const { finePointer, reducedMotion } = useCapabilities();
  const crownParty = useCrownParty(reducedMotion);
  const [focused, setFocused] = useState<TrophyId | null>(null);
  const [hovered, setHovered] = useState<TrophyId | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [failed, setFailed] = useState(false);
  // No servidor e na hidratação não se sabe o que o aparelho suporta.
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false);

  // Se a vitrine assumiu, fica até o fim da visita (a abertura não toca duas vezes).
  const stage = failed || (hydrated && !allowed) ? "list" : sceneReady ? "3d" : "pending";

  const { start: startCrownParty } = crownParty;
  const onReady = useCallback(() => {
    setSceneReady(true);
    startCrownParty();
  }, [startCrownParty]);
  const dismiss = useCallback(() => setFocused(null), []);

  useEffect(() => {
    if (!allowed || sceneReady) return;
    const timer = window.setTimeout(() => setFailed(true), FALLBACK_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [allowed, sceneReady]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setFocused(null);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const cards = useMemo<TrophyCard[]>(() => {
    const format = new Intl.DateTimeFormat(htmlLang[locale], { dateStyle: "medium" });
    return entries.map((entry) => {
      const at = entry.id === "crown" ? undefined : unlocked[entry.id];
      return { ...entry, unlocked: isTrophyUnlocked(entry.id, unlocked), date: at ? format.format(at) : null };
    });
  }, [entries, unlocked, locale]);

  const items = useMemo(
    () =>
      cards.map((card) => ({
        id: card.id,
        label: visibleName(card),
        unlocked: card.unlocked,
        placement: card.placement,
      })),
    [cards],
  );

  const xp = xpOf(unlocked);
  const { level } = levelFor(xp);
  const focusedCard = stage === "3d" ? cards.find((card) => card.id === focused) : undefined;

  return (
    <main className="flex flex-1 flex-col">
      <div className={cn(containerClass, "flex w-full flex-wrap items-end justify-between gap-x-8 gap-y-3 pt-4 pb-6")}>
        <div>
          <h1 className="text-[clamp(1.75rem,3.5vw,2.75rem)] leading-none font-bold tracking-[-0.02em] [font-variation-settings:'wdth'_112]">
            {labels.title}
          </h1>
          <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-night-fg/65">{labels.intro}</p>
        </div>
        <p className="font-pixel text-[12px] text-reward">
          {labels.level}
          {level} · {xp}/{totalXp} XP · {unlockedCount(unlocked)}/{achievements.length}
        </p>
      </div>

      <div className="trophy-stage relative">
        <div
          data-show={stage === "list" ? "" : undefined}
          className={cn(containerClass, "trophy-fallback w-full pb-16 transition-opacity duration-500")}
        >
          <TrophyList cards={cards} labels={{ done: labels.done, locked: labels.locked }} />
        </div>

        {allowed && stage !== "list" && (
          <div
            aria-hidden
            className={cn("absolute inset-0 transition-opacity duration-700", stage === "3d" ? "opacity-100" : "opacity-0")}
            style={{ cursor: hovered ? "pointer" : undefined }}
          >
            <TrophyScene
              items={items}
              focused={focused}
              hovered={hovered}
              crownParty={crownParty.active}
              reduceMotion={reducedMotion}
              onHover={setHovered}
              onSelect={(id) => setFocused((current) => (current === id ? null : id))}
              onDismiss={dismiss}
              onReady={onReady}
              onCrownLanded={crownParty.landed}
            />
          </div>
        )}

        {focusedCard && <FocusedTrophy card={focusedCard} labels={labels} onClose={dismiss} />}
      </div>

      {stage === "3d" && (
        <p className={cn(containerClass, "w-full pt-2 pb-6 text-center text-[13px] text-night-fg/65")}>
          {finePointer ? labels.hint : labels.hintTouch}
        </p>
      )}
    </main>
  );
}

function FocusedTrophy({ card, labels, onClose }: { card: TrophyCard; labels: TrophyRoomLabels; onClose: () => void }) {
  return (
    <div
      style={styleVars(trophyStyles[card.id])}
      className="absolute right-4 bottom-4 left-4 overflow-hidden rounded-xl bg-night/90 p-5 ring-1 ring-white/10 backdrop-blur sm:left-auto sm:w-[22rem] lg:right-12"
    >
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-[3px]", card.unlocked ? "trophy-bar" : "bg-white/10")} />
      <button
        type="button"
        onClick={onClose}
        aria-label={labels.close}
        className="absolute top-3 right-3 grid size-8 place-items-center rounded-full text-night-fg/60 hover:bg-white/10 hover:text-night-fg"
      >
        <X className="size-4" aria-hidden />
      </button>
      <p className="text-[13px] text-night-fg/60">
        {card.unlocked ? labels.done : labels.locked}
        {card.date && ` · ${card.date}`}
      </p>
      <p className={cn("mt-1 text-xl font-semibold tracking-[-0.01em]", card.unlocked && "text-(--a-glow)")}>
        {visibleName(card)}
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-night-fg/70">
        {!card.unlocked && card.hint ? card.hint : card.description}
      </p>
      {card.xp ? <p className="font-pixel mt-4 text-[12px] text-reward">+{card.xp} XP</p> : null}
    </div>
  );
}
