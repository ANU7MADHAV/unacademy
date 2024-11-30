import { Draw, Point, DrawLine } from "@/types/typing";
import { useEffect, useRef, useState } from "react";

const useDraw = (
  onDraw: ({ ctx, currentPoint, prevPoint }: Draw) => void,
  roomId: string
) => {
  const [mouseDown, setMouseDown] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevPoint = useRef<null | Point>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const onMouseDown = () => setMouseDown(true);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "clear" }));
    }
  };

  useEffect(() => {
    if (roomId == "") {
      return;
    }
    wsRef.current = new WebSocket(`ws://localhost:8080/ws?roomId=${roomId}`);
    console.log("drawing", wsRef.current);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (data.type === "clear") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      const { currentPoint, prevPoint, color, lineWidth } = data as DrawLine;

      ctx.beginPath();
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;

      const startingPoint = prevPoint ?? currentPoint;
      ctx.moveTo(startingPoint.x, startingPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(startingPoint.x, startingPoint.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    };

    return () => {
      wsRef.current?.close();
    };
  }, [roomId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!mouseDown) return;

      const currentPoint = computePointInCanvas(e);
      const ctx = canvasRef.current?.getContext("2d");

      if (!ctx || !currentPoint) return;

      onDraw({ ctx, currentPoint, prevPoint: prevPoint.current });

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            currentPoint,
            prevPoint: prevPoint.current,
            color: ctx.strokeStyle,
            lineWidth: ctx.lineWidth,
          })
        );
      }

      prevPoint.current = currentPoint;
    };

    const computePointInCanvas = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      return { x, y };
    };

    const mouseUpHandler = () => {
      setMouseDown(false);
      prevPoint.current = null;
    };

    canvasRef.current?.addEventListener("mousemove", handler);
    window.addEventListener("mouseup", mouseUpHandler);

    return () => {
      canvasRef.current?.removeEventListener("mousemove", handler);
      window.removeEventListener("mouseup", mouseUpHandler);
    };
  }, [mouseDown, onDraw]);

  return { canvasRef, onMouseDown, clear };
};

export default useDraw;
