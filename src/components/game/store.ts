"use client";

import { useSyncExternalStore } from "react";
import { achievements, type AchievementId, type TrophyId } from "@/content/game";
import { fireConfetti } from "./confetti";
import { STORAGE_KEY } from "./storage";

export type ToastItem = { key: number; kind: "achievement"; id: AchievementId } | { key: number; kind: "complete" };

type GameState = {
  unlocked: Partial<Record<AchievementId, number>>;
  seenProjects: string[];
  seenClasses: string[];
  toastsEnabled: boolean;
  /** Prêmio de quem zera: o neon vira ouro. */
  goldMode: boolean;
  crownCelebrated: boolean;
  queue: ToastItem[];
};

type Unlocked = GameState["unlocked"];

const initialState: GameState = {
  unlocked: {},
  seenProjects: [],
  seenClasses: [],
  toastsEnabled: true,
  goldMode: false,
  crownCelebrated: false,
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

/** O seletor deve devolver parte do estado ou um primitivo; um objeto novo re-renderiza sempre. */
export function useGame<T>(select: (game: GameState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(getSnapshot()),
    () => select(initialState),
  );
}

export function unlock(id: AchievementId) {
  load();
  if (state.unlocked[id]) return;
  const unlocked = { ...state.unlocked, [id]: Date.now() };
  const queue: ToastItem[] = [...state.queue, { key: ++toastKey, kind: "achievement", id }];
  const complete = isComplete(unlocked);
  if (complete) queue.push({ key: ++toastKey, kind: "complete" });
  setState({
    ...state,
    unlocked,
    goldMode: state.goldMode || complete,
    queue: state.toastsEnabled ? queue : state.queue,
  });
  if (complete) void fireConfetti();
}

function markSeen(list: "seenProjects" | "seenClasses", item: string, total: number, reward: AchievementId) {
  load();
  if (state[list].includes(item)) return;
  const seen = [...state[list], item];
  setState({ ...state, [list]: seen });
  if (seen.length >= total) unlock(reward);
}

export function markProjectSeen(title: string, total: number) {
  markSeen("seenProjects", title, total, "curator");
}

export function markClassSeen(name: string, total: number) {
  markSeen("seenClasses", name, total, "character-sheet");
}

export function dismissToast(key: number) {
  setState({ ...state, queue: state.queue.filter((toast) => toast.key !== key) });
}

export function setToastsEnabled(toastsEnabled: boolean) {
  setState({ ...state, toastsEnabled, queue: toastsEnabled ? state.queue : [] });
}

export function setGoldMode(goldMode: boolean) {
  load();
  setState({ ...state, goldMode });
}

export function markCrownCelebrated() {
  load();
  if (!state.crownCelebrated) setState({ ...state, crownCelebrated: true });
}

export function resetGame() {
  setState({ ...initialState, toastsEnabled: state.toastsEnabled });
}

export function isComplete(unlocked: Unlocked) {
  return achievements.every((achievement) => unlocked[achievement.id]);
}

export function unlockedCount(unlocked: Unlocked) {
  return achievements.filter((achievement) => unlocked[achievement.id]).length;
}

/** A coroa conta como conquistada quando o portfólio está zerado. */
export function isTrophyUnlocked(id: TrophyId, unlocked: Unlocked) {
  return id === "crown" ? isComplete(unlocked) : Boolean(unlocked[id]);
}

export function xpOf(unlocked: Unlocked) {
  return achievements.reduce((sum, achievement) => sum + (unlocked[achievement.id] ? achievement.xp : 0), 0);
}
