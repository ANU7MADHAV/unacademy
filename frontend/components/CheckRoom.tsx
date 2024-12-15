"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import CamerView from "./CamerView";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { decode } from "punycode";

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
  const [decodedToken, setDecodedToken] = useState<JwtToken>();
  useEffect(() => {
    const liveToken = localStorage.getItem("livekit-token");
    if (!liveToken) return;
    setToken(liveToken);

    const decode = jwtDecode<JwtToken>(liveToken);
    console.log("decode", decode);
    setDecodedToken(decode);
  }, []);
  const router = useRouter();
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
          onClick={() => {
            if (decodedToken?.video.roomAdmin) {
              router.push(`/dashboard/${token}`);
            } else {
              router.push(`/dashboard`);
            }
          }}
        >
          Join
        </Button>
      </CardFooter>
    </Card>
  );
}
