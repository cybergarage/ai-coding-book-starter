export const CARD_SYMBOLS = ["🍎", "🍋", "🍇", "🍓", "🥝", "🍒", "🍑", "🍍"] as const;

export type CardState = "face-down" | "single-face-up" | "pending-mismatch" | "matched";

export interface Card {
  readonly id: string;
  readonly symbol: string;
  readonly state: CardState;
}

export interface GameState {
  readonly cards: readonly Card[];
  readonly moves: number;
  readonly locked: boolean;
  readonly complete: boolean;
}

const MISMATCH_DELAY = 800;

function createDeck(): string[] {
  return CARD_SYMBOLS.flatMap((symbol) => [symbol, symbol]);
}

function shuffle(symbols: readonly string[]): string[] {
  const shuffled = [...symbols];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target]!, shuffled[index]!];
  }
  return shuffled;
}

export class MemoryGame {
  private cards: Card[] = [];
  private moves = 0;
  private firstIndex: number | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private generation = 0;

  public constructor(
    deck?: readonly string[],
    private readonly onChange: () => void = () => undefined,
  ) {
    this.start(deck);
  }

  public getState(): GameState {
    return {
      cards: this.cards.map((card) => ({ ...card })),
      moves: this.moves,
      locked: this.timer !== null,
      complete: this.cards.every((card) => card.state === "matched"),
    };
  }

  public select(index: number): void {
    const state = this.getState();
    const card = this.cards[index];
    if (
      card === undefined ||
      state.complete ||
      state.locked ||
      card.state !== "face-down"
    ) {
      return;
    }

    if (this.firstIndex === null) {
      this.cards[index] = { ...card, state: "single-face-up" };
      this.firstIndex = index;
      return;
    }

    const firstIndex = this.firstIndex;
    const firstCard = this.cards[firstIndex]!;
    this.moves += 1;
    this.firstIndex = null;

    if (firstCard.symbol === card.symbol) {
      this.cards[firstIndex] = { ...firstCard, state: "matched" };
      this.cards[index] = { ...card, state: "matched" };
      return;
    }

    this.cards[firstIndex] = { ...firstCard, state: "pending-mismatch" };
    this.cards[index] = { ...card, state: "pending-mismatch" };
    const currentGeneration = this.generation;
    this.timer = setTimeout(() => {
      if (currentGeneration !== this.generation) {
        return;
      }
      const pendingFirst = this.cards[firstIndex];
      const pendingSecond = this.cards[index];
      if (pendingFirst?.state === "pending-mismatch") {
        this.cards[firstIndex] = { ...pendingFirst, state: "face-down" };
      }
      if (pendingSecond?.state === "pending-mismatch") {
        this.cards[index] = { ...pendingSecond, state: "face-down" };
      }
      this.timer = null;
      this.onChange();
    }, MISMATCH_DELAY);
  }

  public reset(deck?: readonly string[]): void {
    this.generation += 1;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.start(deck);
  }

  private start(deck?: readonly string[]): void {
    const symbols = deck === undefined ? shuffle(createDeck()) : [...deck];
    this.cards = symbols.map((symbol, index) => ({
      id: `card-${index}`,
      symbol,
      state: "face-down",
    }));
    this.moves = 0;
    this.firstIndex = null;
  }
}
