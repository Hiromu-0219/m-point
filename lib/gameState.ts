import type { GameSnapshot, GameState, Player } from "./types";

export const INITIAL_PLAYERS: Player[] = [
  { id: "east", name: "東家", wind: "東", score: 25000, isDealer: true, isRiichi: false },
  { id: "south", name: "南家", wind: "南", score: 25000, isDealer: false, isRiichi: false },
  { id: "west", name: "西家", wind: "西", score: 25000, isDealer: false, isRiichi: false },
  { id: "north", name: "北家", wind: "北", score: 25000, isDealer: false, isRiichi: false },
];

export const createInitialState = (): GameState => ({
  players: INITIAL_PLAYERS.map((player) => ({ ...player })),
  kyotaku: 0,
  honba: 0,
  round: "東一局",
  history: [],
});

export const snapshotOf = (state: GameState): GameSnapshot => ({
  players: state.players.map((player) => ({ ...player })),
  kyotaku: state.kyotaku,
  honba: state.honba,
  round: state.round,
});

export const getRanks = (players: Player[]) =>
  [...players].sort((a, b) => b.score - a.score || INITIAL_PLAYERS.findIndex((p) => p.id === a.id) - INITIAL_PLAYERS.findIndex((p) => p.id === b.id));
