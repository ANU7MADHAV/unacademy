import { useCallback, useEffect, useRef, useState } from "react";
import { TLEventInfo, Tldraw } from "tldraw";
import "tldraw/tldraw.css";

// There's a guide at the bottom of this file!

export default function DrawingComponent() {
  const [events, setEvents] = useState<any[]>([]);
  const websocketRef = useRef<WebSocket | null>(null);

  const handleEvent = useCallback((data: TLEventInfo) => {
    setEvents((events) => {
      const newEvents = events.slice(0, 100);
      if (
        newEvents[newEvents.length - 1] &&
        newEvents[newEvents.length - 1].type === "pointer" &&
        data.type === "pointer" &&
        data.target === "canvas"
      ) {
        newEvents[newEvents.length - 1] = data;
      } else {
        newEvents.unshift(data);
      }
      return newEvents;
    });
  }, []);

  useEffect(() => {
    websocketRef.current = new WebSocket("ws://localhost:8080/ws?id=user123");

    websocketRef.current.onopen = () => {
      console.log("connection estabilished");
    };

    websocketRef.current.onmessage = (message: MessageEvent) => {
      console.log("message", message.data);
    };

    websocketRef.current.onerror = () => {
      console.log("error occured");
    };

    websocketRef.current.onclose = () => {
      console.log("on close");
    };

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (websocketRef.current?.readyState == WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(events, undefined, 2));
    }
  }, [events]);

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "50%", height: "100vh" }}>
        <Tldraw
          onMount={(editor) => {
            editor.on("event", (event) => handleEvent(event));
          }}
        />
      </div>
      <div
        style={{
          width: "50%",
          height: "100vh",
          padding: 8,
          background: "#eee",
          border: "none",
          fontFamily: "monospace",
          fontSize: 12,
          borderLeft: "solid 2px #333",
          display: "flex",
          flexDirection: "column-reverse",
          overflow: "auto",
          whiteSpace: "pre-wrap",
        }}
        onCopy={(event) => event.stopPropagation()}
      >
        <div>{JSON.stringify(events, undefined, 2)}</div>
      </div>
    </div>
  );
}
