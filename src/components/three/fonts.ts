// A Archivo convertida para o 3D (ver public/three). O three.js não lê woff2 nem as fontes do next/font.

/** Peso 800 em typeface.json: as letras extrudadas do hero. */
export const FONT_EXTRUDED = "/three/archivo-800.typeface.json";

/** Peso 600 em TTF: texto plano dentro da cena (as plaquinhas da sala de troféus). */
export const FONT_LABEL = "/three/archivo-600.ttf";

/**
 * Na conversão, 1 em ocupa 1000 × 100 / 72 unidades sobre uma resolução de 1000: o `size` de um
 * TextGeometry vale 72/100 de em. Para letras com N px de corpo, use `size = N / EM_PER_SIZE`.
 */
export const EM_PER_SIZE = 100 / 72;
