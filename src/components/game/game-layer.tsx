"use client";

import { useEffect } from "react";
import ClickSpark from "@/components/vendor/bits/ClickSpark";
import { GOLD_ATTRIBUTE, rewardPair } from "@/lib/palette";
import { useGame } from "./store";
import { AchievementToasts } from "./toasts";

function useGoldAttribute() {
  const goldMode = useGame((game) => game.goldMode);
  useEffect(() => {
    document.documentElement.toggleAttribute(GOLD_ATTRIBUTE, goldMode);
  }, [goldMode]);
}

export function GameLayer({ children }: { children: React.ReactNode }) {
  useGoldAttribute();

  return (
    <ClickSpark sparkColor={rewardPair} sparkCount={9} sparkRadius={22} sparkSize={10} duration={450} shape="line">
      {children}
      <AchievementToasts />
    </ClickSpark>
  );
}
