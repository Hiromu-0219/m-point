import test from "node:test";
import assert from "node:assert/strict";
import { advanceRound, INITIAL_PLAYERS, rotatePlayerWinds } from "../lib/gameState.ts";

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
