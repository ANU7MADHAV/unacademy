import { Excalidraw } from "@excalidraw/excalidraw";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { useEffect, useRef, useState } from "react";

const WhiteBoardSubscribe = () => {
  const [isLoading, setIsLoading] = useState(true);
  const webSocketRef = useRef<WebSocket | null>(null);
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  useEffect(() => {
    webSocketRef.current = new WebSocket(
      "ws://localhost:8080/ws/room123?id=user12"
    );

    webSocketRef.current.onopen = () => {
      console.log("WebSocket connection established");
      setIsLoading(false);
    };

    webSocketRef.current.onmessage = (message: MessageEvent) => {
      console.log("Received WebSocket message:", message);
      try {
        const data = JSON.parse(message.data);
        console.log("Parsed data:", data);

        // Change this condition to match the backend message type
        if (data.type === "strokeData" && excalidrawAPI) {
          console.log("Updating scene with:", data.stroke);
          excalidrawAPI.updateScene({
            elements: data.stroke.elements,
            appState: data.stroke.appState,
          });
        }
      } catch (parseError) {
        console.error("Error parsing message:", parseError);
      }
    };

    webSocketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsLoading(false);
    };

    webSocketRef.current.onclose = () => {
      console.log("WebSocket connection closed");
      setIsLoading(false);
    };

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, [excalidrawAPI]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ height: "100vh" }}>
      <Excalidraw
        initialData={{ elements: [], appState: {} }}
        excalidrawAPI={(api: ExcalidrawImperativeAPI) => {
          console.log("Excalidraw API received");
          setExcalidrawAPI(api);
        }}
        viewModeEnabled={true}
      />
    </div>
  );
};

export default WhiteBoardSubscribe;
