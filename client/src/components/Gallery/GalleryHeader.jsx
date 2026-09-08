import { FiChevronDown, FiX } from "react-icons/fi";

const GalleryHeader = ({
    currentFolder,
    onClose,
    onFolderClick,
    isFolderMenuOpen = false,
}) => {
    return (
        <div className="relative flex h-16 shrink-0 items-center border-b border-[#d8f45a]/15 px-4 sm:px-6">
            {/* CLOSE */}

            <button
                type="button"
                onClick={onClose}
                className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full text-[#edefe5] transition hover:bg-white/5 active:scale-95 sm:left-6"
                aria-label="Close gallery"
            >
                <FiX className="text-xl" />
            </button>

            {/* FOLDER SELECTOR */}

            <div className="flex flex-1 justify-center">
                <button
                    type="button"
                    onClick={onFolderClick}
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[#edefe5] transition hover:bg-white/5 active:scale-[0.98]"
                    aria-label="Choose gallery folder"
                    aria-expanded={isFolderMenuOpen}
                >
                    <span>{currentFolder || "Recents"}</span>

                    <FiChevronDown
                        className={`text-lg transition-transform duration-200 ${isFolderMenuOpen ? "rotate-180" : ""
                            }`}
                    />
                </button>
            </div>
        </div>
    );
};

export default GalleryHeader;