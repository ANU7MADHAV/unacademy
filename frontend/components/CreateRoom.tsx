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

interface IFormInput {
  room: string;
  identity: string;
}

export default function CreateRoom() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<IFormInput>();
  const { token } = useTokenStore();
  const [livekitToken, setLivekitToken] = React.useState("");
  const [room, setRoom] = React.useState("");

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const res = await axios.post(
      "http://localhost:8080/v1/token/create",
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const resData = res.data.token;
    console.log(resData);

    if (resData.length != 0) {
      setLivekitToken(resData);
      const roomId = data.room;
      setRoom(roomId);
      router.push(`/check-room/${roomId}`);
    }
  };

  React.useEffect(() => {
    const localRoom = localStorage.getItem("room");
    const localToken = localStorage.getItem("livekit-token");
    if (!localRoom && !localToken) {
      localStorage.setItem("livekit-token", livekitToken);
      localStorage.setItem("room", room);
    }
  }, [token, room]);

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create your room</CardDescription>
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
            <Button type="submit">Create Room</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
