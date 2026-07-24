export default function CenterPanel({ round, honba, kyotaku, canUndo, layoutMode, onTransfer, onDraw, onHistory, onUndo, onReset, onToggleLayout }: {
  round: string; honba: number; kyotaku: number; canUndo: boolean;
  layoutMode: "table" | "list";
  onTransfer: () => void; onDraw: () => void; onHistory: () => void; onUndo: () => void; onReset: () => void;
  onToggleLayout: () => void;
}) {
  return (
    <section className="center-panel" aria-label="対局操作">
      <div className="brand">M-POINT</div>
      <div className="round">{round}</div>
      <div className="counters"><span>本場<strong>{honba}</strong></span><span>供託<strong>{kyotaku}</strong></span></div>
      <div className="main-action-row">
        <button className="main-action" onClick={onTransfer}>点数移動</button>
        <button className="draw-action" onClick={onDraw}>流局</button>
      </div>
      <div className="utility-row">
        <button onClick={onHistory}>履歴</button>
        <button onClick={onUndo} disabled={!canUndo}>1手戻す</button>
        <button onClick={onToggleLayout}>{layoutMode === "table" ? "縦並び" : "卓表示"}</button>
        <button onClick={onReset}>新規対局</button>
      </div>
    </section>
  );
}
