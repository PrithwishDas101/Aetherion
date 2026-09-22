import { useId } from "react";
import { getAvatarDecoration } from "../config/avatarDecorations.js";

const AetherOrbit = () => {
    const id = useId();
    const gradientId = `aether-orbit-gradient-${id}`;
    const glowId = `aether-orbit-glow-${id}`;

    return (
        <svg
            viewBox="0 0 100 100"
            className="pointer-events-none absolute inset-[-9%] z-0 h-[118%] w-[118%] overflow-visible"
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
            {/* Outer subtle border */}
            <circle
                cx="50"
                cy="50"
                r="47"
                fill="none"
                stroke="#252931"
                strokeWidth="1.2"
            />

            {/* Dark structural ring */}
            <circle
                cx="50"
                cy="50"
                r="44.8"
                fill="none"
                stroke="#44474d"
                strokeWidth="5"
            />

            {/* Bright inner ring */}
            <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#f3f1e8"
                strokeWidth="3.8"
            />

            {/* Very subtle inner edge */}
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
            className="pointer-events-none absolute inset-[-10%] z-0 h-[120%] w-[120%] overflow-visible"
            aria-hidden="true"
        >
            <defs>
                {/* Soft periwinkle → lavender metallic ring */}
                <linearGradient
                    id={ringGradientId}
                    x1="8%"
                    y1="5%"
                    x2="92%"
                    y2="95%"
                >
                    <stop offset="0%" stopColor="#eef0ff" />
                    <stop offset="18%" stopColor="#cfd3f4" />
                    <stop offset="42%" stopColor="#aeb4dc" />
                    <stop offset="68%" stopColor="#c5c9eb" />
                    <stop offset="100%" stopColor="#9298c4" />
                </linearGradient>

                {/* Moon / orb metallic white */}
                <linearGradient
                    id={moonGradientId}
                    x1="15%"
                    y1="10%"
                    x2="85%"
                    y2="90%"
                >
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="48%" stopColor="#f1f3ff" />
                    <stop offset="100%" stopColor="#c7cbea" />
                </linearGradient>

                <filter
                    id={glowId}
                    x="-100%"
                    y="-100%"
                    width="300%"
                    height="300%"
                >
                    <feGaussianBlur
                        stdDeviation="1.15"
                        result="blur"
                    />

                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* =========================================================
                MAIN CIRCULAR FRAME
               ========================================================= */}

            {/* Soft outer metallic edge */}
            <circle
                cx="50"
                cy="50"
                r="46.7"
                fill="none"
                stroke="#777da8"
                strokeWidth="4.8"
                opacity="0.32"
            />

            {/* Main continuous metallic ring */}
            <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke={`url(#${ringGradientId})`}
                strokeWidth="3.5"
            />

            {/* Fine inner highlight */}
            <circle
                cx="50"
                cy="50"
                r="43.8"
                fill="none"
                stroke="#f3f4ff"
                strokeWidth="0.65"
                opacity="0.42"
            />

            {/* =========================================================
                UPPER-LEFT MOON EMBLEM

                The emblem follows the circular border instead of
                floating separately from it.
               ========================================================= */}

            <g filter={`url(#${glowId})`}>
                {/* Small metallic mounting arc behind emblem */}
                <path
                    d="M17.2 31.8C19.8 22.2 27.0 15.0 36.2 11.9"
                    fill="none"
                    stroke="#dfe2ff"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    opacity="0.75"
                />

                {/* -----------------------------------------------------
                    CRESCENT

                    Positioned directly over the upper-left section
                    of the circular frame.
                   ----------------------------------------------------- */}

                <path
                    d="
                        M31.8 14.9
                        C25.1 16.2 20.0 21.9 19.8 28.9
                        C19.5 36.8 25.4 43.2 33.0 43.8
                        C38.0 44.2 42.6 41.9 45.4 38.0
                        C42.6 39.8 39.3 40.4 36.2 39.2
                        C30.4 37.1 27.1 31.1 28.6 25.1
                        C29.5 21.0 32.1 17.7 35.6 15.5
                        C34.3 15.0 33.1 14.8 31.8 14.9
                        Z
                    "
                    fill={`url(#${moonGradientId})`}
                    stroke="#ffffff"
                    strokeWidth="0.45"
                    opacity="0.98"
                />

                {/* -----------------------------------------------------
                    CENTRAL ORB

                    Smaller than before. It sits INSIDE the crescent
                    rather than becoming the whole decoration.
                   ----------------------------------------------------- */}

                <circle
                    cx="32.8"
                    cy="28.9"
                    r="5.9"
                    fill={`url(#${moonGradientId})`}
                />

                {/* Orb highlight */}
                <circle
                    cx="31.0"
                    cy="27.0"
                    r="1.65"
                    fill="#ffffff"
                    opacity="0.9"
                />

                {/* Tiny lower orb reflection */}
                <ellipse
                    cx="34.2"
                    cy="31.1"
                    rx="1.8"
                    ry="1.1"
                    fill="#d9dcf5"
                    opacity="0.55"
                />
            </g>

            {/* =========================================================
                FOUR FOUR-POINTED STARS

                1 + 2 = larger stars immediately around emblem
                3 + 4 = smaller trailing stars along the ring
               ========================================================= */}

            {/* ---------------------------------------------------------
                LARGE STAR #1
                Above-left of moon
               --------------------------------------------------------- */}

            <path
                d="
                    M24.4 8.0
                    L25.9 12.6
                    L30.5 14.1
                    L25.9 15.6
                    L24.4 20.2
                    L22.9 15.6
                    L18.3 14.1
                    L22.9 12.6
                    Z
                "
                fill="#ffffff"
                opacity="0.96"
                filter={`url(#${glowId})`}
            />

            {/* ---------------------------------------------------------
                LARGE STAR #2
                Immediately to the right / upper-right of moon
               --------------------------------------------------------- */}

            <path
                d="
                    M42.0 11.0
                    L43.3 15.1
                    L47.4 16.4
                    L43.3 17.7
                    L42.0 21.8
                    L40.7 17.7
                    L36.6 16.4
                    L40.7 15.1
                    Z
                "
                fill="#f9faff"
                opacity="0.94"
                filter={`url(#${glowId})`}
            />

            {/* ---------------------------------------------------------
                SMALL TRAILING STAR #1
                Follows the upper ring
               --------------------------------------------------------- */}

            <path
                d="
                    M51.0 12.6
                    L51.8 15.3
                    L54.5 16.1
                    L51.8 16.9
                    L51.0 19.6
                    L50.2 16.9
                    L47.5 16.1
                    L50.2 15.3
                    Z
                "
                fill="#e9ecff"
                opacity="0.82"
                filter={`url(#${glowId})`}
            />

            {/* ---------------------------------------------------------
                SMALL TRAILING STAR #2
                Further along the blue ring
               --------------------------------------------------------- */}

            <path
                d="
                    M58.7 17.8
                    L59.4 20.2
                    L61.8 20.9
                    L59.4 21.6
                    L58.7 24.0
                    L58.0 21.6
                    L55.6 20.9
                    L58.0 20.2
                    Z
                "
                fill="#e3e7ff"
                opacity="0.68"
                filter={`url(#${glowId})`}
            />

            {/* =========================================================
                SUBTLE LIGHT CATCHES ON RING

                These keep the frame metallic without turning it into
                a neon/glowing circle.
               ========================================================= */}

            <path
                d="M19.4 37.2C22.0 48.2 28.5 57.0 37.6 62.3"
                fill="none"
                stroke="#f4f5ff"
                strokeWidth="0.7"
                strokeLinecap="round"
                opacity="0.24"
            />

            <path
                d="M62.5 89.0C73.7 84.4 82.4 75.4 86.7 64.2"
                fill="none"
                stroke="#858bb5"
                strokeWidth="0.75"
                strokeLinecap="round"
                opacity="0.24"
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
            return <Initial />

        case "moonlit":
            return <Moonlit />

        default:
            return null;
    }
};

export default AvatarDecoration;