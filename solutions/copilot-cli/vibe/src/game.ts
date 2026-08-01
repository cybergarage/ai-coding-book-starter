export type Card = {
  readonly id: number;
  readonly symbol: string;
  readonly isFlipped: boolean;
  readonly isMatched: boolean;
};

export type CardSymbol =
  | "apple"
  | "balloon"
  | "cat"
  | "diamond"
  | "flower"
  | "guitar"
  | "heart"
  | "star";

export type Game = {
  readonly cards: readonly Card[];
  readonly moves: number;
  readonly phase: "first" | "resolving" | "won";
  readonly selectedIds: readonly number[];
};

export const MISMATCH_DELAY_MS = 800;

const symbols: readonly CardSymbol[] = [
  "apple",
  "balloon",
  "cat",
  "diamond",
  "flower",
  "guitar",
  "heart",
  "star",
];
const defaultDeck = symbols.flatMap((symbol) => [symbol, symbol]);

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!];
  }

  return shuffled;
}

export function createGame(deck: readonly CardSymbol[]): Game {
  if (deck.length !== 16) {
    throw new Error("A game deck must contain exactly 16 cards.");
  }

  return {
    cards: deck.map((symbol, id) => ({
      id,
      symbol,
      isFlipped: false,
      isMatched: false,
    })),
    moves: 0,
    phase: "first",
    selectedIds: [],
  };
}

export function createShuffledGame(random = Math.random): Game {
  return createGame(shuffle(defaultDeck, random));
}

export function flipCard(game: Game, cardId: number): Game {
  if (game.phase === "resolving" || game.phase === "won") {
    return game;
  }

  const card = game.cards.find((candidate) => candidate.id === cardId);
  if (card === undefined || card.isFlipped || card.isMatched) {
    return game;
  }

  const cards = game.cards.map((candidate) =>
    candidate.id === cardId ? { ...candidate, isFlipped: true } : candidate,
  );
  const selectedIds = [...game.selectedIds, cardId];

  if (selectedIds.length === 1) {
    return { ...game, cards, selectedIds };
  }

  const [firstId, secondId] = selectedIds;
  const first = cards.find((candidate) => candidate.id === firstId);
  const second = cards.find((candidate) => candidate.id === secondId);

  if (first === undefined || second === undefined) {
    throw new Error("Selected cards were not found.");
  }

  if (first.symbol !== second.symbol) {
    return { ...game, cards, moves: game.moves + 1, phase: "resolving", selectedIds };
  }

  const matchedCards = cards.map((candidate) =>
    selectedIds.includes(candidate.id) ? { ...candidate, isMatched: true } : candidate,
  );
  const isWon = matchedCards.every((candidate) => candidate.isMatched);

  return {
    ...game,
    cards: matchedCards,
    moves: game.moves + 1,
    phase: isWon ? "won" : "first",
    selectedIds: [],
  };
}

export function hideMismatchedCards(game: Game): Game {
  if (game.phase !== "resolving") {
    return game;
  }

  return {
    ...game,
    cards: game.cards.map((card) =>
      game.selectedIds.includes(card.id) ? { ...card, isFlipped: false } : card,
    ),
    phase: "first",
    selectedIds: [],
  };
}
