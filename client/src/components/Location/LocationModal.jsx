import { useEffect, useState } from "react";
import {
    FiAlertCircle,
    FiArrowLeft,
    FiMapPin,
    FiRefreshCw,
    FiSend,
} from "react-icons/fi";

const LocationModal = ({
    isOpen,
    onClose,
    onSend,
    isSending = false,
}) => {
    const [status, setStatus] = useState("idle");
    const [coordinates, setCoordinates] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setStatus("error");
            setErrorMessage("Location services are not supported by this browser.");
            return;
        }

        setStatus("loading");
        setErrorMessage("");
        setCoordinates(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                    setStatus("error");
                    setErrorMessage("Your location could not be determined.");
                    return;
                }

                setCoordinates({ latitude, longitude });
                setStatus("ready");
            },
            (error) => {
                console.error("Location permission error:", error);

                if (error.code === 1) {
                    setStatus("denied");
                    setErrorMessage(
                        "Location permission was denied. Please allow location access and try again.",
                    );
                } else if (error.code === 2) {
                    setStatus("error");
                    setErrorMessage(
                        "Your location could not be determined. Please try again.",
                    );
                } else if (error.code === 3) {
                    setStatus("error");
                    setErrorMessage(
                        "Location request timed out. Please try again.",
                    );
                } else {
                    setStatus("error");
                    setErrorMessage(
                        "Unable to get your location. Please try again.",
                    );
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            },
        );
    };

    useEffect(() => {
        if (!isOpen) return;

        setStatus("idle");
        setCoordinates(null);
        setErrorMessage("");
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        requestLocation();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!coordinates || isSending || !onSend) return;
        await onSend(coordinates);
    };

    const handleClose = () => {
        if (isSending) return;
        onClose?.();
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-3 py-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div
                className="w-[calc(100vw-24px)] max-w-[360px] overflow-hidden rounded-xl border border-[#d8f45a]/10 bg-[#111711] shadow-2xl"
                onMouseDown={(event) => event.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2.5">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSending}
                            className="aetherion-button h-7 w-7 rounded-lg text-sm disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <FiArrowLeft />
                        </button>

                        <div>
                            <p className="text-xs font-semibold text-[#f1eee8]">
                                Share location
                            </p>
                        </div>
                    </div>

                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d8f45a]/10 text-[#d4d8c2]">
                        <FiMapPin className="text-sm" />
                    </div>
                </div>

                {/* Content */}
                <div className="px-3 py-3">

                    {status === "loading" && (
                        <div className="flex min-h-[210px] flex-col items-center justify-center rounded-lg border border-white/[0.05] bg-[#0d120e] px-5 text-center">
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#d8f45a]/10 text-[#d8f45a]">
                                <FiMapPin className="text-lg animate-pulse" />
                            </div>

                            <p className="text-xs font-medium text-[#e7e9e3]">
                                Finding your location
                            </p>

                            <p className="mt-1 max-w-[220px] text-[9px] leading-4 text-[#687167]">
                                Please allow location access when your browser asks.
                            </p>
                        </div>
                    )}

                    {status === "ready" && coordinates && (
                        <div className="overflow-hidden rounded-lg border border-white/[0.05] bg-[#0d120e]">

                            {/* Compact map preview */}
                            <div className="relative h-[155px] w-full overflow-hidden sm:h-[170px]">
                                {(() => {
                                    const offset = 0.005;

                                    const minLongitude = coordinates.longitude - offset;
                                    const maxLongitude = coordinates.longitude + offset;
                                    const minLatitude = coordinates.latitude - offset;
                                    const maxLatitude = coordinates.latitude + offset;

                                    const mapUrl =
                                        `https://www.openstreetmap.org/export/embed.html?` +
                                        `bbox=${minLongitude},${minLatitude},${maxLongitude},${maxLatitude}` +
                                        `&layer=mapnik`;

                                    return (
                                        <iframe
                                            title="Current location"
                                            src={mapUrl}
                                            className="h-full w-full border-0"
                                            loading="lazy"
                                            style={{
                                                filter:
                                                    "brightness(0.72) saturate(0.7) contrast(0.95)",
                                            }}
                                        />
                                    );
                                })()}

                                {/* Location pin */}
                                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e2e4d7] text-[#11150f] shadow-lg">
                                        <FiMapPin className="text-base" />
                                    </div>

                                    <div className="mx-auto h-1.5 w-1.5 rounded-full bg-[#dbdcd5]" />
                                </div>
                            </div>

                            {/* Location details */}
                            <div className="px-3 py-2.5">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d8f45a]/10 text-[#d8f45a]">
                                        <FiMapPin className="text-sm" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[12px] font-semibold text-[#f1eee8]">
                                            Current location
                                        </p>

                                        <p className="mt-0.5 truncate font-mono text-[13px] text-[#626b61]">
                                            {coordinates.latitude.toFixed(6)},{" "}
                                            {coordinates.longitude.toFixed(6)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(status === "error" || status === "denied") && (
                        <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-[#ff6b6b]/10 bg-[#160f0f] px-5 text-center">
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#ff6b6b]/10 text-[#ff7b7b]">
                                <FiAlertCircle className="text-lg" />
                            </div>

                            <p className="text-xs font-medium text-[#f1eee8]">
                                Location unavailable
                            </p>

                            <p className="mt-1 max-w-[250px] text-[9px] leading-4 text-[#817773]">
                                {errorMessage}
                            </p>

                            <button
                                type="button"
                                onClick={requestLocation}
                                disabled={isSending}
                                className="mt-4 flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[9px] font-semibold text-[#aeb7aa] transition hover:bg-white/[0.05] hover:text-[#d8f45a]"
                            >
                                <FiRefreshCw className="text-xs" />
                                Try again
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {status === "ready" && coordinates && (
                    <div className="flex gap-2 border-t border-white/[0.06] px-3 py-2.5">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSending}
                            className="flex-1 rounded-lg border border-white/[0.06] px-3 py-2 text-[12px] font-semibold text-[#7f897d] transition hover:bg-white/[0.03] hover:text-[#b7beb4] disabled:opacity-40"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={isSending}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#d8f45a] px-3 py-2 text-[10px] font-bold text-[#11150f] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSending ? (
                                <>
                                    <FiRefreshCw className="animate-spin text-xs" />
                                    Sending
                                </>
                            ) : (
                                <>
                                    <FiSend className="text-lg" />
                                    Send location
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationModal;