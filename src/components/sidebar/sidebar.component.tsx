import React, { useState } from "react";

// import { SidebarItemComponent } from "./sidebar-item.component";
import { SidebarButtonHomeComponent } from "./sidebar-buttons";
import { SidebarMapInputComponent } from "./map-input";
import { SidebarTokenPaletteComponent } from "./sidebar-token-palette.component";

export function SidebarComponent() {
  const [currentMap, setCurrentMap] = useState("");

  return (
    <div className="sidebar">
      <SidebarMapInputComponent
        currentMap={currentMap}
        setCurrentMap={setCurrentMap}
      />
      <SidebarButtonHomeComponent />
      <SidebarTokenPaletteComponent />
    </div>
  );
}
