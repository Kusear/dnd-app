import { createRoot } from "react-dom/client";
import { AppComponent } from "./components";
import { gameAreaWebSocketService } from "./game-area-web-socket.service";

const root = createRoot(document.body);
gameAreaWebSocketService.executeConnect();
window.addEventListener("beforeunload", (): void => {
  gameAreaWebSocketService.executeDisconnect();
});
root.render(<AppComponent />);
