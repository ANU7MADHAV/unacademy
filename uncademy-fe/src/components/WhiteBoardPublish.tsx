import { Excalidraw } from "@excalidraw/excalidraw";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { AppState } from "@excalidraw/excalidraw/types/types";
import { useEffect, useRef } from "react";

const WhiteBoardPublish = () => {
  const webSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    webSocketRef.current = new WebSocket(
      "ws://localhost:8080/ws/room123?id=user123"
    );

    webSocketRef.current.onopen = () => {
      console.log("connection established");
    };

    webSocketRef.current.onmessage = (message: MessageEvent) => {
      console.log("message", message);
    };
    webSocketRef.current.onerror = () => {
      console.log("error occured during WebSocket connection");
    };
    webSocketRef.current.onclose = () => {
      console.log("connection closed");
    };

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, []);

  const handleChange = (
    elements: readonly ExcalidrawElement[],
    appState: AppState
  ) => {
    if (!webSocketRef.current) return;

    if (webSocketRef.current?.readyState === 1)
      webSocketRef.current?.send(
        JSON.stringify({
          type: "sendStroke",
          stroke: { elements, appState },
        })
      );
  };

  return (
    <div className="h-full w-screen">
      <Excalidraw onChange={handleChange} />
    </div>
  );
};

export default WhiteBoardPublish;
