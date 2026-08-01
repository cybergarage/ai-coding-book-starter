import { describe, expect, it, vi } from "vitest";
import { createGameController } from "./game-controller";
import {
  MISMATCH_DELAY_MS,
  createGame,
  createShuffledGame,
  flipCard,
  hideMismatchedCards,
  type CardSymbol,
  type Game,
} from "./game";

const orderedDeck: readonly CardSymbol[] = [
  "apple",
  "apple",
  "balloon",
  "balloon",
  "cat",
  "cat",
  "diamond",
  "diamond",
  "flower",
  "flower",
  "guitar",
  "guitar",
  "heart",
  "heart",
  "star",
  "star",
];

describe("memory game state", () => {
  it("creates a shuffled 4 by 4 board with eight pairs", () => {
    const game = createShuffledGame(() => 0);

    expect(game.cards).toHaveLength(16);
    expect(game.cards.map((card) => card.symbol).sort()).toEqual(
      ["apple", "balloon", "cat", "diamond", "flower", "guitar", "heart", "star"]
        .flatMap((symbol) => [symbol, symbol])
        .sort(),
    );
  });

  it("counts a matching pair as one move", () => {
    const game = createGame(orderedDeck);
    const firstCard = game.cards[0]!;
    const matchingCard = game.cards.find(
      (card) => card.id !== firstCard.id && card.symbol === firstCard.symbol,
    )!;
    const first = flipCard(game, firstCard.id);
    const completed = flipCard(first, matchingCard.id);

    expect(completed.moves).toBe(1);
    expect(completed.cards[firstCard.id]?.isMatched).toBe(true);
    expect(completed.cards[matchingCard.id]?.isMatched).toBe(true);
    expect(completed.phase).toBe("first");
  });

  it("hides a mismatched pair after it has been shown", () => {
    const game = createGame(orderedDeck);
    const first = flipCard(game, 0);
    const resolving = flipCard(first, 2);
    const resumed = hideMismatchedCards(resolving);

    expect(resolving.phase).toBe("resolving");
    expect(resumed.phase).toBe("first");
    expect(resumed.cards[0]?.isFlipped).toBe(false);
    expect(resumed.cards[2]?.isFlipped).toBe(false);
  });

  it("keeps mismatched cards visible and input locked through 799ms, then resolves at 800ms", () => {
    vi.useFakeTimers();
    const updates: Game[] = [];
    const controller = createGameController(
      createGame(orderedDeck),
      () => createShuffledGame(() => 0),
      (game) => updates.push(game),
    );

    controller.flip(0);
    controller.flip(2);
    vi.advanceTimersByTime(MISMATCH_DELAY_MS - 1);

    expect(controller.game.phase).toBe("resolving");
    expect(controller.game.cards[0]?.isFlipped).toBe(true);
    expect(controller.game.cards[2]?.isFlipped).toBe(true);
    expect(flipCard(controller.game, 4)).toBe(controller.game);

    vi.advanceTimersByTime(1);

    expect(controller.game.phase).toBe("first");
    expect(controller.game.cards[0]?.isFlipped).toBe(false);
    expect(controller.game.cards[2]?.isFlipped).toBe(false);
    controller.flip(4);
    expect(controller.game.selectedIds).toEqual([4]);
    expect(updates).toHaveLength(4);
    vi.useRealTimers();
  });

  it("cancels a pending mismatch timer when resetting", () => {
    vi.useFakeTimers();
    const controller = createGameController(
      createGame(orderedDeck),
      () => createGame(orderedDeck),
      () => undefined,
    );

    controller.flip(0);
    controller.flip(2);
    vi.advanceTimersByTime(400);
    controller.reset();
    controller.flip(0);
    controller.flip(2);
    vi.advanceTimersByTime(400);

    expect(controller.game.phase).toBe("resolving");
    expect(controller.game.cards[0]?.isFlipped).toBe(true);
    expect(controller.game.cards[2]?.isFlipped).toBe(true);

    vi.advanceTimersByTime(400);

    expect(controller.game.phase).toBe("first");
    expect(controller.game.cards[0]?.isFlipped).toBe(false);
    expect(controller.game.cards[2]?.isFlipped).toBe(false);
    vi.useRealTimers();
  });
});
