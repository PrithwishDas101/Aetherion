import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
    ImagePlus,
    ZoomIn,
    ZoomOut,
    Pencil
} from "lucide-react";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

const ProfileBanner = ({ bannerUrl, onBannerChange, editMode = false }) => {
    const fileInputRef = useRef(null);
    const cropAreaRef = useRef(null);
    const imageRef = useRef(null);

    const [showEditor, setShowEditor] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [zoom, setZoom] = useState(1);

    const [position, setPosition] = useState({
        x: 0,
        y: 0,
    });

    const [baseImageSize, setBaseImageSize] =
        useState({
            width: 0,
            height: 0,
        });

    const [dragging, setDragging] = useState(false);

    const [dragStart, setDragStart] = useState({
        x: 0,
        y: 0,
    });

    const [saving, setSaving] = useState(false);

    // CLEAN PREVIEW URL
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // OPEN FILE PICKER
    const openFilePicker = () => {
        if (saving) {
            return;
        }

        fileInputRef.current?.click();
    };

    // FILE SELECTED
    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];

        event.target.value = "";

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error("Please choose an image.");
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error(
                "Image must be smaller than 50MB.",
            );
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        const nextPreviewUrl =
            URL.createObjectURL(file);

        setSelectedFile(file);
        setPreviewUrl(nextPreviewUrl);

        setZoom(1);

        setPosition({
            x: 0,
            y: 0,
        });

        setBaseImageSize({
            width: 0,
            height: 0,
        });

        setShowEditor(true);
    };

    // IMAGE LOAD
    const handleImageLoad = () => {
        const image = imageRef.current;
        const cropArea = cropAreaRef.current;

        if (!image || !cropArea) {
            return;
        }

        const areaWidth = cropArea.clientWidth;
        const areaHeight = cropArea.clientHeight;

        const naturalWidth =
            image.naturalWidth;

        const naturalHeight =
            image.naturalHeight;

        if (
            !naturalWidth ||
            !naturalHeight ||
            !areaWidth ||
            !areaHeight
        ) {
            return;
        }

        /*
         * "cover" scale.
         *
         * The image is initially scaled just enough
         * to completely cover the 4:1 crop area.
         */

        const coverScale = Math.max(
            areaWidth / naturalWidth,
            areaHeight / naturalHeight,
        );

        setBaseImageSize({
            width: naturalWidth * coverScale,
            height: naturalHeight * coverScale,
        });

        setZoom(1);

        setPosition({
            x: 0,
            y: 0,
        });
    };

    // ZOOM
    const changeZoom = (amount) => {
        if (saving) {
            return;
        }

        setZoom((currentZoom) => {
            const nextZoom = clamp(
                Number(
                    (currentZoom + amount).toFixed(2),
                ),
                1,
                3,
            );

            return nextZoom;
        });
    };

    // POINTER DRAG
    const handlePointerDown = (event) => {
        if (
            saving ||
            !baseImageSize.width ||
            !baseImageSize.height
        ) {
            return;
        }

        event.currentTarget.setPointerCapture(
            event.pointerId,
        );

        setDragging(true);

        setDragStart({
            pointerX: event.clientX,
            pointerY: event.clientY,
            positionX: position.x,
            positionY: position.y,
        });
    };

    const handlePointerMove = (event) => {
        if (!dragging || saving) {
            return;
        }

        const cropArea =
            cropAreaRef.current;

        if (!cropArea) {
            return;
        }

        const scaledWidth =
            baseImageSize.width * zoom;

        const scaledHeight =
            baseImageSize.height * zoom;

        const maxX = Math.max(
            0,
            (scaledWidth -
                cropArea.clientWidth) /
            2,
        );

        const maxY = Math.max(
            0,
            (scaledHeight -
                cropArea.clientHeight) /
            2,
        );

        const deltaX =
            event.clientX -
            dragStart.pointerX;

        const deltaY =
            event.clientY -
            dragStart.pointerY;

        const nextX = clamp(
            dragStart.positionX + deltaX,
            -maxX,
            maxX,
        );

        const nextY = clamp(
            dragStart.positionY + deltaY,
            -maxY,
            maxY,
        );

        setPosition({
            x: nextX,
            y: nextY,
        });
    };

    const handlePointerUp = () => {
        setDragging(false);
    };

    // RESET / CLOSE
    const closeEditor = () => {
        if (saving) {
            return;
        }

        setShowEditor(false);

        setSelectedFile(null);

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl("");

        setZoom(1);

        setPosition({
            x: 0,
            y: 0,
        });

        setDragging(false);
    };

    // CREATE CROPPED IMAGE
    const createCroppedImage = async () => {
        const image = imageRef.current;
        const cropArea =
            cropAreaRef.current;

        if (
            !image ||
            !cropArea ||
            !selectedFile ||
            !baseImageSize.width
        ) {
            throw new Error(
                "Banner crop data is unavailable.",
            );
        }

        const areaWidth =
            cropArea.clientWidth;

        const areaHeight =
            cropArea.clientHeight;

        const scaledWidth =
            baseImageSize.width * zoom;

        const scaledHeight =
            baseImageSize.height * zoom;

        /*
         * Image is centered inside the crop area.
         *
         * position.x / position.y are the user's drag
         * offsets from that centered position.
         */

        const imageLeft =
            (areaWidth - scaledWidth) / 2 +
            position.x;

        const imageTop =
            (areaHeight - scaledHeight) / 2 +
            position.y;

        /*
         * Convert displayed crop coordinates
         * back into the original image.
         */

        const scale =
            scaledWidth / image.naturalWidth;

        const sourceX = clamp(
            -imageLeft / scale,
            0,
            image.naturalWidth,
        );

        const sourceY = clamp(
            -imageTop / scale,
            0,
            image.naturalHeight,
        );

        const sourceWidth =
            areaWidth / scale;

        const sourceHeight =
            areaHeight / scale;

        /*
         * Output dimensions.
         *
         * 1600 × 400 = 4:1.
         */

        const outputWidth = 1600;
        const outputHeight = 400;

        const canvas =
            document.createElement("canvas");

        canvas.width = outputWidth;
        canvas.height = outputHeight;

        const context =
            canvas.getContext("2d");

        if (!context) {
            throw new Error(
                "Unable to create image canvas.",
            );
        }

        context.drawImage(
            image,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            outputWidth,
            outputHeight,
        );

        return new Promise(
            (resolve, reject) => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(
                                new Error(
                                    "Unable to create cropped banner.",
                                ),
                            );

                            return;
                        }

                        const croppedFile =
                            new File(
                                [blob],
                                "aetherion-profile-banner.jpg",
                                {
                                    type: "image/jpeg",
                                    lastModified: Date.now(),
                                },
                            );

                        resolve(croppedFile);
                    },
                    "image/jpeg",
                    0.9,
                );
            },
        );
    };

    // SAVE
    const handleSave = async () => {
        if (
            !selectedFile ||
            saving
        ) {
            return;
        }

        setSaving(true);

        try {
            const croppedFile =
                await createCroppedImage();

            await onBannerChange(
                croppedFile,
            );

            closeEditor();
        } catch (error) {
            console.error(
                "Profile banner save error:",
                error,
            );

            toast.error(
                "Couldn't update your banner.",
            );
        } finally {
            setSaving(false);
        }
    };

    // UIS
    return (
        <>
            {/* BANNER */}
            <div className="relative h-24 w-full overflow-hidden bg-[#151a16] sm:h-28 lg:h-36">
                {bannerUrl ? (
                    <img
                        src={bannerUrl}
                        alt="Profile banner"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_40%,rgba(216,244,90,0.18),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(75,110,70,0.22),transparent_35%),linear-gradient(135deg,#111811,#182119_45%,#0b100c)]" />
                        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full border border-[#d8f45a]/[0.06]" />
                        <div className="absolute -right-4 -top-8 h-36 w-36 rounded-full border border-[#d8f45a]/[0.04]" />
                        <div className="absolute bottom-0 left-0 h-px w-full bg-white/[0.05]" />
                    </>
                )}

                {/* CHANGE BUTTON */}
                {editMode ? (
                    <button
                        type="button"
                        onClick={openFilePicker}
                        disabled={saving}
                        className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white shadow-lg backdrop-blur-md transition hover:bg-black/80 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Change banner"
                        title="Change banner"
                    >
                        <Pencil className="h-4 w-4 text-white" strokeWidth={3.5} />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={openFilePicker}
                        disabled={saving}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-black/45 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-black/65 disabled:cursor-not-allowed disabled:opacity-50 sm:right-4 sm:top-4 sm:w-auto sm:gap-2 sm:px-3"
                    >
                        <ImagePlus className="h-4 w-4" />
                        <span className="hidden sm:inline">{bannerUrl ? "Change banner" : "Add banner"}</span>
                    </button>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFileSelect}
                />
            </div>

            {/* =====================================================
          BANNER EDITOR MODAL
      ===================================================== */}

            {showEditor && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-3 pb-3 sm:items-center sm:px-5 sm:pb-0"
                    onMouseDown={closeEditor}
                >
                    <div
                        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111611] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        {/* HEADER */}

                        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
                            <div>
                                <h2 className="text-sm font-semibold text-[#f1eee8]">
                                    Edit Profile Banner
                                </h2>

                                <p className="mt-0.5 text-xs text-[#626960]">
                                    Choose how your banner appears
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeEditor}
                                disabled={saving}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#737b73] transition hover:bg-white/5 hover:text-[#f1eee8] disabled:opacity-40"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        {/* BODY */}

                        <div className="p-5 sm:p-6">
                            {/* PREVIEW */}

                            <div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-[#c5c9c2]">
                                        Banner preview
                                    </p>

                                    <span className="text-xs text-[#4f564f]">
                                        4:1
                                    </span>
                                </div>

                                <div
                                    ref={cropAreaRef}
                                    className={`relative mt-3 aspect-[4/1] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#080b09] ${dragging
                                        ? "cursor-grabbing"
                                        : "cursor-grab"
                                        }`}
                                    onPointerDown={
                                        handlePointerDown
                                    }
                                    onPointerMove={
                                        handlePointerMove
                                    }
                                    onPointerUp={
                                        handlePointerUp
                                    }
                                    onPointerCancel={
                                        handlePointerUp
                                    }
                                >
                                    {previewUrl && (
                                        <img
                                            ref={imageRef}
                                            src={previewUrl}
                                            alt="Banner crop preview"
                                            onLoad={handleImageLoad}
                                            draggable={false}
                                            className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                                            style={{
                                                width: baseImageSize.width
                                                    ? `${baseImageSize.width}px`
                                                    : "auto",

                                                height: baseImageSize.height
                                                    ? `${baseImageSize.height}px`
                                                    : "auto",

                                                transform: `
                          translate(
                            calc(-50% + ${position.x}px),
                            calc(-50% + ${position.y}px)
                          )
                          scale(${zoom})
                        `,
                                            }}
                                        />
                                    )}

                                    {/* CROP GUIDES */}

                                    <div className="pointer-events-none absolute inset-0">
                                        <div className="absolute inset-0 border border-white/[0.18]" />

                                        <div className="absolute left-1/3 top-0 h-full w-px bg-white/[0.08]" />

                                        <div className="absolute left-2/3 top-0 h-full w-px bg-white/[0.08]" />

                                        <div className="absolute left-0 top-1/2 h-px w-full bg-white/[0.08]" />

                                        <div className="absolute inset-0 bg-black/[0.04]" />
                                    </div>
                                </div>

                                <p className="mt-2 text-[11px] text-[#626960]">
                                    Drag the image to choose the visible
                                    area.
                                </p>
                            </div>

                            {/* ZOOM */}

                            <div className="mt-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-[#c5c9c2]">
                                        Zoom
                                    </p>

                                    <span className="text-xs text-[#626960]">
                                        {Math.round(zoom * 100)}%
                                    </span>
                                </div>

                                <div className="mt-2 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeZoom(-0.1)
                                        }
                                        disabled={
                                            saving ||
                                            zoom <= 1
                                        }
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0b100c] text-[#858d84] transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                        aria-label="Zoom out"
                                    >
                                        <ZoomOut className="h-4 w-4" />
                                    </button>

                                    <input
                                        type="range"
                                        min="1"
                                        max="3"
                                        step="0.05"
                                        value={zoom}
                                        onChange={(event) =>
                                            setZoom(
                                                Number(
                                                    event.target.value,
                                                ),
                                            )
                                        }
                                        disabled={saving}
                                        className="h-1.5 w-full cursor-pointer accent-[#d8f45a] disabled:cursor-not-allowed"
                                        aria-label="Banner zoom"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeZoom(0.1)
                                        }
                                        disabled={
                                            saving ||
                                            zoom >= 3
                                        }
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0b100c] text-[#858d84] transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                        aria-label="Zoom in"
                                    >
                                        <ZoomIn className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* ACTIONS */}

                            <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-5">
                                <button
                                    type="button"
                                    onClick={closeEditor}
                                    disabled={saving}
                                    className="rounded-lg px-3.5 py-2 text-xs font-medium text-[#858d84] transition hover:bg-white/[0.05] hover:text-[#f1eee8] disabled:opacity-40"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="rounded-lg bg-[#d8f45a] px-4 py-2 text-xs font-bold text-[#10120d] transition hover:bg-[#e4ff6f] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfileBanner;