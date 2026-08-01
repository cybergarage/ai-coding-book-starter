export const CARD_SYMBOLS = ["🍎", "🍋", "🍇", "🍒", "🥝", "🍉", "🍓", "🍊"] as const;

export type CardStatus = "hidden" | "revealed" | "pending" | "matched";

export interface Card {
  readonly id: number;
  readonly symbol: string;
  status: CardStatus;
}

export interface GameState {
  readonly cards: readonly Card[];
  readonly moves: number;
  readonly locked: boolean;
  readonly complete: boolean;
  readonly selectedCardId: number | null;
}

type TimerId = ReturnType<typeof setTimeout>;

export class MemoryGame {
  private cards: Card[] = [];
  private moves = 0;
  private locked = false;
  private complete = false;
  private selectedCardId: number | null = null;
  private mismatchTimer: TimerId | null = null;
  private readonly onChange: () => void;

  constructor(deck?: readonly string[], onChange: () => void = () => undefined) {
    this.onChange = onChange;
    this.initialize(deck);
  }

  getState(): GameState {
    return {
      cards: this.cards.map((card) => ({ ...card })),
      moves: this.moves,
      locked: this.locked,
      complete: this.complete,
      selectedCardId: this.selectedCardId,
    };
  }

  selectCard(cardId: number): void {
    if (this.locked || this.complete) return;

    const card = this.cards.find((candidate) => candidate.id === cardId);
    if (card === undefined || card.status !== "hidden") return;

    if (this.selectedCardId === null) {
      card.status = "revealed";
      this.selectedCardId = card.id;
      this.onChange();
      return;
    }

    const firstCard = this.cards.find((candidate) => candidate.id === this.selectedCardId);
    if (firstCard === undefined) return;

    this.moves += 1;
    if (firstCard.symbol === card.symbol) {
      firstCard.status = "matched";
      card.status = "matched";
      this.selectedCardId = null;
      this.complete = this.cards.every((candidate) => candidate.status === "matched");
      this.onChange();
      return;
    }

    firstCard.status = "pending";
    card.status = "pending";
    this.locked = true;
    this.onChange();
    this.mismatchTimer = setTimeout(() => {
      firstCard.status = "hidden";
      card.status = "hidden";
      this.selectedCardId = null;
      this.locked = false;
      this.mismatchTimer = null;
      this.onChange();
    }, 800);
  }

  reset(deck?: readonly string[]): void {
    if (this.mismatchTimer !== null) {
      clearTimeout(this.mismatchTimer);
      this.mismatchTimer = null;
    }

    this.initialize(deck);
    this.onChange();
  }

  private initialize(deck?: readonly string[]): void {
    const symbols = deck === undefined ? shuffle([...CARD_SYMBOLS, ...CARD_SYMBOLS]) : [...deck];
    validateDeck(symbols);
    this.cards = symbols.map((symbol, id) => ({ id, symbol, status: "hidden" }));
    this.moves = 0;
    this.locked = false;
    this.complete = false;
    this.selectedCardId = null;
  }
}

function shuffle<T>(items: T[]): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[randomIndex]] = [items[randomIndex] as T, items[index] as T];
  }
  return items;
}

function validateDeck(deck: readonly string[]): void {
  if (deck.length !== 16) {
    throw new Error("The deck must contain exactly 16 cards.");
  }
}
