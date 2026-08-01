export const CARD_SYMBOLS = [
  "🍎",
  "🐶",
  "🌙",
  "🚀",
  "🌻",
  "🎲",
  "🎵",
  "⚽",
] as const;

export type CardSymbol = (typeof CARD_SYMBOLS)[number];
export type GamePhase = "ready" | "one-selected" | "resolving" | "cleared";

export interface GameState {
  readonly deck: readonly CardSymbol[];
  readonly faceUp: readonly boolean[];
  readonly matched: readonly boolean[];
  readonly selected: readonly number[];
  readonly moves: number;
  readonly phase: GamePhase;
  readonly cleared: boolean;
}

export interface TimerApi {
  setTimeout(callback: () => void, delay: number): ReturnType<typeof setTimeout>;
  clearTimeout(timer: ReturnType<typeof setTimeout>): void;
}

const PAIR_COUNT = CARD_SYMBOLS.length;
const CARD_COUNT = PAIR_COUNT * 2;
const MISMATCH_DELAY_MS = 800;

const defaultTimers: TimerApi = {
  setTimeout(callback, delay) {
    return globalThis.setTimeout(callback, delay);
  },
  clearTimeout(timer) {
    globalThis.clearTimeout(timer);
  },
};

function shuffledDeck(): CardSymbol[] {
  const deck = CARD_SYMBOLS.flatMap((symbol) => [symbol, symbol]);

  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = deck[index];
    const replacement = deck[swapIndex];

    if (current === undefined || replacement === undefined) {
      throw new Error("Failed to shuffle the deck.");
    }

    deck[index] = replacement;
    deck[swapIndex] = current;
  }

  return deck;
}

function validateDeck(deck: readonly CardSymbol[]): void {
  if (deck.length !== CARD_COUNT) {
    throw new Error(`A deck must contain ${CARD_COUNT} cards.`);
  }

  for (const symbol of CARD_SYMBOLS) {
    if (deck.filter((card) => card === symbol).length !== 2) {
      throw new Error("A deck must contain exactly two of every card symbol.");
    }
  }
}

export function createGame(deck?: readonly CardSymbol[]): GameState {
  const cards = deck === undefined ? shuffledDeck() : [...deck];
  validateDeck(cards);

  return {
    deck: cards,
    faceUp: Array.from({ length: CARD_COUNT }, () => false),
    matched: Array.from({ length: CARD_COUNT }, () => false),
    selected: [],
    moves: 0,
    phase: "ready",
    cleared: false,
  };
}

function assertCardIndex(state: GameState, index: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= state.deck.length) {
    throw new RangeError(`Card index ${index} is out of range.`);
  }
}

function allMatched(matched: readonly boolean[]): boolean {
  return matched.every(Boolean);
}

export function selectCard(state: GameState, index: number): GameState {
  assertCardIndex(state, index);

  if (
    state.phase === "resolving" ||
    state.phase === "cleared" ||
    state.matched[index] ||
    state.faceUp[index]
  ) {
    return state;
  }

  const faceUp = [...state.faceUp];
  faceUp[index] = true;

  if (state.phase === "ready") {
    return {
      ...state,
      faceUp,
      selected: [index],
      phase: "one-selected",
    };
  }

  const firstIndex = state.selected[0];
  if (firstIndex === undefined) {
    throw new Error("A selected card is required in the one-selected phase.");
  }

  const moves = state.moves + 1;
  if (state.deck[firstIndex] === state.deck[index]) {
    const matched = [...state.matched];
    matched[firstIndex] = true;
    matched[index] = true;
    const cleared = allMatched(matched);

    return {
      ...state,
      faceUp,
      matched,
      selected: [],
      moves,
      phase: cleared ? "cleared" : "ready",
      cleared,
    };
  }

  return {
    ...state,
    faceUp,
    selected: [firstIndex, index],
    moves,
    phase: "resolving",
  };
}

export function resolveMismatch(state: GameState): GameState {
  if (state.phase !== "resolving") {
    return state;
  }

  const [firstIndex, secondIndex] = state.selected;
  if (firstIndex === undefined || secondIndex === undefined) {
    throw new Error("Two selected cards are required while resolving a mismatch.");
  }

  const faceUp = [...state.faceUp];
  faceUp[firstIndex] = false;
  faceUp[secondIndex] = false;

  return {
    ...state,
    faceUp,
    selected: [],
    phase: "ready",
  };
}

export class GameController {
  private state: GameState;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private generation = 0;
  private readonly listeners = new Set<(state: GameState) => void>();

  public constructor(
    deck?: readonly CardSymbol[],
    private readonly timers: TimerApi = defaultTimers,
  ) {
    this.state = createGame(deck);
  }

  public getState(): GameState {
    return this.state;
  }

  public subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  public selectCard(index: number): void {
    const nextState = selectCard(this.state, index);
    if (nextState === this.state) {
      return;
    }

    this.state = nextState;
    this.notify();

    if (this.state.phase === "resolving") {
      this.scheduleMismatchResolution();
    }
  }

  public reset(deck?: readonly CardSymbol[]): void {
    this.cancelTimer();
    this.generation += 1;
    this.state = createGame(deck);
    this.notify();
  }

  public destroy(): void {
    this.cancelTimer();
    this.listeners.clear();
  }

  private scheduleMismatchResolution(): void {
    const generation = this.generation;
    this.timer = this.timers.setTimeout(() => {
      this.timer = undefined;
      if (generation !== this.generation || this.state.phase !== "resolving") {
        return;
      }

      this.state = resolveMismatch(this.state);
      this.notify();
    }, MISMATCH_DELAY_MS);
  }

  private cancelTimer(): void {
    if (this.timer !== undefined) {
      this.timers.clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
