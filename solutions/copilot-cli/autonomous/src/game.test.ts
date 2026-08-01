import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryGame, SYMBOLS } from "./game";

const FIXED_DECK = [...SYMBOLS, ...SYMBOLS];

describe("MemoryGame", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with sixteen face-down cards, eight pairs, and an unlocked game", () => {
    const game = new MemoryGame(FIXED_DECK);
    const state = game.getState();

    expect(state.cards).toHaveLength(16);
    expect(new Set(state.cards.map((card) => card.symbol))).toHaveLength(8);
    expect(state.cards.filter((card) => card.status === "face-down")).toHaveLength(16);
    expect(state.moves).toBe(0);
    expect(state.isCleared).toBe(false);
    expect(state.inputLocked).toBe(false);
  });

  it("reveals a first card without increasing moves and ignores it when selected again", () => {
    const game = new MemoryGame(FIXED_DECK);

    game.selectCard(0);
    game.selectCard(0);

    expect(game.getState().cards[0]?.status).toBe("face-up");
    expect(game.getState().moves).toBe(0);
  });

  it("matches a pair, counts a move, and permits the next selection", () => {
    const game = new MemoryGame(FIXED_DECK);

    game.selectCard(0);
    game.selectCard(8);
    game.selectCard(1);

    expect(game.getState().cards[0]?.status).toBe("matched");
    expect(game.getState().cards[8]?.status).toBe("matched");
    expect(game.getState().moves).toBe(1);
    expect(game.getState().cards[1]?.status).toBe("face-up");
    expect(game.getState().inputLocked).toBe(false);
  });

  it("keeps mismatched cards visible for 800ms and locks input", () => {
    vi.useFakeTimers();
    const game = new MemoryGame(FIXED_DECK);

    game.selectCard(0);
    game.selectCard(1);
    game.selectCard(2);
    vi.advanceTimersByTime(799);

    expect(game.getState().cards[0]?.status).toBe("pending");
    expect(game.getState().cards[1]?.status).toBe("pending");
    expect(game.getState().cards[2]?.status).toBe("face-down");
    expect(game.getState().moves).toBe(1);
    expect(game.getState().inputLocked).toBe(true);

    vi.advanceTimersByTime(1);

    expect(game.getState().cards[0]?.status).toBe("face-down");
    expect(game.getState().cards[1]?.status).toBe("face-down");
    expect(game.getState().inputLocked).toBe(false);
  });

  it("clears the game after the final pair and retains the final move count", () => {
    const game = new MemoryGame(FIXED_DECK);

    for (let index = 0; index < 8; index += 1) {
      game.selectCard(index);
      game.selectCard(index + 8);
    }

    expect(game.getState().isCleared).toBe(true);
    expect(game.getState().moves).toBe(8);
  });

  it("resets state with a supplied deck and cancels a pending mismatch", () => {
    vi.useFakeTimers();
    const game = new MemoryGame(FIXED_DECK);
    const resetDeck = [...FIXED_DECK].reverse();

    game.selectCard(0);
    game.selectCard(1);
    game.reset(resetDeck);
    vi.advanceTimersByTime(800);

    const state = game.getState();
    expect(state.cards.map((card) => card.symbol)).toEqual(resetDeck);
    expect(state.cards.every((card) => card.status === "face-down")).toBe(true);
    expect(state.moves).toBe(0);
    expect(state.inputLocked).toBe(false);
    expect(state.isCleared).toBe(false);
  });
});
