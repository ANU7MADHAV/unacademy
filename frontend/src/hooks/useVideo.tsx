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
    canpublish: boolean;
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
  const [publishVideo, setPublishVideo] = useState(false);
  const [publishAudio, setPublishAudio] = useState(false);
  const [publishScreen, setPublishScreeen] = useState(false);

  useEffect(() => {
    const liveKit = localStorage.getItem("liveKit");
    const room = localStorage.getItem("room");
    if (liveKit && room) {
      setToken(liveKit);
      setRoomId(room);
    }
  }, []);

  useEffect(() => {
    const initilizeRoom = async () => {
      try {
        if (!token) return;

        const decodejwt = jwtDecode<Jwt>(token);
        username.current = decodejwt.sub;
        const { canpublish, room, roomAdmin, roomJoin } = decodejwt.video;

        if (room !== roomId) return;

        currentRoom.current = new Room({
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: VideoPresets.h720.resolution,
          },
        });

        currentRoom.current.on(
          RoomEvent.TrackSubscribed,
          handleTrackSubscribed
        );

        // show admin track their self
        if (roomAdmin) {
          await handleAdminShowTracks();
        }

        // connect room
        if (serverUrl) {
          await currentRoom.current.prepareConnection(serverUrl, token);
          await currentRoom.current.connect(serverUrl, token);
        }

        // publish video and audio track
        if (roomAdmin && canpublish) {
          await handlePublishTrack();
        }
      } catch (error) {
        console.log(error);
      }
    };

    initilizeRoom();

    return () => {
      if (currentRoom.current) {
        currentRoom.current.disconnect();
      }
      if (videoRef.current) {
        videoRef.current = null;
      }
    };
  }, [roomId, token, serverUrl]);

  const handleTrackSubscribed = async (track: RemoteTrack) => {
    console.log(track);

    try {
      if (track.source === "screen_share" && screenRef.current) {
        screenRef.current.srcObject = null;
        const mediaStream = new MediaStream([track.mediaStreamTrack]);
        screenRef.current.srcObject = mediaStream;
      }
      if (
        track.kind === "video" &&
        track.source === "camera" &&
        videoRef.current
      ) {
        videoRef.current.srcObject = null;
        const mediaStream = new MediaStream([track.mediaStreamTrack]);
        videoRef.current.srcObject = mediaStream;
      } else if (
        track.kind === "audio" &&
        track.source === "microphone" &&
        audioRef.current
      ) {
        audioRef.current.srcObject = null;
        const mediaStream = new MediaStream([track.mediaStreamTrack]);
        audioRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAdminShowTracks = async () => {
    try {
      const tracks = await createLocalTracks({
        audio: true,
        video: true,
      });

      const audioTrack = tracks.find((track) => track.kind === "audio");
      if (audioTrack && audioRef.current) {
        audioRef.current.srcObject = new MediaStream([
          audioTrack.mediaStreamTrack,
        ]);
      }

      const videoTrack = tracks.find((track) => track.kind === "video");
      if (videoTrack && videoRef.current) {
        videoRef.current.srcObject = new MediaStream([
          videoTrack.mediaStreamTrack,
        ]);
      }
    } catch (error) {
      console.log(error);
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
      console.log(error);
    }
  };

  const handleCameraToggle = async () => {
    try {
      if (publishVideo) {
        await currentRoom.current?.localParticipant.setCameraEnabled(false);
      } else {
        await currentRoom.current?.localParticipant.setCameraEnabled(true);
      }
      setPublishVideo((prev) => !prev);
    } catch (error) {
      console.log(error);
    }
  };

  const handleMicrophoneToggle = async () => {
    try {
      if (publishAudio) {
        await currentRoom.current?.localParticipant.setMicrophoneEnabled(false);
      } else {
        const localTrack =
          await currentRoom.current?.localParticipant.setMicrophoneEnabled(
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
      }
      setPublishAudio((prev) => !prev);
    } catch (error) {
      console.log(error);
    }
  };

  const handleScreenShareToggle = async () => {
    if (publishScreen) {
      await currentRoom.current?.localParticipant.setScreenShareEnabled(false);
    } else {
      await currentRoom.current?.localParticipant.setScreenShareEnabled(true);
    }
    setPublishScreeen((prev) => !prev);
  };

  return {
    videoRef,
    audioRef,
    screenRef,
    username: username.current,
    handleCameraToggle,
    handleMicrophoneToggle,
    handleScreenShareToggle,

    publishVideo,
    publishAudio,
    publishScreen,
  };
};

export default useVideo;
