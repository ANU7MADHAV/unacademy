"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import SimpleImageSlider from "react-simple-image-slider";

const ImageSlider = () => {
  const [imagesUrls, setImagesUrls] = useState<string[]>([]);

  useEffect(() => {
    const getSlides = async () => {
      try {
        const res = await axios.post("http://localhost:8080/v1/slides", {
          metadata: "mera-data2",
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

  console.log("images", images[0]?.url[1]);

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
