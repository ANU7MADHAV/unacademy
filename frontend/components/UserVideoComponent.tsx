"use client";
import useVideo from "@/src/hooks/useVideo";
import React from "react";

const UserVideoComponent = () => {
  const { audioRef, screenRef, videoRef, isLoading, isScreenSharing } =
    useVideo();
  console.log("video", isScreenSharing);

  if (isLoading) return <div>Loading..</div>;

  return (
    <div className=" w-full h-full">
      <div className="relative inset-0 z-10">
        <video
          ref={screenRef}
          autoPlay
          muted
          playsInline
          className={isScreenSharing ? "w-full h-full object-contain" : ""}
        />
      </div>

      <div
        className={
          isScreenSharing
            ? "absolute top-4 right-4 z-20 w-1/4 max-w-[300px]"
            : "w-screen h-screen"
        }
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover bg-black rounded-lg shadow-lg"
        />
      </div>

      <audio ref={audioRef} muted={false} autoPlay />
    </div>
  );
};

export default UserVideoComponent;
