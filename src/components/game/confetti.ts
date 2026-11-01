import { palette, rewardPair } from "@/lib/palette";

const BURST = { particleCount: 90, spread: 70, startVelocity: 45 };
const ORIGINS_X = [0.2, 0.8];

/** Confete dos dois lados da tela. A biblioteca só é baixada nessa hora. */
export async function fireConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const { default: confetti } = await import("canvas-confetti");
  const colors = [...rewardPair, palette.light.ink, palette.light.paper];
  for (const x of ORIGINS_X) confetti({ ...BURST, origin: { x, y: 0.9 }, colors });
}
