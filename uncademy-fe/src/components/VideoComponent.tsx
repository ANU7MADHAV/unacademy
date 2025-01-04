"use client";
import useVideo from "../hooks/useVideo";
import { Button } from "./ui/button";
import { UploadButton } from "./UploadFile";
import useSlidesShowStore from "../store/useSliderStore";
// import ImageSlider from "./ImageSlider";
import WhiteBoardPage from "../pages/WhiteBoardPage";
import { useEffect, useState } from "react";
import axios from "axios";
import EgressHelper from "@livekit/egress-sdk";

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
    videoTrackId,
  } = useVideo();
  const { isShowSlides } = useSlidesShowStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSomethingSharing, setIsSomethingSharing] = useState(false);

  useEffect(() => {
    const room = localStorage.getItem("room");
    if (room) {
      EgressHelper.setRoom();

      // Egress layout can change on the fly, we can react to the new layout
      // here.
      EgressHelper.onLayoutChanged((newLayout) => {
        setLayout(newLayout);
      });

      // start recording when there's already a track published
      let hasTrack = false;
      for (const p of Array.from(room.remoteParticipants.values())) {
        if (p.trackPublications.size > 0) {
          hasTrack = true;
          break;
        }
      }

      if (hasTrack) {
        EgressHelper.startRecording();
      } else {
        room.once(RoomEvent.TrackSubscribed, () =>
          EgressHelper.startRecording()
        );
      }
    }
  }, [room]);

  const handlSharing = (event: string) => {
    setIsSomethingSharing(!isSomethingSharing);
    if (event == "drawing") {
      setIsDrawing(!isDrawing);
    }
  };

  console.log("videoTrack", videoTrackId);

  const handleRecording = async () => {
    const res = await axios.post(
      `http://localhost:8080/v1/record/liveroom?track=${videoTrackId}`
    );
    const data = await res.data;

    console.log("data", data);
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <section className="flex justify-end">
        <Button
          className="bg-gray-600 text-white absolute z-10 m-3 cursor-pointer"
          onClick={handleRecording}
        >
          Record
        </Button>
      </section>

      {/* {isShowSlides && (
        <div className="h-screen w-screen z-40">
          <ImageSlider />
        </div>
      )} */}

      <video
        ref={screenRef}
        autoPlay
        muted
        playsInline
        className={`${
          isSomethingSharing ? "h-full w-full absolute" : "hidden"
        }`}
      />

      <audio ref={audioRef} autoPlay />
      {publishVideo && (
        <div
          className={`${
            isSomethingSharing ? "absolute z-10 top-5 right-5" : "relative"
          }`}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`${
              isSomethingSharing
                ? "w-[300px] h-[300px] rounded-md "
                : "h-full w-full bg-black"
            }`}
          />
        </div>
      )}

      {isDrawing && (
        <div className="relative h-5/6">
          <WhiteBoardPage />
        </div>
      )}

      <div className="absolute bottom-5 left-5 flex space-x-3">
        <Button
          onClick={handleCameraToggle}
          className={
            publishVideo ? `bg-white text-black` : `bg-red-500 text-white`
          }
          variant={!publishVideo ? "destructive" : "default"}
        >
          Camera
        </Button>
        <Button
          onClick={handleMicrophoneToggle}
          className={
            publishAudio ? `bg-white text-black` : `bg-red-500 text-white`
          }
        >
          Microphone
        </Button>
        <Button
          onClick={handleShareScreenToggle}
          className={
            publishScreen ? `bg-white text-black` : `bg-red-500 text-white`
          }
        >
          Share Screen
        </Button>
        <Button onClick={() => handlSharing("drawing")}>
          {isDrawing ? "Stop Drawing" : "Draw"}
        </Button>
        <UploadButton />
      </div>
    </div>
  );
};

export default VideoComponent;
