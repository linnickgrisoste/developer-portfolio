/**
 * O nome do hero medido na página, em px relativos à seção (o canvas cobre a seção inteira).
 * As letras 3D se encaixam exatamente onde as letras em CSS estavam: em repouso, é o mesmo desenho.
 */
export type HeroLayout = {
  width: number;
  height: number;
  /** Corpo do nome (px). */
  fontSize: number;
  /** Cada letra: o caractere, o início do avanço (x) e a linha de base (y). */
  letters: { char: string; x: number; baseline: number }[];
  /** O ponto final: canto superior esquerdo e diâmetro. */
  dot: { x: number; y: number; size: number } | null;
};
