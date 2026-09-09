const GalleryFolderMenu = ({
    folders = [],
    currentFolderId,
    onSelect,
    isOpen,
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="absolute left-1/2 top-[72px] z-[110] w-[min(320px,88vw)] -translate-x-1/2 overflow-hidden rounded-2xl border border-[#d8f45a]/15 bg-[#121812] shadow-2xl">
            <div className="scrollbar-aetherion max-h-[320px] overflow-y-auto p-2">
                {folders.map((folder) => {
                    const isActive =
                        String(folder.id) ===
                        String(currentFolderId);

                    return (
                        <button
                            key={folder.id}
                            type="button"
                            onClick={() => onSelect?.(folder)}
                            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${isActive
                                    ? "bg-[#d8f45a]/15 text-[#d8f45a]"
                                    : "text-[#edefe5] hover:bg-white/5"
                                }`}
                        >
                            <span className="truncate">
                                {folder.name}
                            </span>

                            {isActive && (
                                <span className="h-2 w-2 rounded-full bg-[#d8f45a]" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default GalleryFolderMenu;