import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  GameAreaDragPayload,
  OverlayTokenDragPayload,
  SidebarTokenDragPayload,
} from "./models/game-area-drag-payload.model";
import { GAME_AREA_DRAG_DATA_FORMAT } from "./models/game-area-drag-data-format.constant";
import { GameTokenInstance } from "./models/game-token-instance.model";

const DEFAULT_OVERLAY_Z_INDEX = 1;
const ACTIVE_OVERLAY_Z_INDEX = 2;
const MIN_TOKEN_SIZE = 24;
const MAX_TOKEN_SIZE = 120;
const DEFAULT_CANVAS_ZOOM = 1;
const MIN_CANVAS_ZOOM = 0.5;
const MAX_CANVAS_ZOOM = 2;
const CANVAS_ZOOM_STEP = 0.1;
const TOKEN_COLOR_PALETTE: ReadonlyArray<`#${string}`> = [
  "#1d4ed8",
  "#b91c1c",
  "#7c3aed",
  "#0f766e",
  "#ca8a04",
  "#111827",
];

interface OverlaySize {
  readonly width: number;
  readonly height: number;
}

interface CanvasPanState {
  readonly x: number;
  readonly y: number;
}

interface CanvasPanStart {
  readonly pointerX: number;
  readonly pointerY: number;
  readonly originX: number;
  readonly originY: number;
}

function generateTokenId(): string {
  // if ("randomUUID" in globalThis.crypto) {
  //   return globalThis.crypto.randomUUID();
  // }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isSidebarTokenDragPayload(
  payload: unknown,
): payload is SidebarTokenDragPayload {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }
  const payloadCandidate: Partial<SidebarTokenDragPayload> =
    payload as Partial<SidebarTokenDragPayload>;
  const templateCandidate: unknown = payloadCandidate.template;
  if (payloadCandidate.payloadType !== "sidebar-token-template") {
    return false;
  }
  if (typeof templateCandidate !== "object" || templateCandidate === null) {
    return false;
  }
  const templateRecord: Record<string, unknown> = templateCandidate as Record<
    string,
    unknown
  >;
  return (
    typeof templateRecord.type === "string" &&
    typeof templateRecord.label === "string" &&
    typeof templateRecord.width === "number" &&
    typeof templateRecord.height === "number" &&
    typeof templateRecord.color === "string"
  );
}

function isOverlayTokenDragPayload(
  payload: unknown,
): payload is OverlayTokenDragPayload {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }
  const payloadCandidate: Partial<OverlayTokenDragPayload> =
    payload as Partial<OverlayTokenDragPayload>;
  return (
    payloadCandidate.payloadType === "overlay-token-instance" &&
    typeof payloadCandidate.tokenId === "string" &&
    typeof payloadCandidate.pointerOffsetX === "number" &&
    typeof payloadCandidate.pointerOffsetY === "number"
  );
}

function readDragPayload(
  dataTransfer: DataTransfer,
): GameAreaDragPayload | null {
  const serializedPayload: string = dataTransfer.getData(
    GAME_AREA_DRAG_DATA_FORMAT,
  );
  if (serializedPayload.length === 0) {
    return null;
  }
  try {
    const parsedPayload: unknown = JSON.parse(serializedPayload);
    if (isSidebarTokenDragPayload(parsedPayload)) {
      return parsedPayload;
    }
    if (isOverlayTokenDragPayload(parsedPayload)) {
      return parsedPayload;
    }
    return null;
  } catch {
    return null;
  }
}

function clampTokenPosition(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

function calculateBoundedPosition(args: {
  readonly areaWidth: number;
  readonly areaHeight: number;
  readonly tokenWidth: number;
  readonly tokenHeight: number;
  readonly proposedX: number;
  readonly proposedY: number;
}): { readonly x: number; readonly y: number } {
  const maxAllowedX: number = Math.max(0, args.areaWidth - args.tokenWidth);
  const maxAllowedY: number = Math.max(0, args.areaHeight - args.tokenHeight);
  const x: number = clampTokenPosition(args.proposedX, 0, maxAllowedX);
  const y: number = clampTokenPosition(args.proposedY, 0, maxAllowedY);
  return { x, y };
}

function getNextCanvasZoom(currentZoom: number, delta: number): number {
  const nextZoom: number = currentZoom + delta;
  return clampTokenPosition(nextZoom, MIN_CANVAS_ZOOM, MAX_CANVAS_ZOOM);
}

function scaleTokenPositionForResize(args: {
  readonly token: GameTokenInstance;
  readonly previousSize: OverlaySize;
  readonly nextSize: OverlaySize;
}): GameTokenInstance {
  const safePreviousWidth: number = Math.max(args.previousSize.width, 1);
  const safePreviousHeight: number = Math.max(args.previousSize.height, 1);
  const widthRatio: number = args.nextSize.width / safePreviousWidth;
  const heightRatio: number = args.nextSize.height / safePreviousHeight;
  const scaledX: number = args.token.x * widthRatio;
  const scaledY: number = args.token.y * heightRatio;
  const boundedPosition: { readonly x: number; readonly y: number } =
    calculateBoundedPosition({
      areaWidth: args.nextSize.width,
      areaHeight: args.nextSize.height,
      tokenWidth: args.token.width,
      tokenHeight: args.token.height,
      proposedX: scaledX,
      proposedY: scaledY,
    });
  return { ...args.token, x: boundedPosition.x, y: boundedPosition.y };
}

function syncCanvasBufferSize(canvas: HTMLCanvasElement): void {
  const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
  if (ctx === null) {
    return;
  }
  const devicePixelRatioValue: number = window.devicePixelRatio || 1;
  const nextBufferWidth: number = Math.max(
    1,
    Math.floor(canvas.clientWidth * devicePixelRatioValue),
  );
  const nextBufferHeight: number = Math.max(
    1,
    Math.floor(canvas.clientHeight * devicePixelRatioValue),
  );
  if (canvas.width !== nextBufferWidth || canvas.height !== nextBufferHeight) {
    canvas.width = nextBufferWidth;
    canvas.height = nextBufferHeight;
  }
  ctx.setTransform(devicePixelRatioValue, 0, 0, devicePixelRatioValue, 0, 0);
}

function clampCanvasPanByArea(args: {
  readonly pan: CanvasPanState;
  readonly areaSize: OverlaySize;
  readonly zoom: number;
}): CanvasPanState {
  const scaledCanvasWidth: number = args.areaSize.width * args.zoom;
  const scaledCanvasHeight: number = args.areaSize.height * args.zoom;
  const minPanX: number = Math.min(0, args.areaSize.width - scaledCanvasWidth);
  const maxPanX: number = Math.max(0, args.areaSize.width - scaledCanvasWidth);
  const minPanY: number = Math.min(
    0,
    args.areaSize.height - scaledCanvasHeight,
  );
  const maxPanY: number = Math.max(
    0,
    args.areaSize.height - scaledCanvasHeight,
  );
  return {
    x: clampTokenPosition(args.pan.x, minPanX, maxPanX),
    y: clampTokenPosition(args.pan.y, minPanY, maxPanY),
  };
}

function convertScreenPositionToWorld(args: {
  readonly clientX: number;
  readonly clientY: number;
  readonly overlayBounds: DOMRect;
  readonly pan: CanvasPanState;
  readonly zoom: number;
}): { readonly x: number; readonly y: number } {
  const localX: number = args.clientX - args.overlayBounds.left;
  const localY: number = args.clientY - args.overlayBounds.top;
  return {
    x: (localX - args.pan.x) / args.zoom,
    y: (localY - args.pan.y) / args.zoom,
  };
}

export function GameAreaCanvasComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousOverlaySizeRef = useRef<OverlaySize | null>(null);
  const [tokens, setTokens] = useState<ReadonlyArray<GameTokenInstance>>([]);
  const [draggedTokenId, setDraggedTokenId] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [isTrashHighlighted, setIsTrashHighlighted] = useState<boolean>(false);
  const [canvasZoom, setCanvasZoom] = useState<number>(DEFAULT_CANVAS_ZOOM);
  const [canvasPan, setCanvasPan] = useState<CanvasPanState>({ x: 0, y: 0 });
  const [isPanningCanvas, setIsPanningCanvas] = useState<boolean>(false);
  const panStartRef = useRef<CanvasPanStart | null>(null);

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }
    syncCanvasBufferSize(canvasRef.current);
  }, []);

  useEffect(() => {
    const overlayElement: HTMLDivElement | null = overlayRef.current;
    if (overlayElement === null) {
      return;
    }
    const resizeObserver: ResizeObserver = new ResizeObserver(
      (entries: ReadonlyArray<ResizeObserverEntry>): void => {
        const entry: ResizeObserverEntry | undefined = entries[0];
        if (entry === undefined) {
          return;
        }
        const nextSize: OverlaySize = {
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        };
        const previousSize: OverlaySize | null = previousOverlaySizeRef.current;
        if (previousSize !== null) {
          setTokens((previousTokens: ReadonlyArray<GameTokenInstance>) =>
            previousTokens.map((token: GameTokenInstance) =>
              scaleTokenPositionForResize({
                token,
                previousSize,
                nextSize,
              }),
            ),
          );
        }
        setCanvasPan((previousPan: CanvasPanState) =>
          clampCanvasPanByArea({
            pan: previousPan,
            areaSize: nextSize,
            zoom: canvasZoom,
          }),
        );
        previousOverlaySizeRef.current = nextSize;
      },
    );
    resizeObserver.observe(overlayElement);
    return () => {
      resizeObserver.disconnect();
    };
  }, [canvasZoom]);

  const selectedToken: GameTokenInstance | null =
    useMemo((): GameTokenInstance | null => {
      if (selectedTokenId === null) {
        return null;
      }
      return (
        tokens.find(
          (token: GameTokenInstance) => token.id === selectedTokenId,
        ) ?? null
      );
    }, [selectedTokenId, tokens]);

  function updateSelectedToken(
    updater: (
      token: GameTokenInstance,
      areaSize: OverlaySize,
    ) => GameTokenInstance,
  ): void {
    if (selectedTokenId === null || overlayRef.current === null) {
      return;
    }
    const areaBounds: DOMRect = overlayRef.current.getBoundingClientRect();
    const areaSize: OverlaySize = {
      width: areaBounds.width,
      height: areaBounds.height,
    };
    setTokens((previousTokens: ReadonlyArray<GameTokenInstance>) =>
      previousTokens.map((token: GameTokenInstance) => {
        if (token.id !== selectedTokenId) {
          return token;
        }
        return updater(token, areaSize);
      }),
    );
  }

  function handleAreaDragOver(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleAreaDrop(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    const overlayElement: HTMLDivElement | null = overlayRef.current;
    if (overlayElement === null) {
      return;
    }
    const dragPayload: GameAreaDragPayload | null = readDragPayload(
      event.dataTransfer,
    );
    if (dragPayload === null) {
      return;
    }
    const overlayBounds: DOMRect = overlayElement.getBoundingClientRect();
    if (dragPayload.payloadType === "sidebar-token-template") {
      const worldDropCoordinates: { readonly x: number; readonly y: number } =
        convertScreenPositionToWorld({
          clientX: event.clientX,
          clientY: event.clientY,
          overlayBounds,
          pan: canvasPan,
          zoom: canvasZoom,
        });
      const centeredX: number =
        worldDropCoordinates.x - dragPayload.template.width / 2;
      const centeredY: number =
        worldDropCoordinates.y - dragPayload.template.height / 2;
      const boundedCoordinates: { readonly x: number; readonly y: number } =
        calculateBoundedPosition({
          areaWidth: overlayBounds.width,
          areaHeight: overlayBounds.height,
          tokenWidth: dragPayload.template.width,
          tokenHeight: dragPayload.template.height,
          proposedX: centeredX,
          proposedY: centeredY,
        });
      const createdToken: GameTokenInstance = {
        ...dragPayload.template,
        id: generateTokenId(),
        x: boundedCoordinates.x,
        y: boundedCoordinates.y,
      };
      setTokens((previousTokens: ReadonlyArray<GameTokenInstance>) => [
        ...previousTokens,
        createdToken,
      ]);
      setSelectedTokenId(createdToken.id);
      return;
    }
    const movedToken: GameTokenInstance | undefined = tokens.find(
      (token: GameTokenInstance) => token.id === dragPayload.tokenId,
    );
    if (movedToken === undefined) {
      return;
    }
    const proposedX: number =
      (event.clientX -
        overlayBounds.left -
        dragPayload.pointerOffsetX -
        canvasPan.x) /
      canvasZoom;
    const proposedY: number =
      (event.clientY -
        overlayBounds.top -
        dragPayload.pointerOffsetY -
        canvasPan.y) /
      canvasZoom;
    const boundedCoordinates: { readonly x: number; readonly y: number } =
      calculateBoundedPosition({
        areaWidth: overlayBounds.width,
        areaHeight: overlayBounds.height,
        tokenWidth: movedToken.width,
        tokenHeight: movedToken.height,
        proposedX,
        proposedY,
      });
    setTokens((previousTokens: ReadonlyArray<GameTokenInstance>) =>
      previousTokens.map((token: GameTokenInstance) =>
        token.id === dragPayload.tokenId
          ? { ...token, x: boundedCoordinates.x, y: boundedCoordinates.y }
          : token,
      ),
    );
  }

  function handleTokenDragStart(
    event: React.DragEvent<HTMLDivElement>,
    token: GameTokenInstance,
  ): void {
    const tokenRect: DOMRect = event.currentTarget.getBoundingClientRect();
    const payload: OverlayTokenDragPayload = {
      payloadType: "overlay-token-instance",
      tokenId: token.id,
      pointerOffsetX: event.clientX - tokenRect.left,
      pointerOffsetY: event.clientY - tokenRect.top,
    };
    event.dataTransfer.setData(
      GAME_AREA_DRAG_DATA_FORMAT,
      JSON.stringify(payload),
    );
    event.dataTransfer.effectAllowed = "move";
    setDraggedTokenId(token.id);
    setSelectedTokenId(token.id);
  }

  function handleTokenDragEnd(): void {
    setDraggedTokenId(null);
    setIsTrashHighlighted(false);
  }

  function handleTrashDragOver(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleTrashDragEnter(): void {
    setIsTrashHighlighted(true);
  }

  function handleTrashDragLeave(): void {
    setIsTrashHighlighted(false);
  }

  function handleTrashDrop(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    event.stopPropagation();
    setIsTrashHighlighted(false);
    const dragPayload: GameAreaDragPayload | null = readDragPayload(
      event.dataTransfer,
    );
    if (
      dragPayload === null ||
      dragPayload.payloadType !== "overlay-token-instance"
    ) {
      return;
    }
    if (dragPayload.tokenId === selectedTokenId) {
      setSelectedTokenId(null);
    }
    setTokens((previousTokens: ReadonlyArray<GameTokenInstance>) =>
      previousTokens.filter(
        (token: GameTokenInstance) => token.id !== dragPayload.tokenId,
      ),
    );
  }

  function handleTokenClick(tokenId: string): void {
    setSelectedTokenId(tokenId);
  }

  function handleTokenTitleChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const nextTitle: string = event.target.value;
    updateSelectedToken((token: GameTokenInstance) => ({
      ...token,
      label: nextTitle,
    }));
  }

  function handleTokenColorChange(color: `#${string}`): void {
    updateSelectedToken((token: GameTokenInstance) => ({ ...token, color }));
  }

  function handleTokenSizeChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const rawSize = Number(event.target.value);
    const boundedSize: number = clampTokenPosition(
      rawSize,
      MIN_TOKEN_SIZE,
      MAX_TOKEN_SIZE,
    );
    updateSelectedToken((token: GameTokenInstance, areaSize: OverlaySize) => {
      const nextWidth: number = boundedSize;
      const nextHeight: number = boundedSize;
      const boundedPosition: { readonly x: number; readonly y: number } =
        calculateBoundedPosition({
          areaWidth: areaSize.width,
          areaHeight: areaSize.height,
          tokenWidth: nextWidth,
          tokenHeight: nextHeight,
          proposedX: token.x,
          proposedY: token.y,
        });
      return {
        ...token,
        width: nextWidth,
        height: nextHeight,
        x: boundedPosition.x,
        y: boundedPosition.y,
      };
    });
  }

  function handleZoomIn(): void {
    setCanvasZoom((currentZoom: number) =>
      getNextCanvasZoom(currentZoom, CANVAS_ZOOM_STEP),
    );
  }

  function handleZoomOut(): void {
    setCanvasZoom((currentZoom: number) =>
      getNextCanvasZoom(currentZoom, -CANVAS_ZOOM_STEP),
    );
  }

  function handleResetView(): void {
    setCanvasZoom(DEFAULT_CANVAS_ZOOM);
    setCanvasPan({ x: 0, y: 0 });
  }

  function handleCanvasPanStart(
    event: React.PointerEvent<HTMLDivElement>,
  ): void {
    if (event.button !== 0) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    panStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: canvasPan.x,
      originY: canvasPan.y,
    };
    setIsPanningCanvas(true);
  }

  function handleCanvasPanMove(
    event: React.PointerEvent<HTMLDivElement>,
  ): void {
    if (panStartRef.current === null || overlayRef.current === null) {
      return;
    }
    const deltaX: number = event.clientX - panStartRef.current.pointerX;
    const deltaY: number = event.clientY - panStartRef.current.pointerY;
    const overlayRect: DOMRect = overlayRef.current.getBoundingClientRect();
    const nextPan: CanvasPanState = {
      x: panStartRef.current.originX + deltaX,
      y: panStartRef.current.originY + deltaY,
    };
    setCanvasPan(
      clampCanvasPanByArea({
        pan: nextPan,
        areaSize: { width: overlayRect.width, height: overlayRect.height },
        zoom: canvasZoom,
      }),
    );
  }

  function handleCanvasPanEnd(): void {
    panStartRef.current = null;
    setIsPanningCanvas(false);
  }

  return (
    <div
      className="game-area-with-canvas"
      onDragOver={handleAreaDragOver}
      onDrop={handleAreaDrop}
    >
      <canvas
        ref={canvasRef}
        id="game-area-canvas"
        className="game-area-canvas"
        style={{
          transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasZoom})`,
          transformOrigin: "top left",
        }}
      ></canvas>
      <div ref={overlayRef} className="game-area-overlay">
        <div
          className={`game-area-canvas-pan-layer${
            isPanningCanvas ? " game-area-canvas-pan-layer-active" : ""
          }`}
          onPointerDown={handleCanvasPanStart}
          onPointerMove={handleCanvasPanMove}
          onPointerUp={handleCanvasPanEnd}
          onPointerCancel={handleCanvasPanEnd}
          onPointerLeave={handleCanvasPanEnd}
        />
        {tokens.map((token: GameTokenInstance) => (
          <div
            key={token.id}
            draggable={true}
            className={`game-area-token${draggedTokenId === token.id ? " game-area-token-active" : ""}${
              selectedTokenId === token.id ? " game-area-token-selected" : ""
            }`}
            onDragStart={(event: React.DragEvent<HTMLDivElement>) =>
              handleTokenDragStart(event, token)
            }
            onDragEnd={handleTokenDragEnd}
            onClick={() => handleTokenClick(token.id)}
            style={{
              width: `${token.width * canvasZoom}px`,
              height: `${token.height * canvasZoom}px`,
              left: `${canvasPan.x + token.x * canvasZoom}px`,
              top: `${canvasPan.y + token.y * canvasZoom}px`,
              backgroundColor: token.color,
              zIndex:
                draggedTokenId === token.id
                  ? ACTIVE_OVERLAY_Z_INDEX
                  : DEFAULT_OVERLAY_Z_INDEX,
            }}
          >
            {token.label}
          </div>
        ))}
        <div
          className={`game-area-trash${isTrashHighlighted ? " game-area-trash-active" : ""}`}
          onDragOver={handleTrashDragOver}
          onDragEnter={handleTrashDragEnter}
          onDragLeave={handleTrashDragLeave}
          onDrop={handleTrashDrop}
        >
          Trash
        </div>
        <div className="game-area-canvas-zoom-controls">
          <button
            type="button"
            className="game-area-control-button"
            onClick={handleZoomOut}
          >
            -
          </button>
          <span className="game-area-control-value">
            {Math.round(canvasZoom * 100)}%
          </span>
          <button
            type="button"
            className="game-area-control-button"
            onClick={handleZoomIn}
          >
            +
          </button>
          <button
            type="button"
            className="game-area-control-button game-area-control-button-reset"
            onClick={handleResetView}
          >
            Reset
          </button>
        </div>
        {selectedToken !== null && (
          <div className="game-area-token-settings">
            <div className="game-area-token-settings-title">Token settings</div>
            <label
              className="game-area-token-settings-label"
              htmlFor="token-title-input"
            >
              Title
            </label>
            <input
              id="token-title-input"
              className="game-area-token-settings-input"
              value={selectedToken.label}
              onChange={handleTokenTitleChange}
            />
            <div className="game-area-token-settings-label">Color</div>
            <div className="game-area-token-settings-colors">
              {TOKEN_COLOR_PALETTE.map((color: `#${string}`) => (
                <button
                  key={color}
                  type="button"
                  className={`game-area-color-option${selectedToken.color === color ? " game-area-color-option-active" : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleTokenColorChange(color)}
                />
              ))}
            </div>
            <label
              className="game-area-token-settings-label"
              htmlFor="token-size-input"
            >
              Size
            </label>
            <input
              id="token-size-input"
              type="range"
              min={MIN_TOKEN_SIZE}
              max={MAX_TOKEN_SIZE}
              step={1}
              value={selectedToken.width}
              onChange={handleTokenSizeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
