export interface Point {
  x: number;
  y: number;
}

export interface Draw {
  ctx: CanvasRenderingContext2D;
  currentPoint: Point;
  prevPoint: Point | null;
}

export interface DrawLine {
  currentPoint: Point;
  prevPoint: Point | null;
  color: string;
  lineWidth: number;
}
