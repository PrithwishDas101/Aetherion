import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import toast from "react-hot-toast";

import GalleryHeader from "./GalleryHeader.jsx";
import GalleryFolderMenu from "./GalleryFolderMenu.jsx";
import GalleryGrid from "./GalleryGrid.jsx";
import GallerySelectionBar from "./GallerySelectionBar.jsx";

import {
    GALLERY_PERMISSION,
    GALLERY_PERMISSION_STORAGE_KEY,
} from "./galleryConstants.js";

import {
    validateGallerySelection,
} from "../../utils/galleryValidation.js";

import {
    createGalleryFoldersFromMedia,
    createGalleryMediaItems,
    filterGalleryMediaItems,
    revokeMediaPreviewUrls,
} from "../../utils/mediaMetadata.js";

const GalleryModal = ({
    isOpen,
    onClose,
    onSend,
    initialFiles = [],
    source = "chat",
}) => {
    const [mediaItems, setMediaItems] = useState([]);

    const [selectedItems, setSelectedItems] =
        useState([]);

    const [caption, setCaption] =
        useState("");

    const [currentFolder, setCurrentFolder] =
        useState({
            id: "recent",
            name: "Recents",
            filter: "all",
        });

    const [
        isFolderMenuOpen,
        setIsFolderMenuOpen,
    ] = useState(false);

    const [isSending, setIsSending] =
        useState(false);

    const [permission, setPermission] =
        useState(
            GALLERY_PERMISSION.ASK,
        );

    const fileInputRef = useRef(null);

    // LOAD SAVED GALLERY PERMISSION
    useEffect(() => {
        const savedPermission =
            localStorage.getItem(
                GALLERY_PERMISSION_STORAGE_KEY,
            );

        if (
            savedPermission ===
            GALLERY_PERMISSION.GRANTED ||
            savedPermission ===
            GALLERY_PERMISSION.DENIED
        ) {
            setPermission(savedPermission);
        } else {
            setPermission(
                GALLERY_PERMISSION.ASK,
            );
        }
    }, []);

    // OPEN NATIVE FILE PICKER
    const openNativeGalleryPicker = () => {
        requestAnimationFrame(() => {
            fileInputRef.current?.click();
        });
    };

    // OPEN PICKER AUTOMATICALLY IF ALREADY ALLOWED
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (
            permission ===
            GALLERY_PERMISSION.GRANTED
        ) {
            openNativeGalleryPicker();
        }
    }, [
        isOpen,
        permission,
    ]);

    // SUPPORT INITIAL FILES
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const files =
            Array.from(
                initialFiles || [],
            );

        if (!files.length) {
            return;
        }

        const items =
            createGalleryMediaItems(
                files,
            );

        setMediaItems(
            (previousItems) => {
                revokeMediaPreviewUrls(
                    previousItems,
                );

                return items;
            },
        );

        setCurrentFolder({
            id: "recent",
            name: "Recents",
            filter: "all",
        });
    }, [
        initialFiles,
        isOpen,
    ]);

    // CLEAN STATE WHEN CLOSED
    useEffect(() => {
        if (isOpen) {
            return;
        }

        setSelectedItems([]);

        setCaption("");

        setIsFolderMenuOpen(false);

        setIsSending(false);
    }, [isOpen]);

    // CLEANUP MEDIA PREVIEW URLS
    useEffect(() => {
        return () => {
            revokeMediaPreviewUrls(
                mediaItems,
            );
        };
    }, [mediaItems]);

    // USER ACCEPTS AETHERION GALLERY ACCESS
    const handleAllowGallery = () => {
        localStorage.setItem(
            GALLERY_PERMISSION_STORAGE_KEY,
            GALLERY_PERMISSION.GRANTED,
        );

        setPermission(
            GALLERY_PERMISSION.GRANTED,
        );
    };

    // USER DENIES AETHERION GALLERY ACCESS
    const handleDenyGallery = () => {
        localStorage.setItem(
            GALLERY_PERMISSION_STORAGE_KEY,
            GALLERY_PERMISSION.DENIED,
        );

        setPermission(
            GALLERY_PERMISSION.DENIED,
        );

        onClose?.();
    };

    // HANDLE FILE INPUT CHANGE
    const handleFileInputChange = (
        event,
    ) => {
        const files =
            Array.from(
                event.target.files || [],
            );

        // Reset the input so selecting the
        // same file again still triggers change.
        event.target.value = "";

        if (!files.length) {
            return;
        }

        const items =
            createGalleryMediaItems(
                files,
            );

        setMediaItems(
            (previousItems) => {
                revokeMediaPreviewUrls(
                    previousItems,
                );

                return items;
            },
        );

        setSelectedItems([]);

        setCurrentFolder({
            id: "recent",
            name: "Recents",
            filter: "all",
        });
    };

    // CREATE AVAILABLE FOLDERS
    const folders = useMemo(() => {
        return createGalleryFoldersFromMedia(
            mediaItems,
        );
    }, [mediaItems]);

    // FILTER CURRENT FOLDER
    const visibleMediaItems =
        useMemo(() => {
            return filterGalleryMediaItems(
                mediaItems,
                currentFolder?.filter ||
                "all",
            );
        }, [
            mediaItems,
            currentFolder,
        ]);

    // SELECTED ITEM IDS
    const selectedItemIds =
        useMemo(() => {
            return new Set(
                selectedItems.map(
                    (item) =>
                        String(
                            item.id,
                        ),
                ),
            );
        }, [selectedItems]);

    // TOGGLE MEDIA SELECTION
    const handleItemClick = (
        item,
    ) => {
        if (!item) {
            return;
        }

        const isAlreadySelected =
            selectedItemIds.has(
                String(item.id),
            );

        // DESELECT
        if (isAlreadySelected) {
            setSelectedItems(
                (
                    previousItems,
                ) =>
                    previousItems.filter(
                        (
                            currentItem,
                        ) =>
                            String(
                                currentItem.id,
                            ) !==
                            String(
                                item.id,
                            ),
                    ),
            );

            return;
        }

        // VALIDATE BEFORE SELECTING
        const validation =
            validateGallerySelection({
                file: item.file,
                selectedCount:
                    selectedItems.length,
            });

        if (!validation.valid) {
            toast.error(
                validation.error,
            );

            return;
        }

        // SELECT
        setSelectedItems(
            (previousItems) => [
                ...previousItems,
                item,
            ],
        );
    };

    // CHANGE FOLDER
    const handleFolderSelect = (
        folder,
    ) => {
        setCurrentFolder(folder);

        setIsFolderMenuOpen(false);
    };

    // SEND SELECTED MEDIA
    const handleSend = async () => {
        if (
            !selectedItems.length ||
            isSending
        ) {
            return;
        }

        try {
            setIsSending(true);

            await onSend?.({
                items: selectedItems,
                caption:
                    caption.trim(),
                source,
            });

            setSelectedItems([]);

            setCaption("");

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
            {/* HIDDEN NATIVE GALLERY PICKER */}

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

            {/* AETHERION PERMISSION SCREEN */}

            {permission ===
                GALLERY_PERMISSION.ASK ? (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-[#d8f45a]/15 bg-[#0b100c] p-6 shadow-2xl">
                        <h2 className="text-lg font-bold text-[#edefe5]">
                            Allow Aetherion to
                            access your gallery?
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-[#8a9385]">
                            Choose photos and
                            videos from your
                            device to send in this
                            chat.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={
                                    handleDenyGallery
                                }
                                className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#edefe5] transition hover:bg-white/5"
                            >
                                No
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleAllowGallery
                                }
                                className="rounded-xl bg-[#d8f45a] px-5 py-2.5 text-sm font-bold text-[#10120d] transition hover:bg-[#e4ff6f]"
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-0 backdrop-blur-sm sm:p-4">
                    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0b100c] shadow-2xl sm:h-[min(900px,92vh)] sm:max-w-4xl sm:rounded-3xl">

                        {/* HEADER */}

                        <GalleryHeader
                            currentFolder={
                                currentFolder?.name
                            }
                            onClose={
                                onClose
                            }
                            onFolderClick={() =>
                                setIsFolderMenuOpen(
                                    (
                                        previousState,
                                    ) =>
                                        !previousState,
                                )
                            }
                            isFolderMenuOpen={
                                isFolderMenuOpen
                            }
                        />

                        {/* FOLDER MENU */}

                        <GalleryFolderMenu
                            folders={folders}
                            currentFolderId={
                                currentFolder?.id
                            }
                            onSelect={
                                handleFolderSelect
                            }
                            isOpen={
                                isFolderMenuOpen
                            }
                        />

                        {/* MEDIA GRID */}

                        <div className="min-h-0 flex-1 pt-3">
                            <GalleryGrid
                                mediaItems={
                                    visibleMediaItems
                                }
                                selectedItems={
                                    selectedItems
                                }
                                onItemClick={
                                    handleItemClick
                                }
                                disabled={
                                    isSending
                                }
                            />
                        </div>

                        {/* SELECTION BAR */}

                        <GallerySelectionBar
                            caption={
                                caption
                            }
                            selectedCount={
                                selectedItems.length
                            }
                            onCaptionChange={
                                setCaption
                            }
                            onSend={
                                handleSend
                            }
                            isSending={
                                isSending
                            }
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default GalleryModal;