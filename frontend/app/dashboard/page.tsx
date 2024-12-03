"use client";

import useTokenStore from "@/src/store/tokenStore";
import { Room } from "livekit-client";
import { useEffect } from "react";

const page = () => {
  const { token } = useTokenStore();
  const wsURL = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (!wsURL) {
    return;
  }

  const room = new Room();
  useEffect(() => {
    const connectRoom = async () => {
      await room.connect(wsURL, token);
    };
    connectRoom();
  });
  return <div>Hello</div>;
};

export default page;
