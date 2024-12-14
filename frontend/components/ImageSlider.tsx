"use client";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

const ImageSlider = () => {
  const [imagesUrls, setImagesUrls] = useState<string[]>([]);
  const webSocketRef = useRef<WebSocket | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

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

  const prevUrl = (): void => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const nextUrl = (): void => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  useEffect(() => {
    if (webSocketRef.current?.readyState == webSocketRef.current?.OPEN) {
      webSocketRef.current?.send(JSON.stringify(images[currentIndex].url));
    }
  }, [images]);

  return (
    <div>
      {images.length > 0 && (
        <>
          <div>
            <button
              className="absolute left-0 top-1/2 transform h-[459px] rounded-xl hover:bg-[#1a222f] mx-1 -mt-[10px] -translate-y-1/2 bg-[#111927] text-white p-2 group"
              onClick={prevUrl}
            >
              <ChevronLeft className="text-gray-400 group-hover:text-white" />
            </button>
            <section className="flex justify-center">
              <Image
                src={images[currentIndex].url}
                alt="image"
                width={900}
                height={900}
              />
            </section>

            <button
              className="absolute right-0 top-1/2 transform h-[459px] rounded-xl hover:bg-[#1a222f] mx-1 -mt-[10px] -translate-y-1/2 bg-[#111927] text-white p-2 group"
              onClick={nextUrl}
            >
              <ChevronRight className="text-gray-400 group-hover:text-white" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageSlider;
