"use client";

import { useState } from "react";
import type { Player, PlayerId } from "@/lib/types";

export default function DrawModal({ players, honba, onConfirm, onClose }: {
  players: Player[];
  honba: number;
  onConfirm: (tenpaiIds: PlayerId[]) => void;
  onClose: () => void;
}) {
  const [tenpaiIds, setTenpaiIds] = useState<PlayerId[]>([]);
  const toggle = (id: PlayerId) => setTenpaiIds((current) =>
    current.includes(id) ? current.filter((playerId) => playerId !== id) : [...current, id]);
  const dealer = players.find((player) => player.isDealer)!;
  const dealerContinues = tenpaiIds.includes(dealer.id);
  const notenCount = players.length - tenpaiIds.length;
  const hasPenalty = tenpaiIds.length > 0 && notenCount > 0;

  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="draw-title">
        <header className="modal-head">
          <h2 id="draw-title">流局</h2>
          <button className="close" onClick={onClose} aria-label="閉じる">×</button>
        </header>
        <div className="field">
          <span className="field-label">テンパイしたプレイヤーを選択</span>
          <div className="choice-grid">
            {players.map((player) => <button key={player.id} className={`chip ${tenpaiIds.includes(player.id) ? "selected" : ""}`}
              onClick={() => toggle(player.id)}>{player.wind} {player.name}</button>)}
          </div>
        </div>
        <div className="result-card">
          <div className="result-title">{dealerContinues ? "親テンパイ・連荘" : "親ノーテン・親流れ"}</div>
          <div className="result-lines">
            {tenpaiIds.length === 0 ? "全員ノーテン" : tenpaiIds.length === players.length ? "全員テンパイ" : `${tenpaiIds.length}人テンパイ／${notenCount}人ノーテン`}
            {hasPenalty ? `\nノーテン罰符 3,000点を精算` : "\n点数移動なし"}
            {`\n供託は持ち越し／${honba + 1}本場`}
          </div>
          <button className="confirm" onClick={() => { onConfirm(tenpaiIds); onClose(); }}>流局を確定</button>
        </div>
      </section>
    </div>
  );
}
