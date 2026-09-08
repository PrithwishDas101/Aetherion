import GalleryItem from "./GalleryItem.jsx";

const GalleryGrid = ({
    mediaItems = [],
    selectedItems = [],
    onItemClick,
    disabled = false,
}) => {
    const selectedIds = new Set(
        selectedItems.map((item) => String(item.id)),
    );

    if (!mediaItems.length) {
        return (
            <div className="flex h-full min-h-[300px] items-center justify-center">
                <p className="text-sm text-[#70786f]">
                    No media available.
                </p>
            </div>
        );
    }

    return (
        <div className="scrollbar-aetherion h-full overflow-y-auto px-3 pb-4 sm:px-5">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-5">
                {mediaItems.map((item) => (
                    <GalleryItem
                        key={item.id}
                        item={item}
                        isSelected={selectedIds.has(String(item.id))}
                        onClick={onItemClick}
                        disabled={disabled}
                    />
                ))}
            </div>
        </div>
    );
};

export default GalleryGrid;