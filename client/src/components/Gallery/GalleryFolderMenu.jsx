import { FiCheck } from "react-icons/fi";

const GalleryFolderMenu = ({
    folders = [],
    currentFolderId,
    onSelect,
    isOpen = false,
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="absolute left-1/2 top-[68px] z-50 w-[min(280px,calc(100%-32px))] -translate-x-1/2 overflow-hidden rounded-2xl border border-[#d8f45a]/20 bg-[#111811]/95 shadow-2xl backdrop-blur-xl">
            <div className="scrollbar-aetherion max-h-[280px] overflow-y-auto p-2">
                {folders.map((folder) => {
                    const isActive =
                        String(folder.id) === String(currentFolderId);

                    return (
                        <button
                            key={folder.id}
                            type="button"
                            onClick={() => onSelect?.(folder)}
                            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${isActive
                                    ? "bg-[#d8f45a]/10 text-[#d8f45a]"
                                    : "text-[#edefe5] hover:bg-white/5"
                                }`}
                        >
                            <span className="truncate">{folder.name}</span>

                            {isActive && (
                                <FiCheck className="shrink-0 text-lg" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default GalleryFolderMenu;