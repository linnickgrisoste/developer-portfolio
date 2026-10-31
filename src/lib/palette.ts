// Espelho em hex das cores de globals.css. Serve ao que não lê variáveis CSS:
// canvas, WebGL, confete e a imagem de prévia. Mudou uma cor lá, mude aqui também.

const light = { paper: "#f2f2ec", ink: "#0d0f12", neon: "#806500", reward: "#0089a8" };
const dark = { paper: "#0d0f12", ink: "#f2f2ec", neon: "#fcee0a", reward: "#00f0ff" };

export const palette = { light, dark };

/** As duas versões do neon (a do tema claro e a do escuro), para efeitos que usam as duas juntas. */
export const rewardPair = [light.reward, dark.reward];
