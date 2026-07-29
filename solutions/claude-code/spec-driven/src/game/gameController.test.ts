import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GameController } from "./gameController";

// カード0/1=apple, 2/3=banana, 4/5=grapes, 6/7=watermelon,
// 8/9=cherries, 10/11=lemon, 12/13=strawberry, 14/15=peach
const FIXED_DECK = [
  "apple",
  "apple",
  "banana",
  "banana",
  "grapes",
  "grapes",
  "watermelon",
  "watermelon",
  "cherries",
  "cherries",
  "lemon",
  "lemon",
  "strawberry",
  "strawberry",
  "peach",
  "peach",
];

describe("GameController", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("固定した山札順序でカードを初期化する", () => {
    const controller = new GameController(FIXED_DECK);
    const state = controller.getState();
    expect(state.cards.map((card) => card.symbolId)).toEqual(FIXED_DECK);
    expect(state.cards.every((card) => card.status === "hidden")).toBe(true);
    expect(state.moves).toBe(0);
    expect(state.isCleared).toBe(false);
    expect(state.isLocked).toBe(false);
  });

  it("裏向きのカードを選択すると表向きになる", () => {
    const controller = new GameController(FIXED_DECK);
    controller.selectCard(0);
    expect(controller.getState().cards[0]?.status).toBe("faceUp");
  });

  it("すでに表向きのカードを再度選択しても状態は変わらない", () => {
    const controller = new GameController(FIXED_DECK);
    controller.selectCard(0);
    const before = controller.getState();
    controller.selectCard(0);
    expect(controller.getState()).toBe(before);
  });

  it("一致した場合は即座に一致済みになり、手数が1増える", () => {
    const controller = new GameController(FIXED_DECK);
    controller.selectCard(0);
    controller.selectCard(1);
    const state = controller.getState();
    expect(state.cards[0]?.status).toBe("matched");
    expect(state.cards[1]?.status).toBe("matched");
    expect(state.moves).toBe(1);
    expect(state.isLocked).toBe(false);
  });

  it("一致済みのカードを選択しても状態は変わらない", () => {
    const controller = new GameController(FIXED_DECK);
    controller.selectCard(0);
    controller.selectCard(1);
    const before = controller.getState();
    controller.selectCard(0);
    expect(controller.getState()).toBe(before);
  });

  it("一致した直後に次のカードを選択できる", () => {
    const controller = new GameController(FIXED_DECK);
    controller.selectCard(0);
    controller.selectCard(1);
    controller.selectCard(2);
    expect(controller.getState().cards[2]?.status).toBe("faceUp");
  });

  it("一致しなかった場合は判定待ちになり、手数が1増え、ほかのカードを選択できない", () => {
    const controller = new GameController(FIXED_DECK);
    controller.selectCard(0);
    controller.selectCard(2);
    const state = controller.getState();
    expect(state.cards[0]?.status).toBe("pending");
    expect(state.cards[2]?.status).toBe("pending");
    expect(state.moves).toBe(1);
    expect(state.isLocked).toBe(true);

    controller.selectCard(4);
    expect(controller.getState().cards[4]?.status).toBe("hidden");
    expect(controller.getState().cards[0]?.status).toBe("pending");
    expect(controller.getState().isLocked).toBe(true);
  });

  it("800ミリ秒未満では判定待ちのまま、800ミリ秒経過すると裏向きに戻る", () => {
    const controller = new GameController(FIXED_DECK);
    controller.selectCard(0);
    controller.selectCard(2);

    vi.advanceTimersByTime(799);
    expect(controller.getState().cards[0]?.status).toBe("pending");
    expect(controller.getState().isLocked).toBe(true);

    vi.advanceTimersByTime(1);
    expect(controller.getState().cards[0]?.status).toBe("hidden");
    expect(controller.getState().cards[2]?.status).toBe("hidden");
    expect(controller.getState().isLocked).toBe(false);
  });

  it("判定待ち解除後は次のカードを選択できる", () => {
    const controller = new GameController(FIXED_DECK);
    controller.selectCard(0);
    controller.selectCard(2);
    vi.advanceTimersByTime(800);
    controller.selectCard(4);
    expect(controller.getState().cards[4]?.status).toBe("faceUp");
  });

  it("8組すべて一致するとゲームクリアになり、最終的な手数を保持する", () => {
    const controller = new GameController(FIXED_DECK);
    for (let i = 0; i < 16; i += 2) {
      controller.selectCard(i);
      controller.selectCard(i + 1);
    }
    const state = controller.getState();
    expect(state.isCleared).toBe(true);
    expect(state.moves).toBe(8);
    expect(state.cards.every((card) => card.status === "matched")).toBe(true);
  });

  it("リセットすると、カード、手数、選択状態、ロック、クリア状態が初期化される", () => {
    const controller = new GameController(FIXED_DECK);
    controller.selectCard(0);
    controller.selectCard(1);
    controller.selectCard(2);

    const nextDeck = [...FIXED_DECK].reverse();
    controller.reset(nextDeck);

    const state = controller.getState();
    expect(state.cards.map((card) => card.symbolId)).toEqual(nextDeck);
    expect(state.cards.every((card) => card.status === "hidden")).toBe(true);
    expect(state.moves).toBe(0);
    expect(state.isCleared).toBe(false);
    expect(state.isLocked).toBe(false);
  });

  it("判定待ちのタイマーがある間にリセットすると、タイマーは無効化される", () => {
    const controller = new GameController(FIXED_DECK);
    controller.selectCard(0);
    controller.selectCard(2);
    expect(controller.getState().isLocked).toBe(true);

    controller.reset(FIXED_DECK);
    const resetState = controller.getState();

    vi.advanceTimersByTime(800);

    expect(controller.getState()).toBe(resetState);
    expect(controller.getState().cards.every((card) => card.status === "hidden")).toBe(
      true,
    );
    expect(controller.getState().isLocked).toBe(false);
  });

  it("リセットボタンは判定待ち中でも常に有効(reset呼び出しが常に受け付けられる)", () => {
    const controller = new GameController(FIXED_DECK);
    controller.selectCard(0);
    controller.selectCard(2);
    expect(() => controller.reset(FIXED_DECK)).not.toThrow();
  });
});
