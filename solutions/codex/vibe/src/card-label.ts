import type { Card } from "./game";

export function getCardLabel(card: Card): string {
  switch (card.status) {
    case "hidden":
      return "裏向きのカード";
    case "visible":
      return `表向きのカード、${card.symbol}`;
    case "matched":
      return `一致済みのカード、${card.symbol}`;
  }
}
