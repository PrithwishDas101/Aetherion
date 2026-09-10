import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Image,
} from "lucide-react";

import toast from "react-hot-toast";

const GALLERY_PERMISSION_STORAGE_KEY =
    "aetherion_gallery_permission";

const GALLERY_PERMISSION = {
    ASK: "ASK",
    GRANTED: "GRANTED",
};

const GalleryModal = ({
    isOpen,
    onClose,
    onSend,
    source = "chat",
}) => {
    const fileInputRef =
        useRef(null);

    const [isSending, setIsSending] =
        useState(false);

    const [permission, setPermission] =
        useState(GALLERY_PERMISSION.ASK);

    const hasOpenedPickerRef =
        useRef(false);

    // LOAD SAVED GALLERY PERMISSION
    useEffect(() => {
        const savedPermission =
            localStorage.getItem(
                GALLERY_PERMISSION_STORAGE_KEY,
            );

        if (
            savedPermission ===
            GALLERY_PERMISSION.GRANTED
        ) {
            setPermission(
                GALLERY_PERMISSION.GRANTED,
            );

            return;
        }

        setPermission(
            GALLERY_PERMISSION.ASK,
        );
    }, []);

    // RESET PICKER STATE WHEN MODAL CLOSES
    useEffect(() => {
        if (!isOpen) {
            hasOpenedPickerRef.current =
                false;
        }
    }, [isOpen]);

    // IF PERMISSION WAS ALREADY GRANTED,
    // OPEN THE NATIVE PICKER DIRECTLY.
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (
            permission !==
            GALLERY_PERMISSION.GRANTED
        ) {
            return;
        }

        if (
            hasOpenedPickerRef.current
        ) {
            return;
        }

        hasOpenedPickerRef.current =
            true;

        requestAnimationFrame(() => {
            fileInputRef.current?.click();
        });
    }, [
        isOpen,
        permission,
    ]);

    const handleCancel = () => {
        onClose?.();
    };

    const handleContinue = () => {
        // SAVE PERMISSION ONLY WHEN
        // THE USER EXPLICITLY CONTINUES.
        localStorage.setItem(
            GALLERY_PERMISSION_STORAGE_KEY,
            GALLERY_PERMISSION.GRANTED,
        );

        setPermission(
            GALLERY_PERMISSION.GRANTED,
        );

        // Prevent the effect above from
        // opening the picker twice.
        hasOpenedPickerRef.current =
            true;

        // This runs directly inside the user's
        // button click, so browsers can open
        // the native media picker.
        fileInputRef.current?.click();
    };

    const handleFileInputChange =
        async (event) => {
            const files =
                Array.from(
                    event.target.files || [],
                );

            // Reset so selecting the same file
            // again later still triggers change.
            event.target.value = "";

            // User closed the native picker.
            if (!files.length) {
                onClose?.();

                return;
            }

            try {
                setIsSending(true);

                await onSend?.({
                    items: files.map(
                        (file) => ({
                            id: [
                                file.name,
                                file.size,
                                file.lastModified,
                            ].join("-"),
                            file,
                        }),
                    ),
                    caption: "",
                    source,
                });

                onClose?.();
            } catch (error) {
                console.error(
                    "Gallery send error:",
                    error,
                );

                toast.error(
                    "Unable to send selected media.",
                );
            } finally {
                setIsSending(false);
            }
        };

    if (!isOpen) {
        return null;
    }

    return (
        <>
            {/* HIDDEN NATIVE MEDIA PICKER */}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={
                    handleFileInputChange
                }
            />

            {/* SHOW PERMISSION UI ONLY
                BEFORE ACCESS IS GRANTED */}

            {permission ===
                GALLERY_PERMISSION.ASK ? (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

                    <div className="w-full max-w-[340px] rounded-2xl border border-[#d8f45a]/15 bg-[#0b100c] px-5 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">

                        {/* GALLERY ICON */}

                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#181f1a]">
                            <Image
                                size={20}
                                strokeWidth={2}
                                className="text-[#506fb9]"
                            />
                        </div>

                        {/* TEXT */}

                        <h2 className="text-[17px] font-semibold text-[#edefe5]">
                            Access your gallery?
                        </h2>

                        <p className="mt-2 text-sm leading-5 text-[#8a9385]">
                            Choose photos and videos
                            to send in this chat.
                        </p>

                        {/* ACTIONS */}

                        <div className="mt-5 flex gap-3">

                            <button
                                type="button"
                                onClick={
                                    handleCancel
                                }
                                disabled={
                                    isSending
                                }
                                className="flex-1 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-[#edefe5] transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleContinue
                                }
                                disabled={
                                    isSending
                                }
                                className="flex-1 rounded-xl bg-[#e4ff6f] px-4 py-2.5 text-sm font-semibold text-[#10120d] transition hover:bg-[#e1fe5d] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Continue
                            </button>

                        </div>

                    </div>

                </div>
            ) : null}
        </>
    );
};

export default GalleryModal;