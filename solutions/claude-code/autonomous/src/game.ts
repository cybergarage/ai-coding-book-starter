export const SYMBOLS: readonly string[] = [
  "🍎",
  "🍌",
  "🍇",
  "🍉",
  "🍒",
  "🍑",
  "🍋",
  "🍓",
];

export type CardStatus = "hidden" | "revealed" | "pending" | "matched";

export interface Card {
  readonly id: number;
  readonly symbol: string;
  readonly status: CardStatus;
}

export interface GameSnapshot {
  readonly cards: readonly Card[];
  readonly moves: number;
  readonly locked: boolean;
  readonly cleared: boolean;
}

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = result[i] as T;
    const b = result[j] as T;
    result[i] = b;
    result[j] = a;
  }
  return result;
}

function buildSymbolOrder(deck?: readonly string[]): string[] {
  if (deck) {
    return [...deck];
  }
  return shuffle([...SYMBOLS, ...SYMBOLS]);
}

interface MutableCard {
  id: number;
  symbol: string;
  status: CardStatus;
}

export class MemoryGame {
  private cards: MutableCard[];
  private moves = 0;
  private locked = false;
  private cleared = false;
  private firstIndex: number | null = null;
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly listeners = new Set<() => void>();

  constructor(deck?: readonly string[]) {
    this.cards = buildSymbolOrder(deck).map((symbol, id) => ({
      id,
      symbol,
      status: "hidden" as const,
    }));
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  getState(): GameSnapshot {
    return {
      cards: this.cards.map((card) => ({ ...card })),
      moves: this.moves,
      locked: this.locked,
      cleared: this.cleared,
    };
  }

  selectCard(index: number): void {
    if (this.locked) {
      return;
    }

    const card = this.cards[index];
    if (!card || card.status !== "hidden") {
      return;
    }

    if (this.firstIndex === null) {
      card.status = "revealed";
      this.firstIndex = index;
      this.notify();
      return;
    }

    const firstIndex = this.firstIndex;
    const firstCard = this.cards[firstIndex] as MutableCard;

    card.status = "revealed";
    this.moves += 1;
    this.firstIndex = null;

    if (firstCard.symbol === card.symbol) {
      firstCard.status = "matched";
      card.status = "matched";
      this.cleared = this.cards.every((c) => c.status === "matched");
      this.notify();
      return;
    }

    firstCard.status = "pending";
    card.status = "pending";
    this.locked = true;
    this.pendingTimer = setTimeout(() => {
      firstCard.status = "hidden";
      card.status = "hidden";
      this.locked = false;
      this.pendingTimer = null;
      this.notify();
    }, 800);
    this.notify();
  }

  reset(deck?: readonly string[]): void {
    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
    this.cards = buildSymbolOrder(deck).map((symbol, id) => ({
      id,
      symbol,
      status: "hidden" as const,
    }));
    this.moves = 0;
    this.locked = false;
    this.cleared = false;
    this.firstIndex = null;
    this.notify();
  }
}
