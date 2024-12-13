"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import SimpleImageSlider from "react-simple-image-slider";

const ImageSlider = () => {
  const [imagesUrls, setImagesUrls] = useState([]);

  const urls = ["url"];
  console.log("check", urls[0]);

  useEffect(() => {
    const getSlides = async () => {
      const res = await axios.post("http://localhost:8080/v1/slides", {
        metadata: "mera-data1",
      });
      const resData = await res.data;

      console.log("res", resData);

      let urls = [];
      if (Array.isArray(resData.response)) {
        urls = resData.response;
      } else if (typeof resData.response === "string") {
        urls = [resData.response];
      } else if (Array.isArray(resData)) {
        urls = resData;
      } else {
        console.error("Unexpected response format:", resData);
        return;
      }

      setImagesUrls(urls);
    };
    getSlides();
  }, []);

  console.log("urls", typeof imagesUrls[0]);

  return (
    <div>
      <SimpleImageSlider
        width={896}
        height={504}
        images={imagesUrls}
        showBullets={true}
        showNavs={true}
      />
    </div>
  );
};

export default ImageSlider;
