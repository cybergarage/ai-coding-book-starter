export type Card = {
  id: number;
  symbol: string;
  status: "hidden" | "visible" | "matched";
};

export type GameState = {
  cards: Card[];
  moves: number;
  phase: "playing" | "checking" | "complete";
};

export const SYMBOLS = ["🍓", "🍋", "🥝", "🍇", "🍒", "🫐", "🍊", "🍉"];

export type GameOptions = {
  deck?: readonly string[];
  random?: () => number;
};

export function createGame(options: GameOptions = {}): GameState {
  const symbols = options.deck === undefined
    ? [...SYMBOLS, ...SYMBOLS]
    : [...options.deck];
  const random = options.random ?? Math.random;

  if (options.deck === undefined) {
    for (let index = symbols.length - 1; index > 0; index -= 1) {
      const target = Math.floor(random() * (index + 1));
      const currentSymbol = symbols[index]!;
      symbols[index] = symbols[target]!;
      symbols[target] = currentSymbol;
    }
  }

  return {
    cards: symbols.map((symbol, id) => ({ id, symbol, status: "hidden" })),
    moves: 0,
    phase: "playing",
  };
}

export function flipCard(state: GameState, cardId: number): GameState {
  if (state.phase !== "playing") return state;

  const card = state.cards.find((candidate) => candidate.id === cardId);
  if (card === undefined || card.status !== "hidden") return state;

  const cards = state.cards.map((candidate) =>
    candidate.id === cardId ? { ...candidate, status: "visible" as const } : candidate,
  );
  const visibleCards = cards.filter((candidate) => candidate.status === "visible");

  if (visibleCards.length < 2) return { ...state, cards };

  const isMatch = visibleCards[0]!.symbol === visibleCards[1]!.symbol;
  const resolvedCards = isMatch
    ? cards.map((candidate) =>
        candidate.status === "visible" ? { ...candidate, status: "matched" as const } : candidate,
      )
    : cards;
  const isComplete = resolvedCards.every((candidate) => candidate.status === "matched");

  return {
    cards: resolvedCards,
    moves: state.moves + 1,
    phase: isComplete ? "complete" : isMatch ? "playing" : "checking",
  };
}

export function hideUnmatched(state: GameState): GameState {
  if (state.phase !== "checking") return state;

  return {
    ...state,
    cards: state.cards.map((card) =>
      card.status === "visible" ? { ...card, status: "hidden" } : card,
    ),
    phase: "playing",
  };
}
