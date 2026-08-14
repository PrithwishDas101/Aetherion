const compressImage = (
  file,
  {
    maxWidth = 512,
    maxHeight = 512,
    quality = 0.82,
    outputType = "image/webp",
  } = {},
) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No image file provided."));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const image = new Image();

      image.onload = () => {
        let width = image.width;
        let height = image.height;

        const scale = Math.min(maxWidth / width, maxHeight / height, 1);

        width = Math.round(width * scale);

        height = Math.round(height * scale);

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Unable to process image."));
          return;
        }

        context.drawImage(image, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Unable to compress image."));
              return;
            }

            const extension = outputType === "image/webp" ? "webp" : "jpg";

            const compressedFile = new File(
              [blob],
              `profile-picture.${extension}`,
              {
                type: outputType,
                lastModified: Date.now(),
              },
            );

            resolve(compressedFile);
          },
          outputType,
          quality,
        );
      };

      image.onerror = () => {
        reject(new Error("Unable to read image."));
      };

      image.src = event.target.result;
    };

    reader.onerror = () => {
      reject(new Error("Unable to read image file."));
    };

    reader.readAsDataURL(file);
  });
};

export default compressImage;
