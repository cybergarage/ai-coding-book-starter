import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CARD_SYMBOLS,
  GameController,
  createGame,
  selectCard,
  type CardSymbol,
} from "./game";

const FIXED_DECK: readonly CardSymbol[] = [
  "🍎",
  "🐶",
  "🍎",
  "🐶",
  "🌙",
  "🚀",
  "🌙",
  "🚀",
  "🌻",
  "🎲",
  "🌻",
  "🎲",
  "🎵",
  "⚽",
  "🎵",
  "⚽",
];

afterEach(() => {
  vi.useRealTimers();
});

describe("game state transitions", () => {
  it("creates a hidden sixteen-card board with eight pairs", () => {
    const game = createGame(FIXED_DECK);

    expect(game.deck).toEqual(FIXED_DECK);
    expect(game.deck).not.toBe(FIXED_DECK);
    expect(game.faceUp).toEqual(Array.from({ length: 16 }, () => false));
    expect(game.matched).toEqual(Array.from({ length: 16 }, () => false));
    expect(game.moves).toBe(0);
    expect(game.phase).toBe("ready");
    expect(game.cleared).toBe(false);
  });

  it("rejects decks that do not contain two of every symbol", () => {
    expect(() => createGame(CARD_SYMBOLS)).toThrow("16 cards");
    expect(() => createGame(Array.from({ length: 16 }, () => "🍎"))).toThrow(
      "exactly two",
    );
  });

  it("handles the first selection and ignores an already face-up card", () => {
    const firstSelection = selectCard(createGame(FIXED_DECK), 0);
    const repeatedSelection = selectCard(firstSelection, 0);

    expect(firstSelection.phase).toBe("one-selected");
    expect(firstSelection.selected).toEqual([0]);
    expect(firstSelection.faceUp[0]).toBe(true);
    expect(repeatedSelection).toBe(firstSelection);
  });

  it("matches a pair immediately and increments the move count", () => {
    const firstSelection = selectCard(createGame(FIXED_DECK), 0);
    const matched = selectCard(firstSelection, 2);

    expect(matched.moves).toBe(1);
    expect(matched.phase).toBe("ready");
    expect(matched.matched[0]).toBe(true);
    expect(matched.matched[2]).toBe(true);
    expect(matched.faceUp[0]).toBe(true);
    expect(matched.faceUp[2]).toBe(true);
    expect(selectCard(matched, 0)).toBe(matched);
  });

  it("clears on the final match and ignores subsequent selection", () => {
    let game = createGame(FIXED_DECK);
    const pairs = [
      [0, 2],
      [1, 3],
      [4, 6],
      [5, 7],
      [8, 10],
      [9, 11],
      [12, 14],
      [13, 15],
    ];

    for (const [first, second] of pairs) {
      if (first === undefined || second === undefined) {
        throw new Error("A card pair is required.");
      }
      game = selectCard(selectCard(game, first), second);
    }

    expect(game.phase).toBe("cleared");
    expect(game.cleared).toBe(true);
    expect(game.moves).toBe(8);
    expect(selectCard(game, 0)).toBe(game);
  });
});

describe("mismatch timing and reset", () => {
  it("keeps a mismatch visible and locked through 799ms, then hides it at 800ms", () => {
    vi.useFakeTimers();
    const controller = new GameController(FIXED_DECK);

    controller.selectCard(0);
    controller.selectCard(1);
    controller.selectCard(4);

    expect(controller.getState().phase).toBe("resolving");
    expect(controller.getState().moves).toBe(1);
    expect(controller.getState().faceUp[0]).toBe(true);
    expect(controller.getState().faceUp[1]).toBe(true);

    vi.advanceTimersByTime(799);
    expect(controller.getState().phase).toBe("resolving");
    expect(controller.getState().faceUp[0]).toBe(true);

    vi.advanceTimersByTime(1);
    expect(controller.getState().phase).toBe("ready");
    expect(controller.getState().faceUp[0]).toBe(false);
    expect(controller.getState().faceUp[1]).toBe(false);
  });

  it("cancels a pending mismatch timer when reset with a fixed deck", () => {
    vi.useFakeTimers();
    const controller = new GameController(FIXED_DECK);
    const resetDeck = [...FIXED_DECK].reverse() as CardSymbol[];

    controller.selectCard(0);
    controller.selectCard(1);
    controller.reset(resetDeck);
    vi.advanceTimersByTime(800);

    expect(controller.getState().deck).toEqual(resetDeck);
    expect(controller.getState().phase).toBe("ready");
    expect(controller.getState().moves).toBe(0);
    expect(controller.getState().faceUp).toEqual(
      Array.from({ length: 16 }, () => false),
    );
    expect(controller.getState().cleared).toBe(false);
  });
});
