import { parseGIF, decompressFrames } from "gifuct-js";
import GIF from "gif.js.optimized";
import gifWorkerUrl from "gif.js.optimized/dist/gif.worker.js?url";

import { drawDoodles } from "./drawDoodles.js";
import { drawTexts } from "./drawTexts.js";

/*

* Cloudinary is currently rejecting GIF uploads above 10 MB.
*
* Keep edited GIFs comfortably below that limit.
  */
const MAX_OUTPUT_SIZE = 9 * 1024 * 1024;

/*

* Large source GIFs can explode in size when re-encoded.
*
* These limits significantly reduce output size while keeping
* the GIF visually good enough for chat.
  */
const MAX_DIMENSION = 480;
const MAX_TOTAL_FRAMES = 80;

/*

* gif.js quality:
*
* Lower number = better quality + larger/slower encoding.
* Higher number = more compression + smaller/faster encoding.
*
* 20 is a good compromise for chat GIFs.
  */
const GIF_QUALITY = 20;

const loadGifBuffer = async (gifUrl) => {
  const response = await fetch(gifUrl);

  if (!response.ok) {
    throw new Error(
      `Unable to load GIF for editing. Status: ${response.status}`,
    );
  }

  return response.arrayBuffer();
};

const createFrameCanvas = (width, height) => {
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  return canvas;
};

/*

* Calculate output dimensions while preserving aspect ratio.
  */
const getOutputDimensions = (width, height, scale = 1) => {
  let outputWidth = width;
  let outputHeight = height;

  const largestDimension = Math.max(width, height);

  /*

* First limit the GIF to our maximum chat dimension.
  */
  if (largestDimension > MAX_DIMENSION) {
    const dimensionScale = MAX_DIMENSION / largestDimension;

    outputWidth = Math.round(width * dimensionScale);

    outputHeight = Math.round(height * dimensionScale);
  }

  /*

* Additional scale can be used when retrying after the
* encoded GIF is still too large.
  */
  outputWidth = Math.max(1, Math.round(outputWidth * scale));
  outputHeight = Math.max(1, Math.round(outputHeight * scale));

  return {
    width: outputWidth,
    height: outputHeight,
  };
};

const applyEdits = ({
  canvas,
  context,
  doodles,
  texts,
  sourceWidth,
  sourceHeight,
}) => {
  drawDoodles({
    context,
    canvas,
    doodles,
  });

  drawTexts({
    context,
    texts,
    sourceWidth,
    sourceHeight,
    exportWidth: canvas.width,
    exportHeight: canvas.height,
  });
};

/*

* Render the GIF once with the requested scale and frame skipping.
  */
const renderGif = ({
  frames,
  sourceWidth,
  sourceHeight,
  doodles,
  texts,
  scale,
  frameStep,
}) => {
  return new Promise((resolve, reject) => {
    const { width: outputWidth, height: outputHeight } = getOutputDimensions(
      sourceWidth,
      sourceHeight,
      scale,
    );

    console.log("🎞️ GIF RENDER SETTINGS:", {
      sourceWidth,
      sourceHeight,
      outputWidth,
      outputHeight,
      frameStep,
      sourceFrames: frames.length,
    });

    const gifEncoder = new GIF({
      workers: 2,
      quality: GIF_QUALITY,
      width: outputWidth,
      height: outputHeight,
      workerScript: gifWorkerUrl,
    });

    /*

  * Full-size canvas keeps GIF frame compositing accurate.
    */
    const compositingCanvas = createFrameCanvas(sourceWidth, sourceHeight);

    const compositingContext = compositingCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!compositingContext) {
      reject(new Error("Unable to create GIF compositing canvas."));
      return;
    }

    /*

  * Patch canvas converts gifuct RGBA patches into drawable
  * frame regions.
    */
    const patchCanvas = createFrameCanvas(sourceWidth, sourceHeight);

    const patchContext = patchCanvas.getContext("2d");

    if (!patchContext) {
      reject(new Error("Unable to create GIF patch canvas."));
      return;
    }

    /*

  * Temporary scaled output canvas.
    */
    const outputCanvas = createFrameCanvas(outputWidth, outputHeight);

    const outputContext = outputCanvas.getContext("2d");

    if (!outputContext) {
      reject(new Error("Unable to create GIF output canvas."));
      return;
    }

    /*

  * Better scaling for photos/GIF frames.
    */
    outputContext.imageSmoothingEnabled = true;
    outputContext.imageSmoothingQuality = "high";

    /*

  * Accumulate frame timing when skipping frames.
  *
  * Example:
  *
  * frameStep = 2
  *
  * frame 1 delay 50ms
  * frame 2 delay 50ms
  *
  * output frame delay becomes 100ms.
    */
    let accumulatedDelay = 0;

    /*

  * gifuct-js gives us patches rather than fully rendered
  * frames, so every frame must still be composited even
  * when we don't encode it.
    */
    for (let index = 0; index < frames.length; index += 1) {
      const frame = frames[index];

      const { dims, patch, delay, disposalType } = frame;

      /*
       * Save previous state for disposal method 3.
       */
      let previousFrameImage = null;

      if (disposalType === 3) {
        previousFrameImage = compositingContext.getImageData(
          0,
          0,
          sourceWidth,
          sourceHeight,
        );
      }

      /*
       * Disposal method 2 clears the affected region.
       */
      if (disposalType === 2) {
        compositingContext.clearRect(
          dims.left,
          dims.top,
          dims.width,
          dims.height,
        );
      }

      /*
       * Convert gifuct RGBA patch into ImageData.
       */
      const imageData = new ImageData(
        new Uint8ClampedArray(patch),
        dims.width,
        dims.height,
      );

      /*
       * Clear only because this canvas is reused.
       */
      patchContext.clearRect(0, 0, sourceWidth, sourceHeight);

      patchContext.putImageData(imageData, dims.left, dims.top);

      /*
       * Composite the patch into the full GIF frame.
       */
      compositingContext.drawImage(patchCanvas, 0, 0);

      /*
       * Preserve timing even when this frame isn't encoded.
       */
      accumulatedDelay += Math.max(20, Number(delay || 100));

      /*
       * Encode only every nth frame.
       *
       * Always encode the final frame.
       */
      const shouldEncode =
        index % frameStep === 0 || index === frames.length - 1;

      if (shouldEncode) {
        /*
         * Clear previous output.
         */
        outputContext.clearRect(0, 0, outputWidth, outputHeight);

        /*
         * Scale the fully composited source frame.
         */
        outputContext.drawImage(
          compositingCanvas,
          0,
          0,
          sourceWidth,
          sourceHeight,
          0,
          0,
          outputWidth,
          outputHeight,
        );

        /*
         * Apply Aetherion doodles and text.
         */
        applyEdits({
          canvas: outputCanvas,
          context: outputContext,
          doodles,
          texts,
          sourceWidth,
          sourceHeight,
        });

        gifEncoder.addFrame(outputCanvas, {
          copy: true,
          delay: accumulatedDelay,
        });

        accumulatedDelay = 0;
      }

      /*
       * Restore previous state for disposal method 3.
       */
      if (disposalType === 3 && previousFrameImage) {
        compositingContext.putImageData(previousFrameImage, 0, 0);
      }
    }

    gifEncoder.on("finished", (blob) => {
      resolve(
        new Blob([blob], {
          type: "image/gif",
        }),
      );
    });

    gifEncoder.on("abort", () => {
      reject(new Error("GIF rendering was aborted."));
    });

    try {
      gifEncoder.render();
    } catch (error) {
      reject(error);
    }
  });
};

export const composeGif = async ({ gifUrl, doodles = [], texts = [] }) => {
  if (!gifUrl) {
    throw new Error("A GIF URL is required.");
  }

  const arrayBuffer = await loadGifBuffer(gifUrl);

  const gif = parseGIF(arrayBuffer);

  const frames = decompressFrames(gif, true);

  if (!frames.length) {
    throw new Error("No GIF frames were found.");
  }

  const sourceWidth = gif.lsd.width;
  const sourceHeight = gif.lsd.height;

  if (!sourceWidth || !sourceHeight) {
    throw new Error("Invalid GIF dimensions.");
  }

  /*

* Determine how aggressively frames need to be skipped.
  */
  const initialFrameStep = Math.max(
    1,
    Math.ceil(frames.length / MAX_TOTAL_FRAMES),
  );

  console.log("🎞️ STARTING GIF COMPRESSION:", {
    sourceWidth,
    sourceHeight,
    frameCount: frames.length,
    initialFrameStep,
  });

  /*

* Attempt 1
*
* Normal chat compression.
  */
  let blob = await renderGif({
    frames,
    sourceWidth,
    sourceHeight,
    doodles,
    texts,
    scale: 1,
    frameStep: initialFrameStep,
  });

  console.log("🎞️ GIF OUTPUT ATTEMPT 1:", {
    size: blob.size,
    sizeMB: (blob.size / 1024 / 1024).toFixed(2),
  });

  /*

* Attempt 2
*
* If still too large, reduce dimensions by 20%.
  */
  if (blob.size > MAX_OUTPUT_SIZE) {
    blob = await renderGif({
      frames,
      sourceWidth,
      sourceHeight,
      doodles,
      texts,
      scale: 0.8,
      frameStep: Math.max(initialFrameStep, 2),
    });

    console.log("🎞️ GIF OUTPUT ATTEMPT 2:", {
      size: blob.size,
      sizeMB: (blob.size / 1024 / 1024).toFixed(2),
    });
  }

  /*

* Attempt 3
*
* More aggressive compression.
  */
  if (blob.size > MAX_OUTPUT_SIZE) {
    blob = await renderGif({
      frames,
      sourceWidth,
      sourceHeight,
      doodles,
      texts,
      scale: 0.65,
      frameStep: Math.max(initialFrameStep, 3),
    });

    console.log("🎞️ GIF OUTPUT ATTEMPT 3:", {
      size: blob.size,
      sizeMB: (blob.size / 1024 / 1024).toFixed(2),
    });
  }

  /*

* Final safety check.
*
* We intentionally stay below Cloudinary's current
* 10 MB restriction.
  */
  if (blob.size > MAX_OUTPUT_SIZE) {
    throw new Error(
      `Edited GIF is still too large after compression (${(
        blob.size /
        1024 /
        1024
      ).toFixed(2)} MB).`,
    );
  }

  console.log("✅ FINAL GIF READY:", {
    size: blob.size,
    sizeMB: (blob.size / 1024 / 1024).toFixed(2),
    type: blob.type,
  });

  return blob;
};
