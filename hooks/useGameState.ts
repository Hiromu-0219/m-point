"use client";

import { useCallback, useEffect, useState } from "react";
import { calculateScore } from "@/lib/scoreCalculator";
import { createInitialState, snapshotOf } from "@/lib/gameState";
import { loadGame, saveGame } from "@/lib/storage";
import type { GameEvent, GameState, PlayerId, WinType } from "@/lib/types";

const eventId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function useGameState() {
  const [state, setState] = useState<GameState>(createInitialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setState(loadGame() ?? createInitialState());
      setHydrated(true);
    });
  }, []);
  useEffect(() => { if (hydrated) saveGame(state); }, [state, hydrated]);

  const declareRiichi = useCallback((playerId: PlayerId) => {
    setState((current) => {
      const player = current.players.find((p) => p.id === playerId);
      if (!player || player.isRiichi || player.score < 1000) return current;
      const snapshot = snapshotOf(current);
      const players = current.players.map((p) => p.id === playerId ? { ...p, score: p.score - 1000, isRiichi: true } : p);
      const event: GameEvent = {
        id: eventId(), type: "riichi", description: `${player.name} リーチ（1,000点を供託）`,
        changes: [{ playerId, amount: -1000 }], kyotakuBefore: current.kyotaku,
        kyotakuAfter: current.kyotaku + 1, createdAt: Date.now(), snapshot,
      };
      return { ...current, players, kyotaku: current.kyotaku + 1, history: [event, ...current.history] };
    });
  }, []);

  const applyWin = useCallback((params: { winType: WinType; winnerId: PlayerId; loserId?: PlayerId; han: number; fu: number }) => {
    setState((current) => {
      const winner = current.players.find((p) => p.id === params.winnerId);
      if (!winner) return current;
      const result = calculateScore({ han: params.han, fu: params.fu, winType: params.winType, isDealer: winner.isDealer });
      const changes = current.players.map((player) => ({ playerId: player.id, amount: 0 }));
      if (result.winType === "ron") {
        const loser = current.players.find((p) => p.id === params.loserId);
        if (!loser || loser.id === winner.id) return current;
        changes.find((c) => c.playerId === loser.id)!.amount -= result.total;
        changes.find((c) => c.playerId === winner.id)!.amount += result.total;
      } else {
        current.players.filter((p) => p.id !== winner.id).forEach((payer) => {
          const payment = winner.isDealer ? result.childPayment : payer.isDealer ? result.dealerPayment! : result.childPayment;
          changes.find((c) => c.playerId === payer.id)!.amount -= payment;
          changes.find((c) => c.playerId === winner.id)!.amount += payment;
        });
      }
      const kyotakuPoints = current.kyotaku * 1000;
      changes.find((c) => c.playerId === winner.id)!.amount += kyotakuPoints;
      const players = current.players.map((player) => ({
        ...player, score: player.score + changes.find((c) => c.playerId === player.id)!.amount, isRiichi: false,
      }));
      const loserName = current.players.find((p) => p.id === params.loserId)?.name;
      const paymentText = params.winType === "ron" ? `${loserName} → ${winner.name} ${result.total.toLocaleString()}点` : `${winner.name} ツモ ${result.total.toLocaleString()}点`;
      const event: GameEvent = {
        id: eventId(), type: params.winType, description: `${winner.name} ${params.han}翻${params.fu}符 ${paymentText}${kyotakuPoints ? ` ＋供託${kyotakuPoints.toLocaleString()}点` : ""}`,
        changes: changes.filter((change) => change.amount !== 0), kyotakuBefore: current.kyotaku,
        kyotakuAfter: 0, createdAt: Date.now(), snapshot: snapshotOf(current),
      };
      return { ...current, players, kyotaku: 0, history: [event, ...current.history] };
    });
  }, []);

  const undo = useCallback(() => setState((current) => {
    const [latest, ...history] = current.history;
    return latest ? { ...latest.snapshot, history } : current;
  }), []);

  const reset = useCallback(() => setState((current) => {
    const initial = createInitialState();
    const event: GameEvent = {
      id: eventId(), type: "reset", description: "対局をリセット", changes: [],
      kyotakuBefore: current.kyotaku, kyotakuAfter: 0, createdAt: Date.now(), snapshot: snapshotOf(current),
    };
    return { ...initial, history: [event, ...current.history] };
  }), []);

  return { state, declareRiichi, applyWin, undo, reset, hydrated };
}
