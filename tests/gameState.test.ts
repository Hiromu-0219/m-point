import test from "node:test";
import assert from "node:assert/strict";
import { advanceRound, calculateDrawChanges, createInitialState, createMatchRecord, INITIAL_PLAYERS, normalizeManualScore, rotatePlayerWinds } from "../lib/gameState.ts";

test("局を東一局から南四局まで進める", () => {
  assert.equal(advanceRound("東一局"), "東二局");
  assert.equal(advanceRound("東四局"), "南一局");
  assert.equal(advanceRound("南四局"), "対局終了");
});

test("名前と着席IDを固定して自風と親だけを回す", () => {
  const rotated = rotatePlayerWinds(INITIAL_PLAYERS);
  assert.deepEqual(rotated.map(({ id, name, wind, isDealer }) => ({ id, name, wind, isDealer })), [
    { id: "east", name: "東家", wind: "北", isDealer: false },
    { id: "south", name: "南家", wind: "東", isDealer: true },
    { id: "west", name: "西家", wind: "南", isDealer: false },
    { id: "north", name: "北家", wind: "西", isDealer: false },
  ]);
});

test("三麻は北家なしで東三局から南場へ進む", () => {
  const sanma = rotatePlayerWinds(INITIAL_PLAYERS.slice(0, 3));
  assert.deepEqual(sanma.map((player) => player.wind), ["西", "東", "南"]);
  assert.equal(advanceRound("東三局", "sanma"), "南一局");
  assert.equal(advanceRound("南三局", "sanma"), "対局終了");
});

test("最終順位付きの対戦履歴を作成する", () => {
  const state = createInitialState("sanma", ["A", "B", "C"], true);
  state.players[1].score = 42000;
  const record = createMatchRecord(state, 1234);
  assert.equal(record.gameMode, "sanma");
  assert.equal(record.endedAt, 1234);
  assert.deepEqual(record.players.map((player) => player.name), ["B", "A", "C"]);
});

test("四麻の流局でノーテン罰符3000点を精算する", () => {
  const result = calculateDrawChanges(INITIAL_PLAYERS, ["east", "south"]);
  assert.deepEqual(result.changes.map((change) => change.amount), [1500, 1500, -1500, -1500]);
  assert.equal(result.dealerContinues, true);
});

test("三麻の親ノーテン流局を計算する", () => {
  const result = calculateDrawChanges(INITIAL_PLAYERS.slice(0, 3), ["south"]);
  assert.deepEqual(result.changes.map((change) => change.amount), [-1500, 3000, -1500]);
  assert.equal(result.dealerContinues, false);
});

test("手動点数を100点単位へ正規化する", () => {
  assert.equal(normalizeManualScore(25149), 25100);
  assert.equal(normalizeManualScore(25150), 25200);
  assert.equal(normalizeManualScore(-100), null);
  assert.equal(normalizeManualScore(Number.NaN), null);
});
