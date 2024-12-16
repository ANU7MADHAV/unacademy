"use client";
import useVideo from "@/src/hooks/useVideo";
import { Button } from "./ui/button";
import { UploadButton } from "./UploadFile";
import useSlidesShowStore from "@/src/store/slidesStore";
import ImageSlider from "./ImageSlider";

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
  const { isShowSlides } = useSlidesShowStore();

  console.log("isShow", isShowSlides);
  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {isShowSlides && (
        <div className="h-screen w-screen z-40">
          <ImageSlider />
        </div>
      )}

      <video
        ref={screenRef}
        autoPlay
        muted
        playsInline
        className={`${isScreenSharing ? "h-full w-full absolute" : "hidden"}`}
      />

      <audio ref={audioRef} autoPlay />

      <div
        className={`${
          isScreenSharing ? "absolute z-10 top-5 right-5" : "relative"
        }`}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`${
            isScreenSharing
              ? "w-[300px] h-[300px] rounded-md shadow-lg"
              : "h-full w-full bg-black"
          }`}
        />
      </div>

      <div className="absolute bottom-5 left-5 flex space-x-3">
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
          Share Screen
        </Button>
        <UploadButton />
      </div>
    </div>
  );
};

export default VideoComponent;
