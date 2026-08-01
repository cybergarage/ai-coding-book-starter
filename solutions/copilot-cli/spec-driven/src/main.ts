import "./style.css";

import { GameController, type GameState } from "./game";

const app = document.querySelector<HTMLElement>("#app");

if (app === null) {
  throw new Error("Application root was not found.");
}

const root = app;
const controller = new GameController();

function cardLabel(state: GameState, index: number): string {
  const position = index + 1;
  if (state.matched[index]) {
    return `カード ${position}: ${state.deck[index]}、一致済み`;
  }
  if (state.faceUp[index]) {
    const status = state.phase === "resolving" ? "判定待ち" : "表向き";
    return `カード ${position}: ${state.deck[index]}、${status}`;
  }
  return `カード ${position}: 裏向き`;
}

function render(state: GameState): void {
  const cards = state.deck
    .map((symbol, index) => {
      const isFaceUp = state.faceUp[index];
      const isMatched = state.matched[index];
      const status = isMatched ? "一致済み" : isFaceUp ? "表向き" : "裏向き";
      const disabled = state.phase === "cleared" ? " disabled" : "";

      return `
        <button
          class="card card--${isFaceUp ? "face-up" : "face-down"}${isMatched ? " card--matched" : ""}"
          type="button"
          data-card-index="${index}"
          aria-label="${cardLabel(state, index)}"
          aria-pressed="${isFaceUp}"
          ${disabled}
        >
          <span class="card__symbol" aria-hidden="true">${isFaceUp ? symbol : "?"}</span>
          <span class="card__status">${status}</span>
        </button>
      `;
    })
    .join("");

  const clearMessage = state.cleared
    ? `<p class="clear-message" role="status">ゲームクリア！ ${state.moves}手でそろえました。</p>`
    : "";

  root.innerHTML = `
    <section class="game" aria-labelledby="game-title">
      <header class="game__header">
        <h1 id="game-title">神経衰弱</h1>
        <p class="moves" aria-live="polite">手数: <strong>${state.moves}</strong></p>
      </header>
      ${clearMessage}
      <div class="board" aria-label="ゲーム盤">${cards}</div>
      <button class="reset-button" type="button">新しいゲーム</button>
    </section>
  `;

  for (const card of root.querySelectorAll<HTMLButtonElement>("[data-card-index]")) {
    card.addEventListener("click", () => {
      const index = Number(card.dataset.cardIndex);
      controller.selectCard(index);
    });
  }

  const resetButton = root.querySelector<HTMLButtonElement>(".reset-button");
  if (resetButton === null) {
    throw new Error("Reset button was not rendered.");
  }
  resetButton.addEventListener("click", () => controller.reset());
}

controller.subscribe(render);
