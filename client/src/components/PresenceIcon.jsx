import { PRESENCE_STATUS } from "../utils/presenceStatus.js";

const PresenceIcon = ({
    status,
    size = "normal",
}) => {
    const isSmall = size === "small";

    const sizeClasses = isSmall
  ? "h-3.5 w-3.5 shrink-0"
  : "h-5 w-5 shrink-0";

    const strokeWidth = isSmall ? 1.8 : 2;

    switch (status) {
        /*
         * ONLINE
         * Empty green perimeter.
         */
        case PRESENCE_STATUS.ONLINE:
            return (
                <span
                    className={`${sizeClasses} rounded-full border-[2px] border-[#4ade80] bg-transparent`}
                    aria-label="Online"
                />
            );

        /*
         * OFF PLANET
         * Empty grey perimeter.
         */
        case PRESENCE_STATUS.OFF_PLANET:
            return (
                <span
                    className={`${sizeClasses} rounded-full border-[2px] border-[#737a76] bg-transparent`}
                    aria-label="Off Planet"
                />
            );

        /*
         * IDLE
         * True new-moon icon.
         *
         * SVG is used so the shape itself is transparent
         * rather than faking the cutout with a background color.
         */
        case PRESENCE_STATUS.IDLE:
            return (
                <svg
                    viewBox="0 0 24 24"
                    className={sizeClasses}
                    fill="none"
                    aria-label="Idle"
                    role="img"
                >
                    <path
                        d="M17.5 3.5A9.5 9.5 0 1 0 20.5 16
               A8 8 0 1 1 17.5 3.5Z"
                        fill="#facc15"
                    />
                </svg>
            );

        /*
         * DND
         *
         * Black perimeter with a clean red cross.
         * No filled black circle.
         */
        case PRESENCE_STATUS.DND:
            return (
                <svg
                    viewBox="0 0 24 24"
                    className={sizeClasses}
                    fill="none"
                    aria-label="Do Not Disturb"
                    role="img"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="9.5"
                        stroke="#050505"
                        strokeWidth={strokeWidth}
                    />

                    <path
                        d="M8.5 8.5L15.5 15.5M15.5 8.5L8.5 15.5"
                        stroke="#ef4444"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />
                </svg>
            );

        default:
            return null;
    }
};

export default PresenceIcon;