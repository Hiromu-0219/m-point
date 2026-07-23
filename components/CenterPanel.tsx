export default function CenterPanel({ round, honba, kyotaku, canUndo, onTransfer, onHistory, onUndo, onReset }: {
  round: string; honba: number; kyotaku: number; canUndo: boolean;
  onTransfer: () => void; onHistory: () => void; onUndo: () => void; onReset: () => void;
}) {
  return (
    <section className="center-panel" aria-label="対局操作">
      <div className="brand">M-POINT</div>
      <div className="round">{round}</div>
      <div className="counters"><span>本場<strong>{honba}</strong></span><span>供託<strong>{kyotaku}</strong></span></div>
      <button className="main-action" onClick={onTransfer}>点数移動</button>
      <div className="utility-row">
        <button onClick={onHistory}>履歴</button>
        <button onClick={onUndo} disabled={!canUndo}>1手戻す</button>
        <button onClick={onReset}>リセット</button>
      </div>
    </section>
  );
}
