"use client";

import { useCallback, useEffect, useState } from "react";
import { calculateScore } from "@/lib/scoreCalculator";
import { advanceRound, createInitialState, createMatchRecord, normalizeGameState, rotatePlayerWinds, snapshotOf } from "@/lib/gameState";
import { loadGame, saveGame } from "@/lib/storage";
import type { GameEvent, GameMode, GameState, PlayerId, WinType } from "@/lib/types";

const eventId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function useGameState() {
  const [state, setState] = useState<GameState>(createInitialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const saved = loadGame();
      setState(saved ? normalizeGameState(saved) : createInitialState());
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
      const winPoints = changes.find((c) => c.playerId === winner.id)!.amount;
      const kyotakuPoints = current.kyotaku * 1000;
      changes.find((c) => c.playerId === winner.id)!.amount += kyotakuPoints;
      let players = current.players.map((player) => ({
        ...player, score: player.score + changes.find((c) => c.playerId === player.id)!.amount, isRiichi: false,
      }));
      const dealerContinues = winner.isDealer;
      if (!dealerContinues) players = rotatePlayerWinds(players);
      const nextRound = dealerContinues ? current.round : advanceRound(current.round, current.gameMode);
      const nextHonba = dealerContinues ? current.honba + 1 : 0;
      const loserName = current.players.find((p) => p.id === params.loserId)?.name;
      const paymentText = params.winType === "ron" ? `${loserName} → ${winner.name} ${result.total.toLocaleString()}点` : `${winner.name} ツモ ${winPoints.toLocaleString()}点`;
      const progressText = dealerContinues ? `／親連荘・${nextHonba}本場` : `／${nextRound}へ`;
      const event: GameEvent = {
        id: eventId(), type: params.winType, description: `${winner.name} ${params.han}翻${params.fu}符 ${paymentText}${kyotakuPoints ? ` ＋供託${kyotakuPoints.toLocaleString()}点` : ""}${progressText}`,
        changes: changes.filter((change) => change.amount !== 0), kyotakuBefore: current.kyotaku,
        kyotakuAfter: 0, createdAt: Date.now(), snapshot: snapshotOf(current),
      };
      return { ...current, players, kyotaku: 0, honba: nextHonba, round: nextRound, history: [event, ...current.history] };
    });
  }, []);

  const renamePlayer = useCallback((playerId: PlayerId, name: string) => {
    const nextName = name.trim().slice(0, 12);
    if (!nextName) return;
    setState((current) => {
      const player = current.players.find((item) => item.id === playerId);
      if (!player || player.name === nextName) return current;
      const snapshot = snapshotOf(current);
      const event: GameEvent = {
        id: eventId(),
        type: "manual",
        description: `${player.name} の名前を「${nextName}」に変更`,
        changes: [],
        kyotakuBefore: current.kyotaku,
        kyotakuAfter: current.kyotaku,
        createdAt: Date.now(),
        snapshot,
      };
      return {
        ...current,
        players: current.players.map((item) => item.id === playerId ? { ...item, name: nextName } : item),
        history: [event, ...current.history],
      };
    });
  }, []);

  const undo = useCallback(() => setState((current) => {
    const [latest, ...history] = current.history;
    return latest ? normalizeGameState({ ...latest.snapshot, history, matchHistory: current.matchHistory }) : current;
  }), []);

  const startGame = useCallback((gameMode: GameMode, names: string[]) => {
    setState((current) => ({
      ...createInitialState(gameMode, names, true),
      matchHistory: current.matchHistory,
    }));
  }, []);

  const returnToStart = useCallback(() => {
    setState((current) => current.hasStarted ? {
      ...current,
      hasStarted: false,
      matchHistory: [createMatchRecord(current), ...current.matchHistory].slice(0, 100),
    } : current);
  }, []);

  return { state, declareRiichi, applyWin, renamePlayer, undo, startGame, returnToStart, hydrated };
}
