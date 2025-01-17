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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import useTokenStore from "../store/useTokenStore";
import axios from "axios";
import * as React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link } from "react-router";
import { useNavigate } from "react-router";

enum Role {
  student = "student",
  teacher = "teacher",
}

interface IFormInput {
  username: string;
  password: string;
  role: Role;
}

export default function Signup() {
  const [jwt, setJwt] = React.useState("");
  const { setToken } = useTokenStore();
  const { register, handleSubmit, setValue } = useForm<IFormInput>();
  let navigate = useNavigate();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const res = await axios.post(
      "http://localhost:8080/v1/users/register",
      data
    );
    const resData = res.data;
    setJwt(resData);
    setToken(resData);
    if (resData != "" && data.role === "teacher") {
      navigate("/amdin/create-room");
    } else {
      navigate("/admin/join-room");
    }
  };

  React.useEffect(() => {
    localStorage.setItem("jwt-token", jwt);
  }, [jwt]);

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Register accordingly</CardDescription>
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
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Select
                onValueChange={(value) => setValue("role", value as Role)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Signup</Button>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <p className="font-semibold text-gray-700">
          Already registered
          <Link to="/login">
            <span className="px-3 underline text-blue-500">Login</span>
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
