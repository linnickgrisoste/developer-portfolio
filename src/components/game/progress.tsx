"use client";

import { achievements, gameCopy, levelFor } from "@/content/game";
import { useLocale } from "@/components/providers";
import { useGame, xpOf } from "./store";

// Nível e conquistas em uma linha, em fonte pixelada. Usado no rodapé.
export function ProgressBadge() {
  const { t } = useLocale();
  const unlocked = useGame((game) => game.unlocked);
  const count = achievements.filter((achievement) => unlocked[achievement.id]).length;
  const { level } = levelFor(xpOf(unlocked));

  return (
    <span className="font-pixel text-[11px] text-cobalt">
      {t(gameCopy.level)}
      {level} · {count}/{achievements.length}
    </span>
  );
}
