export type CardStatus = "hidden" | "faceUp" | "pending" | "matched";

export interface Card {
  readonly id: number;
  readonly symbolId: string;
  readonly status: CardStatus;
}

export interface GameState {
  readonly cards: readonly Card[];
  readonly moves: number;
  readonly isCleared: boolean;
  readonly isLocked: boolean;
}
