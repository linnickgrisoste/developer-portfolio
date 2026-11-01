"use client";

import { achievements, gameCopy, levelFor } from "@/content/game";
import { useLocale } from "@/components/providers";
import { unlockedCount, useGame, xpOf } from "./store";

export function ProgressBadge() {
  const { t } = useLocale();
  const unlocked = useGame((game) => game.unlocked);
  const { level } = levelFor(xpOf(unlocked));

  return (
    <span className="font-pixel text-[11px] text-reward">
      {t(gameCopy.level)}
      {level} · {unlockedCount(unlocked)}/{achievements.length}
    </span>
  );
}
