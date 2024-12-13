"use client";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import SimpleImageSlider from "react-simple-image-slider";

const ImageSlider = () => {
  const [imagesUrls, setImagesUrls] = useState<string[]>([]);
  const webSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    webSocketRef.current = new WebSocket("ws://localhost:8080/ws?id=user123");

    webSocketRef.current.onopen = () => {
      console.log("connection established");
    };

    webSocketRef.current.onmessage = (message: MessageEvent) => {
      console.log("message", message);
    };

    webSocketRef.current.onerror = () => {
      console.log("error occured");
    };

    webSocketRef.current.onclose = () => {
      console.log("closed connection");
    };

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const getSlides = async () => {
      try {
        const res = await axios.post("http://localhost:8080/v1/slides", {
          metadata: "meta-data1",
        });
        const resData = res.data;

        let urls: string[] = [];

        if (Array.isArray(resData)) {
          urls = resData;
        } else if (resData.ImageURLs) {
          urls = Array.isArray(resData.ImageURLs)
            ? resData.ImageURLs
            : [resData.ImageURLs];
        } else if (resData.imageUrls) {
          urls = Array.isArray(resData.imageUrls)
            ? resData.imageUrls
            : [resData.imageUrls];
        } else if (resData.response) {
          urls = Array.isArray(resData.response)
            ? resData.response
            : [resData.response];
        } else {
          try {
            const parsedUrls = JSON.parse(resData);
            urls = Array.isArray(parsedUrls) ? parsedUrls : [parsedUrls];
          } catch {
            console.error("Could not parse response:", resData);
          }
        }

        console.log("Parsed URLs:", urls);
        setImagesUrls(urls);
      } catch (error) {
        console.error("Error fetching slides:", error);
      }
    };

    getSlides();
  }, []);

  const images = imagesUrls.map((url) => ({ url }));
  console.log("images", images);

  useEffect(() => {
    if (webSocketRef.current?.readyState == webSocketRef.current?.OPEN) {
      webSocketRef.current?.send("hello");
    }
  }, []);

  return (
    <div>
      {imagesUrls.length > 0 && (
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

export default ImageSlider;
