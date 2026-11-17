import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { logSafeClientError } from "../utils/safeLogging.js";
import {
    ImagePlus,
    ZoomIn,
    ZoomOut,
    Pencil
} from "lucide-react";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

const ProfileBanner = ({
    bannerUrl,
    onBannerChange,
    editMode = false,
    showAction = true,
    defaultBannerVariant = "classic",
}) => {
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
            logSafeClientError("Profile banner save", error);
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
                ) : defaultBannerVariant === "space-city" ? (
                    <div className="absolute inset-0 overflow-hidden bg-[#17191b]">
                        <svg viewBox="0 0 1600 400" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="Monochrome low-poly space city with orbital planets and geometric towers">
                            <defs>
                                <linearGradient id="space-city-sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#34383c"/><stop offset=".52" stopColor="#202326"/><stop offset="1" stopColor="#111315"/></linearGradient>
                                <linearGradient id="space-city-moon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f0f0ed"/><stop offset=".55" stopColor="#aeb2b4"/><stop offset="1" stopColor="#656a6e"/></linearGradient>
                                <linearGradient id="space-city-tower" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#777d81"/><stop offset=".48" stopColor="#d0d2d1"/><stop offset="1" stopColor="#555b60"/></linearGradient>
                                <linearGradient id="space-city-haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9dcda" stopOpacity="0"/><stop offset="1" stopColor="#d9dcda" stopOpacity=".2"/></linearGradient>
                            </defs>
                            <rect width="1600" height="400" fill="url(#space-city-sky)"/>
                            <path d="M0 250 Q230 190 440 245 T850 226 T1250 220 T1600 240 V400 H0Z" fill="url(#space-city-haze)"/>
                            <circle cx="1180" cy="105" r="105" fill="url(#space-city-moon)" opacity=".8"/>
                            <path d="M1040 102 Q1180 -2 1325 92 Q1185 48 1040 102Z" fill="#f0f1ef" opacity=".36"/>
                            <ellipse cx="1180" cy="112" rx="185" ry="37" fill="none" stroke="#d9dcda" strokeWidth="10" opacity=".42" transform="rotate(-17 1180 112)"/>
                            <ellipse cx="1180" cy="112" rx="185" ry="37" fill="none" stroke="#555b60" strokeWidth="3" opacity=".8" transform="rotate(-17 1180 112)"/>
                            <circle cx="340" cy="78" r="53" fill="#aeb3b5" opacity=".48"/>
                            <ellipse cx="340" cy="78" rx="92" ry="17" fill="none" stroke="#c8cccd" strokeWidth="5" opacity=".25" transform="rotate(22 340 78)"/>
                            <g opacity=".72" fill="#c8cccd"><circle cx="175" cy="55" r="2"/><circle cx="510" cy="62" r="2"/><circle cx="890" cy="48" r="2"/><circle cx="1450" cy="55" r="2"/><circle cx="1510" cy="160" r="2"/></g>
                            <path d="M0 315 L95 280 L155 300 L230 254 L300 292 L390 260 L465 296 L560 255 L640 286 L735 245 L830 290 L920 260 L1010 292 L1110 246 L1200 280 L1300 245 L1390 285 L1490 252 L1600 290 V400 H0Z" fill="#252a2e"/>
                            <g stroke="#d5d8d7" strokeOpacity=".38" strokeWidth="2">
                                <path d="M115 320 V190 L155 165 L195 190 V320Z" fill="#7c8387"/><path d="M155 165 V320 H195 V190Z" fill="#51585d"/><path d="M115 190 L155 165 L195 190 L155 208Z" fill="#c1c5c5"/>
                                <path d="M220 320 V130 L255 108 L290 130 V320Z" fill="#a0a5a6"/><path d="M255 108 V320 H290 V130Z" fill="#5c6368"/><path d="M220 130 L255 108 L290 130 L255 151Z" fill="#d4d7d6"/>
                                <path d="M315 320 V215 Q350 160 385 215 V320Z" fill="#858c90"/><path d="M350 177 Q385 160 385 215 V320 H350Z" fill="#4c5358"/>
                                <path d="M430 320 V155 L470 126 L510 155 V320Z" fill="#aeb3b3"/><path d="M470 126 V320 H510 V155Z" fill="#60676c"/><path d="M430 155 L470 126 L510 155 L470 178Z" fill="#e0e2df"/>
                                <path d="M560 320 V205 L610 170 L660 205 V320Z" fill="#7e8589"/><path d="M610 170 V320 H660 V205Z" fill="#4c5358"/><path d="M560 205 L610 170 L660 205 L610 231Z" fill="#c3c7c6"/>
                                <path d="M720 320 V115 L770 80 L820 115 V320Z" fill="url(#space-city-tower)"/><path d="M770 80 V320 H820 V115Z" fill="#535a5f"/><path d="M720 115 L770 80 L820 115 L770 145Z" fill="#e0e2df"/>
                                <path d="M870 320 V190 L920 150 L970 190 V320Z" fill="#8e9598"/><path d="M920 150 V320 H970 V190Z" fill="#4d555a"/><path d="M870 190 L920 150 L970 190 L920 218Z" fill="#cdd0cf"/>
                                <path d="M1040 320 V145 L1080 118 L1120 145 V320Z" fill="#aeb3b4"/><path d="M1080 118 V320 H1120 V145Z" fill="#555d62"/><path d="M1040 145 L1080 118 L1120 145 L1080 169Z" fill="#e0e2df"/>
                                <path d="M1200 320 V210 Q1255 135 1310 210 V320Z" fill="#92999c"/><path d="M1255 165 Q1310 135 1310 210 V320 H1255Z" fill="#555c61"/>
                                <path d="M1370 320 V165 L1410 135 L1450 165 V320Z" fill="#9da3a5"/><path d="M1410 135 V320 H1450 V165Z" fill="#50585d"/><path d="M1370 165 L1410 135 L1450 165 L1410 188Z" fill="#dadddc"/>
                            </g>
                            <g fill="none" stroke="#d8dcda" strokeWidth="5" strokeOpacity=".55">
                                <path d="M90 238 H220 M195 275 H430 M290 210 H560 M510 245 H720 M660 220 H870 M820 250 H1040 M970 220 H1200 M1120 260 H1370"/>
                                <path d="M205 238 l-12 -12 m12 12 l-12 12 M425 275 l-12 -12 m12 12 l-12 12 M555 210 l-12 -12 m12 12 l-12 12 M865 220 l-12 -12 m12 12 l-12 12"/>
                            </g>
                            <g fill="none" stroke="#bfc4c4" strokeWidth="4" strokeOpacity=".65">
                                <path d="M210 238 V320 M230 238 V320 M210 252 H230 M210 270 H230 M210 288 H230 M210 306 H230"/>
                                <path d="M650 220 V320 M670 220 V320 M650 240 H670 M650 260 H670 M650 280 H670 M650 300 H670"/>
                                <path d="M1030 220 V320 M1050 220 V320 M1030 240 H1050 M1030 260 H1050 M1030 280 H1050 M1030 300 H1050"/>
                            </g>
                            <g fill="#d8dcda" opacity=".25"><path d="M0 340 L180 320 L360 350 L540 325 L720 355 L900 325 L1080 350 L1260 320 L1440 350 L1600 330 V400 H0Z"/><path d="M0 370 L260 350 L470 380 L710 350 L950 380 L1190 350 L1400 375 L1600 355 V400 H0Z"/></g>
                            <rect y="385" width="1600" height="15" fill="#0d0f11" opacity=".55"/>
                        </svg>
                    </div>
                ) : (
                    <>
                        {/* Original rings banner retained as the classic fallback. */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_40%,rgba(216,244,90,0.18),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(75,110,70,0.22),transparent_35%),linear-gradient(135deg,#111811,#182119_45%,#0b100c)]" />
                        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full border border-[#d8f45a]/[0.06]" />
                        <div className="absolute -right-4 -top-8 h-36 w-36 rounded-full border border-[#d8f45a]/[0.04]" />
                        <div className="absolute bottom-0 left-0 h-px w-full bg-white/[0.05]" />
                    </>
                )}

                {/* BANNER ACTION */}

                {showAction && (
                    editMode ? (
                        <button
                            type="button"
                            onClick={openFilePicker}
                            disabled={saving}
                            className="aetherion-profile-banner-action absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Change banner"
                            title="Change banner"
                        >
                            <Pencil
                                className="h-4 w-4"
                                strokeWidth={3.5}
                            />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={openFilePicker}
                            disabled={saving}
                            className="aetherion-profile-banner-action absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold backdrop-blur-md transition disabled:cursor-not-allowed disabled:opacity-50 sm:right-4 sm:top-4 sm:w-auto sm:gap-2 sm:px-3"
                            aria-label={bannerUrl ? "Change banner" : "Add banner"}
                            title={bannerUrl ? "Change banner" : "Add banner"}
                        >
                            <ImagePlus className="h-4 w-4" />

                            <span className="hidden sm:inline">
                                {bannerUrl ? "Change banner" : "Add banner"}
                            </span>
                        </button>
                    )
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
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-3 pb-3 sm:items-center sm:px-5 sm:pb-0 aetherion-profile-modal"
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