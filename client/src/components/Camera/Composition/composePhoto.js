import { drawDoodles } from "./drawDoodles.js";
import { drawTexts } from "./drawTexts.js";

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    /*
     * IMPORTANT:
     *
     * The image must request CORS permission BEFORE src is set.
     *
     * Without this, a remote image drawn onto the canvas can taint
     * the canvas, which makes canvas.toBlob() throw:
     *
     * SecurityError: Tainted canvases may not be exported.
     */
    image.crossOrigin = "anonymous";

    image.onload = () => {
      resolve(image);
    };

    image.onerror = () => {
      reject(
        new Error(
          "Could not load the photo for composition. The image server may not allow CORS access.",
        ),
      );
    };

    image.src = src;
  });

export const composePhoto = async ({ photoUrl, doodles = [], texts = [] }) => {
  if (!photoUrl) {
    throw new Error("A photo URL is required.");
  }

  const image = await loadImage(photoUrl);

  const canvas = document.createElement("canvas");

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create the photo composition canvas.");
  }

  /*
   * Draw the original photo.
   *
   * If the source was successfully loaded with CORS permission,
   * the canvas remains exportable.
   */
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  /*
   * Draw doodles.
   */
  drawDoodles({
    context,
    canvas,
    doodles,
  });

  /*
   * Draw text.
   */
  drawTexts({
    context,
    texts,
    sourceWidth: canvas.width,
    sourceHeight: canvas.height,
    exportWidth: canvas.width,
    exportHeight: canvas.height,
  });

  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not generate the composed photo."));

            return;
          }

          resolve(blob);
        },
        "image/png",
        1,
      );
    } catch (error) {
      reject(error);
    }
  });
};
