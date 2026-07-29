export type CardValue = string;

export interface Card {
  readonly id: number;
  readonly value: CardValue;
  readonly isFlipped: boolean;
  readonly isMatched: boolean;
}

export interface GameState {
  readonly cards: readonly Card[];
  readonly moves: number;
  readonly flippedIds: readonly number[];
}

export const CARD_VALUES: readonly CardValue[] = [
  "🍎",
  "🍌",
  "🍇",
  "🍉",
  "🍒",
  "🍑",
  "🍍",
  "🥝",
];

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = result[i];
    const b = result[j];
    if (a === undefined || b === undefined) {
      continue;
    }
    result[i] = b;
    result[j] = a;
  }
  return result;
}

export function createGame(
  values: readonly CardValue[] = CARD_VALUES,
  shuffleFn: (items: readonly CardValue[]) => CardValue[] = shuffle,
): GameState {
  const pairedValues = shuffleFn([...values, ...values]);
  const cards: Card[] = pairedValues.map((value, index) => ({
    id: index,
    value,
    isFlipped: false,
    isMatched: false,
  }));
  return { cards, moves: 0, flippedIds: [] };
}

export function isResolving(state: GameState): boolean {
  return state.flippedIds.length === 2;
}

export function flipCard(state: GameState, id: number): GameState {
  if (isResolving(state)) {
    return state;
  }
  const target = state.cards.find((card) => card.id === id);
  if (!target || target.isFlipped || target.isMatched) {
    return state;
  }
  const cards = state.cards.map((card) =>
    card.id === id ? { ...card, isFlipped: true } : card,
  );
  const flippedIds = [...state.flippedIds, id];
  const moves = flippedIds.length === 2 ? state.moves + 1 : state.moves;
  return { cards, moves, flippedIds };
}

function getFlippedPair(state: GameState): readonly [Card, Card] | undefined {
  if (!isResolving(state)) {
    return undefined;
  }
  const [firstId, secondId] = state.flippedIds;
  const first = state.cards.find((card) => card.id === firstId);
  const second = state.cards.find((card) => card.id === secondId);
  return first !== undefined && second !== undefined ? [first, second] : undefined;
}

export function isMatchPending(state: GameState): boolean {
  const pair = getFlippedPair(state);
  return pair !== undefined && pair[0].value === pair[1].value;
}

export function resolveTurn(state: GameState): GameState {
  const pair = getFlippedPair(state);
  if (pair === undefined) {
    return state;
  }
  const isMatch = pair[0].value === pair[1].value;
  const [firstId, secondId] = state.flippedIds;
  const cards = state.cards.map((card) => {
    if (card.id !== firstId && card.id !== secondId) {
      return card;
    }
    return isMatch ? { ...card, isMatched: true } : { ...card, isFlipped: false };
  });
  return { cards, moves: state.moves, flippedIds: [] };
}

export function isCleared(state: GameState): boolean {
  return state.cards.every((card) => card.isMatched);
}
