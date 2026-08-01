import { afterEach, describe, expect, it, vi } from "vitest";
import { CARD_SYMBOLS, MemoryGame } from "./game";

const fixedDeck = [
  "🍎", "🍎", "🍋", "🍇", "🍋", "🍇", "🍓", "🍓",
  "🥝", "🥝", "🍒", "🍒", "🍑", "🍑", "🍍", "🍍",
];

afterEach(() => {
  vi.useRealTimers();
});

describe("MemoryGame", () => {
  it("固定した山札を裏向き、手数0で初期化する", () => {
    const game = new MemoryGame(fixedDeck);
    const state = game.getState();

    expect(state.cards.map((card) => card.symbol)).toEqual(fixedDeck);
    expect(state.cards).toHaveLength(16);
    expect(state.cards.every((card) => card.state === "face-down")).toBe(true);
    expect(state.moves).toBe(0);
    expect(state.locked).toBe(false);
    expect(state.complete).toBe(false);
  });

  it("通常開始時は8種類を2枚ずつ持つ", () => {
    const state = new MemoryGame().getState();

    expect(state.cards).toHaveLength(16);
    for (const symbol of CARD_SYMBOLS) {
      expect(state.cards.filter((card) => card.symbol === symbol)).toHaveLength(2);
    }
  });

  it("一致した2枚を即座に一致済みにして手数を増やす", () => {
    const game = new MemoryGame(fixedDeck);

    game.select(0);
    expect(game.getState().cards[0]?.state).toBe("single-face-up");
    game.select(1);

    const state = game.getState();
    expect(state.cards[0]?.state).toBe("matched");
    expect(state.cards[1]?.state).toBe("matched");
    expect(state.moves).toBe(1);
    expect(state.locked).toBe(false);
  });

  it("不一致の2枚を799msまで表示し、800msで戻してロック解除する", () => {
    vi.useFakeTimers();
    const game = new MemoryGame(fixedDeck);

    game.select(0);
    game.select(2);
    expect(game.getState().moves).toBe(1);
    expect(game.getState().locked).toBe(true);
    expect(game.getState().cards[0]?.state).toBe("pending-mismatch");

    game.select(4);
    expect(game.getState().cards[4]?.state).toBe("face-down");
    vi.advanceTimersByTime(799);
    expect(game.getState().locked).toBe(true);
    expect(game.getState().cards[2]?.state).toBe("pending-mismatch");

    vi.advanceTimersByTime(1);
    expect(game.getState().locked).toBe(false);
    expect(game.getState().cards[0]?.state).toBe("face-down");
    expect(game.getState().cards[2]?.state).toBe("face-down");
  });

  it("同じカードや一致済みカードの再選択では状態と手数を変えない", () => {
    const game = new MemoryGame(fixedDeck);

    game.select(0);
    game.select(0);
    expect(game.getState().moves).toBe(0);
    game.select(1);
    game.select(0);
    expect(game.getState().moves).toBe(1);
    expect(game.getState().cards[0]?.state).toBe("matched");
  });

  it("判定待ち中のリセットでタイマーを破棄し固定山札で初期化する", () => {
    vi.useFakeTimers();
    const changed = vi.fn();
    const game = new MemoryGame(fixedDeck, changed);
    const replacement = [...fixedDeck].reverse();

    game.select(0);
    game.select(2);
    game.reset(replacement);
    vi.advanceTimersByTime(800);

    const state = game.getState();
    expect(state.cards.map((card) => card.symbol)).toEqual(replacement);
    expect(state.cards.every((card) => card.state === "face-down")).toBe(true);
    expect(state.moves).toBe(0);
    expect(state.locked).toBe(false);
    expect(changed).not.toHaveBeenCalled();
  });

  it("全ペア一致でクリアし、その後のカード選択では状態と手数を変えない", () => {
    const pairedDeck = CARD_SYMBOLS.flatMap((symbol) => [symbol, symbol]);
    const game = new MemoryGame(pairedDeck);

    for (let index = 0; index < pairedDeck.length; index += 2) {
      game.select(index);
      game.select(index + 1);
    }

    const completed = game.getState();
    expect(completed.complete).toBe(true);
    expect(completed.moves).toBe(8);
    game.select(0);
    expect(game.getState()).toEqual(completed);
  });
});
