"use client";
import Link from "next/link";
import { Button } from "./ui/button";

const DrawboarderButton = () => {
  const roomId = localStorage.getItem("room");
  return (
    <div>
      <Link href={`/drawing?roomid=${roomId}`}>
        <Button className="absolute bottom-4 bg-white rounded-md w-[80px] text-black font-medium left-64">
          Draw
        </Button>
      </Link>
    </div>
  );
};

export default DrawboarderButton;
