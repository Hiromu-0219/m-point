export type PlayerId = "east" | "south" | "west" | "north";
export type Wind = "東" | "南" | "西" | "北";
export type WinType = "ron" | "tsumo";
export type GameMode = "yonma" | "sanma";

export type Player = {
  id: PlayerId;
  name: string;
  wind: Wind;
  score: number;
  isDealer: boolean;
  isRiichi: boolean;
};

export type ScoreChange = { playerId: PlayerId; amount: number };

export type GameSnapshot = {
  players: Player[];
  kyotaku: number;
  honba: number;
  round: string;
  gameMode: GameMode;
  hasStarted: boolean;
};

export type GameEvent = {
  id: string;
  type: "ron" | "tsumo" | "riichi" | "manual" | "reset";
  description: string;
  changes: ScoreChange[];
  kyotakuBefore: number;
  kyotakuAfter: number;
  createdAt: number;
  snapshot: GameSnapshot;
};

export type MatchRecord = {
  id: string;
  gameMode: GameMode;
  endedAt: number;
  finalRound: string;
  players: Array<Pick<Player, "id" | "name" | "wind" | "score">>;
  eventCount: number;
};

export type GameState = GameSnapshot & {
  history: GameEvent[];
  matchHistory: MatchRecord[];
};
