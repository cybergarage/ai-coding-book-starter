import { buildDeck } from "./deck";
import type { Card, GameState } from "./types";

const MISMATCH_DELAY_MS = 800;

export type GameStateListener = (state: GameState) => void;

function createInitialState(deck?: readonly string[]): GameState {
  const symbolIds = buildDeck(deck);
  const cards: Card[] = symbolIds.map((symbolId, index) => ({
    id: index,
    symbolId,
    status: "hidden",
  }));
  return { cards, moves: 0, isCleared: false, isLocked: false };
}

export class GameController {
  private state: GameState;
  private pendingTimerId: ReturnType<typeof setTimeout> | null = null;
  private readonly listeners = new Set<GameStateListener>();

  constructor(deck?: readonly string[]) {
    this.state = createInitialState(deck);
  }

  getState(): GameState {
    return this.state;
  }

  subscribe(listener: GameStateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  selectCard(cardId: number): void {
    if (this.state.isLocked || this.state.isCleared) {
      return;
    }

    const target = this.state.cards.find((card) => card.id === cardId);
    if (target === undefined || target.status !== "hidden") {
      return;
    }

    const faceUpCards = this.state.cards.filter(
      (card) => card.status === "faceUp",
    );

    if (faceUpCards.length === 0) {
      this.setState({
        ...this.state,
        cards: this.replaceCard(target.id, { status: "faceUp" }),
      });
      return;
    }

    const firstCard = faceUpCards[0]!;
    const moves = this.state.moves + 1;

    if (firstCard.symbolId === target.symbolId) {
      const cards = this.state.cards.map((card) =>
        card.id === firstCard.id || card.id === target.id
          ? { ...card, status: "matched" as const }
          : card,
      );
      const isCleared = cards.every((card) => card.status === "matched");
      this.setState({ ...this.state, cards, moves, isCleared });
      return;
    }

    const cards = this.state.cards.map((card) =>
      card.id === firstCard.id || card.id === target.id
        ? { ...card, status: "pending" as const }
        : card,
    );
    this.setState({ ...this.state, cards, moves, isLocked: true });
    this.scheduleMismatchReset(firstCard.id, target.id);
  }

  reset(deck?: readonly string[]): void {
    this.clearPendingTimer();
    this.setState(createInitialState(deck));
  }

  private scheduleMismatchReset(firstId: number, secondId: number): void {
    this.pendingTimerId = setTimeout(() => {
      this.pendingTimerId = null;
      const cards = this.replaceCards([firstId, secondId], {
        status: "hidden",
      });
      this.setState({ ...this.state, cards, isLocked: false });
    }, MISMATCH_DELAY_MS);
  }

  private clearPendingTimer(): void {
    if (this.pendingTimerId !== null) {
      clearTimeout(this.pendingTimerId);
      this.pendingTimerId = null;
    }
  }

  private replaceCard(cardId: number, patch: Partial<Card>): Card[] {
    return this.replaceCards([cardId], patch);
  }

  private replaceCards(cardIds: readonly number[], patch: Partial<Card>): Card[] {
    return this.state.cards.map((card) =>
      cardIds.includes(card.id) ? { ...card, ...patch } : card,
    );
  }

  private setState(state: GameState): void {
    this.state = state;
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
