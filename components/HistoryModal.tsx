import type { GameEvent, MatchRecord } from "@/lib/types";

export default function HistoryModal({ history, matchHistory, onClose }: {
  history: GameEvent[];
  matchHistory: MatchRecord[];
  onClose: () => void;
}) {
  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="history-title">
        <header className="modal-head"><h2 id="history-title">操作履歴</h2><button className="close" onClick={onClose} aria-label="閉じる">×</button></header>
        <h3 className="history-section-title">過去の対戦</h3>
        {matchHistory.length === 0 ? <div className="empty compact">保存された対戦はありません</div> : (
          <div className="match-list">{matchHistory.map((match) => (
            <article className="match-item" key={match.id}>
              <header>
                <strong>{match.gameMode === "sanma" ? "三人麻雀" : "四人麻雀"}</strong>
                <time>{new Date(match.endedAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time>
              </header>
              <div className="match-results">{match.players.map((player, index) => (
                <span key={player.id}><b>{index + 1}位</b>{player.name}<em>{player.score.toLocaleString()}点</em></span>
              ))}</div>
              <small>{match.finalRound}終了・{match.eventCount}操作</small>
            </article>
          ))}</div>
        )}
        <h3 className="history-section-title current">現在の操作履歴</h3>
        {history.length === 0 ? <div className="empty compact">まだ操作はありません</div> : (
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
