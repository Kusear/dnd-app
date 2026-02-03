import React from "react";

import { MainAreaComponent } from "./main-area";
import { SidebarComponent } from "./sidebar";
import { GameComponent } from "./phaser-game/game";

export function AppComponent() {
  return (
    <div
      className="app-container"
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="top-bar">
        <h1>Top bar position (#TODO)</h1>
      </div>
      <div className="app">
        <SidebarComponent />
        <MainAreaComponent />
      </div>
    </div>
  );
}
