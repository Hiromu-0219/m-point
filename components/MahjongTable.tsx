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
import DrawModal from "./DrawModal";

const positions: Record<PlayerId, "top" | "bottom" | "left" | "right"> = { east: "bottom", south: "right", west: "top", north: "left" };

export default function MahjongTable() {
  const { state, declareRiichi, applyWin, applyDraw, editPlayer, undo, startGame, returnToStart, hydrated } = useGameState();
  const [transferOpen, setTransferOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [drawOpen, setDrawOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"table" | "list">("table");
  const [editingPlayerId, setEditingPlayerId] = useState<PlayerId | null>(null);
  const ranks = useMemo(() => getRanks(state.players), [state.players]);
  if (!hydrated) return <main className="table-shell" />;
  if (!state.hasStarted) return <StartScreen onStart={startGame} matchHistory={state.matchHistory} />;
  return (
    <main className={`table-shell mode-${state.gameMode} layout-${layoutMode}`}>
      {state.players.map((player) => {
        const position = state.gameMode === "sanma" && player.id === "west" ? "left" : positions[player.id];
        return <PlayerPanel key={player.id} player={player} rank={ranks.findIndex((p) => p.id === player.id) + 1}
          position={position} onRiichi={() => declareRiichi(player.id)} onEditName={() => setEditingPlayerId(player.id)} />;
      })}
      <CenterPanel round={state.round} honba={state.honba} kyotaku={state.kyotaku} canUndo={state.history.length > 0}
        layoutMode={layoutMode} onTransfer={() => setTransferOpen(true)} onDraw={() => setDrawOpen(true)}
        onHistory={() => setHistoryOpen(true)} onUndo={undo} onReset={() => setResetOpen(true)}
        onToggleLayout={() => setLayoutMode((current) => current === "table" ? "list" : "table")} />
      {transferOpen && <ScoreTransferModal players={state.players} kyotaku={state.kyotaku} honba={state.honba} gameMode={state.gameMode} onConfirm={applyWin} onClose={() => setTransferOpen(false)} />}
      {drawOpen && <DrawModal players={state.players} honba={state.honba} onConfirm={applyDraw} onClose={() => setDrawOpen(false)} />}
      {historyOpen && <HistoryModal history={state.history} matchHistory={state.matchHistory} onClose={() => setHistoryOpen(false)} />}
      {editingPlayerId && <PlayerNameModal
        player={state.players.find((player) => player.id === editingPlayerId)!}
        onClose={() => setEditingPlayerId(null)}
        onSave={(name, score) => { editPlayer(editingPlayerId, name, score); setEditingPlayerId(null); }}
      />}
      {resetOpen && <ConfirmDialog title="現在の対局を保存しますか？" message="最終順位と点数を対戦履歴へ保存し、人数と名前を選ぶスタート画面へ戻ります。"
        confirmLabel="保存して終了" onCancel={() => setResetOpen(false)} onConfirm={() => { returnToStart(); setResetOpen(false); }} />}
    </main>
  );
}
