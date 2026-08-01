import {
  MISMATCH_DELAY_MS,
  flipCard,
  hideMismatchedCards,
  type Game,
} from "./game";

type Timer = ReturnType<typeof setTimeout>;

type Timers = {
  readonly setTimeout: (callback: () => void, delay: number) => Timer;
  readonly clearTimeout: (timer: Timer) => void;
};

export type GameController = {
  readonly game: Game;
  flip: (cardId: number) => void;
  reset: () => void;
};

export function createGameController(
  initialGame: Game,
  createNewGame: () => Game,
  onChange: (game: Game) => void,
  timers: Timers = globalThis,
): GameController {
  let game = initialGame;
  let hideTimer: Timer | undefined;

  function notify(): void {
    onChange(game);
  }

  function clearPendingTimer(): void {
    if (hideTimer !== undefined) {
      timers.clearTimeout(hideTimer);
      hideTimer = undefined;
    }
  }

  return {
    get game(): Game {
      return game;
    },
    flip(cardId: number): void {
      game = flipCard(game, cardId);
      notify();

      if (game.phase !== "resolving") {
        return;
      }

      hideTimer = timers.setTimeout(() => {
        game = hideMismatchedCards(game);
        hideTimer = undefined;
        notify();
      }, MISMATCH_DELAY_MS);
    },
    reset(): void {
      clearPendingTimer();
      game = createNewGame();
      notify();
    },
  };
}
