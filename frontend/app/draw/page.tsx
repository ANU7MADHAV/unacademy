"use client";

import Drawing from "@/components/Drawing";
import React, { useEffect, useState } from "react";

const page = () => {
  const [room, setRoom] = useState("");
  useEffect(() => {
    const roomId = localStorage.getItem("room");
    if (roomId) {
      setRoom(roomId);
    }
  }, [room]);
  console.log("room", room);
  return (
    <div>
      <Drawing roomId={room} />
    </div>
  );
};

export default page;
