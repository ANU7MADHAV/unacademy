"use client";
import { useEffect, useRef, useState } from "react";
import {
  RemoteTrack,
  Room,
  RoomEvent,
  Track,
  VideoPresets,
  createLocalTracks,
} from "livekit-client";
import { jwtDecode } from "jwt-decode";

interface Jwt {
  sub: string;
  video: {
    canPublish: boolean;
    room: string;
    roomAdmin: boolean;
    roomJoin: boolean;
  };
}

const useVideo = () => {
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const screenRef = useRef<HTMLVideoElement | null>(null);
  const currentRoom = useRef<Room | null>(null);
  const username = useRef<string | null>(null);

  const [roomId, setRoomId] = useState("");
  const [token, setToken] = useState("");
  const [publishVideo, setPublishVideo] = useState(true);
  const [publishAudio, setPublishAudio] = useState(true);
  const [publishScreen, setPublishScreeen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeRoom = async () => {
      try {
        const liveKit = localStorage.getItem("livekit-token");
        const room = localStorage.getItem("room");

        if (!liveKit || !room) {
          setIsLoading(false);
          return;
        }

        setToken(liveKit);
        setRoomId(room);

        if (!liveKit) return;

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

        await currentRoom.current.prepareConnection(serverUrl!, liveKit);
        await currentRoom.current.connect(serverUrl!, liveKit);

        console.log(videoRef.current);

        currentRoom.current.on(
          RoomEvent.TrackSubscribed,
          handleTrackSubscribed
        );

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

  const handleTrackSubscribed = async (track: RemoteTrack) => {
    try {
      if (track.source === "screen_share" && screenRef.current) {
        screenRef.current.srcObject = new MediaStream([track.mediaStreamTrack]);
      }
      if (
        track.kind === "video" &&
        track.source === "camera" &&
        videoRef.current
      ) {
        videoRef.current.srcObject = new MediaStream([track.mediaStreamTrack]);
      }
      if (
        track.kind === "audio" &&
        track.source === "microphone" &&
        audioRef.current
      ) {
        audioRef.current.srcObject = new MediaStream([track.mediaStreamTrack]);
      }
    } catch (error) {
      console.error("Track subscription error:", error);
    }
  };

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
      console.error("Admin track setup error:", error);
    }
  };

  const handlePublishTrack = async () => {
    try {
      if (videoRef.current?.srcObject instanceof MediaStream) {
        const videoTracks = videoRef.current.srcObject.getVideoTracks();
        await currentRoom.current?.localParticipant.publishTrack(
          videoTracks[0],
          {
            name: "videoTrack",
            simulcast: true,
            source: Track.Source.Camera,
          }
        );
      }

      if (audioRef.current?.srcObject instanceof MediaStream) {
        const audioTracks = audioRef.current.srcObject.getAudioTracks();
        await currentRoom.current?.localParticipant.publishTrack(
          audioTracks[0],
          {
            name: "audioTrack",
            simulcast: true,
            source: Track.Source.Microphone,
          }
        );
      }
    } catch (error) {
      console.error("Track publish error:", error);
    }
  };

  const handleCameraToggle = async () => {
    try {
      await currentRoom.current?.localParticipant.setCameraEnabled(
        !publishVideo
      );
      setPublishVideo((prev) => !prev);
    } catch (error) {
      console.error("Camera toggle error:", error);
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

  //   const handleShareScreenToggle = async () => {
  //     try {
  //       if (publishScreen) {
  //         await currentRoomRef.current?.localParticipant.setScreenShareEnabled(
  //           false
  //         );
  //       } else {
  //         const localTrack =
  //           await currentRoomRef.current?.localParticipant.setScreenShareEnabled(
  //             true
  //           );
  //
  //         if (!localTrack || !localTrack.track) {
  //           console.log("No tracks found");
  //           return;
  //         }
  //
  //         screenRef.current!.srcObject = null;
  //
  //         const mediaStream = new MediaStream([
  //           localTrack.track.mediaStreamTrack,
  //         ]);
  //
  //         screenRef.current!.srcObject = mediaStream;
  //       }
  //
  //       setPublishScreeen((prev) => !prev);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };

  return {
    videoRef,
    audioRef,
    screenRef,
    username: username.current,
    handleCameraToggle,
    handleMicrophoneToggle,
    // handleScreenShareToggle,
    handleAdminShowTracks,
    publishVideo,
    publishAudio,
    publishScreen,
    isLoading,
  };
};

export default useVideo;
