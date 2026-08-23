import { useEffect, useRef } from "react";

import {
  createStroke,
  drawAllStrokes,
  getCanvasPoint,
} from "./utils/doodleDrawing.js";

const DoodleCanvas = ({
  doodles = [],
  activeColor,
  activeBrushSize,
  onChange,
}) => {
  const canvasRef = useRef(null);
  const activeStrokeRef = useRef(null);

  // Keep the canvas visually sharp when its size changes.
  const resizeCanvas = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    if (canvas.width !== width) {
      canvas.width = width;
    }

    if (canvas.height !== height) {
      canvas.height = height;
    }

    const context = canvas.getContext("2d");

    if (!context) return;

    drawAllStrokes(context, canvas, doodles);
  };

  // Redraw doodles whenever the doodle data changes.
  useEffect(() => {
    resizeCanvas();
  }, [doodles]);

  // Redraw when the preview/canvas size changes.
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return undefined;

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handlePointerDown = (event) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    event.preventDefault();

    canvas.setPointerCapture?.(event.pointerId);

    const point = getCanvasPoint(event, canvas);

    const newStroke = createStroke({
      color: activeColor,
      size: activeBrushSize,
      point,
    });

    activeStrokeRef.current = newStroke;

    onChange?.([...doodles, newStroke]);
  };

  const handlePointerMove = (event) => {
    const canvas = canvasRef.current;
    const activeStroke = activeStrokeRef.current;

    if (!canvas || !activeStroke) return;

    event.preventDefault();

    const point = getCanvasPoint(event, canvas);

    const updatedStroke = {
      ...activeStroke,
      points: [...activeStroke.points, point],
    };

    activeStrokeRef.current = updatedStroke;

    onChange?.([
      ...doodles.filter((stroke) => stroke.id !== updatedStroke.id),
      updatedStroke,
    ]);
  };

  const finishStroke = (event) => {
    const canvas = canvasRef.current;

    if (!canvas || !activeStrokeRef.current) return;

    canvas.releasePointerCapture?.(event.pointerId);

    activeStrokeRef.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 h-full w-full touch-none cursor-crosshair"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishStroke}
      onPointerCancel={finishStroke}
      aria-label="Doodle canvas"
    />
  );
};

export default DoodleCanvas;