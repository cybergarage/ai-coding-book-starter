export interface Symbol {
  readonly id: string;
  readonly emoji: string;
  readonly name: string;
}

export const SYMBOLS: readonly Symbol[] = [
  { id: "apple", emoji: "🍎", name: "りんご" },
  { id: "banana", emoji: "🍌", name: "バナナ" },
  { id: "grapes", emoji: "🍇", name: "ぶどう" },
  { id: "watermelon", emoji: "🍉", name: "すいか" },
  { id: "cherries", emoji: "🍒", name: "さくらんぼ" },
  { id: "lemon", emoji: "🍋", name: "レモン" },
  { id: "strawberry", emoji: "🍓", name: "いちご" },
  { id: "peach", emoji: "🍑", name: "もも" },
];

export function findSymbol(symbolId: string): Symbol {
  const symbol = SYMBOLS.find((candidate) => candidate.id === symbolId);
  if (symbol === undefined) {
    throw new Error(`Unknown symbol id: ${symbolId}`);
  }
  return symbol;
}
