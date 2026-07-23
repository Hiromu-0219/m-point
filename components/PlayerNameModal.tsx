"use client";

import { useState } from "react";
import type { Player } from "@/lib/types";

export default function PlayerNameModal({ player, onSave, onClose }: {
  player: Player;
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(player.name);
  const valid = name.trim().length > 0;

  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal name-modal" role="dialog" aria-modal="true" aria-labelledby="name-title"
        onSubmit={(event) => { event.preventDefault(); if (valid) onSave(name); }}>
        <header className="modal-head">
          <h2 id="name-title">{player.wind}家の名前</h2>
          <button className="close" type="button" onClick={onClose} aria-label="閉じる">×</button>
        </header>
        <label className="field">
          <span className="field-label">プレイヤー名（12文字まで）</span>
          <input className="name-input" value={name} maxLength={12} autoFocus inputMode="text"
            onChange={(event) => setName(event.target.value)} onFocus={(event) => event.currentTarget.select()} />
        </label>
        {!valid && <p className="warning">名前を入力してください。</p>}
        <button className="confirm" type="submit" disabled={!valid}>名前を保存</button>
      </form>
    </div>
  );
}
