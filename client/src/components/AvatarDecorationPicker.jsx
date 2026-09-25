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
    const [selectedDecoration, setSelectedDecoration] =        useState(currentDecoration);

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
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-3 py-4 backdrop-blur-sm sm:px-5"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !saving
                ) {
                    onClose();
                }
            }}
        >
            <div
                className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101510] shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
                onMouseDown={(event) => event.stopPropagation()}
            >
                {/* HEADER */}
                <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">
                    <h2 className="text-base font-semibold tracking-tight text-[#f1eee8] sm:text-lg">
                        Change Avatar Decoration
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-xl leading-none text-[#626960] transition hover:bg-white/[0.05] hover:text-[#f1eee8] disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Close decoration picker"
                    >
                        ×
                    </button>
                </div>

                {/* AVATAR PREVIEW */}
                <div className="flex shrink-0 items-center justify-center px-5 pb-6 pt-7 sm:pb-7 sm:pt-8">
                    <Avatar
                        profilePic={profilePic}
                        initials={initials}
                        alt={fullName || "Profile"}
                        decoration={selectedDecoration}
                        size="lg"
                        avatarClassName="bg-[#171d17] font-bold text-[#d8f45a]"
                    />
                </div>

                {/* DECORATION GRID */}
                <div className="aetherion-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-5 sm:px-6">
                    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3">
                        {decorations.map((decoration) => {
                            const isSelected =
                                selectedDecoration === decoration.id;

                            return (
                                <button
                                    key={decoration.id}
                                    type="button"
                                    onClick={() =>
                                        setSelectedDecoration(
                                            decoration.id,
                                        )
                                    }
                                    disabled={saving}
                                    aria-label={`Select ${decoration.name}`}
                                    aria-pressed={isSelected}
                                    className={`group relative flex
                                        aspect-square min-w-0
                                        items-center justify-center
                                        rounded-xl border transition-all
                                        duration-150
                                        ${isSelected
                                            ? "border-[#d8f45a]/70 bg-white/[0.035] shadow-[0_0_0_1px_rgba(216,244,90,0.08)]"
                                            : "border-white/[0.07] bg-white/[0.018] hover:border-white/[0.14] hover:bg-white/[0.035]"
                                        }
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    `}
                                >
                                    <Avatar
                                        profilePic={profilePic}
                                        initials={initials}
                                        alt={fullName || "Profile"}
                                        decoration={decoration.id}
                                        size="md"
                                        avatarClassName="bg-[#171d17] font-bold text-[#d8f45a]"
                                    />

                                    {/* SELECTED INDICATOR */}
                                    {isSelected && (
                                        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#d8f45a] text-[11px] font-black text-[#101510] shadow-lg">
                                            ✓
                                        </span>
                                    )}

                                    {/* DECORATION NAME */}
                                    <span
                                        className={`absolute bottom-1.5 left-1.5 right-1.5 truncate text-center text-[9px] font-medium leading-3 transition-colors sm:text-[10px]
                                            ${isSelected
                                                ? "text-[#d5d7c9]"
                                                : "text-[#747c73] group-hover:text-[#aeb5aa]"
                                            }
                                        `}
                                    >
                                        {decoration.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex shrink-0 items-center justify-end gap-2 border-t border-white/[0.06] px-4 py-3.5 sm:px-6 sm:py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-[#858d84] transition hover:bg-white/[0.05] hover:text-[#f1eee8] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleApply}
                        disabled={saving}
                        className="rounded-lg bg-[#d8f45a] px-5 py-2 text-sm font-bold text-[#10120d] transition hover:bg-[#e4ff6f] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Apply"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvatarDecorationPicker;