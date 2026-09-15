import { FiExternalLink, FiMapPin } from "react-icons/fi";

const LocationMessage = ({ message, isOwn }) => {
    const latitude = Number(message?.location?.latitude);
    const longitude = Number(message?.location?.longitude);
    const address = message?.location?.address;

    const hasValidCoordinates =
        Number.isFinite(latitude) &&
        Number.isFinite(longitude);

    if (!hasValidCoordinates) {
        return (
            <div
                className={`rounded-xl border px-3 py-3 ${isOwn
                        ? "border-[#d8f45a]/10 bg-[#1c2418]"
                        : "border-white/[0.06] bg-[#171c18]"
                    }`}
            >
                <div className="flex items-center gap-2">
                    <FiMapPin className="shrink-0 text-[#ff6b6b]" />

                    <span className="text-xs text-[#9ba49a]">
                        Location unavailable
                    </span>
                </div>
            </div>
        );
    }

    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    /*
     * A small bounding box around the current coordinates.
     * This gives OpenStreetMap enough area to render
     * a useful preview without requiring an API key.
     */
    const offset = 0.005;

    const minLongitude = longitude - offset;
    const maxLongitude = longitude + offset;
    const minLatitude = latitude - offset;
    const maxLatitude = latitude + offset;

    const mapUrl =
        `https://www.openstreetmap.org/export/embed.html?` +
        `bbox=${minLongitude},${minLatitude},${maxLongitude},${maxLatitude}` +
        `&layer=mapnik` +
        `&marker=${latitude},${longitude}`;

    return (
        <div
            className={`overflow-hidden rounded-xl border ${isOwn
                    ? "border-[#d8f45a]/10 bg-[#182018]"
                    : "border-white/[0.06] bg-[#171c18]"
                }`}
        >
            {/* MAP */}

            <div className="relative h-[190px] w-full overflow-hidden bg-[#0d120e]">
                <iframe
                    title="Shared location"
                    src={mapUrl}
                    className="h-full w-full border-0"
                    loading="lazy"
                    style={{
                        filter:
                            "brightness(0.72) saturate(0.7) contrast(0.95)",
                    }}
                />

                {/* MAP OVERLAY */}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                {/* LOCATION PIN */}

                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d8f45a] text-[#11150f] shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
                        <FiMapPin className="text-xl" />
                    </div>

                    <div className="mx-auto h-2 w-2 rounded-full bg-[#d8f45a]" />
                </div>
            </div>

            {/* DETAILS */}

            <div className="px-3 py-3">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d8f45a]/10 text-[#d8f45a]">
                        <FiMapPin className="text-base" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#f1eee8]">
                            Location
                        </p>

                        {address ? (
                            <p className="mt-0.5 truncate text-[10px] text-[#7f897d]">
                                {address}
                            </p>
                        ) : (
                            <p className="mt-0.5 text-[10px] text-[#7f897d]">
                                Current location
                            </p>
                        )}

                        <p className="mt-1 font-mono text-[9px] text-[#626b61]">
                            {latitude.toFixed(6)},{" "}
                            {longitude.toFixed(6)}
                        </p>
                    </div>
                </div>

                {/* OPEN IN MAPS */}

                <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 text-[10px] font-semibold text-[#aeb7aa] transition hover:bg-white/[0.05] hover:text-[#d8f45a]"
                >
                    <FiExternalLink className="text-sm" />

                    Open in Maps
                </a>
            </div>
        </div>
    );
};

export default LocationMessage;