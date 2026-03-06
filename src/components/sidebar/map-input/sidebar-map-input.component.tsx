import React from "react";

interface DrawImageContainArguments {
  readonly imageWidth: number;
  readonly imageHeight: number;
  readonly areaWidth: number;
  readonly areaHeight: number;
}

interface DrawImageContainResult {
  readonly drawX: number;
  readonly drawY: number;
  readonly drawWidth: number;
  readonly drawHeight: number;
}

function calculateContainPlacement(
  args: DrawImageContainArguments,
): DrawImageContainResult {
  if (args.imageWidth <= 0 || args.imageHeight <= 0) {
    return { drawX: 0, drawY: 0, drawWidth: 0, drawHeight: 0 };
  }
  if (args.areaWidth <= 0 || args.areaHeight <= 0) {
    return { drawX: 0, drawY: 0, drawWidth: 0, drawHeight: 0 };
  }
  const widthRatio: number = args.areaWidth / args.imageWidth;
  const heightRatio: number = args.areaHeight / args.imageHeight;
  const scale: number = Math.min(widthRatio, heightRatio);
  const drawWidth: number = args.imageWidth * scale;
  const drawHeight: number = args.imageHeight * scale;
  const drawX: number = (args.areaWidth - drawWidth) / 2;
  const drawY: number = (args.areaHeight - drawHeight) / 2;
  return { drawX, drawY, drawWidth, drawHeight };
}

function drawMapImageToCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
): void {
  const devicePixelRatioValue: number = window.devicePixelRatio || 1;
  const areaWidth: number = canvas.clientWidth;
  const areaHeight: number = canvas.clientHeight;
  const bufferWidth: number = Math.max(
    1,
    Math.floor(areaWidth * devicePixelRatioValue),
  );
  const bufferHeight: number = Math.max(
    1,
    Math.floor(areaHeight * devicePixelRatioValue),
  );
  if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
    canvas.width = bufferWidth;
    canvas.height = bufferHeight;
  }
  ctx.setTransform(devicePixelRatioValue, 0, 0, devicePixelRatioValue, 0, 0);
  const containPlacement: DrawImageContainResult = calculateContainPlacement({
    imageWidth: image.naturalWidth,
    imageHeight: image.naturalHeight,
    areaWidth,
    areaHeight,
  });
  ctx.clearRect(0, 0, areaWidth, areaHeight);
  ctx.drawImage(
    image,
    containPlacement.drawX,
    containPlacement.drawY,
    containPlacement.drawWidth,
    containPlacement.drawHeight,
  );
}

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

    const canvas: HTMLCanvasElement | null = document.getElementById(
      "game-area-canvas",
    ) as HTMLCanvasElement | null;
    if (canvas === null) {
      return;
    }
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (ctx === null) {
      return;
    }

    const background = new Image();
    background.src = query as string;
    background.onload = () => {
      drawMapImageToCanvas(canvas, ctx, background);
    };
  }

  return (
    <div className="sidebar-map-input-container">
      <form id="map-url-form" action={mapUrlSelector}>
        <input
          id="map-url-input"
          name="query"
          placeholder="Enter map URL"
          defaultValue={currentMap}
        />
        <button id="map-url-button" type="submit">
          Load
        </button>
      </form>
    </div>
  );
}
