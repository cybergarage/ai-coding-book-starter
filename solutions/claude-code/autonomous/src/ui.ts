import type { Card, MemoryGame } from "./game";

const STATUS_TEXT: Record<Card["status"], string> = {
  hidden: "裏向き",
  revealed: "表向き",
  pending: "判定待ち",
  matched: "一致",
};

function cardLabel(card: Card): string {
  if (card.status === "hidden") {
    return `${STATUS_TEXT.hidden}のカード`;
  }
  return `${STATUS_TEXT[card.status]}のカード: ${card.symbol}`;
}

export function mountGame(root: HTMLElement, game: MemoryGame): void {
  root.innerHTML = `
    <section class="memory-game">
      <p class="eyebrow">MEMORY GAME</p>
      <h1>神経衰弱</h1>
      <p class="status-line">手数: <strong data-moves>0</strong></p>
      <div class="board" role="grid" aria-label="カード盤面" data-board></div>
      <button type="button" class="reset" data-reset>リセット</button>
      <p class="clear-message" data-clear hidden>
        ゲームクリア！ 最終手数: <strong data-clear-moves></strong>
      </p>
    </section>
  `;

  const boardRef = root.querySelector<HTMLDivElement>("[data-board]");
  const movesRef = root.querySelector<HTMLElement>("[data-moves]");
  const resetRef = root.querySelector<HTMLButtonElement>("[data-reset]");
  const clearRef = root.querySelector<HTMLElement>("[data-clear]");
  const clearMovesRef = root.querySelector<HTMLElement>("[data-clear-moves]");

  if (!boardRef || !movesRef || !resetRef || !clearRef || !clearMovesRef) {
    throw new Error("Failed to initialize game DOM.");
  }

  const board = boardRef;
  const movesEl = movesRef;
  const resetButton = resetRef;
  const clearEl = clearRef;
  const clearMovesEl = clearMovesRef;

  function render(): void {
    const state = game.getState();

    board.innerHTML = "";
    state.cards.forEach((card, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `card card--${card.status}`;
      button.setAttribute("aria-label", cardLabel(card));
      button.disabled = card.status === "matched" || state.locked;
      button.textContent = card.status === "hidden" ? "" : card.symbol;
      button.addEventListener("click", () => game.selectCard(index));
      board.appendChild(button);
    });

    movesEl.textContent = String(state.moves);

    clearEl.hidden = !state.cleared;
    if (state.cleared) {
      clearMovesEl.textContent = String(state.moves);
    }
  }

  resetButton.addEventListener("click", () => game.reset());
  game.subscribe(render);
  render();
}
