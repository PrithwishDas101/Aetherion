const AetherionDayBadge = ({ milestone, size = "normal" }) => {
    if (!milestone) {
        return null;
    }

    const isSmall = size === "small";

    const containerSize = isSmall
        ? "h-8 w-8"
        : "h-9 w-9";

    const iconSize = isSmall ? 18 : 20;

    const renderIcon = () => {
        switch (milestone.icon) {
            case "spark":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z"
                            fill="currentColor"
                        />
                    </svg>
                );

            case "sparks":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M8 3L9 7L13 8L9 9L8 13L7 9L3 8L7 7L8 3Z"
                            fill="currentColor"
                        />
                        <path
                            d="M17 10L18 14L22 15L18 16L17 20L16 16L12 15L16 14L17 10Z"
                            fill="currentColor"
                        />
                    </svg>
                );

            case "sprout":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M12 21V11"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <path
                            d="M12 12C7 12 5 9 5 5C9 5 12 7 12 12Z"
                            fill="currentColor"
                        />
                        <path
                            d="M12 10C12 5 15 3 19 3C19 7 17 10 12 10Z"
                            fill="currentColor"
                        />
                    </svg>
                );

            case "orbit":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="3"
                            fill="currentColor"
                        />
                        <ellipse
                            cx="12"
                            cy="12"
                            rx="9"
                            ry="4"
                            transform="rotate(-25 12 12)"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        />
                    </svg>
                );

            case "moon":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M19 15.5A8 8 0 0 1 8.5 5
                 A8.5 8.5 0 1 0 19 15.5Z"
                            fill="currentColor"
                        />
                    </svg>
                );

            case "diamond":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M12 3L20 12L12 21L4 12L12 3Z"
                            fill="currentColor"
                        />
                        <path
                            d="M12 6L17 12L12 18L7 12L12 6Z"
                            fill="#101218"
                            opacity="0.45"
                        />
                    </svg>
                );

            case "star":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M12 2L14.8 8.6L22 9.2L16.5 14L18.2 21L12 17.3L5.8 21L7.5 14L2 9.2L9.2 8.6L12 2Z"
                            fill="currentColor"
                        />
                    </svg>
                );

            case "crystal":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M7 3H17L21 9L12 21L3 9L7 3Z"
                            fill="currentColor"
                        />
                        <path
                            d="M7 3L12 9L17 3M3 9H21M12 9V21"
                            stroke="#101218"
                            strokeWidth="1"
                            opacity="0.5"
                        />
                    </svg>
                );

            case "rings":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="7"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        />
                        <ellipse
                            cx="12"
                            cy="12"
                            rx="10"
                            ry="3.5"
                            transform="rotate(-25 12 12)"
                            stroke="currentColor"
                            strokeWidth="1"
                        />
                    </svg>
                );

            case "gem":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M6 4H18L22 9L12 21L2 9L6 4Z"
                            fill="currentColor"
                        />
                        <path
                            d="M6 4L12 9L18 4M2 9H22M12 9V21"
                            stroke="#101218"
                            strokeWidth="1"
                            opacity="0.5"
                        />
                    </svg>
                );

            case "flame":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M13.5 2C14 6 10 7 10 11
                 C10 13 11.5 14.5 13 14.5
                 C14.5 14.5 15.5 13.5 15.5 11
                 C18 14 19 16 19 18
                 C19 21.5 16 23 12 23
                 C7.5 23 5 20 5 16
                 C5 11.5 8 8.5 13.5 2Z"
                            fill="currentColor"
                        />
                    </svg>
                );

            case "year":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                        <path
                            d="M8 15L12 7L16 15"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M9.5 13H14.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                );

            case "crown":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M4 18L3 7L8 11L12 4L16 11L21 7L20 18H4Z"
                            fill="currentColor"
                        />
                        <path
                            d="M5 20H19"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                );

            case "comet":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M6 18L15 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <circle
                            cx="17"
                            cy="7"
                            r="4"
                            fill="currentColor"
                        />
                        <path
                            d="M4 20L10 14"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            opacity="0.5"
                        />
                    </svg>
                );

            case "trophy":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M7 4H17V9C17 12 15 14 12 15C9 14 7 12 7 9V4Z"
                            fill="currentColor"
                        />
                        <path
                            d="M7 6H4V8C4 10 5.5 11.5 8 11.5M17 6H20V8C20 10 18.5 11.5 16 11.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M12 15V19M8 21H16"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                );

            case "galaxy":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="2.5"
                            fill="currentColor"
                        />
                        <ellipse
                            cx="12"
                            cy="12"
                            rx="10"
                            ry="4"
                            transform="rotate(-35 12 12)"
                            stroke="currentColor"
                            strokeWidth="1"
                        />
                        <ellipse
                            cx="12"
                            cy="12"
                            rx="10"
                            ry="4"
                            transform="rotate(35 12 12)"
                            stroke="currentColor"
                            strokeWidth="1"
                        />
                    </svg>
                );

            case "infinity":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M7 7C4.8 7 3 8.8 3 11
                 C3 13.2 4.8 15 7 15
                 C9.5 15 11 12 12 11
                 C13 10 14.5 7 17 7
                 C19.2 7 21 8.8 21 11
                 C21 13.2 19.2 15 17 15
                 C14.5 15 13 12 12 11
                 C11 10 9.5 7 7 7Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        />
                    </svg>
                );

            case "constellation":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle cx="5" cy="6" r="1.5" fill="currentColor" />
                        <circle cx="18" cy="5" r="1.5" fill="currentColor" />
                        <circle cx="12" cy="13" r="1.5" fill="currentColor" />
                        <circle cx="19" cy="18" r="1.5" fill="currentColor" />
                        <circle cx="6" cy="19" r="1.5" fill="currentColor" />

                        <path
                            d="M5 6L12 13L18 5M12 13L19 18L6 19L5 6"
                            stroke="currentColor"
                            strokeWidth="1"
                            opacity="0.7"
                        />
                    </svg>
                );

            case "planet":
                return (
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="5"
                            fill="currentColor"
                        />
                        <ellipse
                            cx="12"
                            cy="12"
                            rx="10"
                            ry="3.5"
                            transform="rotate(-20 12 12)"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        />
                    </svg>
                );

            default:
                return null;
        }
    };

    return (
        <span
            title={milestone.name}
            className={[
                containerSize,
                "inline-flex shrink-0 items-center justify-center",
                "text-[#9fcaef]",
            ].join(" ")}
            aria-label={milestone.name}
        >
            {renderIcon()}
        </span>
    );
};

export default AetherionDayBadge;