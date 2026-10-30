"use client";

import { useSyncExternalStore } from "react";

// O que o aparelho e a pessoa permitem, lido de um lugar só. As primitivas decidem por aqui
// se animam, como engajam (mouse ou faixa central) e se o 3D pode entrar.

export type Capabilities = {
  /** Pediu movimento reduzido no sistema. */
  reducedMotion: boolean;
  /** Tem mouse ou caneta (hover de verdade). Sem isso, engajar é passar pela faixa central. */
  finePointer: boolean;
  /** Pediu economia de dados. */
  saveData: boolean;
  /** WebGL 2 disponível. */
  webgl: boolean;
};

// No servidor (e na hidratação) assume o caso mais comum, sem 3D: o cliente corrige em seguida.
const serverSnapshot: Capabilities = { reducedMotion: false, finePointer: true, saveData: false, webgl: false };

let snapshot = serverSnapshot;
let webgl: boolean | null = null;

function detectWebgl() {
  if (webgl === null) {
    try {
      webgl = Boolean(document.createElement("canvas").getContext("webgl2"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

const reducedQuery = () => window.matchMedia("(prefers-reduced-motion: reduce)");
const fineQuery = () => window.matchMedia("(hover: hover) and (pointer: fine)");

function getSnapshot(): Capabilities {
  const next: Capabilities = {
    reducedMotion: reducedQuery().matches,
    finePointer: fineQuery().matches,
    saveData: Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData),
    webgl: detectWebgl(),
  };
  // Mesmo valor, mesmo objeto: o React só re-renderiza quando algo muda de fato.
  const same = (Object.keys(next) as (keyof Capabilities)[]).every((key) => next[key] === snapshot[key]);
  if (!same) snapshot = next;
  return snapshot;
}

function subscribe(listener: () => void) {
  const queries = [reducedQuery(), fineQuery()];
  queries.forEach((query) => query.addEventListener("change", listener));
  return () => queries.forEach((query) => query.removeEventListener("change", listener));
}

export function useCapabilities() {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}
