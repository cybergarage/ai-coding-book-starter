import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGameController, MISMATCH_DELAY_MS } from "./game-controller";

const identityShuffle = (items: readonly string[]): string[] => [...items];

// identity shuffle of ["A","B"] duplicated -> ids: 0=A, 1=B, 2=A, 3=B
const options = { values: ["A", "B"], shuffleFn: identityShuffle };

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("matching pair", () => {
  it("resolves immediately, without waiting for a timer", () => {
    const onChange = vi.fn();
    const controller = createGameController(onChange, options);

    controller.flip(0);
    controller.flip(2);

    const state = controller.getState();
    expect(state.cards[0]?.isMatched).toBe(true);
    expect(state.cards[2]?.isMatched).toBe(true);
    expect(state.flippedIds).toHaveLength(0);
    expect(controller.isLocked()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("mismatched pair", () => {
  it("stays revealed and locked at 799ms", () => {
    const onChange = vi.fn();
    const controller = createGameController(onChange, options);

    controller.flip(0);
    controller.flip(1);
    vi.advanceTimersByTime(MISMATCH_DELAY_MS - 1);

    const state = controller.getState();
    expect(state.cards[0]?.isFlipped).toBe(true);
    expect(state.cards[1]?.isFlipped).toBe(true);
    expect(state.flippedIds).toHaveLength(2);
    expect(controller.isLocked()).toBe(true);
  });

  it("flips back face down and unlocks exactly at 800ms", () => {
    const onChange = vi.fn();
    const controller = createGameController(onChange, options);

    controller.flip(0);
    controller.flip(1);
    vi.advanceTimersByTime(MISMATCH_DELAY_MS);

    const state = controller.getState();
    expect(state.cards[0]?.isFlipped).toBe(false);
    expect(state.cards[1]?.isFlipped).toBe(false);
    expect(state.flippedIds).toHaveLength(0);
    expect(controller.isLocked()).toBe(false);
  });
});

describe("reset while a resolution is pending", () => {
  it("cancels the stale timer so it cannot affect the new game", () => {
    const onChange = vi.fn();
    const controller = createGameController(onChange, options);

    controller.flip(0);
    controller.flip(1);
    const callsBeforeReset = onChange.mock.calls.length;

    vi.advanceTimersByTime(300);
    controller.reset();
    const callsAfterReset = onChange.mock.calls.length;

    // advance well past the original 800ms mark relative to the first flip
    vi.advanceTimersByTime(MISMATCH_DELAY_MS);

    expect(callsAfterReset).toBe(callsBeforeReset + 1);
    expect(onChange).toHaveBeenCalledTimes(callsAfterReset);
    expect(vi.getTimerCount()).toBe(0);

    const state = controller.getState();
    expect(state.moves).toBe(0);
    expect(state.flippedIds).toHaveLength(0);
    expect(state.cards.every((card) => !card.isFlipped && !card.isMatched)).toBe(true);
    expect(controller.isLocked()).toBe(false);
  });
});
