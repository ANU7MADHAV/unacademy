"use client";

import React, { useEffect, useRef } from "react";

const CamerView = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.log(error);
      }
    };
    startCamera();
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-[300px] h-[300px] rounded-lg"
      />
    </div>
  );
};

export default CamerView;
