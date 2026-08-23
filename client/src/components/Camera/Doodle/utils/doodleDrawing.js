// Convert a pointer event position into coordinates relative to the canvas.
export const getCanvasPoint = (event, canvas) => {
  const rect = canvas.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

// A stroke looks like:
// {
//   id: "...",
//   color: "#FF3B30",
//   size: 5,
//   points: [
//     { x: 100, y: 200 },
//     { x: 105, y: 205 }
//   ]
// }
export const drawStroke = (context, stroke) => {
  if (!stroke?.points?.length) return;

  const { points, color, size } = stroke;

  context.save();

  context.strokeStyle = color;
  context.lineWidth = size;

  context.lineCap = "round";
  context.lineJoin = "round";

  context.beginPath();

  // A single-point stroke should still create a visible dot.
  if (points.length === 1) {
    const point = points[0];

    context.fillStyle = color;

    context.beginPath();
    context.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
    context.fill();

    context.restore();
    return;
  }

  context.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];

    context.lineTo(point.x, point.y);
  }

  context.stroke();
  context.restore();
};

// Clear the entire canvas and redraw every committed doodle stroke.
export const drawAllStrokes = (context, canvas, strokes = []) => {
  context.clearRect(0, 0, canvas.width, canvas.height);

  strokes.forEach((stroke) => {
    drawStroke(context, stroke);
  });
};

// Create a new doodle stroke.
export const createStroke = ({ color, size, point }) => {
  return {
    id: `${Date.now()}-${Math.random()}`,
    color,
    size,
    points: [point],
  };
};
