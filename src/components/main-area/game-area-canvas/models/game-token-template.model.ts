export interface GameTokenTemplate {
  readonly type: "hero" | "monster" | "marker";
  readonly label: string;
  readonly width: number;
  readonly height: number;
  readonly color: `#${string}`;
}
