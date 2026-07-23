import RiichiStick from "./RiichiStick";
import type { Player } from "@/lib/types";

export default function PlayerPanel({ player, rank, position, onRiichi }: {
  player: Player; rank: number; position: "top" | "bottom" | "left" | "right"; onRiichi: () => void;
}) {
  const disabled = player.isRiichi || player.score < 1000;
  return (
    <div className={`player-panel position-${position}`}>
      <button className={`player-inner ${player.isRiichi ? "riichi" : ""}`} onClick={onRiichi} disabled={disabled}
        aria-label={`${player.name} ${player.score}点。${disabled ? player.isRiichi ? "リーチ済み" : "リーチ不可" : "タップでリーチ宣言"}`}>
        <span className="wind-tile">{player.wind}</span>
        <span>
          <span className="player-name">{player.name}{player.isDealer && <span className="dealer">親</span>}</span>
          <span className="score">{player.score.toLocaleString()}</span>
        </span>
        <span className="rank">{rank}位</span>
        {player.isRiichi && <><span className="riichi-label">リーチ</span><RiichiStick /></>}
      </button>
    </div>
  );
}
