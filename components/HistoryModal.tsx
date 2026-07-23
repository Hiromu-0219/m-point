import type { GameEvent } from "@/lib/types";

export default function HistoryModal({ history, onClose }: { history: GameEvent[]; onClose: () => void }) {
  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="history-title">
        <header className="modal-head"><h2 id="history-title">操作履歴</h2><button className="close" onClick={onClose} aria-label="閉じる">×</button></header>
        {history.length === 0 ? <div className="empty">まだ操作はありません</div> : (
          <div className="history-list">{history.map((event) => (
            <article className="history-item" key={event.id}><p>{event.description}</p>
              <time>{new Date(event.createdAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</time>
            </article>
          ))}</div>
        )}
      </section>
    </div>
  );
}
