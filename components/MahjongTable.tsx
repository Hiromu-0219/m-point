"use client";

import { useMemo, useState } from "react";
import { getRanks } from "@/lib/gameState";
import { useGameState } from "@/hooks/useGameState";
import type { PlayerId } from "@/lib/types";
import PlayerPanel from "./PlayerPanel";
import CenterPanel from "./CenterPanel";
import ScoreTransferModal from "./ScoreTransferModal";
import HistoryModal from "./HistoryModal";
import ConfirmDialog from "./ConfirmDialog";
import PlayerNameModal from "./PlayerNameModal";
import StartScreen from "./StartScreen";

const positions: Record<PlayerId, "top" | "bottom" | "left" | "right"> = { east: "bottom", south: "right", west: "top", north: "left" };

export default function MahjongTable() {
  const { state, declareRiichi, applyWin, renamePlayer, undo, startGame, returnToStart, hydrated } = useGameState();
  const [transferOpen, setTransferOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<PlayerId | null>(null);
  const ranks = useMemo(() => getRanks(state.players), [state.players]);
  if (!hydrated) return <main className="table-shell" />;
  if (!state.hasStarted) return <StartScreen onStart={startGame} />;
  return (
    <main className={`table-shell mode-${state.gameMode}`}>
      {state.players.map((player) => {
        const position = state.gameMode === "sanma" && player.id === "west" ? "left" : positions[player.id];
        return <PlayerPanel key={player.id} player={player} rank={ranks.findIndex((p) => p.id === player.id) + 1}
          position={position} onRiichi={() => declareRiichi(player.id)} onEditName={() => setEditingPlayerId(player.id)} />;
      })}
      <CenterPanel round={state.round} honba={state.honba} kyotaku={state.kyotaku} canUndo={state.history.length > 0}
        onTransfer={() => setTransferOpen(true)} onHistory={() => setHistoryOpen(true)} onUndo={undo} onReset={() => setResetOpen(true)} />
      {transferOpen && <ScoreTransferModal players={state.players} kyotaku={state.kyotaku} gameMode={state.gameMode} onConfirm={applyWin} onClose={() => setTransferOpen(false)} />}
      {historyOpen && <HistoryModal history={state.history} onClose={() => setHistoryOpen(false)} />}
      {editingPlayerId && <PlayerNameModal
        player={state.players.find((player) => player.id === editingPlayerId)!}
        onClose={() => setEditingPlayerId(null)}
        onSave={(name) => { renamePlayer(editingPlayerId, name); setEditingPlayerId(null); }}
      />}
      {resetOpen && <ConfirmDialog title="新しい対局を始めますか？" message="現在の対局を終了し、人数と名前を選ぶスタート画面へ戻ります。"
        confirmLabel="スタート画面へ" onCancel={() => setResetOpen(false)} onConfirm={() => { returnToStart(); setResetOpen(false); }} />}
    </main>
  );
}
