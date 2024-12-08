import { useEffect, useRef, useState } from "react";
import {
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  Track,
  VideoPresets,
  createLocalTracks,
} from "livekit-client";
import { jwtDecode } from "jwt-decode";
import { error } from "console";

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

  const videRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const screenRef = useRef<HTMLVideoElement | null>(null);
  const currentRoom = useRef<Room | null>(null);
  const username = useRef<string | null>(null);

  const [roomId, setRoomId] = useState("");
  const [token, setToken] = useState("");

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
        if (serverUrl) {
          currentRoom.current.prepareConnection(serverUrl, token);
        }
      } catch (error) {
        console.log(error);
      }
      if (!token) return;
    };
  }, []);
  return <div>useVideo</div>;
};

export default useVideo;
