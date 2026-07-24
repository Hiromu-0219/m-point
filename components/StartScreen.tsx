"use client";

import { useState } from "react";
import type { GameMode, MatchRecord } from "@/lib/types";

export default function StartScreen({ onStart, matchHistory = [] }: {
  onStart: (mode: GameMode, names: string[]) => void;
  matchHistory?: MatchRecord[];
}) {
  const [mode, setMode] = useState<GameMode>("yonma");
  const count = mode === "sanma" ? 3 : 4;
  const [names, setNames] = useState(["プレイヤー1", "プレイヤー2", "プレイヤー3", "プレイヤー4"]);

  const updateName = (index: number, value: string) => {
    setNames((current) => current.map((name, nameIndex) => nameIndex === index ? value : name));
  };

  return (
    <main className="start-screen">
      <section className="start-card">
        <div className="start-brand">M-POINT</div>
        <h1>麻雀点数卓</h1>
        <p className="start-lead">人数と名前を決めて、卓の中央へ。</p>
        <div className="mode-picker" aria-label="対局人数">
          <button className={mode === "yonma" ? "active" : ""} onClick={() => setMode("yonma")}>
            <strong>四人麻雀</strong><span>25,000点持ち</span>
          </button>
          <button className={mode === "sanma" ? "active" : ""} onClick={() => setMode("sanma")}>
            <strong>三人麻雀</strong><span>35,000点・ツモ損あり</span>
          </button>
        </div>
        <div className="start-names">
          {names.slice(0, count).map((name, index) => (
            <label key={index}>
              <span>{index + 1}人目</span>
              <input value={name} maxLength={12} onChange={(event) => updateName(index, event.target.value)}
                onFocus={(event) => event.currentTarget.select()} />
            </label>
          ))}
        </div>
        <button className="start-button" disabled={names.slice(0, count).some((name) => !name.trim())}
          onClick={() => onStart(mode, names.slice(0, count))}>
          {mode === "sanma" ? "三麻を始める" : "四麻を始める"}
        </button>
        <p className="start-foot">名前と対局状況はこの端末だけに保存されます</p>
        {matchHistory.length > 0 && <div className="start-history-summary">
          <strong>保存済みの対戦</strong>
          <span>{matchHistory.length}局</span>
          <small>最新：{new Date(matchHistory[0].endedAt).toLocaleDateString("ja-JP")}</small>
        </div>}
      </section>
    </main>
  );
}
