import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
    FaInstagram,
    FaChevronDown,
    FaLinkedinIn,
    FaRedditAlien,
    FaGithub,
    FaYoutube,
    FaDiscord,
    FaTwitch,
    FaTiktok,
    FaFacebook,
    FaPinterest,
    FaTumblr,
    FaGlobe,
    FaTrash,
    FaGitlab,
    FaStackOverflow,
    FaMedium,
    FaDev,
    FaVimeo,
    FaSteam,
    FaSpotify,
    FaSoundcloud,
    FaApple,
} from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";

import {
    SiThreads,
    SiSnapchat,
    SiBluesky,
    SiCodeforces,
    SiCodechef,
    SiHackerrank,
    SiHackerearth,
    SiKaggle,
    SiReplit,
    SiCodesandbox,
    SiNpm,
    SiSubstack,
    SiBehance,
    SiDribbble,
    SiArtstation,
    SiFigma,
    SiKick,
    SiEpicgames,
    SiPlaystation,
    SiLinktree,
    SiBandcamp,
    SiLeetcode,
    SiOnlyfans,
} from "react-icons/si";

const MAX_CONNECTIONS = 20;

const PLATFORM_CONFIG = [
    // SOCIAL
    {
        name: "Instagram",
        domains: ["instagram.com"],
        icon: FaInstagram,
        color: "#E4405F",
    },
    {
        name: "X",
        domains: ["x.com", "twitter.com"],
        icon: FaXTwitter,
        color: "#f1eee8",
    },
    {
        name: "Facebook",
        domains: ["facebook.com", "fb.com"],
        icon: FaFacebook,
        color: "#1877F2",
    },
    {
        name: "Threads",
        domains: ["threads.net"],
        icon: SiThreads,
        color: "#f1eee8",
    },
    {
        name: "Reddit",
        domains: ["reddit.com"],
        icon: FaRedditAlien,
        color: "#FF4500",
    },
    {
        name: "Snapchat",
        domains: ["snapchat.com"],
        icon: SiSnapchat,
        color: "#FFFC00",
    },
    {
        name: "Pinterest",
        domains: ["pinterest.com"],
        icon: FaPinterest,
        color: "#E60023",
    },
    {
        name: "Bluesky",
        domains: ["bsky.app"],
        icon: SiBluesky,
        color: "#1185FE",
    },
    {
        name: "Tumblr",
        domains: ["tumblr.com"],
        icon: FaTumblr,
        color: "#36465D",
    },

    // PROFESSIONAL
    {
        name: "LinkedIn",
        domains: ["linkedin.com"],
        icon: FaLinkedinIn,
        color: "#0A66C2",
    },
    {
        name: "Medium",
        domains: ["medium.com"],
        icon: FaMedium,
        color: "#f1eee8",
    },
    {
        name: "Dev.to",
        domains: ["dev.to"],
        icon: FaDev,
        color: "#f1eee8",
    },
    {
        name: "Substack",
        domains: ["substack.com"],
        icon: SiSubstack,
        color: "#FF6719",
    },

    // DEVELOPER
    {
        name: "GitHub",
        domains: ["github.com"],
        icon: FaGithub,
        color: "#f1eee8",
    },
    {
        name: "GitLab",
        domains: ["gitlab.com"],
        icon: FaGitlab,
        color: "#FC6D26",
    },
    {
        name: "LeetCode",
        domains: ["leetcode.com"],
        icon: SiLeetcode,
        color: "#FFA116",
    },
    {
        name: "Codeforces",
        domains: ["codeforces.com"],
        icon: SiCodeforces,
        color: "#1F8ACB",
    },
    {
        name: "CodeChef",
        domains: ["codechef.com"],
        icon: SiCodechef,
        color: "#5B4638",
    },
    {
        name: "HackerRank",
        domains: ["hackerrank.com"],
        icon: SiHackerrank,
        color: "#00EA64",
    },
    {
        name: "HackerEarth",
        domains: ["hackerearth.com"],
        icon: SiHackerearth,
        color: "#2C3454",
    },
    {
        name: "Kaggle",
        domains: ["kaggle.com"],
        icon: SiKaggle,
        color: "#20BEFF",
    },
    {
        name: "Stack Overflow",
        domains: ["stackoverflow.com"],
        icon: FaStackOverflow,
        color: "#F48024",
    },
    {
        name: "Replit",
        domains: ["replit.com"],
        icon: SiReplit,
        color: "#F26207",
    },
    {
        name: "CodeSandbox",
        domains: ["codesandbox.io"],
        icon: SiCodesandbox,
        color: "#151515",
    },
    {
        name: "npm",
        domains: ["npmjs.com"],
        icon: SiNpm,
        color: "#CB3837",
    },

    // CREATIVE
    {
        name: "Behance",
        domains: ["behance.net"],
        icon: SiBehance,
        color: "#1769FF",
    },
    {
        name: "Dribbble",
        domains: ["dribbble.com"],
        icon: SiDribbble,
        color: "#EA4C89",
    },
    {
        name: "ArtStation",
        domains: ["artstation.com"],
        icon: SiArtstation,
        color: "#13AFF0",
    },
    {
        name: "Figma",
        domains: ["figma.com"],
        icon: SiFigma,
        color: "#F24E1E",
    },

    // VIDEO / STREAMING
    {
        name: "YouTube",
        domains: ["youtube.com", "youtu.be"],
        icon: FaYoutube,
        color: "#FF0000",
    },
    {
        name: "Twitch",
        domains: ["twitch.tv"],
        icon: FaTwitch,
        color: "#9146FF",
    },
    {
        name: "Kick",
        domains: ["kick.com"],
        icon: SiKick,
        color: "#53FC18",
    },
    {
        name: "Vimeo",
        domains: ["vimeo.com"],
        icon: FaVimeo,
        color: "#1AB7EA",
    },

    // GAMING
    {
        name: "Discord",
        domains: ["discord.com", "discord.gg"],
        icon: FaDiscord,
        color: "#5865F2",
    },
    {
        name: "Steam",
        domains: ["steamcommunity.com", "steampowered.com"],
        icon: FaSteam,
        color: "#f1eee8",
    },
    {
        name: "Epic Games",
        domains: ["epicgames.com"],
        icon: SiEpicgames,
        color: "#f1eee8",
    },
    {
        name: "PlayStation",
        domains: ["playstation.com"],
        icon: SiPlaystation,
        color: "#003791",
    },

    // MUSIC
    {
        name: "Spotify",
        domains: ["spotify.com", "open.spotify.com"],
        icon: FaSpotify,
        color: "#1DB954",
    },
    {
        name: "SoundCloud",
        domains: ["soundcloud.com"],
        icon: FaSoundcloud,
        color: "#FF5500",
    },
    {
        name: "Apple Music",
        domains: ["music.apple.com"],
        icon: FaApple,
        color: "#f1eee8",
    },
    {
        name: "Bandcamp",
        domains: ["bandcamp.com"],
        icon: SiBandcamp,
        color: "#629AA9",
    },

    // PERSONAL / OTHER
    {
        name: "Linktree",
        domains: ["linktr.ee"],
        icon: SiLinktree,
        color: "#43E55E",
    },
    {
        name: "TikTok",
        domains: ["tiktok.com"],
        icon: FaTiktok,
        color: "#f1eee8",
    },
    {
        name: "OnlyFans",
        domains: ["onlyfans.com"],
        icon: SiOnlyfans,
        color: "#00AFF0",
    },
];

const PLATFORM_GROUPS = [
    {
        name: "Social",
        platforms: [
            "Instagram",
            "X",
            "Facebook",
            "Threads",
            "Reddit",
            "Snapchat",
            "Pinterest",
            "Bluesky",
            "Tumblr",
            "TikTok",
        ],
    },
    {
        name: "Developer",
        platforms: [
            "GitHub",
            "GitLab",
            "LeetCode",
            "Codeforces",
            "CodeChef",
            "HackerRank",
            "HackerEarth",
            "Kaggle",
            "Stack Overflow",
            "Replit",
            "CodeSandbox",
            "npm",
        ],
    },
    {
        name: "Professional",
        platforms: [
            "LinkedIn",
            "Medium",
            "Dev.to",
            "Substack",
        ],
    },
    {
        name: "Creative",
        platforms: [
            "Behance",
            "Dribbble",
            "ArtStation",
            "Figma",
        ],
    },
    {
        name: "Video & Streaming",
        platforms: [
            "YouTube",
            "Twitch",
            "Kick",
            "Vimeo",
        ],
    },
    {
        name: "Gaming",
        platforms: [
            "Discord",
            "Steam",
            "Epic Games",
            "PlayStation",
        ],
    },
    {
        name: "Music",
        platforms: [
            "Spotify",
            "SoundCloud",
            "Apple Music",
            "Bandcamp",
        ],
    },
    {
        name: "Personal",
        platforms: [
            "Linktree",
            "OnlyFans",
        ],
    },
];

const getHostname = (url) => {
    try {
        return new URL(url)
            .hostname
            .replace(/^www\./, "")
            .toLowerCase();
    } catch {
        return "";
    }
};

const detectPlatform = (url) => {
    const hostname = getHostname(url);

    if (!hostname) {
        return {
            name: "",
            icon: FaGlobe,
            color: "#9ca3af",
        };
    }

    const platform = PLATFORM_CONFIG.find((item) =>
        item.domains.some(
            (domain) =>
                hostname === domain ||
                hostname.endsWith(`.${domain}`),
        ),
    );

    if (platform) {
        return platform;
    }

    return {
        name: hostname,
        icon: FaGlobe,
        color: "#9ca3af",
    };
};

const cleanPathSegment = (segment) => {
    if (!segment) {
        return "";
    }

    let value = "";

    try {
        value = decodeURIComponent(segment);
    } catch {
        value = segment;
    }

    value = value
        .replace(/^@/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (!value) {
        return "";
    }

    return value
        .split(" ")
        .map((word) => {
            if (!word) {
                return "";
            }

            return (
                word.charAt(0).toUpperCase() +
                word.slice(1)
            );
        })
        .join(" ");
};

const extractPersonName = (url) => {
    try {
        const parsedUrl = new URL(url);

        const hostname = parsedUrl.hostname
            .replace(/^www\./, "")
            .toLowerCase();

        const segments = parsedUrl.pathname
            .split("/")
            .filter(Boolean);

        if (!segments.length) {
            return parsedUrl.hostname
                .replace(/^www\./, "")
                .split(".")[0];
        }

        if (
            hostname === "linkedin.com" ||
            hostname.endsWith(".linkedin.com")
        ) {
            const profileIndex = segments.findIndex(
                (segment) =>
                    segment.toLowerCase() === "in",
            );

            if (
                profileIndex !== -1 &&
                segments[profileIndex + 1]
            ) {
                return cleanPathSegment(
                    segments[profileIndex + 1],
                );
            }
        }

        if (
            hostname === "reddit.com" ||
            hostname.endsWith(".reddit.com")
        ) {
            const userIndex = segments.findIndex(
                (segment) =>
                    segment.toLowerCase() === "u",
            );

            if (
                userIndex !== -1 &&
                segments[userIndex + 1]
            ) {
                return cleanPathSegment(
                    segments[userIndex + 1],
                );
            }
        }

        if (
            hostname === "youtube.com" ||
            hostname.endsWith(".youtube.com")
        ) {
            const first = segments[0];

            if (first.startsWith("@")) {
                return cleanPathSegment(first);
            }

            if (
                first.toLowerCase() === "channel" &&
                segments[1]
            ) {
                return cleanPathSegment(
                    segments[1],
                );
            }

            if (
                first.toLowerCase() === "c" &&
                segments[1]
            ) {
                return cleanPathSegment(
                    segments[1],
                );
            }

            if (
                first.toLowerCase() === "user" &&
                segments[1]
            ) {
                return cleanPathSegment(
                    segments[1],
                );
            }
        }

        if (
            hostname === "instagram.com" ||
            hostname.endsWith(".instagram.com") ||
            hostname === "x.com" ||
            hostname.endsWith(".x.com") ||
            hostname === "twitter.com" ||
            hostname.endsWith(".twitter.com") ||
            hostname === "github.com" ||
            hostname.endsWith(".github.com") ||
            hostname === "tiktok.com" ||
            hostname.endsWith(".tiktok.com") ||
            hostname === "twitch.tv" ||
            hostname.endsWith(".twitch.tv") ||
            hostname === "onlyfans.com" ||
            hostname.endsWith(".onlyfans.com")
        ) {
            return cleanPathSegment(
                segments[0],
            );
        }

        return cleanPathSegment(
            segments[segments.length - 1],
        );
    } catch {
        return "";
    }
};

const normalizeConnection = (connection) => {
    const url =
        connection?.url?.trim() || "";

    const detected = detectPlatform(url);

    const extractedName =
        extractPersonName(url);

    return {
        name:
            extractedName ||
            connection?.name?.trim() ||
            detected.name ||
            "Connection",
        url,
    };
};

//Used for checking duplicate URLs
const normalizeConnectionUrl = (url) => {
    try {
        const parsed = new URL(url.trim());

        parsed.protocol =
            parsed.protocol.toLowerCase();

        parsed.hostname =
            parsed.hostname.toLowerCase();

        // Remove default ports.
        if (
            (parsed.protocol === "https:" &&
                parsed.port === "443") ||
            (parsed.protocol === "http:" &&
                parsed.port === "80")
        ) {
            parsed.port = "";
        }

        // Remove trailing slash from pathname.
        parsed.pathname =
            parsed.pathname.replace(/\/+$/, "");

        return parsed
            .toString()
            .toLowerCase()
            .replace(/\/+$/, "");
    } catch {
        return url
            .trim()
            .toLowerCase()
            .replace(/\/+$/, "");
    }
};

const Connections = ({ connections = [], onSave, }) => {

    const [showModal, setShowModal] = useState(false);
    const [draftConnections, setDraftConnections] = useState([]);
    const [saving, setSaving] = useState(false);

    const [activePlatformIndex, setActivePlatformIndex] = useState(null);
    const [platformSearch, setPlatformSearch] = useState("");
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);

    const visibleConnections = useMemo(() =>
        Array.isArray(connections)
            ? connections.filter(
                (connection) =>
                    connection?.url?.trim(),
            )
            : [],
        [connections],
    );

    const duplicateIndexes = useMemo(() => {
        const seen = new Map();
        const duplicates = new Set();

        draftConnections.forEach(
            (connection, index) => {
                const url =
                    connection.url?.trim();

                if (!url) {
                    return;
                }

                const normalizedUrl =
                    normalizeConnectionUrl(url);

                if (!normalizedUrl) {
                    return;
                }

                if (
                    seen.has(normalizedUrl)
                ) {
                    duplicates.add(index);
                    duplicates.add(
                        seen.get(normalizedUrl),
                    );
                } else {
                    seen.set(
                        normalizedUrl,
                        index,
                    );
                }
            },
        );

        return duplicates;
    }, [draftConnections]);

    const hasDuplicateConnections = duplicateIndexes.size > 0;

    const filteredPlatformGroups = useMemo(() => {
        const query = platformSearch.trim().toLowerCase();

        return PLATFORM_GROUPS
            .map((group) => {
                const platforms = group.platforms
                    .map((name) =>
                        PLATFORM_CONFIG.find(
                            (platform) =>
                                platform.name === name,
                        ),
                    )
                    .filter(Boolean)
                    .filter((platform) =>
                        query
                            ? platform.name
                                .toLowerCase()
                                .includes(query)
                            : true,
                    );

                return {
                    ...group,
                    platforms,
                };
            })
            .filter(
                (group) =>
                    group.platforms.length > 0,
            );
    }, [platformSearch]);

    useEffect(() => {
        if (!showModal) {
            return;
        }

        const initialConnections =
            visibleConnections.length
                ? visibleConnections.map(
                    normalizeConnection,
                )
                : [
                    {
                        name: "",
                        url: "",
                    },
                ];

        setDraftConnections(initialConnections);

        setSelectedPlatforms(
            initialConnections.map(
                (connection) =>
                    detectPlatform(connection.url).name,
            ),
        );

        setActivePlatformIndex(null);
        setPlatformSearch("");

    }, [showModal, visibleConnections,]);

    const openModal = () => {
        setActivePlatformIndex(null);
        setPlatformSearch("");

        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
    };

    const updateConnection = (index, value) => {
        setDraftConnections((current) =>
            current.map(
                (connection, itemIndex) =>
                    itemIndex === index
                        ? {
                            ...connection,
                            url: value,
                            name:
                                extractPersonName(
                                    value,
                                ),
                        }
                        : connection,
            ),
        );

        const detected = detectPlatform(value);

        if (detected.name) {
            setSelectedPlatforms((current) =>
                current.map(
                    (platform, itemIndex) =>
                        itemIndex === index
                            ? detected.name
                            : platform,
                ),
            );
        }
    };

    const addConnection = () => {
        if (
            draftConnections.length >=
            MAX_CONNECTIONS
        ) {
            toast.error(
                `You can add up to ${MAX_CONNECTIONS} connections.`,
            );

            return;
        }

        setDraftConnections((current) => [
            ...current,
            {
                name: "",
                url: "",
            },
        ]);

        setSelectedPlatforms((current) => [
            ...current,
            "",
        ]);
    };

    const removeConnection = (index) => {
        setDraftConnections((current) =>
            current.filter(
                (_, itemIndex) =>
                    itemIndex !== index,
            ),
        );

        setSelectedPlatforms((current) =>
            current.filter(
                (_, itemIndex) =>
                    itemIndex !== index,
            ),
        );

        setActivePlatformIndex(null);
    };

    const handleSave = async () => {
        if (saving) {
            return;
        }

        const cleanedConnections =
            draftConnections
                .map((connection) => {
                    const url =
                        connection.url?.trim() ||
                        "";

                    return {
                        name:
                            extractPersonName(url) ||
                            connection.name?.trim() ||
                            "",
                        url,
                    };
                })
                .filter(
                    (connection) =>
                        connection.url,
                );

        if (
            cleanedConnections.length >
            MAX_CONNECTIONS
        ) {
            toast.error(
                `You can add up to ${MAX_CONNECTIONS} connections.`,
            );

            return;
        }

        /*
         * Final duplicate protection.
         *
         * The UI already detects duplicates,
         * but we check again before saving.
         */
        const seenUrls = new Set();

        for (const connection of cleanedConnections) {
            const normalizedUrl =
                normalizeConnectionUrl(
                    connection.url,
                );

            if (
                seenUrls.has(
                    normalizedUrl,
                )
            ) {
                toast.error(
                    "Don't add the same connection more than once.",
                );

                return;
            }

            seenUrls.add(normalizedUrl);
        }

        for (const connection of cleanedConnections) {
            try {
                const parsedUrl =
                    new URL(connection.url);

                if (
                    parsedUrl.protocol !==
                    "http:" &&
                    parsedUrl.protocol !==
                    "https:"
                ) {
                    throw new Error();
                }
            } catch {
                toast.error(
                    `Invalid connection URL: ${connection.url}`,
                );

                return;
            }
        }

        setSaving(true);

        try {
            await onSave(
                cleanedConnections,
            );

            setShowModal(false);
        } catch (error) {
            console.error(
                "Connections save error:",
                error,
            );

            toast.error(
                "Couldn't update your connections.",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            {/* CONNECTIONS SECTION */}
            <div className="min-w-0 lg:border-l lg:border-white/[0.06] lg:pl-10">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8d918c]">
                            Connections
                        </p>
                    </div>
                </div>

                {visibleConnections.length ? (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {visibleConnections.map(
                            (connection, index,) => {
                                const detectedPlatform = detectPlatform(
                                    connection.url,
                                );

                                const selectedPlatform = PLATFORM_CONFIG.find(
                                    (item) =>
                                        item.name === selectedPlatforms[index],
                                );

                                const platform =
                                    selectedPlatform || detectedPlatform;

                                const Icon = platform.icon;

                                const personName = extractPersonName(
                                    connection.url,
                                ) || connection.name || platform.name;

                                return (
                                    <a
                                        key={`${connection.url}-${index}`}
                                        href={connection.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-white/[0.05] bg-white/[0.018] px-2 py-1 text-[10px] font-medium text-[#aeb4ac] transition hover:border-white/[0.1] hover:bg-white/[0.045] hover:text-white"
                                    >
                                        <Icon
                                            className="h-3 w-3 shrink-0"
                                            style={{
                                                color:
                                                    platform.color,
                                            }}
                                        />

                                        <span className="max-w-[10rem] truncate">
                                            {personName}
                                        </span>
                                    </a>
                                );
                            },
                        )}
                    </div>
                ) : null}

                <button
                    type="button"
                    onClick={openModal}
                    className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-medium text-[#777d76] transition hover:text-[#f1eee8]"
                >
                    <span className="text-sm leading-none">
                        +
                    </span>

                    Add more
                </button>
            </div>

            {/* ADD CONNECTIONS MODAL */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-3 pb-3 sm:items-center sm:px-5 sm:pb-0"
                    onMouseDown={closeModal}
                >
                    <div
                        className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111611] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                        onMouseDown={(event,) => event.stopPropagation()}
                    >
                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                            <div>
                                <h2 className="text-sm font-semibold text-[#f1eee8]">
                                    Add Connections
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-[#737b73] transition hover:bg-white/5 hover:text-[#f1eee8] disabled:opacity-40"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="max-h-[60vh] overflow-y-auto px-5 py-5 sm:px-6">
                            {hasDuplicateConnections && (
                                <div className="mb-4 rounded-xl border border-red-400/20 bg-red-400/[0.05] px-3.5 py-3">
                                    <p className="text-[11px] font-semibold text-red-400">
                                        Duplicate connection
                                    </p>

                                    <p className="mt-1 text-[11px] leading-relaxed text-red-300/70">
                                        You already added this connection.
                                        Remove the duplicate before saving.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3">
                                {draftConnections.map(
                                    (connection, index,) => {
                                        const detectedPlatform = detectPlatform(connection.url,);

                                        const selectedPlatform = PLATFORM_CONFIG.find((item) => item.name === selectedPlatforms[index],);

                                        const platform = selectedPlatform || detectedPlatform;

                                        const Icon = platform.icon;

                                        const isDuplicate = duplicateIndexes.has(index);

                                        return (
                                            <div
                                                key={index}
                                                className={`rounded-xl ${isDuplicate
                                                    ? "bg-red-500/[0.04] p-1.5"
                                                    : ""
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActivePlatformIndex(
                                                                activePlatformIndex === index
                                                                    ? null
                                                                    : index,
                                                            );

                                                            setPlatformSearch("");
                                                        }}
                                                        disabled={saving}
                                                        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${activePlatformIndex === index
                                                            ? "border-[#d8f45a]/30 bg-[#d8f45a]/[0.08]"
                                                            : "border-white/[0.07] bg-white/[0.035] hover:border-white/[0.12] hover:bg-white/[0.06]"
                                                            }`}
                                                        aria-label={`Choose platform${platform.name
                                                            ? `, currently ${platform.name}`
                                                            : ""
                                                            }`}
                                                        title={
                                                            platform.name
                                                                ? `Platform: ${platform.name}`
                                                                : "Choose platform"
                                                        }
                                                    >
                                                        <Icon
                                                            className="h-4 w-4"
                                                            style={{
                                                                color: platform.color,
                                                            }}
                                                        />

                                                        <FaChevronDown
                                                            className={`absolute bottom-1 right-1 h-2 w-2 text-[#777d76] transition-transform ${activePlatformIndex === index
                                                                ? "rotate-180"
                                                                : ""
                                                                }`}
                                                        />
                                                    </button>

                                                    <input
                                                        type="url"
                                                        value={connection.url}
                                                        onChange={(event) =>
                                                            updateConnection(
                                                                index,
                                                                event.target.value,
                                                            )
                                                        }
                                                        placeholder={
                                                            selectedPlatform
                                                                ? `Paste your ${selectedPlatform.name} link`
                                                                : "Paste a profile or website link"
                                                        }
                                                        disabled={saving}
                                                        className={`h-10 min-w-0 flex-1 rounded-xl border bg-white/[0.025] px-3.5 text-sm text-[#f1eee8] outline-none transition placeholder:text-[#4f564f] focus:bg-white/[0.04] ${isDuplicate
                                                            ? "border-red-400/40 focus:border-red-400/60"
                                                            : "border-white/[0.08] focus:border-[#d8f45a]/30"
                                                            }`}
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeConnection(index)
                                                        }
                                                        disabled={saving}
                                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-red-400 transition hover:bg-red-400/[0.08] hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                                                        aria-label={`Remove connection ${index + 1
                                                            }`}
                                                    >
                                                        <FaTrash className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                {activePlatformIndex === index && (
                                                    <div className="mt-2 overflow-hidden rounded-xl border border-white/[0.07] bg-[#0d120e]">
                                                        {/* SEARCH */}
                                                        <div className="border-b border-white/[0.06] p-2.5">
                                                            <input
                                                                type="text"
                                                                value={platformSearch}
                                                                onChange={(event) =>
                                                                    setPlatformSearch(event.target.value)
                                                                }
                                                                placeholder="Search platforms..."
                                                                autoFocus
                                                                className="h-9 w-full rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 text-xs text-[#f1eee8] outline-none placeholder:text-[#4f564f] focus:border-[#d8f45a]/30"
                                                            />
                                                        </div>

                                                        {/* PLATFORM LIST */}
                                                        <div className="max-h-64 overflow-y-auto p-2.5">
                                                            {filteredPlatformGroups.length ? (
                                                                <div className="space-y-4">
                                                                    {filteredPlatformGroups.map(
                                                                        (group) => (
                                                                            <div
                                                                                key={group.name}
                                                                            >
                                                                                <p className="mb-2 px-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#666d65]">
                                                                                    {group.name}
                                                                                </p>

                                                                                <div className="flex flex-wrap gap-1.5">
                                                                                    {group.platforms.map(
                                                                                        (
                                                                                            platform,
                                                                                        ) => {
                                                                                            const PlatformIcon =
                                                                                                platform.icon;

                                                                                            const isSelected =
                                                                                                selectedPlatforms[
                                                                                                index
                                                                                                ] ===
                                                                                                platform.name;

                                                                                            return (
                                                                                                <button
                                                                                                    key={platform.name}
                                                                                                    type="button"
                                                                                                    onClick={() => {
                                                                                                        setSelectedPlatforms((current) =>
                                                                                                            current.map(
                                                                                                                (item, itemIndex) =>
                                                                                                                    itemIndex === index
                                                                                                                        ? platform.name
                                                                                                                        : item,
                                                                                                            ),
                                                                                                        );

                                                                                                        setActivePlatformIndex(null);
                                                                                                        setPlatformSearch("");
                                                                                                    }}
                                                                                                    className={`group relative flex h-10 w-10 items-center justify-center rounded-lg border transition ${isSelected
                                                                                                        ? "border-[#d8f45a]/30 bg-[#d8f45a]/[0.08]"
                                                                                                        : "border-white/[0.05] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.06]"
                                                                                                        }`}
                                                                                                    aria-label={platform.name}
                                                                                                    title={platform.name}
                                                                                                >
                                                                                                    <PlatformIcon
                                                                                                        className="h-4 w-4"
                                                                                                        style={{
                                                                                                            color: platform.color,
                                                                                                        }}
                                                                                                    />
                                                                                                </button>
                                                                                            );
                                                                                        },
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="px-2 py-6 text-center">
                                                                    <p className="text-[11px] text-[#555d55]">
                                                                        No platform found.
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {isDuplicate && (
                                                    <p className="mt-1.5 pl-[3.25rem] text-[10px] font-medium text-red-400/80">
                                                        This connection is already added.
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    },
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={addConnection}
                                disabled={saving || draftConnections.length >= MAX_CONNECTIONS}
                                className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#838371] transition hover:text-[#f1eee8] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <span className="text-base">
                                    +
                                </span>

                                Add more
                            </button>
                        </div>

                        {/* FOOTER */}
                        <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-4 sm:px-6">
                            <span className="text-[11px] text-[#4f564f]">
                                {draftConnections.length} / {MAX_CONNECTIONS}
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-lg px-3.5 py-2 text-xs font-medium text-[#858d84] transition hover:bg-white/[0.05] hover:text-[#f1eee8] disabled:opacity-40"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving || hasDuplicateConnections}
                                    className="rounded-lg bg-[#d8f45a] px-4 py-2 text-xs font-bold text-[#10120d] transition hover:bg-[#e4ff6f] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Connections;