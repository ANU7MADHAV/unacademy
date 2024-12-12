"use client";

import React, { useEffect, useRef } from "react";

const Test = () => {
  const websocketRef = useRef<WebSocket | null>(null);
  const messageRef = useRef<string | null>(null);

  useEffect(() => {
    websocketRef.current = new WebSocket("ws://localhost:8080/ws");

    websocketRef.current.onopen = () => {
      console.log("estabilished connection");
    };

    websocketRef.current.onmessage = (message: MessageEvent) => {
      console.log("message", message.data);
      messageRef.current = message.data;
    };

    websocketRef.current.onerror = () => {
      console.log("error");
    };

    websocketRef.current.onclose = () => {
      console.log("close");
    };

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  return (
    <div>
      <p>{messageRef.current}</p>
    </div>
  );
};

export default Test;
