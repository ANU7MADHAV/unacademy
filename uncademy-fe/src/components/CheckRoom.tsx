"use client";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import CamerView from "./CameraView";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface JwtToken {
  sub: string;
  video: {
    canPublish: boolean;
    room: string;
    roomAdmin: boolean;
    roomJoin: boolean;
  };
}

export default function CheckRoom() {
  const [token, setToken] = useState<string>();
  const [room, setRoom] = useState<string | null>();
  const [decodedToken, setDecodedToken] = useState<JwtToken>();
  let navigate = useNavigate();
  useEffect(() => {
    const liveToken = localStorage.getItem("livekit-token");
    const room = localStorage.getItem("room");
    if (!liveToken) return;
    setToken(liveToken);
    setRoom(room);

    const decode = jwtDecode<JwtToken>(liveToken);
    console.log("decode", decode);
    setDecodedToken(decode);
  }, []);

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Join Room</CardTitle>
        <CardDescription>Join your new room in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <CamerView />
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button
          className="hover:bg-black hover:text-white"
          onClick={() => {
            if (decodedToken?.video.roomAdmin) {
              navigate(`/dashboard/${token}`);
            } else {
              navigate(`/dashboard/${room}`);
            }
          }}
        >
          Join
        </Button>
      </CardFooter>
    </Card>
  );
}
