import { GameTokenTemplate } from "./game-token-template.model";

export interface SidebarTokenDragPayload {
  readonly payloadType: "sidebar-token-template";
  readonly template: GameTokenTemplate;
}

export interface OverlayTokenDragPayload {
  readonly payloadType: "overlay-token-instance";
  readonly tokenId: string;
  readonly pointerOffsetX: number;
  readonly pointerOffsetY: number;
}

export type GameAreaDragPayload = SidebarTokenDragPayload | OverlayTokenDragPayload;
