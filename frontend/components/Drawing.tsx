"use client";
import { Tldraw } from "tldraw";
import { useSyncDemo } from "@tldraw/sync";
import "tldraw/tldraw.css";
import useRoomStore from "@/src/store/roomStore";
import { useState } from "react";

interface Props {
  roomId: string;
}

export default function Drawing({ roomId }: Props) {
  console.log("roomId", roomId);
  const store = useSyncDemo({ roomId: roomId });

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw store={store} />
    </div>
  );
}
