"use client";

import { useState } from "react";
import type { Player } from "@/lib/types";

export default function PlayerNameModal({ player, onSave, onClose }: {
  player: Player;
  onSave: (name: string, score: number) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(player.name);
  const [score, setScore] = useState(String(player.score));
  const scoreValue = Number(score);
  const valid = name.trim().length > 0 && score.trim() !== "" && Number.isFinite(scoreValue) && scoreValue >= 0 && scoreValue <= 999900;

  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal name-modal" role="dialog" aria-modal="true" aria-labelledby="name-title"
        onSubmit={(event) => { event.preventDefault(); if (valid) onSave(name, scoreValue); }}>
        <header className="modal-head">
          <h2 id="name-title">{player.wind}家を編集</h2>
          <button className="close" type="button" onClick={onClose} aria-label="閉じる">×</button>
        </header>
        <div className="edit-fields">
          <label className="field">
            <span className="field-label">プレイヤー名（12文字まで）</span>
            <input className="name-input" value={name} maxLength={12} autoFocus inputMode="text"
              onChange={(event) => setName(event.target.value)} onFocus={(event) => event.currentTarget.select()} />
          </label>
          <label className="field">
            <span className="field-label">現在点数（100点単位）</span>
            <input className="name-input score-input" value={score} type="number" min="0" max="999900" step="100"
              inputMode="numeric" onChange={(event) => setScore(event.target.value)} onFocus={(event) => event.currentTarget.select()} />
          </label>
        </div>
        {!valid && <p className="warning">名前と0〜999,900点の範囲で点数を入力してください。</p>}
        <button className="confirm" type="submit" disabled={!valid}>変更を保存</button>
      </form>
    </div>
  );
}
