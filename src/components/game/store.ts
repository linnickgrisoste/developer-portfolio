"use client";

import { useSyncExternalStore } from "react";
import { achievements, type AchievementId } from "@/content/game";
import { rewardPair, palette } from "@/lib/palette";

// Estado do modo explorador, salvo no localStorage e compartilhado por toda a página.

const STORAGE_KEY = "explorer-mode";

export type ToastItem = { key: number; kind: "achievement"; id: AchievementId } | { key: number; kind: "complete" };

type GameState = {
  unlocked: Partial<Record<AchievementId, number>>;
  seenProjects: string[];
  seenClasses: string[];
  toastsEnabled: boolean;
  queue: ToastItem[];
};

const initialState: GameState = {
  unlocked: {},
  seenProjects: [],
  seenClasses: [],
  toastsEnabled: true,
  queue: [],
};

let state = initialState;
let loaded = false;
let toastKey = 0;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (saved) state = { ...initialState, ...saved, queue: [] };
  } catch {}
}

function setState(next: GameState) {
  state = next;
  try {
    const persisted: Partial<GameState> = { ...next };
    delete persisted.queue;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {}
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  load();
  return state;
}

/**
 * Lê uma parte do estado. O componente só re-renderiza quando essa parte muda,
 * então o seletor deve devolver um valor do próprio estado ou um primitivo
 * (ex.: `useGame((game) => game.queue)`), nunca um objeto novo a cada chamada.
 */
export function useGame<T>(select: (game: GameState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(getSnapshot()),
    () => select(initialState),
  );
}

// O confete só existe ao completar 100% das conquistas, então a biblioteca baixa só nessa hora.
async function celebrate() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const { default: confetti } = await import("canvas-confetti");
  const colors = [...rewardPair, palette.light.ink, palette.light.paper];
  confetti({ particleCount: 90, spread: 70, startVelocity: 45, origin: { x: 0.2, y: 0.9 }, colors });
  confetti({ particleCount: 90, spread: 70, startVelocity: 45, origin: { x: 0.8, y: 0.9 }, colors });
}

export function unlock(id: AchievementId) {
  load();
  if (state.unlocked[id]) return;
  const unlocked = { ...state.unlocked, [id]: Date.now() };
  const queue: ToastItem[] = [...state.queue, { key: ++toastKey, kind: "achievement", id }];
  const complete = achievements.every((achievement) => unlocked[achievement.id]);
  if (complete) queue.push({ key: ++toastKey, kind: "complete" });
  setState({ ...state, unlocked, queue: state.toastsEnabled ? queue : state.queue });
  if (complete) void celebrate();
}

export function markProjectSeen(title: string, total: number) {
  load();
  if (state.seenProjects.includes(title)) return;
  const seenProjects = [...state.seenProjects, title];
  setState({ ...state, seenProjects });
  if (seenProjects.length >= total) unlock("curator");
}

export function markClassSeen(name: string, total: number) {
  load();
  if (state.seenClasses.includes(name)) return;
  const seenClasses = [...state.seenClasses, name];
  setState({ ...state, seenClasses });
  if (seenClasses.length >= total) unlock("character-sheet");
}

export function dismissToast(key: number) {
  setState({ ...state, queue: state.queue.filter((toast) => toast.key !== key) });
}

export function setToastsEnabled(toastsEnabled: boolean) {
  setState({ ...state, toastsEnabled, queue: toastsEnabled ? state.queue : [] });
}

export function resetGame() {
  setState({ ...initialState, toastsEnabled: state.toastsEnabled });
}

export function xpOf(unlocked: GameState["unlocked"]) {
  return achievements.reduce((sum, achievement) => sum + (unlocked[achievement.id] ? achievement.xp : 0), 0);
}
