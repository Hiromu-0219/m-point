import type { GameState } from "./types";

const STORAGE_KEY = "m-point-game-v1";

export function loadGame(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as GameState) : null;
  } catch { return null; }
}

export function saveGame(state: GameState) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* private mode */ }
}
