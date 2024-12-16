import { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Jwt } from "./useVideo";
import { RemoteTrack, Room, RoomEvent, VideoPresets } from "livekit-client";

const useUserVideo = () => {
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const screenRef = useRef<HTMLVideoElement | null>(null);
  const roomRef = useRef<Room | null>(null);

  const [loading, setLoading] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    const initilizeRoom = async () => {
      try {
        const room = localStorage.getItem("room");
        const livekitToken = localStorage.getItem("livekit-token");

        console.log("livekit-token", livekitToken);
        console.log("room", room);
        if (!room && !livekitToken) {
          setLoading(true);
          return;
        }

        const decodedJwt = jwtDecode<Jwt>(livekitToken!);

        const { room: jwtRoom } = decodedJwt.video;

        if (room != "") {
          if (room != jwtRoom) return;

          roomRef.current = new Room({
            adaptiveStream: true,
            dynacast: true,
            videoCaptureDefaults: {
              resolution: VideoPresets.h720.resolution,
            },
          });

          if (!livekitToken) return;

          await roomRef.current.prepareConnection(serverUrl!, livekitToken);
          await roomRef.current.connect(serverUrl!, livekitToken);

          roomRef.current.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
          roomRef.current.on(
            RoomEvent.TrackUnsubscribed,
            handleTrackUnsubscribed
          );
        }
      } catch (error) {
        console.log("error occured", error);
      }
    };

    initilizeRoom();

    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  const handleTrackSubscribed = (track: RemoteTrack) => {
    try {
      console.log("tack-sub", track);
      if (track.source === "screen_share" && screenRef.current) {
        screenRef.current.srcObject = new MediaStream([track.mediaStreamTrack]);
        console.log("screen", screenRef.current.srcObject);
        setIsScreenSharing(true);
      }
      if (
        track.source == "camera" &&
        track.kind == "video" &&
        videoRef.current
      ) {
        videoRef.current.srcObject = new MediaStream([track.mediaStreamTrack]);
        console.log("video", videoRef.current.srcObject);
      }
      if (
        track.source === "microphone" &&
        track.kind == "audio" &&
        audioRef.current
      ) {
        audioRef.current.srcObject = new MediaStream([track.mediaStreamTrack]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleTrackUnsubscribed = (track: RemoteTrack) => {
    try {
      if (track.source === "screen_share" && screenRef.current) {
        track.detach();
        setIsScreenSharing(false);
      }
      track.detach();
    } catch (error) {
      console.log("error occcured during unscribed", error);
    }
  };
  return {
    handleTrackSubscribed,
    videoRef,
    audioRef,
    screenRef,
    loading,
    isScreenSharing,
  };
};

export default useUserVideo;
