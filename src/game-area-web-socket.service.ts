declare const __GAME_AREA_WS_ENDPOINT__: string;

const DEFAULT_GAME_AREA_WS_ENDPOINT = "127.0.0.1:3000/ws";

function resolveGameAreaWebSocketUrl(rawEndpoint: string): string {
  const normalizedEndpoint: string =
    rawEndpoint.trim().length > 0
      ? rawEndpoint.trim()
      : DEFAULT_GAME_AREA_WS_ENDPOINT;
  if (
    normalizedEndpoint.startsWith("ws://") ||
    normalizedEndpoint.startsWith("wss://")
  ) {
    return normalizedEndpoint;
  }
  return `ws://${normalizedEndpoint}`;
}

/**
 * Stores a single shared websocket connection for the renderer process.
 */
class GameAreaWebSocketService {
  private webSocket: WebSocket | null = null;
  private messageListeners: Set<(messageData: unknown) => void> = new Set();

  public executeConnect(): WebSocket {
    if (this.webSocket !== null) {
      return this.webSocket;
    }
    const webSocketUrl: string = resolveGameAreaWebSocketUrl(
      __GAME_AREA_WS_ENDPOINT__,
    );
    this.webSocket = new WebSocket(webSocketUrl);
    this.subscribeToConnectionEvents(this.webSocket);
    return this.webSocket;
  }

  public getWebSocket(): WebSocket | null {
    return this.webSocket;
  }

  public subscribeToMessages(
    listener: (messageData: unknown) => void,
  ): () => void {
    this.messageListeners.add(listener);
    return (): void => {
      this.messageListeners.delete(listener);
    };
  }

  public executeSendMessage(messageData: unknown): void {
    if (this.webSocket === null) {
      console.warn(
        "[GameAreaWebSocket] skip send because websocket is not initialized",
      );
      return;
    }
    if (this.webSocket.readyState !== WebSocket.OPEN) {
      console.warn(
        `[GameAreaWebSocket] skip send because websocket is not open (state=${this.webSocket.readyState})`,
      );
      return;
    }
    this.webSocket.send(JSON.stringify(messageData));
  }

  public executeDisconnect(): void {
    if (this.webSocket === null) {
      return;
    }
    if (
      this.webSocket.readyState === WebSocket.OPEN ||
      this.webSocket.readyState === WebSocket.CONNECTING
    ) {
      this.webSocket.close();
    }
    this.webSocket = null;
  }

  private subscribeToConnectionEvents(webSocket: WebSocket): void {
    webSocket.addEventListener("open", (): void => {
      console.log("[GameAreaWebSocket] connection opened");
    });
    webSocket.addEventListener("message", (event: MessageEvent): void => {
      const messageData: unknown = this.parseMessageData(event.data);
      console.log("[GameAreaWebSocket] message received:", messageData);
      this.notifyMessageListeners(messageData);
    });
    webSocket.addEventListener("error", (event: Event): void => {
      console.error("[GameAreaWebSocket] connection error:", event);
    });
    webSocket.addEventListener("close", (event: CloseEvent): void => {
      console.log(
        `[GameAreaWebSocket] connection closed: code=${event.code}, reason=${event.reason}`,
      );
    });
  }

  private notifyMessageListeners(messageData: unknown): void {
    this.messageListeners.forEach(
      (listener: (nextMessageData: unknown) => void): void => {
        listener(messageData);
      },
    );
  }

  private parseMessageData(rawData: unknown): unknown {
    if (typeof rawData !== "string") {
      return rawData;
    }
    try {
      return JSON.parse(rawData) as unknown;
    } catch {
      return rawData;
    }
  }
}

export const gameAreaWebSocketService = new GameAreaWebSocketService();
