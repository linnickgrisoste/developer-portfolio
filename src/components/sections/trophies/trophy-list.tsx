import { Check, Lock } from "lucide-react";
import { AchievementIcon } from "@/components/game/achievement-icon";
import { styleVars, trophyStyles } from "@/lib/trophy-styles";
import type { TrophyId } from "@/content/game";
import { cn } from "@/lib/utils";

export type TrophyEntry = {
  id: TrophyId;
  name: string;
  description: string;
  hint?: string;
  secret: boolean;
  // A coroa não vale XP: ela é o prêmio de já ter todos.
  xp?: number;
  placement: "shelf" | "center";
};

export type TrophyCard = TrophyEntry & { unlocked: boolean; date: string | null };

type TrophyListLabels = { done: string; locked: string };

// Vitrine em DOM, com os mesmos dados e cores de cada peça da cena 3D.
export function TrophyList({ cards, labels, className }: { cards: TrophyCard[]; labels: TrophyListLabels; className?: string }) {
  return (
    <ol className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {cards.map((card) => (
        <TrophyListItem key={card.id} card={card} labels={labels} />
      ))}
    </ol>
  );
}

function TrophyListItem({ card, labels }: { card: TrophyCard; labels: TrophyListLabels }) {
  const hidden = card.secret && !card.unlocked;

  return (
    <li
      style={styleVars(trophyStyles[card.id])}
      className={cn(
        "flex gap-4 rounded-xl p-4 ring-1",
        card.unlocked
          ? "bg-[linear-gradient(160deg,color-mix(in_oklab,var(--a-glow)_14%,transparent),transparent_60%)] ring-white/15"
          : "bg-white/5 ring-white/10",
      )}
    >
      <span
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-xl",
          card.unlocked ? "medal text-night" : "bg-white/5 text-night-fg/40",
        )}
      >
        {hidden ? <Lock className="size-5" aria-hidden /> : <AchievementIcon id={card.id} className="size-6" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className={cn("text-[15px] font-semibold", !card.unlocked && "text-night-fg/60")}>
            {hidden ? "???" : card.name}
          </span>
          {card.xp ? <span className="font-pixel shrink-0 text-[11px] text-reward">+{card.xp} XP</span> : null}
        </span>
        <span className="mt-1 block text-[13px] leading-snug text-night-fg/60">
          {hidden && card.hint ? card.hint : card.description}
        </span>
        <span className="mt-2 flex items-center gap-1.5 text-[12px] text-night-fg/65">
          {card.unlocked ? <Check className="size-3.5 shrink-0 text-reward" aria-hidden /> : null}
          {card.unlocked ? labels.done : labels.locked}
          {card.date && ` · ${card.date}`}
        </span>
      </span>
    </li>
  );
}
