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
import tokenStore from "@/src/store/tokenStore";
import useTokenStore from "@/src/store/tokenStore";
import { register } from "module";

interface IFormInput {
  room: string;
  description: string;
}

export default function CreateRoom() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<IFormInput>();
  const { setToken } = useTokenStore();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const res = await axios.post("http://localhost:8080/v1/token/create", data);

    const token = res.data.token;
    console.log(token);

    if (token.length != 0) {
      setToken(token);
      router.push(`/check-room/${data.room}`);
    }
  };

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
              <Label htmlFor="description">Description</Label>
              <Input
                className="py-8"
                id="description"
                placeholder="Description..."
                {...register("description")}
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
