/** O nome do hero medido na página, em px relativos à seção: as letras 3D se encaixam onde estavam as do CSS. */
export type HeroLayout = {
  width: number;
  height: number;
  fontSize: number;
  /** Cada letra: o caractere, o início do avanço (x) e a linha de base (y). */
  letters: { char: string; x: number; baseline: number }[];
  /** O ponto final: canto superior esquerdo e diâmetro. */
  dot: { x: number; y: number; size: number } | null;
};
