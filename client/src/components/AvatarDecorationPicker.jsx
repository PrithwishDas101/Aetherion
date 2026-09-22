import { useEffect, useState } from "react";
import Avatar from "./Avatar.jsx";
import { AVATAR_DECORATIONS } from "../config/avatarDecorations.js";

const AvatarDecorationPicker = ({
    isOpen,
    onClose,
    currentDecoration = "none",
    profilePic,
    initials,
    fullName,
    onApply,
    saving = false,
}) => {
    const [selectedDecoration, setSelectedDecoration] = useState(currentDecoration);

    useEffect(() => {
        if (isOpen) {
            setSelectedDecoration(currentDecoration || "none");
        }
    }, [isOpen, currentDecoration]);

    if (!isOpen) {
        return null;
    }

    const decorations = Object.values(AVATAR_DECORATIONS);

    const handleApply = () => {
        if (saving) {
            return;
        }

        onApply(selectedDecoration);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#273027] bg-[#101510] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#273027] px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[#eef5d5]">
                            Avatar Decoration
                        </h2>

                        <p className="mt-1 text-sm text-[#899289]">
                            Choose how your avatar appears across Aetherion.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#899289] transition hover:bg-[#1a211a] hover:text-[#eef5d5] disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Close decoration picker"
                    >
                        ×
                    </button>
                </div>

                <div className="flex flex-col items-center px-5 py-8">
                    <div className="mb-7">
                        <Avatar
                            profilePic={profilePic}
                            initials={initials}
                            alt={fullName}
                            decoration={selectedDecoration}
                            size="lg"
                            avatarClassName="bg-[#1a211a] font-bold text-[#d8f45a]"
                        />
                    </div>

                    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
                        {decorations.map((decoration) => {
                            const isSelected = selectedDecoration === decoration.id;

                            return (
                                <button
                                    key={decoration.id}
                                    type="button"
                                    onClick={() => setSelectedDecoration(decoration.id)}
                                    disabled={saving}
                                    className={`relative flex min-h-[150px] flex-col items-center justify-center rounded-xl border p-4 text-center transition ${isSelected
                                            ? "border-[#d8f45a] bg-[#182018]"
                                            : "border-[#273027] bg-[#141914] hover:border-[#465046] hover:bg-[#191f19]"
                                        }`}
                                >
                                    <Avatar
                                        profilePic={profilePic}
                                        initials={initials}
                                        alt={fullName}
                                        decoration={decoration.id}
                                        size="md"
                                        avatarClassName="bg-[#1a211a] font-bold text-[#d8f45a]"
                                    />

                                    <span className="mt-4 text-sm font-medium text-[#eef5d5]">
                                        {decoration.name}
                                    </span>

                                    <span className="mt-1 text-xs leading-4 text-[#899289]">
                                        {decoration.description}
                                    </span>

                                    {isSelected && (
                                        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#d8f45a] text-xs font-bold text-[#101510]">
                                            ✓
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-[#273027] px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-[#a8b0a5] transition hover:bg-[#1a211a] hover:text-[#eef5d5] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleApply}
                        disabled={saving}
                        className="rounded-lg bg-[#d8f45a] px-5 py-2 text-sm font-semibold text-[#101510] transition hover:bg-[#c8e64f] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Apply"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvatarDecorationPicker;