// Começa a baixar a cena da sala de troféus antes do clique (no hover ou foco de um link para ela).
// Fica num arquivo próprio para que quem chama não puxe three.js para o seu pacote.

let started = false;

export function preloadTrophyScene() {
  if (started) return;
  started = true;
  void import("./trophy-scene");
}
