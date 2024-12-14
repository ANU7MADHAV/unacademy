"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import useTokenStore from "@/src/store/tokenStore";
import { jwtDecode } from "jwt-decode";
import { Jwt } from "@/src/hooks/useVideo";

interface IFormInput {
  room: string;
  identity: string;
}

export default function JoinRoom() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<IFormInput>();
  const { token, setToken } = useTokenStore();
  const [room, setRoom] = React.useState("");

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const res = await axios.post("http://localhost:8080/v1/token/create", data);

    const token = res.data.token;
    console.log(token);

    const decodeJwt = jwtDecode<Jwt>(token);

    if (token.length != 0) {
      setToken(token);
      const roomId = data.room;
      setRoom(roomId);
      if (decodeJwt.video.roomAdmin) {
        router.push(`/dashboard/${token}`);
      } else {
        router.push("/dashboard");
      }
    }
  };

  React.useEffect(() => {
    const localRoom = localStorage.getItem("room");
    const localToken = localStorage.getItem("livekit-token");
    if (!localRoom && !localToken) {
      localStorage.setItem("livekit-token", token);
      localStorage.setItem("room", room);
    }
  }, [token, room]);

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Join</CardTitle>
        <CardDescription>Join your room</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="room">Room</Label>
              <Input id="room" placeholder="Room" {...register("room")} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Identity</Label>
              <Input
                className="py-2"
                id="identity"
                placeholder="identity"
                {...register("identity")}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Join Room</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
