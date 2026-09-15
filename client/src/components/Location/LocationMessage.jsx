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
                className={`max-w-[320px] rounded-lg border px-2.5 py-2 ${isOwn
                        ? "border-[#d8f45a]/10 bg-[#1c2418]"
                        : "border-white/[0.06] bg-[#171c18]"
                    }`}
            >
                <div className="flex items-center gap-2">
                    <FiMapPin className="shrink-0 text-sm text-[#ff6b6b]" />

                    <span className="text-[9px] text-[#9ba49a]">
                        Location unavailable
                    </span>
                </div>
            </div>
        );
    }

    const mapsUrl =
        `https://www.google.com/maps?q=${latitude},${longitude}`;

    const offset = 0.005;

    const minLongitude = longitude - offset;
    const maxLongitude = longitude + offset;
    const minLatitude = latitude - offset;
    const maxLatitude = latitude + offset;

    const mapUrl =
        `https://www.openstreetmap.org/export/embed.html?` +
        `bbox=${minLongitude},${minLatitude},${maxLongitude},${maxLatitude}` +
        `&layer=mapnik`;

    return (
        <div
            className={`w-full max-w-[320px] overflow-hidden rounded-lg border sm:max-w-[340px] ${isOwn
                    ? "border-[#d8f45a]/10 bg-[#182018]"
                    : "border-white/[0.06] bg-[#171c18]"
                }`}
        >
            {/* Map */}
            <div className="relative h-[145px] w-full overflow-hidden sm:h-[160px] bg-[#0d120e]">
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

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                {/* Pin */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d8f45a] text-[#11150f] shadow-lg">
                        <FiMapPin className="text-sm" />
                    </div>

                    <div className="mx-auto h-1.5 w-1.5 rounded-full bg-[#d8f45a]" />
                </div>
            </div>

            {/* Details */}
            <div className="px-2.5 py-2.5">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d8f45a]/10 text-[#e2e5d3]">
                        <FiMapPin className="text-xs" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-[#f1eee8]">
                            Location
                        </p>

                        {address ? (
                            <p className="mt-0.5 truncate text-[8px] text-[#7f897d]">
                                {address}
                            </p>
                        ) : (
                            <p className="mt-0.5 text-[14px] text-[#7f897d]">
                                Current location
                            </p>
                        )}

                        <p className="mt-0.5 font-mono text-[12px] text-[#626b61]">
                            {latitude.toFixed(6)}, {longitude.toFixed(6)}
                        </p>
                    </div>
                </div>

                {/* Maps button */}
                <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-white/[0.07] bg-white/[0.025] px-2.5 py-2 text-[8px] font-semibold text-[#aeb7aa] transition"
                >
                    <FiExternalLink className="text-lg" />
                    Open in Maps
                </a>
            </div>
        </div>
    );
};

export default LocationMessage;