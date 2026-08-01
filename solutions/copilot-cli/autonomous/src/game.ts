export const SYMBOLS = ["🍎", "🐶", "🚗", "⭐", "🎈", "🌈", "🎵", "⚽"] as const;

export type CardStatus = "face-down" | "face-up" | "pending" | "matched";

export interface Card {
  readonly id: number;
  readonly symbol: string;
  readonly status: CardStatus;
}

export interface GameState {
  readonly cards: readonly Card[];
  readonly moves: number;
  readonly inputLocked: boolean;
  readonly isCleared: boolean;
}

type StateListener = (state: GameState) => void;

const CARD_COUNT = 16;
const MISMATCH_DELAY = 800;

function createDeck(): string[] {
  return [...SYMBOLS, ...SYMBOLS];
}

function shuffle(deck: readonly string[]): string[] {
  const shuffled = [...deck];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = shuffled[index];
    const replacement = shuffled[swapIndex];

    if (current !== undefined && replacement !== undefined) {
      shuffled[index] = replacement;
      shuffled[swapIndex] = current;
    }
  }

  return shuffled;
}

function validateDeck(deck: readonly string[]): void {
  if (deck.length !== CARD_COUNT) {
    throw new Error("A deck must contain exactly 16 cards.");
  }

  for (const symbol of SYMBOLS) {
    if (deck.filter((cardSymbol) => cardSymbol === symbol).length !== 2) {
      throw new Error("A deck must contain each symbol exactly twice.");
    }
  }
}

export class MemoryGame {
  private state: GameState;
  private mismatchTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly listeners = new Set<StateListener>();

  public constructor(deck?: readonly string[]) {
    this.state = this.createInitialState(deck ?? shuffle(createDeck()));
  }

  public getState(): GameState {
    return this.state;
  }

  public selectCard(cardId: number): void {
    const card = this.state.cards[cardId];

    if (
      card === undefined ||
      this.state.inputLocked ||
      card.status !== "face-down" ||
      this.state.isCleared
    ) {
      return;
    }

    const faceUpCards = this.state.cards.filter((candidate) => candidate.status === "face-up");
    const cards = this.updateCardStatus(cardId, "face-up");

    if (faceUpCards.length === 0) {
      this.updateState({ ...this.state, cards });
      return;
    }

    const firstCard = faceUpCards[0];
    if (firstCard === undefined) {
      throw new Error("The first selected card was not found.");
    }

    if (firstCard.symbol === card.symbol) {
      this.updateState({
        ...this.state,
        cards: cards.map((candidate) =>
          candidate.status === "face-up" ? { ...candidate, status: "matched" } : candidate,
        ),
        moves: this.state.moves + 1,
        isCleared: cards.every(
          (candidate) =>
            candidate.status === "matched" ||
            candidate.id === firstCard.id ||
            candidate.id === cardId,
        ),
      });
      return;
    }

    this.updateState({
      ...this.state,
      cards: cards.map((candidate) =>
        candidate.status === "face-up" ? { ...candidate, status: "pending" } : candidate,
      ),
      moves: this.state.moves + 1,
      inputLocked: true,
    });
    this.mismatchTimer = setTimeout(() => {
      this.mismatchTimer = null;
      this.updateState({
        ...this.state,
        cards: this.state.cards.map((candidate) =>
          candidate.status === "pending" ? { ...candidate, status: "face-down" } : candidate,
        ),
        inputLocked: false,
      });
    }, MISMATCH_DELAY);
  }

  public reset(deck?: readonly string[]): void {
    this.clearMismatchTimer();
    this.updateState(this.createInitialState(deck ?? shuffle(createDeck())));
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private createInitialState(deck: readonly string[]): GameState {
    validateDeck(deck);
    return {
      cards: deck.map((symbol, id) => ({ id, symbol, status: "face-down" })),
      moves: 0,
      inputLocked: false,
      isCleared: false,
    };
  }

  private updateCardStatus(cardId: number, status: CardStatus): Card[] {
    return this.state.cards.map((card) => (card.id === cardId ? { ...card, status } : card));
  }

  private updateState(state: GameState): void {
    this.state = state;
    this.listeners.forEach((listener) => listener(this.state));
  }

  private clearMismatchTimer(): void {
    if (this.mismatchTimer !== null) {
      clearTimeout(this.mismatchTimer);
      this.mismatchTimer = null;
    }
  }
}
