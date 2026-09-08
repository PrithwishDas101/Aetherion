import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import GalleryHeader from "./GalleryHeader.jsx";
import GalleryFolderMenu from "./GalleryFolderMenu.jsx";
import GalleryGrid from "./GalleryGrid.jsx";
import GallerySelectionBar from "./GallerySelectionBar.jsx";

import {
    DEFAULT_GALLERY_FOLDERS,
} from "./galleryConstants.js";

import {
    validateGallerySelection,
} from "../../utils/galleryValidation.js";

import {
    createGalleryMediaItems,
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

    const [selectedItems, setSelectedItems] = useState([]);

    const [caption, setCaption] = useState("");

    const [currentFolder, setCurrentFolder] = useState(
        DEFAULT_GALLERY_FOLDERS[0],
    );

    const [isFolderMenuOpen, setIsFolderMenuOpen] =
        useState(false);

    const [isSending, setIsSending] = useState(false);

    const previousItemsRef = useRef([]);

    // BUILD MEDIA ITEMS FROM FILES
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const files = Array.from(initialFiles || []);

        if (!files.length) {
            return;
        }

        const items = createGalleryMediaItems(files);

        previousItemsRef.current = items;

        setMediaItems(items);

        return () => {
            revokeMediaPreviewUrls(items);
        };
    }, [initialFiles, isOpen]);

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

    // SELECTED ITEM IDS
    const selectedItemIds = useMemo(() => {
        return new Set(
            selectedItems.map((item) => String(item.id)),
        );
    }, [selectedItems]);

    // TOGGLE SELECTION
    const handleItemClick = (item) => {
        if (!item) {
            return;
        }

        const isAlreadySelected = selectedItemIds.has(
            String(item.id),
        );

        // DESELECT
        if (isAlreadySelected) {
            setSelectedItems((previousItems) =>
                previousItems.filter(
                    (currentItem) =>
                        String(currentItem.id) !== String(item.id),
                ),
            );

            return;
        }

        // VALIDATE BEFORE SELECTING
        const validation = validateGallerySelection({
            file: item.file,
            selectedCount: selectedItems.length,
        });

        if (!validation.valid) {
            toast.error(validation.error);
            return;
        }

        // SELECT
        setSelectedItems((previousItems) => [
            ...previousItems,
            item,
        ]);
    };

    // FOLDER CHANGE
    const handleFolderSelect = (folder) => {
        setCurrentFolder(folder);

        setIsFolderMenuOpen(false);
    };

    // SEND
    const handleSend = async () => {
        if (!selectedItems.length || isSending) {
            return;
        }

        try {
            setIsSending(true);

            await onSend?.({
                items: selectedItems,
                caption: caption.trim(),
                source,
            });

            setSelectedItems([]);
            setCaption("");

            onClose?.();
        } catch (error) {
            console.error("Gallery send error:", error);

            toast.error("Unable to send selected media.");
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-0 backdrop-blur-sm sm:p-4">
            {/* MODAL */}

            <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0b100c] shadow-2xl sm:h-[min(900px,92vh)] sm:max-w-4xl sm:rounded-3xl">
                {/* HEADER */}

                <GalleryHeader
                    currentFolder={currentFolder?.name}
                    onClose={onClose}
                    onFolderClick={() =>
                        setIsFolderMenuOpen(
                            (previousState) => !previousState,
                        )
                    }
                    isFolderMenuOpen={isFolderMenuOpen}
                />

                {/* FOLDER MENU */}

                <GalleryFolderMenu
                    folders={DEFAULT_GALLERY_FOLDERS}
                    currentFolderId={currentFolder?.id}
                    onSelect={handleFolderSelect}
                    isOpen={isFolderMenuOpen}
                />

                {/* MEDIA GRID */}

                <div className="min-h-0 flex-1 pt-3">
                    <GalleryGrid
                        mediaItems={mediaItems}
                        selectedItems={selectedItems}
                        onItemClick={handleItemClick}
                        disabled={isSending}
                    />
                </div>

                {/* BOTTOM BAR */}

                <GallerySelectionBar
                    caption={caption}
                    selectedCount={selectedItems.length}
                    onCaptionChange={setCaption}
                    onSend={handleSend}
                    isSending={isSending}
                />
            </div>
        </div>
    );
};

export default GalleryModal;