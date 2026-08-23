import { useEffect, useRef } from "react";

import { drawAllStrokes } from "./utils/doodleDrawing.js";

const DoodleDisplay = ({ doodles = [] }) => {
  const canvasRef = useRef(null);

  const drawDoodles = () => {
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

  // Redraw whenever saved doodles change.
  useEffect(() => {
    drawDoodles();
  }, [doodles]);

  // Keep doodles correctly positioned when the preview changes size.
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return undefined;

    const resizeObserver = new ResizeObserver(() => {
      drawDoodles();
    });

    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (!doodles.length) return null;

  return (
    <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10 h-full w-full" />
  );
};

export default DoodleDisplay;