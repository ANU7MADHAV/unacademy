"use client";

import useVideo from "@/src/hooks/useVideo";
import { Button } from "./ui/button";

const VideoComponent = () => {
  const {
    audioRef,
    handleCameraToggle,
    handleMicrophoneToggle,
    handleShareScreenToggle,
    publishAudio,
    publishScreen,
    publishVideo,
    screenRef,
    videoRef,
    isScreenSharing,
  } = useVideo();
  console.log("screeenref", isScreenSharing);

  return (
    <div>
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
            <Button
              onClick={handleShareScreenToggle}
              variant={!publishScreen ? "destructive" : "default"}
            >
              Share screeen
            </Button>
          </>
        </div>
      </div>
    </div>
  );
};

export default VideoComponent;
