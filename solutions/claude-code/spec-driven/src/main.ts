import "./style.css";
import { GameController } from "./game/gameController";
import { mountGame } from "./ui/boardView";

const app = document.querySelector<HTMLElement>("#app");

if (app === null) {
  throw new Error("Application root was not found.");
}

const controller = new GameController();
mountGame(app, controller);
