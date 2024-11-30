"use client";

import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";

interface FormInput {
  room: string;
  identity: string;
}

export function Register() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<FormInput>();
  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    try {
      if (data.identity) {
        const res = await axios.post("http://localhost:8080/v1/token", {
          room: data.room,
          identity: data.identity,
        });
        const resData = await res.data;
        console.log(resData);
        if (resData) {
          localStorage.setItem("token", resData.jwt);
          localStorage.setItem("room", resData.room);
          localStorage.setItem("identity", resData.identity);
        }

        router.push("/");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Register</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Room</Label>
              <Input
                id="Room"
                placeholder="Name of Room"
                {...register("room")}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">Identity</Label>
              <Input
                id="identity"
                placeholder="Identity"
                {...register("identity")}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit">Submit</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
