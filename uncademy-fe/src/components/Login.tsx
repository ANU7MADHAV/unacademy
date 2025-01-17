import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import axios from "axios";
import * as React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { jwtDecode } from "jwt-decode";
import useTokenStore from "../store/useTokenStore";
import { Link } from "react-router";
import { useNavigate } from "react-router";

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
  const { setToken } = useTokenStore();
  const { register, handleSubmit } = useForm<IFormInput>();
  let navigate = useNavigate();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const res = await axios.post("http://localhost:8080/v1/users/login", data);
    const resData = await res.data;
    setJwt(resData);
    setToken(resData);

    const decode = jwtDecode<JwtToken>(resData);

    console.log("decode", decode);

    if (resData != "" && decode?.role === "teacher") {
      navigate("/create-room");
    } else {
      navigate("/join-room");
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
          <Link to="/signup">
            <span className="px-3 underline text-blue-500">Signup</span>
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
