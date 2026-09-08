import { FaPaperPlane } from "react-icons/fa";

const GallerySelectionBar = ({
    caption,
    selectedCount = 0,
    onCaptionChange,
    onSend,
    isSending = false,
}) => {
    if (selectedCount <= 0) {
        return null;
    }

    return (
        <div className="shrink-0 border-t border-[#d8f45a]/15 bg-[#0b100c] px-3 py-3 sm:px-5">
            <div className="flex items-center gap-3">
                {/* CAPTION */}

                <input
                    type="text"
                    value={caption}
                    onChange={(event) =>
                        onCaptionChange?.(event.target.value)
                    }
                    placeholder="Add caption"
                    disabled={isSending}
                    className="h-12 min-w-0 flex-1 rounded-full border border-[#d8f45a]/15 bg-[#151c16] px-5 text-sm text-[#edefe5] outline-none placeholder:text-[#70786f] transition focus:border-[#d8f45a]/40 disabled:opacity-50"
                />

                {/* SEND */}

                <button
                    type="button"
                    onClick={onSend}
                    disabled={isSending || selectedCount <= 0}
                    className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d8f45a] text-[#10120d] transition hover:bg-[#e4ff6f] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Send ${selectedCount} selected items`}
                >
                    {isSending ? (
                        <span className="text-lg font-bold">...</span>
                    ) : (
                        <FaPaperPlane className="ml-0.5 text-lg" />
                    )}

                    {/* ITEM COUNT */}

                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#10120d] px-1 text-[10px] font-bold text-[#d8f45a] ring-1 ring-[#d8f45a]/40">
                        {selectedCount > 99 ? "99+" : selectedCount}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default GallerySelectionBar;