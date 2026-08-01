import "./style.css";
import { MemoryGame, type Card } from "./game";

const app = document.querySelector<HTMLElement>("#app");

if (app === null) {
  throw new Error("Application root was not found.");
}

const root = app;
let game: MemoryGame;

function cardLabel(card: Card, index: number): string {
  const position = `カード${index + 1}`;
  switch (card.state) {
    case "face-down":
      return `${position}、裏向き`;
    case "single-face-up":
      return `${position}、${card.symbol}、表向き`;
    case "pending-mismatch":
      return `${position}、${card.symbol}、判定待ち`;
    case "matched":
      return `${position}、${card.symbol}、一致済み`;
  }
}

function render(): void {
  const state = game.getState();
  const cards = state.cards
    .map((card, index) => {
      const visible = card.state !== "face-down";
      const disabled = state.locked || card.state === "matched" || state.complete;
      return `
        <button
          class="card card--${card.state}"
          type="button"
          data-card-index="${index}"
          aria-label="${cardLabel(card, index)}"
          ${disabled ? "disabled" : ""}
        >
          <span aria-hidden="true">${visible ? card.symbol : "?"}</span>
        </button>
      `;
    })
    .join("");

  root.innerHTML = `
    <section class="game" aria-labelledby="game-title">
      <header class="game__header">
        <div>
          <p class="eyebrow">MEMORY GAME</p>
          <h1 id="game-title">絵文字 神経衰弱</h1>
        </div>
        <p class="moves" aria-live="polite">手数 <strong>${state.moves}</strong></p>
      </header>
      <div class="board" aria-label="神経衰弱のカード盤">${cards}</div>
      <div class="game__footer">
        <p class="result" role="status" aria-live="polite">
          ${state.complete ? `クリア！ 最終手数は${state.moves}手です。` : "同じ絵柄のペアを見つけましょう。"}
        </p>
        <button class="reset" type="button" data-reset>リセット</button>
      </div>
    </section>
  `;
}

game = new MemoryGame(undefined, render);
render();

root.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  if (target.closest<HTMLButtonElement>("[data-reset]") !== null) {
    game.reset();
    render();
    return;
  }

  const cardButton = target.closest<HTMLButtonElement>("[data-card-index]");
  if (cardButton === null) {
    return;
  }
  const index = Number(cardButton.dataset.cardIndex);
  game.select(index);
  render();
});
