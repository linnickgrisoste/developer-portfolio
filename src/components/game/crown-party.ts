"use client";

import { useCallback, useState } from "react";
import { fireConfetti } from "./confetti";
import { isComplete, markCrownCelebrated, useGame } from "./store";

export function useCrownParty(reducedMotion: boolean) {
  const complete = useGame((game) => isComplete(game.unlocked));
  const celebrated = useGame((game) => game.crownCelebrated);
  const [active, setActive] = useState(false);

  const start = useCallback(() => {
    if (!complete || celebrated || reducedMotion) return;
    setActive(true);
    markCrownCelebrated();
  }, [complete, celebrated, reducedMotion]);

  const landed = useCallback(() => void fireConfetti(), []);

  return { active, start, landed };
}
