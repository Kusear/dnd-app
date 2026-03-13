import { GameTokenTemplate } from "./game-token-template.model";

export interface GameTokenInstance extends GameTokenTemplate {
  readonly id: number;
  readonly x: number;
  readonly y: number;
}
