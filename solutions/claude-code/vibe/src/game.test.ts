import { describe, expect, it } from "vitest";
import { createGame, flipCard, isCleared, isMatchPending, isResolving, resolveTurn } from "./game";

const identityShuffle = (items: readonly string[]): string[] => [...items];

describe("createGame", () => {
  it("creates 16 cards forming 8 matching pairs, all face down", () => {
    const state = createGame();

    expect(state.cards).toHaveLength(16);
    expect(state.moves).toBe(0);
    expect(state.flippedIds).toHaveLength(0);
    expect(state.cards.every((card) => !card.isFlipped && !card.isMatched)).toBe(true);

    const counts = new Map<string, number>();
    for (const card of state.cards) {
      counts.set(card.value, (counts.get(card.value) ?? 0) + 1);
    }
    expect(counts.size).toBe(8);
    expect([...counts.values()]).toEqual(Array(8).fill(2));
  });
});

describe("flipCard", () => {
  it("flips a face-down card and does not count a move for the first flip", () => {
    const state = createGame(["A", "B"], identityShuffle);

    const next = flipCard(state, 0);

    expect(next.cards[0]?.isFlipped).toBe(true);
    expect(next.moves).toBe(0);
    expect(next.flippedIds).toEqual([0]);
  });

  it("counts a move once a second card is flipped", () => {
    const state = createGame(["A", "B"], identityShuffle);

    const next = flipCard(flipCard(state, 0), 1);

    expect(next.moves).toBe(1);
    expect(next.flippedIds).toEqual([0, 1]);
  });

  it("ignores clicks while two cards are awaiting resolution", () => {
    const state = createGame(["A", "B"], identityShuffle);
    const twoFlipped = flipCard(flipCard(state, 0), 1);

    const next = flipCard(twoFlipped, 2);

    expect(next).toBe(twoFlipped);
  });

  it("ignores clicks on an already flipped or matched card", () => {
    const state = createGame(["A", "B"], identityShuffle);
    const oneFlipped = flipCard(state, 0);

    expect(flipCard(oneFlipped, 0)).toBe(oneFlipped);
  });
});

describe("resolveTurn", () => {
  it("marks matching cards as matched and clears the flipped ids", () => {
    // identity shuffle of ["A","B","A","B"] -> ids 0 and 2 both hold "A"
    const state = createGame(["A", "B"], identityShuffle);
    const twoFlipped = flipCard(flipCard(state, 0), 2);

    const resolved = resolveTurn(twoFlipped);

    expect(resolved.cards[0]?.isMatched).toBe(true);
    expect(resolved.cards[2]?.isMatched).toBe(true);
    expect(resolved.flippedIds).toHaveLength(0);
    expect(isResolving(resolved)).toBe(false);
  });

  it("flips mismatched cards back face down", () => {
    const state = createGame(["A", "B"], identityShuffle);
    const twoFlipped = flipCard(flipCard(state, 0), 1);

    const resolved = resolveTurn(twoFlipped);

    expect(resolved.cards[0]?.isFlipped).toBe(false);
    expect(resolved.cards[1]?.isFlipped).toBe(false);
    expect(resolved.cards.some((card) => card.isMatched)).toBe(false);
    expect(resolved.flippedIds).toHaveLength(0);
  });

  it("does nothing when fewer than two cards are flipped", () => {
    const state = createGame(["A", "B"], identityShuffle);
    const oneFlipped = flipCard(state, 0);

    expect(resolveTurn(oneFlipped)).toBe(oneFlipped);
  });
});

describe("isMatchPending", () => {
  it("is true when the two flipped cards share a value", () => {
    const state = createGame(["A", "B"], identityShuffle);
    const twoFlipped = flipCard(flipCard(state, 0), 2);

    expect(isMatchPending(twoFlipped)).toBe(true);
  });

  it("is false when the two flipped cards differ", () => {
    const state = createGame(["A", "B"], identityShuffle);
    const twoFlipped = flipCard(flipCard(state, 0), 1);

    expect(isMatchPending(twoFlipped)).toBe(false);
  });

  it("is false when fewer than two cards are flipped", () => {
    const state = createGame(["A", "B"], identityShuffle);

    expect(isMatchPending(state)).toBe(false);
    expect(isMatchPending(flipCard(state, 0))).toBe(false);
  });
});

describe("isCleared", () => {
  it("is true only once every card is matched", () => {
    const state = createGame(["A"], identityShuffle);
    expect(isCleared(state)).toBe(false);

    const matched = resolveTurn(flipCard(flipCard(state, 0), 1));
    expect(isCleared(matched)).toBe(true);
  });
});
