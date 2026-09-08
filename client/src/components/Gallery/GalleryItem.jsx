import { FiCheck, FiPlay } from "react-icons/fi";

const GalleryItem = ({
    item,
    isSelected = false,
    onClick,
    disabled = false,
}) => {
    if (!item) {
        return null;
    }

    const handleClick = () => {
        if (disabled) {
            return;
        }

        onClick?.(item);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className={`group relative aspect-square w-full overflow-hidden rounded-xl bg-[#151c16] transition-all duration-200 ${disabled
                    ? "cursor-not-allowed opacity-40"
                    : "cursor-pointer active:scale-[0.97]"
                } ${isSelected
                    ? "ring-2 ring-[#d8f45a]"
                    : "hover:ring-1 hover:ring-[#d8f45a]/40"
                }`}
            aria-label={`Select ${item.name}`}
            aria-pressed={isSelected}
        >
            {item.type === "video" ? (
                <video
                    src={item.previewUrl}
                    muted
                    playsInline
                    preload="metadata"
                    className={`pointer-events-none h-full w-full object-cover transition duration-200 ${isSelected
                            ? "opacity-50"
                            : "opacity-100 group-hover:scale-[1.03]"
                        }`}
                />
            ) : (
                <img
                    src={item.previewUrl}
                    alt={item.name}
                    draggable="false"
                    className={`pointer-events-none h-full w-full object-cover transition duration-200 ${isSelected
                            ? "opacity-50"
                            : "opacity-100 group-hover:scale-[1.03]"
                        }`}
                />
            )}

            {/* VIDEO INDICATOR */}

            {item.type === "video" && (
                <div className="pointer-events-none absolute bottom-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
                    <FiPlay className="ml-0.5 text-sm" />
                </div>
            )}

            {/* SELECTED OVERLAY */}

            {isSelected && (
                <div className="pointer-events-none absolute inset-0 bg-[#d8f45a]/10" />
            )}

            {/* GREEN TICK */}

            {isSelected && (
                <div className="pointer-events-none absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#d8f45a] text-[#10120d] shadow-lg">
                    <FiCheck className="text-base font-bold" />
                </div>
            )}
        </button>
    );
};

export default GalleryItem;