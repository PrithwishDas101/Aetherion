import { FiCheck } from "react-icons/fi";

const PollOption = ({
    option,
    index,
    voteCount = 0,
    percentage = 0,
    isSelected = false,
    allowMultipleAnswers = false,
    disabled = false,
    onClick,
}) => {
    const handleClick = () => {
        if (disabled) {
            return;
        }

        onClick?.();
    };

    const handleKeyDown = (event) => {
        if (disabled) {
            return;
        }

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();
            onClick?.();
        }
    };

    const safePercentage = Math.max(
        0,
        Math.min(100, percentage),
    );

    return (
        <button
            type="button"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={`w-full text-left outline-none focus:outline-none focus:ring-0 focus-visible:outline-none ${disabled
                    ? "cursor-not-allowed opacity-70"
                    : "cursor-pointer"
                }`}
            aria-label={`Vote for ${option.text}`}
            aria-pressed={isSelected}
        >
            {/* OPTION */}
            <div className="flex items-center gap-2 px-0.5 py-1">
                <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center border transition ${isSelected
                        ? "border-[#171717] bg-[#171717] text-[#171717]"
                        : "border-[#687165] bg-transparent text-transparent"
                        } ${allowMultipleAnswers
                            ? "rounded-md"
                            : "rounded-full"
                        }`}
                >
                    {isSelected ? (
                        <FiCheck className="text-[10px] stroke-[4]" />
                    ) : null}
                </div>

                <span
                    className={`min-w-0 flex-1 break-words text-xs font-medium leading-5 ${isSelected
                        ? "text-[#F5F5F5]"
                        : "text-[#E5E5E5]"
                        }`}
                >
                    {option.text}
                </span>

                {voteCount > 0 ? (
                    <span className="shrink-0 text-[10px] font-semibold text-[#737373]">
                        {voteCount}
                    </span>
                ) : null}
            </div>

            {/* VOTE BAR */}
            <div className="relative ml-7 h-[9px] w-[calc(100%-1.75rem)] overflow-hidden rounded-md border border-white/[0.06] bg-[#FFFFFF]">
                <div
                    className={`absolute inset-y-0 left-0 rounded-md transition-all duration-500 ${isSelected
                        ? "bg-[#171717]"
                        : "bg-[#737373]/65 shadow-[inset_0_0_8px_rgba(156,175,82,0.18)]"
                        }`}
                    style={{
                        width: `${safePercentage}%`,
                    }}
                />
            </div>

        </button>
    );
};

export default PollOption;