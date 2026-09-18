import { PRESENCE_STATUS } from "../utils/presenceStatus.js";

const PresenceIcon = ({
    status,
    size = "normal",
}) => {
    const isSmall = size === "small";

    const sizeClasses = isSmall
        ? "h-2.5 w-2.5 shrink-0"
        : "h-5 w-5 shrink-0";

    const strokeWidth = isSmall ? 1.8 : 2;

    switch (status) {
        // ONLINE
        case PRESENCE_STATUS.ONLINE:
            return (
                <span
                    className={`${sizeClasses} rounded-full bg-[#42e655] shadow-[0_0_4px_rgba(9,217,85,0.55)]`}
                    aria-label="Online"
                />
            );

        // OFF PLANET
        case PRESENCE_STATUS.OFF_PLANET:
            return (
                <span
                    className={`${sizeClasses} rounded-full bg-[#737a76] shadow-[0_0_3px_rgba(180,188,183,0.4)]`}
                    aria-label="Off Planet"
                />
            );

        // IDLE
        case PRESENCE_STATUS.IDLE:
            return (
                <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
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

        // DND
        case PRESENCE_STATUS.DND:
            return (
                <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    aria-label="Do Not Disturb"
                    role="img"
                >
                    {/* Red ball */}
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                        fill="#ef4444"
                    />

                    {/* Black center line */}
                    <path
                        d="M7 12H17"
                        stroke="#050505"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>);

        default:
            return null;
    }
};

export default PresenceIcon;