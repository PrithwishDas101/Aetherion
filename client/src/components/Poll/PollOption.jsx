import { FiCheck, } from "react-icons/fi";

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


    return (
        <button
            type="button"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={`relative w-full overflow-hidden rounded-xl border text-left transition-all duration-200 ${isSelected
                ? "border-[#d8f45a]/55 bg-[#d8f45a]/10"
                : "border-white/[0.06] bg-white/[0.025] hover:border-[#d8f45a]/25 hover:bg-white/[0.045]"
                } ${disabled
                    ? "cursor-not-allowed opacity-70"
                    : "cursor-pointer active:scale-[0.99]"
                }`}
            aria-label={`Vote for ${option.text}`}
            aria-pressed={isSelected}
        >

            {/* PERCENTAGE FILL */}
            <div
                className={`absolute inset-y-0 left-0 transition-all duration-500 ${isSelected
                    ? "bg-[#d8f45a]/18"
                    : "bg-[#d8f45a]/8"
                    }`}
                style={{
                    width: `${Math.max(
                        0,
                        Math.min(
                            100,
                            percentage,
                        ),
                    )}%`,
                }}
            />


            {/* CONTENT */}
            <div className="relative flex min-h-12 items-center gap-3 px-3.5 py-2.5">

                {/* SELECTOR */}
                <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center border transition ${isSelected
                        ? "border-[#d8f45a] bg-[#d8f45a] text-[#10120d]"
                        : "border-[#7d8677] bg-transparent text-transparent"
                        } ${allowMultipleAnswers
                            ? "rounded-md"
                            : "rounded-full"
                        }`}
                >
                    {isSelected ? (
                        <FiCheck className="text-base stroke-[3]" />
                    ) : null}
                </div>

                {/* OPTION TEXT */}
                <span
                    className={`min-w-0 flex-1 break-words text-sm font-medium ${isSelected
                        ? "text-[#eff6d6]"
                        : "text-[#d9dfd4]"
                        }`}
                >
                    {option.text}
                </span>

                {/* VOTE COUNT */}
                <span
                    className={`shrink-0 text-xs font-semibold ${voteCount > 0
                        ? "text-[#d8f45a]"
                        : "text-[#6f786a]"
                        }`}
                >
                    {voteCount}
                </span>

            </div>

            {/* OPTIONAL PERCENTAGE */}
            {voteCount > 0 ? (
                <div className="relative px-3.5 pb-2.5 pl-[58px]">

                    <span className="text-[10px] font-medium text-[#778071]">
                        {Math.round(
                            percentage,
                        )}
                        %
                    </span>

                </div>
            ) : null}

        </button>
    );
};

export default PollOption;
