import test from "node:test";
import assert from "node:assert/strict";
import { calculateHonbaBonus, calculateScore } from "../lib/scoreCalculator.ts";

const ron = (han: number, fu: number, isDealer = false) => calculateScore({ han, fu, winType: "ron", isDealer });
test("通常ロンの点数", () => {
  assert.equal(ron(1, 30).total, 1000);
  assert.equal(ron(1, 30, true).total, 1500);
  assert.equal(ron(2, 30).total, 2000);
  assert.equal(ron(3, 40).total, 5200);
  assert.equal(ron(3, 40, true).total, 7700);
  assert.equal(ron(4, 30).total, 7700);
});
test("満貫以上", () => {
  assert.equal(ron(4, 40).total, 8000);
  assert.equal(ron(5, 30).total, 8000);
  assert.equal(ron(5, 30, true).total, 12000);
  assert.equal(ron(6, 30).total, 12000);
  assert.equal(ron(6, 30, true).total, 18000);
  assert.equal(ron(8, 30).total, 16000);
  assert.equal(ron(11, 30).total, 24000);
  assert.equal(ron(13, 30).total, 32000);
});
test("満貫ツモ", () => {
  const child = calculateScore({ han: 5, fu: 30, winType: "tsumo", isDealer: false });
  const dealer = calculateScore({ han: 5, fu: 30, winType: "tsumo", isDealer: true });
  assert.equal(child.winType, "tsumo");
  if (child.winType === "tsumo") { assert.equal(child.dealerPayment, 4000); assert.equal(child.childPayment, 2000); }
  if (dealer.winType === "tsumo") assert.equal(dealer.childPayment, 4000);
});

test("本場の加算", () => {
  assert.deepEqual(calculateHonbaBonus(1, "ron", 1), { perPayer: 300, total: 300 });
  assert.deepEqual(calculateHonbaBonus(2, "ron", 1), { perPayer: 600, total: 600 });
  assert.deepEqual(calculateHonbaBonus(1, "tsumo", 3), { perPayer: 100, total: 300 });
  assert.deepEqual(calculateHonbaBonus(1, "tsumo", 2), { perPayer: 100, total: 200 });
});
