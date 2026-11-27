/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            keyframes: {
                paletteOverlayIn: {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                palettePanelIn: {
                    from: { opacity: "0", transform: "translateY(-12px) scale(0.985)" },
                    to: { opacity: "1", transform: "translateY(0) scale(1)" },
                },
            },
            animation: {
                "palette-overlay-in": "paletteOverlayIn 180ms ease-out both",
                "palette-panel-in": "palettePanelIn 260ms cubic-bezier(0.16, 1, 0.3, 1) both",
            },
        },
    },
    plugins: [],
};
