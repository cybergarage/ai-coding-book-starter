import { SYMBOLS } from "./symbols";

export function createOrderedSymbolIds(): string[] {
  return SYMBOLS.flatMap((symbol) => [symbol.id, symbol.id]);
}

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}

export function buildDeck(order?: readonly string[]): string[] {
  if (order !== undefined) {
    return [...order];
  }
  return shuffle(createOrderedSymbolIds());
}
