import "./style.css";
import { MemoryGame } from "./game";
import type { Card } from "./game";

const app = document.querySelector<HTMLElement>("#app");

if (app === null) {
  throw new Error("Application root was not found.");
}

app.innerHTML = `
  <section class="game" aria-labelledby="game-title">
    <header class="game__header">
      <div>
        <p class="eyebrow">MEMORY GAME</p>
        <h1 id="game-title">神経衰弱</h1>
      </div>
      <p class="moves" aria-live="polite">手数 <strong id="moves">0</strong></p>
    </header>
    <p id="message" class="message" aria-live="polite"></p>
    <div id="board" class="board" aria-label="カード盤"></div>
    <button id="reset" class="reset" type="button">もう一度遊ぶ</button>
  </section>
`;

const board = requireElement<HTMLDivElement>("#board");
const moves = requireElement<HTMLElement>("#moves");
const message = requireElement<HTMLElement>("#message");
const reset = requireElement<HTMLButtonElement>("#reset");
const game = new MemoryGame(undefined, render);

board.addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-card-id]");
  if (button !== null) game.selectCard(Number(button.dataset.cardId));
});

reset.addEventListener("click", () => game.reset());
render();

function render(): void {
  const state = game.getState();
  moves.textContent = String(state.moves);
  message.textContent = state.complete ? `ゲームクリア！ ${state.moves}手で完成しました。` : "";
  board.setAttribute("aria-busy", String(state.locked));
  board.innerHTML = state.cards.map(cardMarkup).join("");
}

function cardMarkup(card: Card): string {
  const visible = card.status !== "hidden";
  const label = card.status === "hidden"
    ? `カード ${card.id + 1}、裏向き`
    : card.status === "matched"
      ? `カード ${card.id + 1}、${card.symbol}、一致済み`
      : `カード ${card.id + 1}、${card.symbol}、表向き`;
  return `<button class="card card--${card.status}" type="button" data-card-id="${card.id}" aria-label="${label}" ${card.status === "matched" ? "disabled" : ""}><span aria-hidden="true">${visible ? card.symbol : "?"}</span></button>`;
}

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (element === null) throw new Error(`Element not found: ${selector}`);
  return element;
}
