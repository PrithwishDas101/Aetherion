import { forwardRef } from "react";

const GalleryFilePicker = forwardRef(
    (
        {
            onFilesSelected,
            accept = "image/*,video/*",
            multiple = true,
        },
        ref,
    ) => {
        const handleChange = (event) => {
            const files = Array.from(event.target.files || []);

            if (files.length) {
                onFilesSelected?.(files);
            }

            // Allows the same file to be selected again later.
            event.target.value = "";
        };

        return (
            <input
                ref={ref}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleChange}
                className="hidden"
                aria-hidden="true"
            />
        );
    },
);

GalleryFilePicker.displayName = "GalleryFilePicker";

export default GalleryFilePicker;