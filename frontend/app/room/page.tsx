"use client";

import {
  LiveKitRoom,
  VideoConference
} from "@livekit/components-react";

import "@livekit/components-styles";

import { useEffect, useState } from "react";

export default function Page() {
  // TODO: get user input for room and name

  const [token, setToken] = useState("");

  useEffect(() => {
    const isToken = localStorage.getItem("token");
    if (isToken) {
      setToken(isToken);
    }
  }, []);

  if (token === "") {
    return <div>Getting token...</div>;
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      // Use the default LiveKit theme for nice styles.
      data-lk-theme="default"
      style={{ height: "100dvh" }}
    >
      <VideoConference />
    </LiveKitRoom>
  );
}
