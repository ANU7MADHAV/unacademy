"use client";

import React, { useEffect, useRef, useState } from "react";
import SimpleImageSlider from "react-simple-image-slider";

const UserImageSlider = () => {
  //   const [imagesUrls, setImagesUrls] = useState([]);
  const webSocketRef = useRef<WebSocket | null>(null);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    webSocketRef.current = new WebSocket("ws://localhost:8080/ws");

    webSocketRef.current.onopen = () => {
      console.log("connection established");
    };

    webSocketRef.current.onmessage = (message: MessageEvent) => {
      console.log("message", message.data);
      const parsedMessage = JSON.parse(message.data);

      if (Array.isArray(parsedMessage)) {
        // Extract URLs from array of objects or use array of strings
        const extractedUrls = parsedMessage.map((item) =>
          typeof item === "string" ? item : item.url
        );
        setImages(extractedUrls);
      } else if (parsedMessage.url) {
        // If it's a single image object
        setImages([parsedMessage.url]);
      }
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

  console.log("message1", typeof images);
  console.log("message1", images);

  return (
    <div>
      {images.length > 0 && (
        <SimpleImageSlider
          width={900}
          height={900}
          images={images}
          showBullets={true}
          showNavs={true}
        />
      )}
    </div>
  );
};

export default UserImageSlider;
