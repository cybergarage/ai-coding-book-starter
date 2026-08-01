import "./style.css";
import { MemoryGame, type Card, type GameState } from "./game";

const app = document.querySelector<HTMLElement>("#app");

if (app === null) {
  throw new Error("Application root was not found.");
}

const applicationRoot: HTMLElement = app;

const game = new MemoryGame();

function cardLabel(card: Card): string {
  switch (card.status) {
    case "face-down":
      return "裏向きのカード";
    case "face-up":
      return `${card.symbol}のカード、表向き`;
    case "pending":
      return `${card.symbol}のカード、判定待ち`;
    case "matched":
      return `${card.symbol}のカード、一致済み`;
  }
}

function render(state: GameState): void {
  const clearMessage = state.isCleared
    ? `<p class="clear-message" role="status">ゲームクリア！ ${state.moves}手でそろえました。</p>`
    : "";
  const cards = state.cards
    .map(
      (card) => `
        <button
          class="card card--${card.status}"
          type="button"
          data-card-id="${card.id}"
          aria-label="${cardLabel(card)}"
          ${state.inputLocked || card.status === "matched" ? "disabled" : ""}
        >
          <span aria-hidden="true">${card.status === "face-down" ? "?" : card.symbol}</span>
          <span class="card-status" aria-hidden="true">${
            card.status === "matched" ? "一致" : card.status === "face-down" ? "裏" : "表"
          }</span>
        </button>
      `,
    )
    .join("");

  applicationRoot.innerHTML = `
    <section class="game" aria-labelledby="game-title">
      <h1 id="game-title">神経衰弱</h1>
      <p class="moves" aria-live="polite">手数: <strong>${state.moves}</strong></p>
      ${clearMessage}
      <div class="card-grid" aria-label="カード一覧">${cards}</div>
      <button class="reset-button" type="button">リセット</button>
    </section>
  `;
}

app.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const cardButton = target.closest<HTMLButtonElement>("[data-card-id]");
  if (cardButton !== null) {
    const cardId = Number(cardButton.dataset.cardId);
    game.selectCard(cardId);
    return;
  }

  if (target.closest(".reset-button") !== null) {
    game.reset();
  }
});

game.subscribe(render);
render(game.getState());
