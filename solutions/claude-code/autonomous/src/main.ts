import "./style.css";
import { MemoryGame } from "./game";
import { mountGame } from "./ui";

const app = document.querySelector<HTMLElement>("#app");

if (app === null) {
  throw new Error("Application root was not found.");
}

const game = new MemoryGame();
mountGame(app, game);
