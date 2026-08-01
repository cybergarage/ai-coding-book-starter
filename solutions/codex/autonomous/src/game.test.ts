import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryGame } from "./game";

const deck = ["A", "A", "B", "B", "C", "C", "D", "D", "E", "E", "F", "F", "G", "G", "H", "H"];

afterEach(() => vi.useRealTimers());

describe("MemoryGame", () => {
  it("does not notify before constructor assignment is complete", () => {
    let game: MemoryGame | undefined;
    const onChange = vi.fn(() => {
      if (game === undefined) throw new Error("Game assignment is not complete.");
      return game.getState();
    });

    expect(() => {
      game = new MemoryGame(deck, onChange);
    }).not.toThrow();
    expect(onChange).not.toHaveBeenCalled();

    if (game === undefined) throw new Error("Game was not constructed.");
    game.reset(deck);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("creates the specified 16-card deck in its initial state", () => {
    const state = new MemoryGame(deck).getState();
    expect(state.cards).toHaveLength(16);
    expect(new Set(state.cards.map((card) => card.symbol))).toHaveLength(8);
    for (const symbol of new Set(deck)) expect(state.cards.filter((card) => card.symbol === symbol)).toHaveLength(2);
    expect(state.cards.every((card) => card.status === "hidden")).toBe(true);
    expect(state).toMatchObject({ moves: 0, complete: false, locked: false, selectedCardId: null });
  });

  it("reveals only a hidden first card without increasing moves", () => {
    const game = new MemoryGame(deck);
    game.selectCard(0);
    const selected = game.getState();
    expect(selected.cards[0]?.status).toBe("revealed");
    expect(selected.moves).toBe(0);
    game.selectCard(0);
    expect(game.getState()).toEqual(selected);
  });

  it("matches a pair immediately and allows the next selection", () => {
    const game = new MemoryGame(deck);
    game.selectCard(0);
    game.selectCard(1);
    expect(game.getState()).toMatchObject({ moves: 1, locked: false });
    expect(game.getState().cards.slice(0, 2).every((card) => card.status === "matched")).toBe(true);
    const matchedState = game.getState();
    game.selectCard(0);
    expect(game.getState()).toEqual(matchedState);
    game.selectCard(2);
    expect(game.getState().cards[2]?.status).toBe("revealed");
  });

  it("locks a mismatch for exactly 800 milliseconds", () => {
    vi.useFakeTimers();
    const game = new MemoryGame(deck);
    game.selectCard(0);
    game.selectCard(2);
    expect(game.getState()).toMatchObject({ moves: 1, locked: true });
    expect(game.getState().cards[0]?.status).toBe("pending");
    expect(game.getState().cards[2]?.status).toBe("pending");
    const lockedState = game.getState();
    game.selectCard(3);
    expect(game.getState()).toEqual(lockedState);
    vi.advanceTimersByTime(799);
    expect(game.getState()).toEqual(lockedState);
    vi.advanceTimersByTime(1);
    expect(game.getState()).toMatchObject({ locked: false, selectedCardId: null });
    expect(game.getState().cards[0]?.status).toBe("hidden");
    expect(game.getState().cards[2]?.status).toBe("hidden");
  });

  it("completes on the last match and preserves the final move count", () => {
    const game = new MemoryGame(deck);
    for (let index = 0; index < deck.length; index += 2) {
      game.selectCard(index);
      game.selectCard(index + 1);
    }
    expect(game.getState()).toMatchObject({ complete: true, moves: 8 });
  });

  it("reset cancels a mismatch and restores a specified layout", () => {
    vi.useFakeTimers();
    const game = new MemoryGame(deck);
    game.selectCard(0);
    game.selectCard(2);
    const reversed = [...deck].reverse();
    game.reset(reversed);
    expect(game.getState()).toMatchObject({ moves: 0, locked: false, complete: false, selectedCardId: null });
    expect(game.getState().cards.map((card) => card.symbol)).toEqual(reversed);
    expect(game.getState().cards.every((card) => card.status === "hidden")).toBe(true);
    vi.advanceTimersByTime(800);
    expect(game.getState().cards.every((card) => card.status === "hidden")).toBe(true);
  });
});
