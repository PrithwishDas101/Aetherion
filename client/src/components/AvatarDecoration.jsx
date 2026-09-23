import { useId } from "react";
import { getAvatarDecoration } from "../config/avatarDecorations.js";

const AetherOrbit = () => {
    const id = useId();
    const gradientId = `aether-orbit-gradient-${id}`;
    const glowId = `aether-orbit-glow-${id}`;

    return (
        <svg
            viewBox="0 0 100 100"
            className="pointer-events-none absolute inset-[-9%] z-10 h-[118%] w-[118%] overflow-visible"
            aria-hidden="true"
        >
            <defs>
                <linearGradient
                    id={gradientId}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                >
                    <stop offset="0%" stopColor="#d8f45a" stopOpacity="0.06" />
                    <stop offset="42%" stopColor="#d8f45a" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#d8f45a" stopOpacity="0.08" />
                </linearGradient>

                <filter
                    id={glowId}
                    x="-100%"
                    y="-100%"
                    width="300%"
                    height="300%"
                >
                    <feGaussianBlur stdDeviation="1.1" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <g className="aether-orbit-rotation">
                <ellipse
                    cx="50"
                    cy="50"
                    rx="46"
                    ry="42"
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth="0.85"
                    strokeDasharray="25 9 7 18"
                    strokeLinecap="round"
                    opacity="0.82"
                    filter={`url(#${glowId})`}
                />

                <path
                    d="M16 31C25 15 45 7 63 12"
                    fill="none"
                    stroke="#d8f45a"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                    opacity="0.7"
                />

                <path
                    d="M73 78C61 91 39 94 25 86"
                    fill="none"
                    stroke="#d8f45a"
                    strokeWidth="0.85"
                    strokeLinecap="round"
                    opacity="0.38"
                />

                <circle
                    cx="16"
                    cy="31"
                    r="1.8"
                    fill="#d8f45a"
                    opacity="0.9"
                    filter={`url(#${glowId})`}
                />

                <circle cx="73" cy="78" r="1.35" fill="#d8f45a" opacity="0.72" />
                <circle cx="63" cy="12" r="0.9" fill="#eef5d5" opacity="0.8" />
                <circle cx="25" cy="86" r="0.8" fill="#eef5d5" opacity="0.55" />
                <circle cx="84" cy="40" r="0.7" fill="#d8f45a" opacity="0.5" />
            </g>
        </svg>
    );
};

const Initial = () => {
    return (
        <svg
            viewBox="0 0 100 100"
            className="pointer-events-none absolute inset-[-8%] z-0 h-[116%] w-[116%] overflow-visible"
            aria-hidden="true"
        >
            <circle
                cx="50"
                cy="50"
                r="47"
                fill="none"
                stroke="#252931"
                strokeWidth="1.2"
            />

            <circle
                cx="50"
                cy="50"
                r="44.8"
                fill="none"
                stroke="#44474d"
                strokeWidth="5"
            />

            <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#f3f1e8"
                strokeWidth="3.8"
            />

            <circle
                cx="50"
                cy="50"
                r="39.8"
                fill="none"
                stroke="#c9c9c5"
                strokeWidth="0.5"
                opacity="0.45"
            />
        </svg>
    );
};

const Moonlit = () => {
    const id = useId();

    const ringGradientId = `moonlit-ring-${id}`;
    const moonGradientId = `moonlit-moon-${id}`;
    const glowId = `moonlit-glow-${id}`;

    return (
        <svg
            viewBox="0 0 100 100"
            className="pointer-events-none absolute inset-[-12%] z-0 h-[124%] w-[124%] overflow-visible"
            aria-hidden="true"
        >
            <defs>
                {/* Main metallic lunar ring */}
                <linearGradient
                    id={ringGradientId}
                    x1="5%"
                    y1="5%"
                    x2="95%"
                    y2="95%"
                >
                    <stop offset="0%" stopColor="#f4f5ff" />
                    <stop offset="18%" stopColor="#d8dcf7" />
                    <stop offset="42%" stopColor="#aeb5dc" />
                    <stop offset="68%" stopColor="#d0d4f0" />
                    <stop offset="100%" stopColor="#8f96c2" />
                </linearGradient>

                {/* Crescent */}
                <linearGradient
                    id={moonGradientId}
                    x1="15%"
                    y1="10%"
                    x2="85%"
                    y2="90%"
                >
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="45%" stopColor="#f1f3ff" />
                    <stop offset="100%" stopColor="#c3c8e8" />
                </linearGradient>

                <filter
                    id={glowId}
                    x="-100%"
                    y="-100%"
                    width="300%"
                    height="300%"
                >
                    <feGaussianBlur
                        stdDeviation="1.05"
                        result="blur"
                    />

                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* =========================================================
                OUTER METALLIC RING
            ========================================================= */}

            <circle
                cx="50"
                cy="50"
                r="47"
                fill="none"
                stroke="#7077a2"
                strokeWidth="4.8"
                opacity="0.28"
            />

            <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke={`url(#${ringGradientId})`}
                strokeWidth="3.4"
            />

            <circle
                cx="50"
                cy="50"
                r="43.9"
                fill="none"
                stroke="#f5f6ff"
                strokeWidth="0.65"
                opacity="0.38"
            />

            {/* =========================================================
                NORTH-WEST CELESTIAL CLUSTER

                Deliberately kept OUTSIDE the avatar boundary.
            ========================================================= */}

            <g filter={`url(#${glowId})`}>

                {/* Crescent */}
                <path
                    d="
                        M24.5 4.8
                        C16.8 5.6 11.2 11.0 10.9 17.8
                        C10.6 24.8 16.0 30.2 22.7 30.0
                        C26.0 29.9 29.0 28.4 31.1 25.8
                        C26.4 26.5 22.2 24.1 20.3 20.3
                        C17.2 14.2 19.0 8.3 24.5 4.8
                        Z
                    "
                    fill={`url(#${moonGradientId})`}
                    stroke="#ffffff"
                    strokeWidth="0.45"
                    opacity="0.98"
                />

                {/* Tiny lunar highlight */}
                <circle
                    cx="17.2"
                    cy="14.5"
                    r="2.35"
                    fill={`url(#${moonGradientId})`}
                />

                <circle
                    cx="16.5"
                    cy="13.8"
                    r="0.65"
                    fill="#ffffff"
                    opacity="0.9"
                />

                <ellipse
                    cx="17.8"
                    cy="15.7"
                    rx="0.8"
                    ry="0.48"
                    fill="#d9dcf5"
                    opacity="0.55"
                />
            </g>

            {/* =========================================================
                CELESTIAL SPARKLES
            ========================================================= */}

            {/* Main northwest sparkle */}
            <path
                d="
                    M30.8 1.8
                    L32.2 5.4
                    L35.8 6.8
                    L32.2 8.2
                    L30.8 11.8
                    L29.4 8.2
                    L25.8 6.8
                    L29.4 5.4
                    Z
                "
                fill="#ffffff"
                opacity="0.98"
                filter={`url(#${glowId})`}
            />

            {/* Far-left sparkle */}
            <path
                d="
                    M6.8 17.2
                    L7.9 20.2
                    L10.9 21.3
                    L7.9 22.4
                    L6.8 25.4
                    L5.7 22.4
                    L2.7 21.3
                    L5.7 20.2
                    Z
                "
                fill="#f9faff"
                opacity="0.94"
                filter={`url(#${glowId})`}
            />

            {/* Small upper sparkle */}
            <path
                d="
                    M45.0 1.8
                    L45.7 4.1
                    L48.0 4.8
                    L45.7 5.5
                    L45.0 7.8
                    L44.3 5.5
                    L42.0 4.8
                    L44.3 4.1
                    Z
                "
                fill="#e9ecff"
                opacity="0.82"
                filter={`url(#${glowId})`}
            />

            {/* Tiny secondary sparkle */}
            <path
                d="
                    M56.8 7.0
                    L57.4 9.0
                    L59.4 9.6
                    L57.4 10.2
                    L56.8 12.2
                    L56.2 10.2
                    L54.2 9.6
                    L56.2 9.0
                    Z
                "
                fill="#e3e7ff"
                opacity="0.68"
                filter={`url(#${glowId})`}
            />

            {/* =========================================================
                SUBTLE LUNAR ACCENTS
            ========================================================= */}

            <path
                d="
                    M15.0 36.0
                    C18.4 47.5 25.7 56.5 36.2 62.0
                "
                fill="none"
                stroke="#f4f5ff"
                strokeWidth="0.7"
                strokeLinecap="round"
                opacity="0.22"
            />

            <path
                d="
                    M63.0 89.5
                    C74.0 84.8 82.8 75.5 87.0 64.0
                "
                fill="none"
                stroke="#858bb5"
                strokeWidth="0.75"
                strokeLinecap="round"
                opacity="0.22"
            />
        </svg>
    );
};

const AvatarDecoration = ({ decoration = "none" }) => {
    const decorationData = getAvatarDecoration(decoration);

    if (decorationData.id === "none") {
        return null;
    }

    switch (decorationData.id) {
        case "aether-orbit":
            return <AetherOrbit />;

        case "initial":
            return <Initial />;

        case "moonlit":
            return <Moonlit />;

        default:
            return null;
    }
};

export default AvatarDecoration;