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
          metadata: "mera-data1",
        });
        const resData = res.data;

        // Detailed logging to understand the response structure
        console.log("Full response data:", resData);
        console.log("Type of resData:", typeof resData);
        console.log("Keys of resData:", Object.keys(resData));

        let urls: string[] = [];

        // More flexible parsing
        if (Array.isArray(resData)) {
          // If the entire response is an array of URLs
          urls = resData;
        } else if (resData.ImageURLs) {
          // If ImageURLs exists
          urls = Array.isArray(resData.ImageURLs)
            ? resData.ImageURLs
            : [resData.ImageURLs];
        } else if (resData.imageUrls) {
          // Alternative key name
          urls = Array.isArray(resData.imageUrls)
            ? resData.imageUrls
            : [resData.imageUrls];
        } else if (resData.response) {
          // Another possible key
          urls = Array.isArray(resData.response)
            ? resData.response
            : [resData.response];
        } else {
          // Attempt to parse as JSON if it's a string
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

  // Prepare images for the slider
  const images = imagesUrls.map((url) => ({ url }));

  console.log("images", images[0]?.url[1]);

  return (
    <div>
      {imagesUrls.length > 0 && (
        <SimpleImageSlider
          width={896}
          height={504}
          images={images}
          showBullets={true}
          showNavs={true}
        />
      )}
    </div>
  );
};

export default ImageSlider;
