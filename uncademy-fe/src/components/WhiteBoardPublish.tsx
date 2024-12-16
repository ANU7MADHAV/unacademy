import { Excalidraw } from "@excalidraw/excalidraw";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { AppState } from "@excalidraw/excalidraw/types/types";
import { useEffect, useRef } from "react";

const WhiteBoardPublish = () => {
  const webSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    webSocketRef.current = new WebSocket("ws://localhost:8080/ws");

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
    element: readonly ExcalidrawElement[],
    appState: AppState
  ) => {
    console.log(element, appState);
    if (webSocketRef.current?.readyState == webSocketRef.current?.OPEN) {
      webSocketRef.current?.send(
        JSON.stringify({
          type: "stroke",
          stroke: { element, appState },
          roomid: "room123",
        })
      );
    }
  };
  return (
    <div style={{ height: "1000px" }}>
      <Excalidraw onChange={handleChange} />
    </div>
  );
};

export default WhiteBoardPublish;
