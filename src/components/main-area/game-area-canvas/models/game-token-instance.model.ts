import { GameTokenTemplate } from "./game-token-template.model";

export interface GameTokenInstance extends GameTokenTemplate {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}
