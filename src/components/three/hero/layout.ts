export type HeroLayout = {
  width: number;
  height: number;
  fontSize: number;
  letters: { char: string; x: number; baseline: number }[];
  dot: { x: number; y: number; size: number } | null;
};
