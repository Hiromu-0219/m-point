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

const positions: Record<PlayerId, "top" | "bottom" | "left" | "right"> = { east: "bottom", south: "right", west: "top", north: "left" };

export default function MahjongTable() {
  const { state, declareRiichi, applyWin, undo, reset } = useGameState();
  const [transferOpen, setTransferOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const ranks = useMemo(() => getRanks(state.players), [state.players]);
  return (
    <main className="table-shell">
      {state.players.map((player) => <PlayerPanel key={player.id} player={player} rank={ranks.findIndex((p) => p.id === player.id) + 1}
        position={positions[player.id]} onRiichi={() => declareRiichi(player.id)} />)}
      <CenterPanel round={state.round} honba={state.honba} kyotaku={state.kyotaku} canUndo={state.history.length > 0}
        onTransfer={() => setTransferOpen(true)} onHistory={() => setHistoryOpen(true)} onUndo={undo} onReset={() => setResetOpen(true)} />
      {transferOpen && <ScoreTransferModal players={state.players} kyotaku={state.kyotaku} onConfirm={applyWin} onClose={() => setTransferOpen(false)} />}
      {historyOpen && <HistoryModal history={state.history} onClose={() => setHistoryOpen(false)} />}
      {resetOpen && <ConfirmDialog title="対局をリセットしますか？" message="4人の点数を25,000点に戻します。この操作も「1手戻す」で取り消せます。"
        confirmLabel="リセット" onCancel={() => setResetOpen(false)} onConfirm={() => { reset(); setResetOpen(false); }} />}
    </main>
  );
}
