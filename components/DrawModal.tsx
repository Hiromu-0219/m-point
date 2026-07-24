"use client";

import { useState } from "react";
import type { Player, PlayerId } from "@/lib/types";

export default function DrawModal({ players, honba, kyotaku, onConfirm, onClose }: {
  players: Player[];
  honba: number;
  kyotaku: number;
  onConfirm: (tenpaiIds: PlayerId[], riichiIds: PlayerId[]) => void;
  onClose: () => void;
}) {
  const declaredRiichiIds = players.filter((player) => player.isRiichi).map((player) => player.id);
  const [tenpaiIds, setTenpaiIds] = useState<PlayerId[]>(declaredRiichiIds);
  const [riichiIds, setRiichiIds] = useState<PlayerId[]>(declaredRiichiIds);
  const toggleTenpai = (id: PlayerId) => {
    if (riichiIds.includes(id)) return;
    setTenpaiIds((current) => current.includes(id) ? current.filter((playerId) => playerId !== id) : [...current, id]);
  };
  const toggleRiichi = (player: Player) => {
    if (player.isRiichi || player.score < 1000) return;
    const selected = riichiIds.includes(player.id);
    setRiichiIds((current) => selected ? current.filter((id) => id !== player.id) : [...current, player.id]);
    if (!selected) setTenpaiIds((tenpai) => tenpai.includes(player.id) ? tenpai : [...tenpai, player.id]);
  };
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
            {players.map((player) => <button key={player.id} disabled={riichiIds.includes(player.id)} className={`chip ${tenpaiIds.includes(player.id) ? "selected" : ""}`}
              onClick={() => toggleTenpai(player.id)}>{player.wind} {player.name}</button>)}
          </div>
        </div>
        <div className="field">
          <span className="field-label">リーチ者（未処理なら1,000点を供託）</span>
          <div className="choice-grid">
            {players.map((player) => <button key={player.id} disabled={player.isRiichi || player.score < 1000}
              className={`chip riichi-chip ${riichiIds.includes(player.id) ? "selected" : ""}`}
              onClick={() => toggleRiichi(player)}>
              {player.wind} {player.name}{player.isRiichi ? "・宣言済" : ""}
            </button>)}
          </div>
        </div>
        <div className="result-card">
          <div className="result-title">{dealerContinues ? "親テンパイ・連荘" : "親ノーテン・親流れ"}</div>
          <div className="result-lines">
            {tenpaiIds.length === 0 ? "全員ノーテン" : tenpaiIds.length === players.length ? "全員テンパイ" : `${tenpaiIds.length}人テンパイ／${notenCount}人ノーテン`}
            {hasPenalty ? `\nノーテン罰符 3,000点を精算` : "\n点数移動なし"}
            {`\n供託 ${kyotaku + riichiIds.filter((id) => !declaredRiichiIds.includes(id)).length}本を持ち越し／${honba + 1}本場`}
          </div>
          <button className="confirm" onClick={() => { onConfirm(tenpaiIds, riichiIds); onClose(); }}>流局を確定</button>
        </div>
      </section>
    </div>
  );
}
