const getFontStyle = (font) => {
  switch (font) {
    case "serif":
      return "serif";

    case "mono":
      return "monospace";

    case "italic":
      return "italic sans-serif";

    case "bold":
      return "900 sans-serif";

    case "slab":
      return "bold serif";

    case "wide":
      return "sans-serif";

    case "sans":
    default:
      return "sans-serif";
  }
};

const getBackgroundColor = (background) => {
  switch (background) {
    case "white":
      return "#FFFFFF";

    case "black":
      return "#000000";

    case "transparent":
      return "rgba(0, 0, 0, 0.45)";

    case "none":
    default:
      return null;
  }
};

// Draw committed text objects onto the final export canvas.
export const drawTexts = ({
  context,
  texts = [],
  sourceWidth,
  sourceHeight,
  exportWidth,
  exportHeight,
}) => {
  if (!texts.length) return;

  const scaleX = exportWidth / sourceWidth;
  const scaleY = exportHeight / sourceHeight;
  const fontScale = Math.min(scaleX, scaleY);

  context.save();

  texts.forEach((text) => {
    const x = (text.x / 100) * exportWidth;
    const y = (text.y / 100) * exportHeight;

    const fontSize = 30 * fontScale;

    context.font = `${fontSize}px ${getFontStyle(text.font)}`;
    context.fillStyle = text.color;
    context.textAlign = text.alignment || "center";
    context.textBaseline = "middle";

    const lines = text.text.split("\n");
    const lineHeight = fontSize * 1.2;

    const paddingX = 8 * fontScale;
    const paddingY = 3 * fontScale;
    const borderRadius = 6 * fontScale;

    const backgroundColor = getBackgroundColor(text.background);

    lines.forEach((line, index) => {
      const displayLine = line || " ";

      const lineY =
        y - ((lines.length - 1) * lineHeight) / 2 + index * lineHeight;

      const textWidth = context.measureText(displayLine).width;

      if (backgroundColor) {
        let backgroundX = x;

        if (context.textAlign === "center") {
          backgroundX = x - textWidth / 2 - paddingX;
        } else if (context.textAlign === "right") {
          backgroundX = x - textWidth - paddingX;
        } else {
          backgroundX = x - paddingX;
        }

        const backgroundY = lineY - fontSize / 2 - paddingY;

        const backgroundWidth = textWidth + paddingX * 2;

        const backgroundHeight = fontSize + paddingY * 2;

        context.fillStyle = backgroundColor;

        context.beginPath();

        context.roundRect(
          backgroundX,
          backgroundY,
          backgroundWidth,
          backgroundHeight,
          borderRadius,
        );

        context.fill();

        context.fillStyle = text.color;
      }

      context.fillText(displayLine, x, lineY);
    });
  });

  context.restore();
};
