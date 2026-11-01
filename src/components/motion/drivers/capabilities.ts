"use client";

import { useSyncExternalStore } from "react";

export type Capabilities = {
  reducedMotion: boolean;
  finePointer: boolean;
  saveData: boolean;
  webgl: boolean;
};

const serverSnapshot: Capabilities = { reducedMotion: false, finePointer: true, saveData: false, webgl: false };

let snapshot = serverSnapshot;
let webglSupport: boolean | null = null;

function detectWebgl() {
  if (webglSupport !== null) return webglSupport;
  try {
    webglSupport = Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

const reducedMotionQuery = () => window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = () => window.matchMedia("(hover: hover) and (pointer: fine)");

function prefersSaveData() {
  return Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
}

function getSnapshot(): Capabilities {
  const next: Capabilities = {
    reducedMotion: reducedMotionQuery().matches,
    finePointer: finePointerQuery().matches,
    saveData: prefersSaveData(),
    webgl: detectWebgl(),
  };
  const unchanged = (Object.keys(next) as (keyof Capabilities)[]).every((key) => next[key] === snapshot[key]);
  if (!unchanged) snapshot = next;
  return snapshot;
}

function subscribe(listener: () => void) {
  const queries = [reducedMotionQuery(), finePointerQuery()];
  queries.forEach((query) => query.addEventListener("change", listener));
  return () => queries.forEach((query) => query.removeEventListener("change", listener));
}

export function useCapabilities() {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}
