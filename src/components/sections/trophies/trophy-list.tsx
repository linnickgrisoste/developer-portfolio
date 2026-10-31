import { Check, Lock } from "lucide-react";
import type { AchievementId } from "@/content/game";
import { AchievementIcon } from "@/components/game/achievement-icon";
import { cn } from "@/lib/utils";

/** Uma conquista já no idioma da página, como a sala mostra. */
export type TrophyEntry = {
  id: AchievementId;
  name: string;
  description: string;
  hint?: string;
  secret: boolean;
  xp: number;
};

export type TrophyCard = TrophyEntry & { unlocked: boolean; date: string | null };

// A sala em DOM: uma vitrine de cards com os mesmos dados da cena 3D.
export function TrophyList({ cards, labels, className }: { cards: TrophyCard[]; labels: { done: string; locked: string }; className?: string }) {
  return (
    <ol className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {cards.map((card) => {
        const hidden = card.secret && !card.unlocked;
        return (
          <li key={card.id} className="flex gap-4 rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
            <span
              className={cn(
                "grid size-12 shrink-0 place-items-center rounded-md",
                card.unlocked ? "bg-neon-deep text-white" : "bg-white/5 text-night-fg/40",
              )}
            >
              {hidden ? <Lock className="size-5" aria-hidden /> : <AchievementIcon id={card.id} className="size-6" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-3">
                <span className={cn("text-[15px] font-semibold", !card.unlocked && "text-night-fg/60")}>
                  {hidden ? "???" : card.name}
                </span>
                <span className="font-pixel shrink-0 text-[11px] text-reward">+{card.xp} XP</span>
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
      })}
    </ol>
  );
}
