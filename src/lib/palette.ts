// Espelho em hex das cores de globals.css. Serve ao que não lê variáveis CSS:
// canvas, WebGL, confete e a imagem de prévia. Mudou uma cor lá, mude aqui também.

const light = { paper: "#eceef1", ink: "#0d1321", cobalt: "#2440e6" };
const dark = { paper: "#0a0f1c", ink: "#e6e9ef", cobalt: "#8495ff" };

export const palette = { light, dark };

/** As duas versões do cobalto (a do tema claro e a do escuro), para efeitos que usam as duas juntas. */
export const cobaltPair = [light.cobalt, dark.cobalt];
