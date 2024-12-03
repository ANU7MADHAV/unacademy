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
import VideoComponent from "./VideoComponent";

export default function CheckRoom() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create Room</CardTitle>
        <CardDescription>Create your new room in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <VideoComponent />
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button>Join</Button>
      </CardFooter>
    </Card>
  );
}
