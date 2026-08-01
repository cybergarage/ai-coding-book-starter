import "./style.css";
import { getCardLabel } from "./card-label";
import { GameSession } from "./game-session";
import type { GameState } from "./game";

const app = document.querySelector<HTMLElement>("#app");
if (app === null) throw new Error("Application root was not found.");

app.innerHTML = `
  <section class="game" aria-labelledby="game-title">
    <header class="game__header">
      <div>
        <p class="eyebrow">MEMORY GAME</p>
        <h1 id="game-title">フルーツ神経衰弱</h1>
      </div>
      <button class="reset" type="button">もう一度</button>
    </header>
    <div class="status" aria-live="polite">
      <p><span>手数</span><strong id="moves">0</strong></p>
      <p id="message">同じフルーツを見つけよう</p>
    </div>
    <div class="board" role="grid" aria-label="4行4列のカード"></div>
  </section>
`;

const board = app.querySelector<HTMLElement>(".board")!;
const moves = app.querySelector<HTMLElement>("#moves")!;
const message = app.querySelector<HTMLElement>("#message")!;
const resetButton = app.querySelector<HTMLButtonElement>(".reset")!;

function render(game: GameState): void {
  moves.textContent = String(game.moves);
  message.textContent = game.phase === "complete" ? "クリア！ おめでとう 🎉" : "同じフルーツを見つけよう";
  message.classList.toggle("message--complete", game.phase === "complete");

  board.innerHTML = game.cards
    .map((card) => {
      const isOpen = card.status !== "hidden";
      const label = getCardLabel(card);
      return `
        <button class="card${isOpen ? " card--open" : ""}${card.status === "matched" ? " card--matched" : ""}"
          type="button" role="gridcell" data-card-id="${card.id}"
          aria-label="${label}" aria-pressed="${isOpen}" ${card.status === "matched" ? "disabled" : ""}>
          <span class="card__back" aria-hidden="true">✦</span>
          <span class="card__face" aria-hidden="true">${card.symbol}</span>
        </button>`;
    })
    .join("");
}

const session = new GameSession(undefined, render);

board.addEventListener("click", (event) => {
  const target = (event.target as Element).closest<HTMLButtonElement>("[data-card-id]");
  if (target === null) return;

  session.select(Number(target.dataset.cardId));
});

resetButton.addEventListener("click", () => {
  session.reset();
});

render(session.state);
