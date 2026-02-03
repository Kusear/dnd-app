import React from "react";

export function SidebarItemComponent() {
  const handleClick = () => {
    const canvas = document.getElementById(
      "game-area-canvas"
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    const background = new Image();
    background.src =
      "media:///Users/kusear/My-projects/my-new-app-typescript/assets/image.png";
    // background.src =
    //   "https://runefoundry.com/cdn/shop/products/ForestEncampment_digital_day_grid.jpg?v=1676584019&width=416";

    background.onload = () => {
      ctx.drawImage(background, 0, 0);
    };
  };

  return (
    <div className="sidebar-item">
      <button className="sidebar-item-button" onClick={handleClick}>
        Home
      </button>
      <div className="sidebar-item-text">Home</div>
    </div>
  );
}
