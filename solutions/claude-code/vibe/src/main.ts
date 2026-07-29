import "./style.css";
import { createGameController } from "./game-controller";
import { isCleared, type Card, type GameState } from "./game";

const appRoot = document.querySelector<HTMLElement>("#app");

if (appRoot === null) {
  throw new Error("Application root was not found.");
}

appRoot.innerHTML = `
  <section class="memory-game">
    <header class="memory-game__header">
      <h1>神経衰弱</h1>
      <div class="memory-game__status">
        <p class="memory-game__moves">手数: <strong id="moves">0</strong></p>
        <button id="reset" class="memory-game__reset" type="button">リセット</button>
      </div>
    </header>
    <p id="clear-message" class="memory-game__clear" hidden>クリア！おめでとうございます 🎉</p>
    <div id="board" class="memory-game__board" role="grid" aria-label="神経衰弱ボード"></div>
  </section>
`;

function requireElement<T extends Element>(element: T | null, selector: string): T {
  if (element === null) {
    throw new Error(`Required game element was not found: ${selector}`);
  }
  return element;
}

const boardEl = requireElement(appRoot.querySelector<HTMLElement>("#board"), "#board");
const movesEl = requireElement(appRoot.querySelector<HTMLElement>("#moves"), "#moves");
const clearMessageEl = requireElement(
  appRoot.querySelector<HTMLElement>("#clear-message"),
  "#clear-message",
);
const resetButton = requireElement(
  appRoot.querySelector<HTMLButtonElement>("#reset"),
  "#reset",
);

function cardLabel(card: Card): string {
  if (card.isMatched) {
    return `一致済みのカード: ${card.value}`;
  }
  if (card.isFlipped) {
    return `表向きのカード: ${card.value}`;
  }
  return "裏向きのカード";
}

function renderCard(card: Card): string {
  const revealed = card.isFlipped || card.isMatched;
  const classes = ["memory-game__card"];
  if (revealed) classes.push("is-revealed");
  if (card.isMatched) classes.push("is-matched");
  return `
    <button
      type="button"
      class="${classes.join(" ")}"
      data-id="${card.id}"
      aria-label="${cardLabel(card)}"
      ${revealed ? "disabled" : ""}
    >${revealed ? card.value : ""}</button>
  `;
}

function render(state: GameState): void {
  boardEl.innerHTML = state.cards.map(renderCard).join("");
  movesEl.textContent = String(state.moves);
  clearMessageEl.hidden = !isCleared(state);
}

const controller = createGameController(render);

boardEl.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }
  const target = event.target.closest<HTMLButtonElement>("[data-id]");
  if (!target || !target.dataset.id) {
    return;
  }
  controller.flip(Number(target.dataset.id));
});

resetButton.addEventListener("click", () => controller.reset());

render(controller.getState());
