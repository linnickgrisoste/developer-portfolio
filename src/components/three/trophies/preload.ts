// Baixa a cena da sala antes do clique (hover ou foco de um link). Arquivo próprio para não puxar three.js junto.

let started = false;

export function preloadTrophyScene() {
  if (started) return;
  started = true;
  void import("./trophy-scene");
}
