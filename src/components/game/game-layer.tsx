"use client";

import ClickSpark from "@/components/vendor/bits/ClickSpark";
import { rewardPair } from "@/lib/palette";
import { AchievementToasts } from "./toasts";

// Envolve a página com as faíscas de clique e os avisos de conquista.
export function GameLayer({ children }: { children: React.ReactNode }) {
  return (
    <ClickSpark sparkColor={rewardPair} sparkCount={9} sparkRadius={22} sparkSize={10} duration={450} shape="line">
      {children}
      <AchievementToasts />
    </ClickSpark>
  );
}
