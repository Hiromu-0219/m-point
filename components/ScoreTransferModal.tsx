"use client";

import { useMemo, useState } from "react";
import { calculateScore, isValidHanFu, VALID_FU } from "@/lib/scoreCalculator";
import type { Player, PlayerId, WinType } from "@/lib/types";

export default function ScoreTransferModal({ players, kyotaku, onConfirm, onClose }: {
  players: Player[]; kyotaku: number;
  onConfirm: (value: { winType: WinType; winnerId: PlayerId; loserId?: PlayerId; han: number; fu: number }) => void;
  onClose: () => void;
}) {
  const [winType, setWinType] = useState<WinType>("ron");
  const [winnerId, setWinnerId] = useState<PlayerId>("east");
  const [loserId, setLoserId] = useState<PlayerId | undefined>("south");
  const [han, setHan] = useState(3);
  const [fu, setFu] = useState(40);
  const winner = players.find((p) => p.id === winnerId)!;
  const valid = isValidHanFu(han, fu) && (winType === "tsumo" || (!!loserId && loserId !== winnerId));
  const result = useMemo(() => valid ? calculateScore({ han, fu, winType, isDealer: winner.isDealer }) : null, [valid, han, fu, winType, winner.isDealer]);

  const selectWinType = (value: WinType) => { setWinType(value); if (value === "tsumo") setLoserId(undefined); else setLoserId(players.find((p) => p.id !== winnerId)?.id); };
  const selectWinner = (id: PlayerId) => { setWinnerId(id); if (winType === "ron" && loserId === id) setLoserId(players.find((p) => p.id !== id)?.id); };
  const lines = result?.winType === "ron"
    ? `${players.find((p) => p.id === loserId)?.name} → ${winner.name}\n${result.total.toLocaleString()}点`
    : winner.isDealer
      ? `3人から各 ${result?.childPayment.toLocaleString()}点`
      : `親 ${result?.dealerPayment?.toLocaleString()}点／子 各${result?.childPayment.toLocaleString()}点`;

  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="transfer-title">
        <header className="modal-head"><h2 id="transfer-title">点数移動</h2><button className="close" onClick={onClose} aria-label="閉じる">×</button></header>
        <div className="field"><span className="field-label">和了形式</span><div className="segmented">
          {(["ron", "tsumo"] as WinType[]).map((type) => <button key={type} className={`chip ${winType === type ? "selected" : ""}`} onClick={() => selectWinType(type)}>{type === "ron" ? "ロン" : "ツモ"}</button>)}
        </div></div>
        <div className="field"><span className="field-label">和了者</span><div className="choice-grid">
          {players.map((player) => <button key={player.id} className={`chip ${winnerId === player.id ? "selected" : ""}`} onClick={() => selectWinner(player.id)}>{player.wind} {player.name}</button>)}
        </div></div>
        {winType === "ron" && <div className="field"><span className="field-label">放銃者</span><div className="choice-grid">
          {players.map((player) => <button key={player.id} disabled={winnerId === player.id} className={`chip ${loserId === player.id ? "selected" : ""}`} onClick={() => setLoserId(player.id)}>{player.wind} {player.name}</button>)}
        </div></div>}
        <div className="select-row">
          <label className="field"><span className="field-label">翻数</span><select value={han} onChange={(e) => setHan(Number(e.target.value))}>
            {Array.from({ length: 13 }, (_, i) => i + 1).map((value) => <option key={value} value={value}>{value === 13 ? "13翻以上" : `${value}翻`}</option>)}
          </select></label>
          <label className="field"><span className="field-label">符数</span><select value={fu} onChange={(e) => setFu(Number(e.target.value))}>
            {VALID_FU.map((value) => <option key={value} value={value}>{value}符</option>)}
          </select></label>
        </div>
        {!valid && <p className="warning">{!isValidHanFu(han, fu) ? "この翻・符の組み合わせは無効です。" : "放銃者を選択してください。"}</p>}
        {result && <div className="result-card">
          <div className="result-title">{winner.name} {han}翻{fu}符 {winType === "ron" ? "ロン" : "ツモ"} {result.limitName && `・${result.limitName}`}</div>
          <div className="result-lines">{lines}{kyotaku ? `\n供託 ＋${(kyotaku * 1000).toLocaleString()}点` : ""}</div>
          <div className="result-total">獲得合計 {(result.total + kyotaku * 1000).toLocaleString()}点</div>
          <button className="confirm" onClick={() => { onConfirm({ winType, winnerId, loserId, han, fu }); onClose(); }}>この内容で確定</button>
        </div>}
      </section>
    </div>
  );
}
