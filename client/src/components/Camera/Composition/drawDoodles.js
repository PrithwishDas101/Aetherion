import { drawStroke } from "../Doodle/utils/doodleDrawing.js";

// Draw all doodles onto the final export canvas.
export const drawDoodles = ({
  context,
  doodles = [],
  sourceWidth,
  sourceHeight,
  exportWidth,
  exportHeight,
}) => {
  if (!doodles.length) return;

  const scaleX = exportWidth / sourceWidth;
  const scaleY = exportHeight / sourceHeight;

  context.save();

  context.scale(scaleX, scaleY);

  doodles.forEach((stroke) => {
    drawStroke(context, stroke);
  });

  context.restore();
};
