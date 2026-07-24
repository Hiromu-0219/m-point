import type { WinType } from "./types";

export type CalculateScoreInput = {
  han: number;
  fu: number;
  winType: WinType;
  isDealer: boolean;
};

export type CalculateScoreResult =
  | { winType: "ron"; total: number; limitName?: string }
  | { winType: "tsumo"; total: number; dealerPayment?: number; childPayment: number; limitName?: string };

export const VALID_FU = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110] as const;
export const roundUp100 = (value: number) => Math.ceil(value / 100) * 100;

export function calculateHonbaBonus(honba: number, winType: WinType, payerCount: number) {
  const safeHonba = Number.isInteger(honba) && honba > 0 ? honba : 0;
  if (winType === "ron") return { perPayer: safeHonba * 300, total: safeHonba * 300 };
  const perPayer = safeHonba * 100;
  return { perPayer, total: perPayer * Math.max(0, payerCount) };
}

export function isValidHanFu(han: number, fu: number) {
  return Number.isInteger(han) && han >= 1 && han <= 13 && VALID_FU.includes(fu as (typeof VALID_FU)[number])
    && !(han === 1 && (fu === 20 || fu === 25));
}

function getBasePoints(han: number, fu: number): { base: number; limitName?: string } {
  if (han >= 13) return { base: 8000, limitName: "役満" };
  if (han >= 11) return { base: 6000, limitName: "三倍満" };
  if (han >= 8) return { base: 4000, limitName: "倍満" };
  if (han >= 6) return { base: 3000, limitName: "跳満" };
  if (han === 5 || (han === 4 && fu >= 40) || (han === 3 && fu >= 70)) {
    return { base: 2000, limitName: "満貫" };
  }
  return { base: Math.min(fu * 2 ** (han + 2), 2000) };
}

export function calculateScore(input: CalculateScoreInput): CalculateScoreResult {
  const { han, fu, winType, isDealer } = input;
  if (!isValidHanFu(han, fu)) throw new Error("無効な翻・符の組み合わせです");
  const { base, limitName } = getBasePoints(han, fu);
  if (winType === "ron") {
    return { winType, total: roundUp100(base * (isDealer ? 6 : 4)), limitName };
  }
  if (isDealer) {
    const childPayment = roundUp100(base * 2);
    return { winType, childPayment, total: childPayment * 3, limitName };
  }
  const dealerPayment = roundUp100(base * 2);
  const childPayment = roundUp100(base);
  return { winType, dealerPayment, childPayment, total: dealerPayment + childPayment * 2, limitName };
}
