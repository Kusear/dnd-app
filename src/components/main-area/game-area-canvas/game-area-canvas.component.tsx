import React, { useEffect, useRef } from "react";
import { handleCanvasRender } from "./rect-drawing.script";

export function GameAreaCanvasComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    handleCanvasRender(canvasRef);
  }, []);

  return (
    <div className="game-area-with-canvas">
      <canvas
        ref={canvasRef}
        id="game-area-canvas"
        className="game-area-canvas"
      ></canvas>
    </div>
  );
}
