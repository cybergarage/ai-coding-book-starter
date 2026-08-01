import "./style.css";
import { createGameController, type GameController } from "./game-controller";
import { createShuffledGame, type Card, type Game } from "./game";

const appRoot = document.querySelector<HTMLElement>("#app");

if (appRoot === null) {
  throw new Error("Application root was not found.");
}

const app: HTMLElement = appRoot;
let controller: GameController;

function cardLabel(symbol: string): string {
  const labels: Record<string, string> = {
    apple: "りんご",
    balloon: "風船",
    cat: "ねこ",
    diamond: "ダイヤ",
    flower: "花",
    guitar: "ギター",
    heart: "ハート",
    star: "星",
  };

  return labels[symbol] ?? symbol;
}

function cardFace(symbol: string): string {
  const faces: Record<string, string> = {
    apple: "🍎",
    balloon: "🎈",
    cat: "🐈",
    diamond: "💎",
    flower: "🌼",
    guitar: "🎸",
    heart: "💗",
    star: "⭐",
  };

  return faces[symbol] ?? symbol;
}

function cardAriaLabel(card: Card, game: Game): string {
  if (card.isMatched) {
    return `${cardLabel(card.symbol)}のカード（一致済み）`;
  }

  if (!card.isFlipped) {
    return "裏向きのカード";
  }

  return game.phase === "resolving"
    ? `${cardLabel(card.symbol)}のカード（判定待ち）`
    : `${cardLabel(card.symbol)}のカード（表向き）`;
}

function render(): void {
  const game = controller.game;
  const status =
    game.phase === "won"
      ? `<p class="clear-message" role="status">ゲームクリア！ ${game.moves}手でそろえました。</p>`
      : `<p class="hint" id="game-hint">同じ絵柄のカードを2枚そろえよう</p>`;

  app.innerHTML = `
    <section class="game">
      <header class="game-header">
        <div>
          <p class="eyebrow">MEMORY GAME</p>
          <h1>神経衰弱</h1>
        </div>
        <div class="move-count" aria-label="手数">${game.moves}<span>手</span></div>
      </header>
      ${status}
      <div class="board" ${game.phase === "won" ? "" : 'aria-describedby="game-hint"'} aria-label="カードの一覧">
        ${game.cards
          .map((card) => {
            const isVisible = card.isFlipped || card.isMatched;
            const className = [
              "card",
              isVisible ? "is-flipped" : "",
              card.isMatched ? "is-matched" : "",
            ]
              .filter(Boolean)
              .join(" ");
            const label = cardAriaLabel(card, game);

            return `<button class="${className}" type="button" data-card-id="${card.id}" aria-label="${label}" ${
              game.phase === "resolving" || card.isMatched ? "disabled" : ""
            }><span aria-hidden="true">${isVisible ? cardFace(card.symbol) : "?"}</span></button>`;
          })
          .join("")}
      </div>
      <button class="reset-button" type="button" data-reset>もう一度あそぶ</button>
    </section>
  `;
}

app.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  if (target.closest<HTMLButtonElement>("[data-reset]") !== null) {
    controller.reset();
    return;
  }

  const card = target.closest<HTMLButtonElement>("[data-card-id]");
  if (card === null) {
    return;
  }

  const cardId = Number(card.dataset.cardId);
  controller.flip(cardId);
});

controller = createGameController(createShuffledGame(), createShuffledGame, render);
render();
