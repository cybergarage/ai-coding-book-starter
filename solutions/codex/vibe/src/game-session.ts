import { createGame, flipCard, hideUnmatched, type GameState } from "./game";

export const MISMATCH_DISPLAY_MS = 800;

export class GameSession {
  private game: GameState;
  private hideTimer: ReturnType<typeof setTimeout> | undefined;

  public constructor(
    deck: readonly string[] | undefined,
    private readonly onChange: (state: GameState) => void,
  ) {
    this.game = createGame({ deck });
  }

  public get state(): GameState {
    return this.game;
  }

  public select(cardId: number): void {
    const nextGame = flipCard(this.game, cardId);
    if (nextGame === this.game) return;

    this.game = nextGame;
    this.onChange(this.game);

    if (this.game.phase === "checking") {
      this.hideTimer = setTimeout(() => {
        this.game = hideUnmatched(this.game);
        this.hideTimer = undefined;
        this.onChange(this.game);
      }, MISMATCH_DISPLAY_MS);
    }
  }

  public reset(deck?: readonly string[]): void {
    if (this.hideTimer !== undefined) clearTimeout(this.hideTimer);
    this.hideTimer = undefined;
    this.game = createGame({ deck });
    this.onChange(this.game);
  }
}
