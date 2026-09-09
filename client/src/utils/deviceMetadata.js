import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
} from "../components/Gallery/galleryConstants.js";

const getAcceptString = () => {
  return [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(",");
};

const isSupportedMediaFile = (file) => {
  if (!file) {
    return false;
  }

  return (
    ACCEPTED_IMAGE_TYPES.includes(file.type) ||
    ACCEPTED_VIDEO_TYPES.includes(file.type)
  );
};

const filterSupportedFiles = (files = []) => {
  return Array.from(files).filter(isSupportedMediaFile);
};

// On mobile -> Browser/OS usually opens the device's media picker.
// On desktop -> Browser opens the system file picker.
export const pickDeviceMediaFiles = () => {
  return new Promise((resolve) => {
    const input = document.createElement("input");

    input.type = "file";

    input.accept = getAcceptString();

    input.multiple = true;

    input.style.display = "none";

    document.body.appendChild(input);

    const cleanup = () => {
      window.removeEventListener("focus", handleWindowFocus);

      input.remove();
    };

    const handleWindowFocus = () => {
      // Some browsers do not reliably fire change when the picker is cancelled.
      // Giving the picker a moment to finish before checking.
      setTimeout(() => {
        if (!input.files?.length) {
          cleanup();

          resolve([]);
        }
      }, 500);
    };

    input.addEventListener(
      "change",
      () => {
        const files = filterSupportedFiles(input.files);

        cleanup();

        resolve(files);
      },
      {
        once: true,
      },
    );

    // Detect cancellation when the native picker closes.
    window.addEventListener("focus", handleWindowFocus, {
      once: true,
    });

    input.click();
  });
};

// Opens a directory picker where supported.
export const pickDeviceMediaDirectory = () => {
  return new Promise((resolve) => {
    const input = document.createElement("input");

    input.type = "file";

    input.accept = getAcceptString();

    input.multiple = true;

    input.webkitdirectory = true;

    input.style.display = "none";

    document.body.appendChild(input);

    const cleanup = () => {
      window.removeEventListener("focus", handleWindowFocus);

      input.remove();
    };

    const handleWindowFocus = () => {
      setTimeout(() => {
        if (!input.files?.length) {
          cleanup();

          resolve([]);
        }
      }, 500);
    };

    input.addEventListener(
      "change",
      () => {
        const files = filterSupportedFiles(input.files);

        cleanup();

        resolve(files);
      },
      {
        once: true,
      },
    );

    window.addEventListener("focus", handleWindowFocus, {
      once: true,
    });

    input.click();
  });
};

// Checks whether the browser exposes the webkitdirectory capability.
export const supportsDirectoryPicker = () => {
  const input = document.createElement("input");

  return "webkitdirectory" in input;
};
