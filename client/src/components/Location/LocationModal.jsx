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
            setErrorMessage(
                "Location services are not supported by this browser.",
            );
            return;
        }

        setStatus("loading");
        setErrorMessage("");
        setCoordinates(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                if (
                    !Number.isFinite(latitude) ||
                    !Number.isFinite(longitude)
                ) {
                    setStatus("error");
                    setErrorMessage(
                        "Your location could not be determined.",
                    );
                    return;
                }

                setCoordinates({
                    latitude,
                    longitude,
                });

                setStatus("ready");
            },
            (error) => {
                console.error(
                    "Location permission error:",
                    error,
                );

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
        if (!isOpen) {
            return;
        }

        setStatus("idle");
        setCoordinates(null);
        setErrorMessage("");
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        requestLocation();
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSend = async () => {
        if (
            !coordinates ||
            isSending ||
            !onSend
        ) {
            return;
        }

        await onSend(coordinates);
    };

    const handleClose = () => {
        if (isSending) {
            return;
        }

        onClose?.();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-[390px] overflow-hidden rounded-2xl border border-[#d8f45a]/10 bg-[#111711] shadow-2xl">
                {/* HEADER */}

                <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSending}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#9ca694] transition hover:bg-white/[0.05] hover:text-[#f1eee8] disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Close location"
                    >
                        <FiArrowLeft className="text-lg" />
                    </button>

                    <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-semibold text-[#f1eee8]">
                            Send Location
                        </h2>

                        <p className="mt-0.5 text-[10px] text-[#727b71]">
                            Share your current location once
                        </p>
                    </div>

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d8f45a]/10 text-[#d8f45a]">
                        <FiMapPin className="text-base" />
                    </div>
                </div>

                {/* CONTENT */}

                <div className="px-4 py-5">
                    {/* IDLE */}

                    {status === "idle" && (
                        <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#d8f45a]/10 text-[#d8f45a]">
                                <FiMapPin className="text-2xl" />
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-[#f1eee8]">
                                Get your location
                            </h3>

                            <p className="mt-2 max-w-[260px] text-xs leading-5 text-[#737d72]">
                                Aetherion will ask your browser for
                                permission to access your current
                                location.
                            </p>
                        </div>
                    )}

                    {/* LOADING */}

                    {status === "loading" && (
                        <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
                            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#d8f45a]/10 text-[#d8f45a]">
                                <FiMapPin className="text-2xl" />

                                <span className="absolute inset-0 animate-ping rounded-full border border-[#d8f45a]/20" />
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-[#f1eee8]">
                                Finding your location...
                            </h3>

                            <p className="mt-2 max-w-[260px] text-xs leading-5 text-[#737d72]">
                                Please allow location access if your
                                browser asks for permission.
                            </p>
                        </div>
                    )}

                    {/* READY */}

                    {status === "ready" && coordinates && (
                        <div>
                            <div className="relative flex h-[230px] items-center justify-center overflow-hidden rounded-xl border border-[#d8f45a]/10 bg-[#0b100c]">
                                <div className="absolute inset-0 opacity-30">
                                    <div className="h-full w-full bg-[radial-gradient(circle_at_center,#d8f45a_0,transparent_1px)] [background-size:18px_18px]" />
                                </div>

                                <div className="relative flex flex-col items-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d8f45a] text-[#10120d] shadow-[0_0_35px_rgba(216,244,90,0.25)]">
                                        <FiMapPin className="text-2xl" />
                                    </div>

                                    <div className="mt-3 rounded-lg border border-white/[0.06] bg-[#111711]/90 px-3 py-2 text-center backdrop-blur-md">
                                        <p className="text-[10px] font-semibold text-[#d8f45a]">
                                            Current location
                                        </p>

                                        <p className="mt-1 text-[9px] text-[#788276]">
                                            Coordinates ready to send
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 rounded-lg border border-white/[0.05] bg-[#0c120d] px-3 py-2.5">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-[10px] font-medium text-[#707a70]">
                                        Latitude
                                    </span>

                                    <span className="font-mono text-[10px] text-[#cbd3c6]">
                                        {coordinates.latitude.toFixed(6)}
                                    </span>
                                </div>

                                <div className="mt-1.5 flex items-center justify-between gap-3">
                                    <span className="text-[10px] font-medium text-[#707a70]">
                                        Longitude
                                    </span>

                                    <span className="font-mono text-[10px] text-[#cbd3c6]">
                                        {coordinates.longitude.toFixed(6)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DENIED / ERROR */}

                    {(status === "denied" ||
                        status === "error") && (
                            <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff6b6b]/10 text-[#ff7d7d]">
                                    <FiAlertCircle className="text-2xl" />
                                </div>

                                <h3 className="mt-4 text-sm font-semibold text-[#f1eee8]">
                                    {status === "denied"
                                        ? "Location access denied"
                                        : "Couldn't get your location"}
                                </h3>

                                <p className="mt-2 max-w-[280px] text-xs leading-5 text-[#737d72]">
                                    {errorMessage}
                                </p>

                                <button
                                    type="button"
                                    onClick={requestLocation}
                                    disabled={isSending}
                                    className="mt-5 flex items-center gap-2 rounded-lg bg-[#d8f45a] px-4 py-2.5 text-xs font-semibold text-[#10120d] transition hover:bg-[#e4ff6c] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <FiRefreshCw className="text-sm" />
                                    Try Again
                                </button>
                            </div>
                        )}
                </div>

                {/* FOOTER */}

                <div className="border-t border-white/[0.06] px-4 py-3">
                    {status === "ready" ? (
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={isSending}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d8f45a] px-4 py-3 text-xs font-bold text-[#10120d] transition hover:bg-[#e4ff6c] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <FiSend className="text-sm" />

                            {isSending
                                ? "Sending..."
                                : "Send Location"}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSending}
                            className="w-full rounded-xl border border-white/[0.07] px-4 py-3 text-xs font-semibold text-[#aab3a8] transition hover:bg-white/[0.04] hover:text-[#f1eee8] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationModal;