import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryGame, SYMBOLS } from "./game";

const TEST_DECK = [
  "🍎",
  "🍎",
  "🍌",
  "🍇",
  "🍌",
  "🍇",
  "🍉",
  "🍒",
  "🍉",
  "🍒",
  "🍑",
  "🍋",
  "🍑",
  "🍋",
  "🍓",
  "🍓",
];

const ALL_PAIRS: Array<[number, number]> = [
  [0, 1],
  [2, 4],
  [3, 5],
  [6, 8],
  [7, 9],
  [10, 12],
  [11, 13],
  [14, 15],
];

describe("初期状態", () => {
  it("16枚のカードが存在する", () => {
    const game = new MemoryGame(TEST_DECK);
    expect(game.getState().cards).toHaveLength(16);
  });

  it("8種類の絵柄が2枚ずつ存在する", () => {
    const game = new MemoryGame(TEST_DECK);
    const counts = new Map<string, number>();
    for (const card of game.getState().cards) {
      counts.set(card.symbol, (counts.get(card.symbol) ?? 0) + 1);
    }
    expect(counts.size).toBe(8);
    for (const symbol of SYMBOLS) {
      expect(counts.get(symbol)).toBe(2);
    }
  });

  it("すべてのカードが裏向きである", () => {
    const game = new MemoryGame(TEST_DECK);
    expect(game.getState().cards.every((card) => card.status === "hidden")).toBe(true);
  });

  it("手数が0である", () => {
    const game = new MemoryGame(TEST_DECK);
    expect(game.getState().moves).toBe(0);
  });

  it("ゲームクリアではない", () => {
    const game = new MemoryGame(TEST_DECK);
    expect(game.getState().cleared).toBe(false);
  });

  it("入力がロックされていない", () => {
    const game = new MemoryGame(TEST_DECK);
    expect(game.getState().locked).toBe(false);
  });
});

describe("1枚目の選択", () => {
  it("裏向きのカードを選択すると表向きになる", () => {
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    expect(game.getState().cards[0]?.status).toBe("revealed");
  });

  it("1枚目だけでは手数が増えない", () => {
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    expect(game.getState().moves).toBe(0);
  });

  it("同じカードを再度選択しても状態が変わらない", () => {
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    const before = game.getState();
    game.selectCard(0);
    const after = game.getState();
    expect(after.cards[0]?.status).toBe("revealed");
    expect(after.moves).toBe(before.moves);
    expect(after.cards.filter((card) => card.status === "revealed")).toHaveLength(1);
  });

  it("一致済みのカードを選択しても状態が変わらない", () => {
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    game.selectCard(1);
    expect(game.getState().cards[0]?.status).toBe("matched");

    game.selectCard(0);
    expect(game.getState().cards[0]?.status).toBe("matched");
    expect(game.getState().moves).toBe(1);
  });
});

describe("一致", () => {
  it("同じ絵柄の2枚を選択すると一致済みになる", () => {
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    game.selectCard(1);
    const state = game.getState();
    expect(state.cards[0]?.status).toBe("matched");
    expect(state.cards[1]?.status).toBe("matched");
  });

  it("2枚目を選択すると手数が1増える", () => {
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    game.selectCard(1);
    expect(game.getState().moves).toBe(1);
  });

  it("一致したカードは表向きのまま残る", () => {
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    game.selectCard(1);
    expect(game.getState().locked).toBe(false);
    expect(game.getState().cards[0]?.status).toBe("matched");
  });

  it("判定後に次のカードを選択できる", () => {
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    game.selectCard(1);
    game.selectCard(2);
    expect(game.getState().cards[2]?.status).toBe("revealed");
  });
});

describe("不一致", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("異なる絵柄の2枚を選択すると入力がロックされる", () => {
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    game.selectCard(2);
    expect(game.getState().locked).toBe(true);
  });

  it("2枚目を選択すると手数が1増える", () => {
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    game.selectCard(2);
    expect(game.getState().moves).toBe(1);
  });

  it("ロック中に別のカードを選択しても状態が変わらない", () => {
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    game.selectCard(2);
    game.selectCard(3);
    const state = game.getState();
    expect(state.cards[3]?.status).toBe("hidden");
    expect(state.moves).toBe(1);
  });

  it("799ミリ秒経過した時点では、2枚が表向きで入力がロックされたままである", () => {
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    game.selectCard(2);
    vi.advanceTimersByTime(799);
    const state = game.getState();
    expect(state.cards[0]?.status).toBe("pending");
    expect(state.cards[2]?.status).toBe("pending");
    expect(state.locked).toBe(true);
  });

  it("800ミリ秒経過した時点で、2枚が裏向きへ戻る", () => {
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    game.selectCard(2);
    vi.advanceTimersByTime(800);
    const state = game.getState();
    expect(state.cards[0]?.status).toBe("hidden");
    expect(state.cards[2]?.status).toBe("hidden");
  });

  it("不一致を解決すると2枚が裏向きへ戻る", () => {
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    game.selectCard(2);
    vi.advanceTimersByTime(800);
    const state = game.getState();
    expect(state.cards[0]?.status).toBe("hidden");
    expect(state.cards[2]?.status).toBe("hidden");
  });

  it("不一致を解決すると入力ロックが解除される", () => {
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    game.selectCard(2);
    vi.advanceTimersByTime(800);
    expect(game.getState().locked).toBe(false);
  });
});

describe("ゲームクリア", () => {
  it("最後の1組が一致するとゲームクリアになる", () => {
    const game = new MemoryGame(TEST_DECK);
    for (const [first, second] of ALL_PAIRS) {
      game.selectCard(first);
      game.selectCard(second);
    }
    expect(game.getState().cleared).toBe(true);
  });

  it("クリア後も最終手数が保持される", () => {
    const game = new MemoryGame(TEST_DECK);
    for (const [first, second] of ALL_PAIRS) {
      game.selectCard(first);
      game.selectCard(second);
    }
    expect(game.getState().moves).toBe(ALL_PAIRS.length);
  });
});

describe("リセット", () => {
  it("カードがすべて裏向きになる", () => {
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    game.selectCard(1);
    game.reset(TEST_DECK);
    expect(game.getState().cards.every((card) => card.status === "hidden")).toBe(true);
  });

  it("手数が0になる", () => {
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    game.selectCard(1);
    game.reset(TEST_DECK);
    expect(game.getState().moves).toBe(0);
  });

  it("選択状態がなくなる", () => {
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    game.reset(TEST_DECK);
    game.selectCard(1);
    expect(game.getState().cards[1]?.status).toBe("revealed");
    expect(game.getState().moves).toBe(0);
  });

  it("入力ロックが解除される", () => {
    vi.useFakeTimers();
    const game = new MemoryGame(TEST_DECK);
    game.selectCard(0);
    game.selectCard(2);
    expect(game.getState().locked).toBe(true);
    game.reset(TEST_DECK);
    expect(game.getState().locked).toBe(false);
    vi.useRealTimers();
  });

  it("ゲームクリア状態が解除される", () => {
    const game = new MemoryGame(TEST_DECK);
    for (const [first, second] of ALL_PAIRS) {
      game.selectCard(first);
      game.selectCard(second);
    }
    expect(game.getState().cleared).toBe(true);
    game.reset(TEST_DECK);
    expect(game.getState().cleared).toBe(false);
  });

  it("指定したカード配置で初期化できる", () => {
    const game = new MemoryGame(TEST_DECK);
    game.reset(TEST_DECK);
    const symbols = game.getState().cards.map((card) => card.symbol);
    expect(symbols).toEqual(TEST_DECK);
  });
});
