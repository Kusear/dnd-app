import React from "react";

export function SidebarMapInputComponent({
  currentMap,
  setCurrentMap,
}: {
  currentMap: string;
  setCurrentMap: (map: string) => void;
}) {
  function mapUrlSelector(formData: FormData) {
    const query = formData.get("query");
    console.log("query", query);

    if (!query) {
      return;
    }

    setCurrentMap(query as string);

    const canvas = document.getElementById(
      "game-area-canvas"
    ) as HTMLCanvasElement;

    const ctx = canvas.getContext("2d");

    const background = new Image();
    background.src = query as string;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    background.onload = () => {
      ctx.drawImage(background, 0, 0);
    };
  }

  return (
    <div className="sidebar-map-input-container">
      <form id="map-url-form" action={mapUrlSelector}>
        <input id="map-url-input" name="query" placeholder="Enter map URL" />
        <button id="map-url-button" type="submit">
          Load
        </button>
      </form>
    </div>
  );
}
