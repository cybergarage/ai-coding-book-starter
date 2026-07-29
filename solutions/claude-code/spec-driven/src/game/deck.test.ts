import { describe, expect, it } from "vitest";
import { buildDeck, createOrderedSymbolIds, shuffle } from "./deck";
import { SYMBOLS } from "./symbols";

function sorted(ids: readonly string[]): string[] {
  return [...ids].sort();
}

describe("createOrderedSymbolIds", () => {
  it("8種類の絵柄をそれぞれ2枚ずつ、16枚分生成する", () => {
    const ids = createOrderedSymbolIds();
    expect(ids).toHaveLength(16);
    for (const symbol of SYMBOLS) {
      expect(ids.filter((id) => id === symbol.id)).toHaveLength(2);
    }
  });
});

describe("shuffle", () => {
  it("シャッフル後も要素の多重集合を保つ", () => {
    const original = createOrderedSymbolIds();
    const result = shuffle(original);
    expect(sorted(result)).toEqual(sorted(original));
  });

  it("元の配列を変更しない", () => {
    const original = createOrderedSymbolIds();
    const copy = [...original];
    shuffle(original);
    expect(original).toEqual(copy);
  });
});

describe("buildDeck", () => {
  it("順序を指定した場合はその並びをそのまま使う", () => {
    const fixedOrder = createOrderedSymbolIds();
    const deck = buildDeck(fixedOrder);
    expect(deck).toEqual(fixedOrder);
  });

  it("順序を指定しない場合は8種類の絵柄が2枚ずつ含まれる山札を生成する", () => {
    const deck = buildDeck();
    expect(sorted(deck)).toEqual(sorted(createOrderedSymbolIds()));
  });
});
