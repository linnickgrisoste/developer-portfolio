let started = false;

export function preloadTrophyScene() {
  if (started) return;
  started = true;
  void import("./trophy-scene");
}
