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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import userUserStore from "@/src/store/authStore";
import axios from "axios";
import Link from "next/link";
import * as React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

interface IFormInput {
  username: string;
  password: string;
}
interface JwtToken {
  role: string;
  username: string;
}

export default function Login() {
  const [jwt, setJwt] = React.useState("");
  const { setUsername } = userUserStore();
  const { register, handleSubmit } = useForm<IFormInput>();
  const router = useRouter();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const res = await axios.post("http://localhost:8080/v1/users/login", data);
    setUsername(data.username);
    const resData = await res.data;
    setJwt(resData);
    console.log("res", resData);

    const decode = jwtDecode<JwtToken>(resData);

    console.log("decode", decode);

    if (resData != "" && decode?.role === "teacher") {
      router.push("/");
    } else {
      router.push("/user/join-room");
    }
  };

  React.useEffect(() => {
    localStorage.setItem("jwt-token", jwt);
  }, [jwt]);

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Login to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="usename"
                placeholder="Username"
                {...register("username")}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="Password"
                {...register("password")}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Login</Button>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <p className="font-semibold text-gray-700">
          doesn't have account already
          <Link href="/signup">
            <span className="px-3 underline text-blue-500">Signup</span>
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
