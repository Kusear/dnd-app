import React from "react";
import { GAME_AREA_DRAG_DATA_FORMAT } from "../main-area/game-area-canvas/models/game-area-drag-data-format.constant";
import { SidebarTokenDragPayload } from "../main-area/game-area-canvas/models/game-area-drag-payload.model";
import { GameTokenTemplate } from "../main-area/game-area-canvas/models/game-token-template.model";

const SIDEBAR_TOKEN_TEMPLATES: ReadonlyArray<GameTokenTemplate> = [
  { type: "hero", label: "Hero", width: 48, height: 48, color: "#1d4ed8" },
  {
    type: "monster",
    label: "Monster",
    width: 48,
    height: 48,
    color: "#b91c1c",
  },
  { type: "marker", label: "Marker", width: 40, height: 40, color: "#7c3aed" },
];

export function SidebarTokenPaletteComponent() {
  function handleTemplateDragStart(
    event: React.DragEvent<HTMLButtonElement>,
    template: GameTokenTemplate,
  ): void {
    const payload: SidebarTokenDragPayload = {
      payloadType: "sidebar-token-template",
      template,
    };
    event.dataTransfer.setData(
      GAME_AREA_DRAG_DATA_FORMAT,
      JSON.stringify(payload),
    );
    event.dataTransfer.effectAllowed = "copyMove";
  }

  return (
    <div className="sidebar-item sidebar-token-palette">
      {SIDEBAR_TOKEN_TEMPLATES.map((template: GameTokenTemplate) => (
        <button
          key={template.type}
          type="button"
          draggable={true}
          className="sidebar-token-item"
          onDragStart={(event: React.DragEvent<HTMLButtonElement>) =>
            handleTemplateDragStart(event, template)
          }
        >
          Drag {template.label}
        </button>
      ))}
    </div>
  );
}
