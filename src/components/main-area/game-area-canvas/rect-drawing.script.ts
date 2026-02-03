import React from "react";

export function DrawRect(ctx: CanvasRenderingContext2D) {
  let firstPoint: { x: number; y: number } = { x: 0, y: 0 };
  let secondPoint: { x: number; y: number } = { x: 0, y: 0 };

  const clearPoints = () => {
    firstPoint = { x: 0, y: 0 };
    secondPoint = { x: 0, y: 0 };
  };

  return {
    rememberPoint: (x: number, y: number) => {
      if (firstPoint.x === 0 && firstPoint.y === 0) {
        firstPoint = { x, y };
      } else {
        secondPoint = { x, y };
      }
    },
    draw: (style: `#${string}` = "#242222") => {
      ctx.fillStyle = style;
      ctx.fillRect(
        firstPoint.x,
        firstPoint.y,
        secondPoint.x - firstPoint.x,
        secondPoint.y - firstPoint.y
      );
      clearPoints();
    },
    isRectReady: () => {
      return (
        firstPoint.x !== 0 &&
        firstPoint.y !== 0 &&
        secondPoint.x !== 0 &&
        secondPoint.y !== 0
      );
    },
  };
}

export function handleCanvasRender(
  canvasRef: React.RefObject<HTMLCanvasElement>
) {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  const drawRectInstance = DrawRect(ctx);

  canvas.addEventListener(
    "click",
    (event: PointerEvent) => {
      event.stopPropagation();

      const rect = canvas.getBoundingClientRect();

      // const x = event.clientX - rect.left;
      const x = event.offsetX;
      // const y = event.clientY - rect.top;
      const y = event.offsetY;
      console.log(x, y);

      drawRectInstance.rememberPoint(x, y);
      if (drawRectInstance.isRectReady()) {
        drawRectInstance.draw();
      }
      console.log("click event", event);
    },
    { capture: true }
  );

  canvas.addEventListener("mousedown", (event) => {
    console.log("mousedown event", event);
  });

  //Our first draw
  ctx.fillStyle = "#000000";

  const scale = window.devicePixelRatio;
  canvas.width = window.innerWidth * scale; // Actual pixel width
  canvas.height = window.innerHeight * scale; // Actual pixel height
  ctx.scale(scale, scale);
}
