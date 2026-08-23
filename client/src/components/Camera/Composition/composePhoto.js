import { drawDoodles } from "./drawDoodles.js";
import { drawTexts } from "./drawTexts.js";

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve(image);
    };

    image.onerror = () => {
      reject(new Error("Could not load the photo for composition."));
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

  // Draw the original photo first.
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Draw committed doodles on top of the photo.
  drawDoodles({
    context,
    canvas,
    doodles,
  });

  // Draw committed texts on top of the photo and doodles.
  drawTexts({
    context,
    texts,
    sourceWidth: canvas.width,
    sourceHeight: canvas.height,
    exportWidth: canvas.width,
    exportHeight: canvas.height,
  });

  return new Promise((resolve, reject) => {
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
  });
};
