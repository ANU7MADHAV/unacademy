import { Excalidraw } from "@excalidraw/excalidraw";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

interface Events {
  stroke: Stroke;
}

interface Stroke {
  elements: Element[];
}

interface Element {
  angle: number | undefined;
}

const WhiteBoardSubscribe = () => {
  const [isLoading, setIsLoading] = useState(true);
  const webSocketRef = useRef<WebSocket | null>(null);
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [replayEvents, setReplayEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const intervalRef = useRef<any>();

  useEffect(() => {
    const fectReplayEvents = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/v1/event/replay/room123"
        );
        const data = await res.data;

        const validateElements = data.events.filter(
          (event: Events) =>
            Array.isArray(event.stroke.elements) &&
            event.stroke.elements.some((element) => element.angle !== undefined)
        );
        console.log("validateElements", validateElements);
        setReplayEvents(validateElements);

        if (validateElements.length > 0) {
          const initialEvent = validateElements[0];
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    fectReplayEvents();
  }, []);

  useEffect(() => {
    if (isReplaying && isPlaying && replayEvents.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex < replayEvents.length - 1) {
            const nextEvent = replayEvents[prevIndex + 1];

            console.log("Playing next event:", nextEvent);

            if (nextEvent.stroke.elements) {
              const element = nextEvent.stroke.elements;
              excalidrawAPI?.updateScene({
                elements: element,
                appState: {
                  ...nextEvent.stroke.appState,
                  viewBackgroundColor: "#ffffff",
                },
              });
            }

            return prevIndex + 1;
          } else {
            setIsPlaying(false);
            return prevIndex;
          }
        });
      }, 70);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, isReplaying, excalidrawAPI, replayEvents]);

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

  const handlePause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    if (replayEvents.length > 0) {
      const firstElement = replayEvents[0];
      const element = firstElement.stroke.elements;

      excalidrawAPI?.updateScene({
        elements: element,
        appState: {
          ...firstElement.stroke.elements,
          viewBackgroundColor: "#ffffff",
        },
      });
    }
    setIsPlaying(false);
  };

  const handleToggle = () => {
    console.log("clicked");
    setIsPlaying(true);
    setIsReplaying(!isReplaying);
    setCurrentIndex(0);

    console.log("isPlaying", isPlaying);
    console.log("isReplaying", isReplaying);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    excalidrawAPI?.updateScene({
      elements: [],
      appState: {},
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex justify-center gap-2">
        {!isReplaying && (
          <button
            onClick={handleToggle}
            className="bg-blue-500 text-white px-2 py-1 rounded-md"
          >
            Start replay
          </button>
        )}
        {isReplaying && (
          <section>
            <button
              onClick={handlePause}
              className="bg-blue-400 text-white px-2 py-1 rounded-md"
            >
              {isPlaying ? "Pause" : "continue"}
            </button>
            <button
              onClick={handleReset}
              className="bg-sky-300 text-black px-2 py-1 rounded-md"
            >
              Reset
            </button>
          </section>
        )}
      </div>

      <div className="flex-1">
        <Excalidraw
          initialData={{ elements: [], appState: {} }}
          excalidrawAPI={(api: ExcalidrawImperativeAPI) => {
            console.log("Excalidraw API received");
            setExcalidrawAPI(api);
          }}
          viewModeEnabled={true}
        />
      </div>
    </div>
  );
};

export default WhiteBoardSubscribe;
