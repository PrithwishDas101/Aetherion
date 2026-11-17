import { FiImage, FiX } from "react-icons/fi";

const GalleryAccessModal = ({
    isOpen,
    onAllow,
    onDeny,
    isRequesting = false,
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="absolute inset-0 z-[130] flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm">
            <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-[#E5E5E5] bg-[#F7F7F5] shadow-2xl">
                {/* TOP ICON */}

                <div className="flex justify-center pt-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#171717]/10 text-[#171717]">
                        <FiImage className="text-3xl" />
                    </div>
                </div>

                {/* CONTENT */}

                <div className="px-7 pb-7 pt-5 text-center">
                    <h2 className="text-lg font-bold text-[#171717]">
                        Allow Aetherion to access your gallery?
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-[#737373]">
                        Select photos and videos from your device to send them in this
                        chat.
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[#737373]">
                        Aetherion only accesses the media you choose.
                    </p>

                    {/* ACTIONS */}

                    <div className="mt-7 flex gap-3">
                        <button
                            type="button"
                            onClick={onDeny}
                            disabled={isRequesting}
                            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-[#ffffff]/10 bg-[#F5F5F5] text-sm font-semibold text-[#E5E5E5] transition hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Not now
                        </button>

                        <button
                            type="button"
                            onClick={onAllow}
                            disabled={isRequesting}
                            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#171717] text-sm font-bold text-[#F7F7F5] transition hover:bg-[#333333] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isRequesting ? "Opening..." : "Allow"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GalleryAccessModal;