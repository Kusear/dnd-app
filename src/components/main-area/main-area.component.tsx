import React from "react";

import { GameAreaCanvasComponent } from "./game-area-canvas";
// import { GameComponent } from "../phaser-game/game";

export function MainAreaComponent() {
  return (
    <div id="id-game-area" className="main-area">
      <GameAreaCanvasComponent />
      {/* <GameComponent /> */}
    </div>
  );
}
