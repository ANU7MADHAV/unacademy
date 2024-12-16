"use client";
import { useEffect, useRef, useState } from "react";
import { Room, Track, VideoPresets, createLocalTracks } from "livekit-client";
import { jwtDecode } from "jwt-decode";

export interface Jwt {
  sub: string;
  video: {
    canPublish: boolean;
    room: string;
    roomAdmin?: boolean;
    roomJoin: boolean;
  };
}

const useVideo = () => {
  const serverUrl = import.meta.env.VITE_LIVEKIT_URL;

  console.log("serverUrl", serverUrl);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const screenRef = useRef<HTMLVideoElement | null>(null);
  const currentRoom = useRef<Room | null>(null);
  const username = useRef<string | null>(null);

  const [publishVideo, setPublishVideo] = useState(true);
  const [publishAudio, setPublishAudio] = useState(true);
  const [publishScreen, setPublishScreeen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    const initializeRoom = async () => {
      try {
        const liveKit = localStorage.getItem("livekit-token");
        const room = localStorage.getItem("room");

        if (!liveKit || !room) {
          setIsLoading(false);
          return;
        }

        const decodedJwt = jwtDecode<Jwt>(liveKit);
        username.current = decodedJwt.sub;
        const { canPublish, room: jwtRoom, roomAdmin } = decodedJwt.video;

        if (jwtRoom !== room) return;

        currentRoom.current = new Room({
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: VideoPresets.h720.resolution,
          },
        });

        console.log("url", serverUrl);
        console.log("token", liveKit);

        await currentRoom.current.prepareConnection(serverUrl!, liveKit);
        await currentRoom.current.connect(serverUrl!, liveKit);

        // Show admin track their self
        if (roomAdmin) {
          await handleAdminShowTracks();
        }

        // Publish tracks if admin and can publish
        if (roomAdmin && canPublish) {
          await handlePublishTrack();
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Room initialization error:", error);
        setIsLoading(false);
      }
    };

    initializeRoom();

    return () => {
      if (currentRoom.current) {
        currentRoom.current.disconnect();
      }
    };
  }, [serverUrl]);

  const handleAdminShowTracks = async () => {
    try {
      const tracks = await createLocalTracks({
        audio: true,
        video: true,
      });

      const audioTrack = tracks.find((track) => track.kind === "audio");
      const videoTrack = tracks.find((track) => track.kind === "video");

      if (audioTrack && audioRef.current) {
        audioRef.current.srcObject = new MediaStream([
          audioTrack.mediaStreamTrack,
        ]);
      }

      if (videoTrack && videoRef.current) {
        videoRef.current.srcObject = new MediaStream([
          videoTrack.mediaStreamTrack,
        ]);
      }
    } catch (error) {
      console.log("Admin track setup error:", error);
    }
  };

  const handlePublishTrack = async () => {
    try {
      if (!(videoRef.current?.srcObject instanceof MediaStream)) return;

      const videoTracks = videoRef.current.srcObject.getVideoTracks();
      await currentRoom.current?.localParticipant.publishTrack(videoTracks[0], {
        name: "videoTrack",
        simulcast: true,
        source: Track.Source.Camera,
      });

      if (!(audioRef.current?.srcObject instanceof MediaStream)) return;

      const audioTracks = audioRef.current.srcObject.getAudioTracks();
      await currentRoom.current?.localParticipant.publishTrack(audioTracks[0], {
        name: "audioTrack",
        simulcast: true,
        source: Track.Source.Microphone,
      });
    } catch (error) {
      console.log("Track publish error:", error);
    }
  };

  const handleCameraToggle = async () => {
    try {
      await currentRoom.current?.localParticipant.setCameraEnabled(
        !publishVideo
      );
      setPublishVideo((prev) => !prev);
    } catch (error) {
      console.log("Camera toggle error:", error);
    }
  };

  const handleMicrophoneToggle = async () => {
    try {
      await currentRoom.current?.localParticipant.setMicrophoneEnabled(
        !publishAudio
      );
      setPublishAudio((prev) => !prev);
    } catch (error) {
      console.log("Microphone toggle error:", error);
    }
  };

  const handleShareScreenToggle = async () => {
    try {
      if (publishScreen) {
        await currentRoom.current?.localParticipant.setScreenShareEnabled(
          false
        );
        setIsScreenSharing(false);
      } else {
        const localTrack =
          await currentRoom.current?.localParticipant.setScreenShareEnabled(
            true
          );

        if (!localTrack || !localTrack.track) {
          console.log("No tracks found");
          return;
        }

        screenRef.current!.srcObject = null;

        const mediaStream = new MediaStream([
          localTrack.track.mediaStreamTrack,
        ]);

        screenRef.current!.srcObject = mediaStream;
        setIsScreenSharing(true);
      }

      setPublishScreeen((prev) => !prev);
    } catch (err) {
      console.log(err);
    }
  };

  return {
    videoRef,
    audioRef,
    screenRef,
    handleCameraToggle,
    handleMicrophoneToggle,
    handleShareScreenToggle,
    handleAdminShowTracks,
    publishVideo,
    publishAudio,
    publishScreen,
    isLoading,
    isScreenSharing,
  };
};

export default useVideo;