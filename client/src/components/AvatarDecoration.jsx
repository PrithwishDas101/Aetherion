import { useId } from "react";
import { getAvatarDecoration } from "../config/avatarDecorations.js";

const AetherOrbit = () => {
    const id = useId();
    const gradientId = `aether-orbit-gradient-${id}`;
    const glowId = `aether-orbit-glow-${id}`;

    return (
        <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-[-9%] z-0 h-[118%] w-[118%] overflow-visible" aria-hidden="true">
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d8f45a" stopOpacity="0.06" />
                    <stop offset="42%" stopColor="#d8f45a" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#d8f45a" stopOpacity="0.08" />
                </linearGradient>

                <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="1.1" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <g className="aether-orbit-rotation">
                <ellipse cx="50" cy="50" rx="46" ry="42" fill="none" stroke={`url(#${gradientId})`} strokeWidth="0.85" strokeDasharray="25 9 7 18" strokeLinecap="round" opacity="0.82" filter={`url(#${glowId})`} />

                <path d="M16 31C25 15 45 7 63 12" fill="none" stroke="#d8f45a" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />

                <path d="M73 78C61 91 39 94 25 86" fill="none" stroke="#d8f45a" strokeWidth="0.85" strokeLinecap="round" opacity="0.38" />

                <circle cx="16" cy="31" r="1.8" fill="#d8f45a" opacity="0.9" filter={`url(#${glowId})`} />
                <circle cx="73" cy="78" r="1.35" fill="#d8f45a" opacity="0.72" />
                <circle cx="63" cy="12" r="0.9" fill="#eef5d5" opacity="0.8" />
                <circle cx="25" cy="86" r="0.8" fill="#eef5d5" opacity="0.55" />
                <circle cx="84" cy="40" r="0.7" fill="#d8f45a" opacity="0.5" />
            </g>
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

        default:
            return null;
    }
};

export default AvatarDecoration;