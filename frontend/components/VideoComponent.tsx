"use client";

import useVideo from "@/src/hooks/useVideo";
import { Button } from "./ui/button";
import { useRef } from "react";

const VideoComponent = () => {
  const videoRefc = useRef<HTMLVideoElement>(null);
  const {
    audioRef,
    handleCameraToggle,
    handleMicrophoneToggle,
    // handleScreenShareToggle,
    publishAudio,
    publishScreen,
    publishVideo,
    screenRef,
    videoRef,
    // isVideoReady,
  } = useVideo();
  //
  //   if (!isVideoReady) {
  //     return <div>Loading...</div>;
  //   }

  return (
    <div>
      <p>Hello</p>
      <video ref={videoRefc} autoPlay muted playsInline />
      <video ref={screenRef} autoPlay muted playsInline />
      <audio ref={audioRef} muted={true} autoPlay />

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="bg-black h-screen"
      />

      <div>
        <div>
          <>
            <Button
              onClick={handleCameraToggle}
              variant={!publishVideo ? "destructive" : "default"}
            >
              Camera
            </Button>
            <Button
              onClick={handleMicrophoneToggle}
              variant={!publishAudio ? "destructive" : "default"}
            >
              Microphone
            </Button>
            {/* <Button
              onClick={handleScreenShareToggle}
              variant={!publishScreen ? "destructive" : "default"}
            >
              Share screeen
            </Button> */}
          </>
        </div>
      </div>
    </div>
  );
};

export default VideoComponent;
