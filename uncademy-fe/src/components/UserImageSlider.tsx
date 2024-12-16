"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const UserImageSlider = () => {
  const webSocketRef = useRef<WebSocket | null>(null);
  const [images, setImages] = useState<string>();

  useEffect(() => {
    webSocketRef.current = new WebSocket("ws://localhost:8080/ws");

    webSocketRef.current.onopen = () => {
      console.log("connection established");
    };

    webSocketRef.current.onmessage = (message: MessageEvent) => {
      console.log("message", message.data);
      const parsedMessage = JSON.parse(message.data);

      setImages(parsedMessage);
    };

    webSocketRef.current.onerror = () => {
      console.log("error");
    };

    webSocketRef.current.onclose = () => {
      console.log("close");
    };

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, []);

  return (
    <div>
      {images && (
        <Image src={images} alt="image-slider" width={900} height={900} />
      )}
    </div>
  );
};

export default UserImageSlider;
