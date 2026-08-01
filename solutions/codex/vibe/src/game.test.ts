import { afterEach, describe, expect, it, vi } from "vitest";
import { getCardLabel } from "./card-label";
import { GameSession, MISMATCH_DISPLAY_MS } from "./game-session";
import { createGame, flipCard, hideUnmatched, SYMBOLS, type Card } from "./game";

const FIXED_DECK = ["🍓", "🍋", "🍓", "🍋"] as const;

afterEach(() => {
  vi.useRealTimers();
});

describe("memory game state", () => {
  it("creates eight shuffled pairs", () => {
    const game = createGame({ random: () => 0.5 });

    expect(game.cards).toHaveLength(16);
    for (const symbol of SYMBOLS) {
      expect(game.cards.filter((card) => card.symbol === symbol)).toHaveLength(2);
    }
    expect(game.moves).toBe(0);
  });

  it("uses a directly supplied deck order for initialization", () => {
    const game = createGame({ deck: FIXED_DECK });

    expect(game.cards.map((card) => card.symbol)).toEqual(FIXED_DECK);
  });

  it("counts a move and keeps a matching pair open", () => {
    const game = createGame({ deck: FIXED_DECK });
    const result = flipCard(flipCard(game, 0), 2);

    expect(result.moves).toBe(1);
    expect(result.cards.filter((card) => card.status === "matched")).toHaveLength(2);
    expect(result.phase).toBe("playing");
  });

  it("locks and then hides a mismatched pair", () => {
    const game = createGame({ deck: FIXED_DECK });
    const checking = flipCard(flipCard(game, 0), 1);
    const hidden = hideUnmatched(checking);

    expect(checking.phase).toBe("checking");
    expect(flipCard(checking, 2)).toBe(checking);
    expect(hidden.cards.every((card) => card.status === "hidden")).toBe(true);
    expect(hidden.moves).toBe(1);
  });

  it("keeps a mismatch face up for 800ms using fake timers", () => {
    vi.useFakeTimers();
    const session = new GameSession(FIXED_DECK, () => undefined);

    session.select(0);
    session.select(1);
    vi.advanceTimersByTime(MISMATCH_DISPLAY_MS - 1);
    expect(session.state.cards.slice(0, 2).every((card) => card.status === "visible")).toBe(true);

    vi.advanceTimersByTime(1);
    expect(session.state.cards.slice(0, 2).every((card) => card.status === "hidden")).toBe(true);
  });

  it("cancels the old timer on reset and keeps the new fixed game", () => {
    vi.useFakeTimers();
    const resetDeck = ["🍇", "🍇", "🍊", "🍊"] as const;
    const session = new GameSession(FIXED_DECK, () => undefined);

    session.select(0);
    session.select(1);
    session.reset(resetDeck);
    vi.advanceTimersByTime(MISMATCH_DISPLAY_MS);

    expect(session.state.cards.map((card) => card.symbol)).toEqual(resetDeck);
    expect(session.state.cards.every((card) => card.status === "hidden")).toBe(true);
    expect(session.state.moves).toBe(0);
    expect(session.state.phase).toBe("playing");
  });

  it("finishes when the final pair is matched", () => {
    let game = createGame({ deck: ["🍓", "🍓"] });
    game = flipCard(flipCard(game, 0), 1);

    expect(game.phase).toBe("complete");
    expect(game.moves).toBe(1);
  });
});

describe("assistive labels", () => {
  const card = (status: Card["status"]): Card => ({ id: 0, symbol: "🍓", status });

  it("does not reveal the symbol of a hidden card", () => {
    expect(getCardLabel(card("hidden"))).toBe("裏向きのカード");
    expect(getCardLabel(card("hidden"))).not.toContain("🍓");
  });

  it("distinguishes visible and matched cards", () => {
    expect(getCardLabel(card("visible"))).toBe("表向きのカード、🍓");
    expect(getCardLabel(card("matched"))).toBe("一致済みのカード、🍓");
  });
});
