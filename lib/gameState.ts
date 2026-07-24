import type { GameMode, GameSnapshot, GameState, MatchRecord, Player, PlayerId, ScoreChange, Wind } from "./types";

export const INITIAL_PLAYERS: Player[] = [
  { id: "east", name: "東家", wind: "東", score: 25000, isDealer: true, isRiichi: false },
  { id: "south", name: "南家", wind: "南", score: 25000, isDealer: false, isRiichi: false },
  { id: "west", name: "西家", wind: "西", score: 25000, isDealer: false, isRiichi: false },
  { id: "north", name: "北家", wind: "北", score: 25000, isDealer: false, isRiichi: false },
];

export const createInitialState = (gameMode: GameMode = "yonma", names?: string[], hasStarted = false): GameState => ({
  players: INITIAL_PLAYERS
    .slice(0, gameMode === "sanma" ? 3 : 4)
    .map((player, index) => ({
      ...player,
      name: names?.[index]?.trim().slice(0, 12) || `プレイヤー${index + 1}`,
      score: gameMode === "sanma" ? 35000 : 25000,
    })),
  kyotaku: 0,
  honba: 0,
  round: "東一局",
  gameMode,
  hasStarted,
  history: [],
  matchHistory: [],
});

export const snapshotOf = (state: GameState): GameSnapshot => ({
  players: state.players.map((player) => ({ ...player })),
  kyotaku: state.kyotaku,
  honba: state.honba,
  round: state.round,
  gameMode: state.gameMode,
  hasStarted: state.hasStarted,
});

export const getRanks = (players: Player[]) =>
  [...players].sort((a, b) => b.score - a.score || INITIAL_PLAYERS.findIndex((p) => p.id === a.id) - INITIAL_PLAYERS.findIndex((p) => p.id === b.id));

const YONMA_ROUNDS = ["東一局", "東二局", "東三局", "東四局", "南一局", "南二局", "南三局", "南四局"] as const;
const SANMA_ROUNDS = ["東一局", "東二局", "東三局", "南一局", "南二局", "南三局"] as const;

export function advanceRound(round: string, gameMode: GameMode = "yonma") {
  const rounds: readonly string[] = gameMode === "sanma" ? SANMA_ROUNDS : YONMA_ROUNDS;
  const index = rounds.indexOf(round);
  if (index < 0) return "東一局";
  return rounds[index + 1] ?? "対局終了";
}

export function rotatePlayerWinds(players: Player[]): Player[] {
  const winds: readonly Wind[] = players.length === 3 ? ["東", "南", "西"] : ["東", "南", "西", "北"];
  return players.map((player) => {
    const windIndex = winds.indexOf(player.wind);
    const wind = winds[(windIndex + winds.length - 1) % winds.length];
    return { ...player, wind, isDealer: wind === "東" };
  });
}

export function normalizeGameState(value: GameState): GameState {
  const gameMode = value.gameMode ?? (value.players?.length === 3 ? "sanma" : "yonma");
  return {
    ...value,
    gameMode,
    hasStarted: value.hasStarted ?? true,
    players: value.players.slice(0, gameMode === "sanma" ? 3 : 4),
    history: value.history ?? [],
    matchHistory: value.matchHistory ?? [],
  };
}

export function createMatchRecord(state: GameState, endedAt = Date.now()): MatchRecord {
  return {
    id: `${endedAt}-${Math.random().toString(36).slice(2)}`,
    gameMode: state.gameMode,
    endedAt,
    finalRound: state.round,
    players: getRanks(state.players).map(({ id, name, wind, score }) => ({ id, name, wind, score })),
    eventCount: state.history.length,
  };
}

export function calculateDrawChanges(players: Player[], tenpaiIds: PlayerId[]): {
  changes: ScoreChange[];
  dealerContinues: boolean;
} {
  const tenpai = new Set(tenpaiIds);
  const tenpaiPlayers = players.filter((player) => tenpai.has(player.id));
  const notenPlayers = players.filter((player) => !tenpai.has(player.id));
  const changes = players.map((player) => ({ playerId: player.id, amount: 0 }));
  if (tenpaiPlayers.length > 0 && notenPlayers.length > 0) {
    const gain = 3000 / tenpaiPlayers.length;
    const loss = 3000 / notenPlayers.length;
    tenpaiPlayers.forEach((player) => { changes.find((change) => change.playerId === player.id)!.amount = gain; });
    notenPlayers.forEach((player) => { changes.find((change) => change.playerId === player.id)!.amount = -loss; });
  }
  const dealer = players.find((player) => player.isDealer);
  return { changes, dealerContinues: !!dealer && tenpai.has(dealer.id) };
}

export function calculateDrawRiichiAdjustments(players: Player[], riichiIds: PlayerId[]): {
  changes: ScoreChange[];
  additionalKyotaku: number;
} {
  const requested = new Set(riichiIds);
  const newlyDeclared = players.filter((player) =>
    requested.has(player.id) && !player.isRiichi && player.score >= 1000);
  return {
    changes: players.map((player) => ({
      playerId: player.id,
      amount: newlyDeclared.some((declared) => declared.id === player.id) ? -1000 : 0,
    })),
    additionalKyotaku: newlyDeclared.length,
  };
}

export function normalizeManualScore(value: number): number | null {
  if (!Number.isFinite(value) || value < 0 || value > 999900) return null;
  return Math.round(value / 100) * 100;
}
