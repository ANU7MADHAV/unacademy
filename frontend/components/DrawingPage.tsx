"use client";
import { useSearchParams } from "next/navigation";
import useDraw from "@/hooks/useDraw";
import { Draw } from "@/types/typing";
import { useEffect, useState } from "react";
import Link from "next/link";

const DrawingPage = () => {
  const searchParams = useSearchParams();
  const [roomId, setRoomId] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const room = searchParams.get("roomid");
    if (!room) {
      setError("Room ID is required");
      return;
    }
    setRoomId(room);
  }, [searchParams]);

  const { canvasRef, onMouseDown, clear } = useDraw(drawLine, roomId);

  function drawLine({ ctx, currentPoint, prevPoint }: Draw) {
    const { x: currX, y: currY } = currentPoint;
    const lineColor = "#000";
    const lineWidth = 5;

    let startingPoint = prevPoint ?? currentPoint;
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.moveTo(startingPoint.x, startingPoint.y);
    ctx.lineTo(currX, currY);
    ctx.stroke();

    ctx.fillStyle = lineColor;
    ctx.beginPath();
    ctx.arc(startingPoint.x, startingPoint.y, 2, 0, 2 * Math.PI);
    ctx.fill();
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex gap-4 mb-4">
        <Link href="/">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Home
          </button>
        </Link>

        <button
          onClick={clear}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        width={1000}
        height={600}
        className="border border-gray-200 rounded-lg bg-white"
      />
    </div>
  );
};

export default DrawingPage;
