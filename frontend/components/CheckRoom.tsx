"use client";

import * as React from "react";

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

export default function CheckRoom() {
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
            router.push("/dashboard");
          }}
        >
          Join
        </Button>
      </CardFooter>
    </Card>
  );
}
