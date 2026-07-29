import {
  createGame,
  flipCard,
  isMatchPending,
  isResolving,
  resolveTurn,
  type CardValue,
  type GameState,
} from "./game";

export const MISMATCH_DELAY_MS = 800;

export interface GameControllerOptions {
  readonly values?: readonly CardValue[];
  readonly shuffleFn?: (items: readonly CardValue[]) => CardValue[];
}

export interface GameController {
  getState(): GameState;
  isLocked(): boolean;
  flip(id: number): void;
  reset(): void;
}

export function createGameController(
  onChange: (state: GameState) => void,
  options: GameControllerOptions = {},
): GameController {
  const { values, shuffleFn } = options;
  let state = createGame(values, shuffleFn);
  let locked = false;
  let pendingTimeoutId: ReturnType<typeof setTimeout> | undefined;

  function clearPendingTimeout(): void {
    if (pendingTimeoutId !== undefined) {
      clearTimeout(pendingTimeoutId);
      pendingTimeoutId = undefined;
    }
  }

  function flip(id: number): void {
    if (locked) {
      return;
    }
    state = flipCard(state, id);
    onChange(state);

    if (!isResolving(state)) {
      return;
    }

    if (isMatchPending(state)) {
      state = resolveTurn(state);
      onChange(state);
      return;
    }

    locked = true;
    pendingTimeoutId = setTimeout(() => {
      pendingTimeoutId = undefined;
      state = resolveTurn(state);
      locked = false;
      onChange(state);
    }, MISMATCH_DELAY_MS);
  }

  function reset(): void {
    clearPendingTimeout();
    locked = false;
    state = createGame(values, shuffleFn);
    onChange(state);
  }

  return {
    getState: () => state,
    isLocked: () => locked,
    flip,
    reset,
  };
}
