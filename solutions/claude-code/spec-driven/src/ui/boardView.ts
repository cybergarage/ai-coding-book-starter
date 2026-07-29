import type { GameController } from "../game/gameController";
import { findSymbol } from "../game/symbols";
import type { CardStatus, GameState } from "../game/types";

const GAME_TITLE = "神経衰弱";

function cardLabel(status: CardStatus, symbolName: string): string {
  switch (status) {
    case "hidden":
      return "カード, 裏向き";
    case "faceUp":
      return `カード, ${symbolName}`;
    case "pending":
      return `カード, ${symbolName}, 判定待ち`;
    case "matched":
      return `カード, ${symbolName}, 一致済み`;
  }
}

function cardContent(status: CardStatus, emoji: string): string {
  if (status === "hidden") {
    return "";
  }
  if (status === "matched") {
    return `${emoji} ✓`;
  }
  return emoji;
}

export function mountGame(root: HTMLElement, controller: GameController): void {
  root.innerHTML = `
    <section class="game" aria-labelledby="game-title">
      <h1 id="game-title">${GAME_TITLE}</h1>
      <p class="moves" aria-live="polite"></p>
      <div class="board" role="group" aria-label="カード盤面"></div>
      <button type="button" class="reset-button">リセット</button>
      <p class="clear-message" aria-live="polite"></p>
    </section>
  `;

  const movesEl = root.querySelector<HTMLParagraphElement>(".moves");
  const boardEl = root.querySelector<HTMLDivElement>(".board");
  const resetButton = root.querySelector<HTMLButtonElement>(".reset-button");
  const clearMessageEl = root.querySelector<HTMLParagraphElement>(
    ".clear-message",
  );

  if (
    movesEl === null ||
    boardEl === null ||
    resetButton === null ||
    clearMessageEl === null
  ) {
    throw new Error("Failed to build game view.");
  }

  const cardButtons: HTMLButtonElement[] = [];

  function render(state: GameState): void {
    movesEl!.textContent = `手数: ${state.moves}`;
    clearMessageEl!.textContent = state.isCleared
      ? `ゲームクリア！ 手数: ${state.moves}`
      : "";

    state.cards.forEach((card, index) => {
      const symbol = findSymbol(card.symbolId);
      let button = cardButtons[index];
      if (button === undefined) {
        button = document.createElement("button");
        button.type = "button";
        button.className = "card";
        button.addEventListener("click", () => controller.selectCard(index));
        cardButtons[index] = button;
        boardEl!.appendChild(button);
      }
      button.textContent = cardContent(card.status, symbol.emoji);
      button.setAttribute("aria-label", cardLabel(card.status, symbol.name));
      button.dataset.status = card.status;
      button.disabled = card.status === "matched" || state.isLocked;
    });
  }

  resetButton.addEventListener("click", () => controller.reset());

  controller.subscribe(render);
  render(controller.getState());
}
