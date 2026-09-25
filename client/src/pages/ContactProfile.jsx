import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
    IoArrowBack,
    IoChevronForward,
    IoPersonAddOutline,
    IoPersonRemoveOutline,
    IoPlay,
    IoDocumentTextOutline,
    IoImageOutline,
} from "react-icons/io5";

import Avatar from "../components/Avatar.jsx";
import PresenceIcon from "../components/PresenceIcon.jsx";
import ProfileBanner from "../components/ProfileBanner.jsx";
import Connections from "../components/Connections.jsx";
import MediaViewer from "../components/Camera/MediaViewer.jsx";
import ContactList from "../components/ContactList.jsx";

import {
    getContactProfile,
    getContactProfileMedia,
} from "../apiCalls/contactProfileApi.js";
import AetherionDayBadge from "../components/AetherionDayBadge.jsx";
import { removeContact, addContact, } from "../apiCalls/contactApi.js";
import { getEffectivePresenceStatus } from "../utils/presenceStatus.js";
import { getAetherionDays, getAetherionDayMilestone, } from "../utils/aetherionDays.js";

const getFullName = (user) => {
    return (
        [user?.firstName, user?.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() || "Unknown user"
    );
};

const getInitials = (user) => {
    const firstName = String(user?.firstName || "").trim();
    const lastName = String(user?.lastName || "").trim();

    if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }

    if (firstName) {
        return firstName.slice(0, 2).toUpperCase();
    }

    if (lastName) {
        return lastName.slice(0, 2).toUpperCase();
    }

    return "?";
};

const formatDate = (value) => {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString([], {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const getDocumentName = (media) => {
    return (
        media?.document?.name ||
        media?.text ||
        "Document"
    );
};

const isVisualMedia = (media) => {
    return (
        media?.type === "image" ||
        media?.type === "video" ||
        media?.type === "gif"
    );
};

const getMediaDateGroup = (value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Older";
    }

    const now = new Date();

    const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
    );

    const itemDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
    );

    const difference =
        startOfToday.getTime() -
        itemDate.getTime();

    const daysAgo = Math.floor(
        difference / (1000 * 60 * 60 * 24),
    );

    if (daysAgo <= 0) {
        return "Today";
    }

    if (daysAgo <= 7) {
        return "Last week";
    }

    if (daysAgo <= 30) {
        return "Last month";
    }

    return "Older";
};

const ContactProfile = () => {
    const navigate = useNavigate();
    const { userId } = useParams();

    const presence = useSelector(
        (state) => state.userReducer?.presence || {},
    );

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
    const [mediaViewerIndex, setMediaViewerIndex] = useState(0);

    const [allMediaOpen, setAllMediaOpen] = useState(false);
    const [allMediaLoading, setAllMediaLoading] = useState(false);
    const [allMedia, setAllMedia] = useState([]);
    const [allMediaTab, setAllMediaTab] = useState("media");

    const [showRemoveContactModal, setShowRemoveContactModal] = useState(false);
    const [isRemovingContact, setIsRemovingContact] = useState(false);

    const [showAddContactModal, setShowAddContactModal] = useState(false);
    const [isAddingContact, setIsAddingContact] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadProfile = async () => {
            setLoading(true);

            const response = await getContactProfile(userId);

            if (cancelled) {
                return;
            }

            if (!response?.success) {
                toast.error(
                    response?.message ||
                    "Unable to load this profile.",
                );

                navigate(-1);
                return;
            }

            setProfileData(response.data);
            setLoading(false);
        };

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, [userId, navigate]);

    const profile = profileData?.profile;

    const fullName = useMemo(
        () => getFullName(profile),
        [profile],
    );

    const initials = useMemo(
        () => getInitials(profile),
        [profile],
    );

    const livePresence = presence?.[String(userId)];

    const presenceStatus = useMemo(() => {
        if (!profile) {
            return "off_planet";
        }

        return getEffectivePresenceStatus({
            user: {
                ...profile,
                publicPresenceStatus:
                    profile.effectivePresenceStatus ||
                    profile.publicPresenceStatus,
            },
            livePresence,
        });
    }, [profile, livePresence]);

    const aetherionDays = useMemo(
        () => getAetherionDays(profile?.createdAt),
        [profile?.createdAt],
    );

    const aetherionMilestone = useMemo(
        () => getAetherionDayMilestone(aetherionDays),
        [aetherionDays],
    );

    const media = Array.isArray(profileData?.media)
        ? profileData.media
        : [];

    const mediaTotal = Number(
        profileData?.mediaTotal ?? media.length,
    );

    const visualMedia = useMemo(
        () => media.filter(isVisualMedia),
        [media],
    );

    const groupedAllMedia = useMemo(() => {
        const source = allMedia.filter((item) =>
            allMediaTab === "media"
                ? isVisualMedia(item)
                : item?.type === "document",
        );

        const groups = {
            Today: [],
            "Last week": [],
            "Last month": [],
            Older: [],
        };

        source.forEach((item) => {
            const group = getMediaDateGroup(
                item.createdAt,
            );

            groups[group].push(item);
        });

        return Object.entries(groups).filter(
            ([, items]) => items.length > 0,
        );
    }, [allMedia, allMediaTab]);

    const openMediaViewer = (mediaItem) => {
        const index = visualMedia.findIndex(
            (item) => item?._id === mediaItem?._id,
        );

        if (index < 0) {
            return;
        }

        setMediaViewerIndex(index);
        setMediaViewerOpen(true);
    };

    const closeMediaViewer = () => {
        setMediaViewerOpen(false);
    };

    const openAllMedia = async () => {
        setAllMediaOpen(true);

        if (allMedia.length > 0) {
            return;
        }

        setAllMediaLoading(true);

        try {
            const response =
                await getContactProfileMedia(userId);

            if (!response?.success) {
                toast.error(
                    response?.message ||
                    "Unable to load media.",
                );

                setAllMediaOpen(false);
                return;
            }

            setAllMedia(
                Array.isArray(response.data?.media)
                    ? response.data.media
                    : [],
            );
        } catch (error) {
            console.error(
                "Load all contact media error:",
                error,
            );

            toast.error("Unable to load media.");
            setAllMediaOpen(false);
        } finally {
            setAllMediaLoading(false);
        }
    };

    const openAllMediaItem = (item) => {
        if (!isVisualMedia(item)) {
            return;
        }

        const index = allMedia.findIndex(
            (mediaItem) => mediaItem?._id === item?._id,
        );

        if (index < 0) {
            return;
        }

        const allVisualMedia = allMedia.filter(
            isVisualMedia,
        );

        const visualIndex = allVisualMedia.findIndex(
            (mediaItem) => mediaItem?._id === item?._id,
        );

        if (visualIndex < 0) {
            return;
        }

        setAllMediaOpen(false);

        setMediaViewerIndex(visualIndex);

        setMediaViewerOpen(true);

        setAllMediaTab("media");
    };

    const handleRemoveContact = async () => {
        if (!profile?._id || isRemovingContact) {
            return;
        }

        setIsRemovingContact(true);

        try {
            const response = await removeContact(
                profile._id,
            );

            if (!response?.success) {
                toast.error(
                    response?.message ||
                    "Couldn't remove this contact.",
                );

                return;
            }

            setProfileData((current) => {
                if (!current) {
                    return current;
                }

                return {
                    ...current,
                    isContact: false,
                };
            });

            setShowRemoveContactModal(false);

            toast.success("Contact removed.");
        } catch (error) {
            console.error(
                "Remove contact error:",
                error,
            );

            toast.error(
                "Couldn't remove this contact.",
            );
        } finally {
            setIsRemovingContact(false);
        }
    };

    const handleAddContact = async () => {
        if (!profile?._id || isAddingContact) {
            return;
        }

        setIsAddingContact(true);

        try {
            const response = await addContact(
                profile._id,
            );

            if (!response?.success) {
                toast.error(
                    response?.message ||
                    "Couldn't add this contact.",
                );

                return;
            }

            setProfileData((current) => {
                if (!current) {
                    return current;
                }

                return {
                    ...current,
                    isContact: true,
                };
            });

            setShowAddContactModal(false);

            toast.success("Contact added.");
        } catch (error) {
            console.error(
                "Add contact error:",
                error,
            );

            toast.error(
                "Couldn't add this contact.",
            );
        } finally {
            setIsAddingContact(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0b100c]">
                <div className="text-sm text-[#626960]">
                    Loading profile...
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0b100c]">
                <div className="text-sm text-[#626960]">
                    Profile unavailable.
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b100c] text-[#f1eee8]">
            <main className="w-full px-4 py-7 sm:px-7 sm:py-10 lg:px-10">
                <div className="w-full">

                    {/* BANNER */}
                    <div className="relative">
                        <ProfileBanner
                            bannerUrl={profile.profileBanner}
                            editMode={false}
                            showAction={false}
                        />

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="absolute left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg transition active:scale-95 sm:left-5 sm:top-5"
                            aria-label="Go back"
                            title="Go back"
                        >
                            <IoArrowBack className="text-lg" />
                        </button>
                    </div>

                    {/* PROFILE CONTENT */}

                    <div className="relative px-5 pb-10 sm:px-8 sm:pb-12 lg:px-10 lg:pb-14">

                        {/* AVATAR */}
                        <div className="relative min-h-[6rem] sm:min-h-[6.5rem] lg:min-h-[7rem]">
                            <div className="absolute left-0 top-0 z-10 -translate-y-16 sm:-translate-y-20">
                                <Avatar
                                    profilePic={profile.profilePic}
                                    initials={initials}
                                    alt={fullName}
                                    decoration={profile.avatarDecoration}
                                    size="lg"
                                    avatarClassName="border-4 border-[#0b100c] bg-[#151a16] font-bold text-[#d8f45a]"
                                >
                                    <div className="absolute bottom-1 right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full border-[2px] border-[#111317] bg-[#131613] shadow-md">
                                        <PresenceIcon
                                            status={presenceStatus}
                                            size="small"
                                        />
                                    </div>
                                </Avatar>
                            </div>

                            {/* STATUS */}
                            {profile.customStatus?.trim() && (
                                <div className="absolute left-[7.5rem] right-0 -top-[8px] z-20 sm:left-[8.5rem] lg:left-[9.5rem]">
                                    <div className="flex min-w-0 items-start">

                                        {/* CONNECTOR DOTS */}
                                        <div className="mr-1 mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#1a1c1a]" />
                                        <div className="mr-1.5 mt-4 h-3 w-3 shrink-0 rounded-full bg-[#1a1c1a]" />

                                        {/* READ-ONLY STATUS BUBBLE */}
                                        <div className="min-w-0 max-w-[calc(100vw-9rem)] rounded-[1.35rem] rounded-bl-md border border-white/[0.1] bg-white/[0.035] px-4 py-2.5 text-left text-sm leading-5 text-[#d4d7d1] shadow-[0_8px_30px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:max-w-[calc(100vw-10rem)] lg:max-w-[28rem]">
                                            <span className="block max-h-[3.75rem] overflow-hidden break-all">
                                                {profile.customStatus}
                                            </span>
                                        </div>

                                    </div>
                                </div>
                            )}

                        </div>

                        {/* IDENTITY */}
                        <div className="-mt-4 max-w-3xl">
                            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                {fullName}
                            </h2>

                            <p className="mt-1.5 break-words text-sm text-[#b5b8b3]">
                                {profile.email}

                                {profile.pronouns?.trim() && (
                                    <>
                                        {" • "}
                                        {profile.pronouns}
                                    </>
                                )}
                            </p>
                        </div>

                        {/* MEDIA */}
                        <section className="mt-8">

                            <div
                                role="button"
                                tabIndex={0}
                                onClick={openAllMedia}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" ||
                                        event.key === " "
                                    ) {
                                        event.preventDefault();
                                        openAllMedia();
                                    }
                                }}
                                className="cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-semibold text-[#f1eee8]">
                                        Media and docs
                                    </h2>

                                    <div className="flex items-center gap-1 text-xs font-medium text-[#858d84]">
                                        <span>
                                            {mediaTotal}
                                        </span>

                                        <IoChevronForward className="text-sm" />
                                    </div>
                                </div>

                                {mediaTotal > 0 && (
                                    <div className="mt-3 overflow-hidden rounded-2xl bg-[#0b100c] transition">
                                        <div className="scrollbar-aetherion flex gap-2 overflow-x-auto p-2">
                                            {media.map(
                                                (
                                                    item,
                                                    index,
                                                ) => {
                                                    const visual =
                                                        isVisualMedia(
                                                            item,
                                                        );

                                                    const visibilityClass =
                                                        index >=
                                                            15
                                                            ? "hidden lg:flex"
                                                            : index >=
                                                                10
                                                                ? "hidden sm:flex"
                                                                : "flex";

                                                    return (
                                                        <div
                                                            key={
                                                                item._id
                                                            }
                                                            role={
                                                                visual
                                                                    ? "button"
                                                                    : undefined
                                                            }
                                                            tabIndex={
                                                                visual
                                                                    ? 0
                                                                    : undefined
                                                            }
                                                            onClick={(
                                                                event,
                                                            ) => {
                                                                if (
                                                                    visual
                                                                ) {
                                                                    event.stopPropagation();

                                                                    openMediaViewer(
                                                                        item,
                                                                    );
                                                                } else {
                                                                    openAllMedia();
                                                                }
                                                            }}
                                                            onKeyDown={(
                                                                event,
                                                            ) => {
                                                                if (
                                                                    visual &&
                                                                    (
                                                                        event.key ===
                                                                        "Enter" ||
                                                                        event.key ===
                                                                        " "
                                                                    )
                                                                ) {
                                                                    event.preventDefault();
                                                                    event.stopPropagation();

                                                                    openMediaViewer(
                                                                        item,
                                                                    );
                                                                }
                                                            }}
                                                            className={`${visibilityClass} group relative aspect-square shrink-0 basis-[22%] overflow-hidden rounded-xl bg-[#151a16] sm:basis-[18%] lg:basis-[14%]`}
                                                        >
                                                            {item.type ===
                                                                "image" ||
                                                                item.type ===
                                                                "gif" ? (
                                                                <img
                                                                    src={
                                                                        item.mediaUrl
                                                                    }
                                                                    alt=""
                                                                    className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                                                                    loading="lazy"
                                                                />
                                                            ) : item.type ===
                                                                "video" ? (
                                                                <>
                                                                    <video
                                                                        src={
                                                                            item.mediaUrl
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                        muted
                                                                        playsInline
                                                                        preload="metadata"
                                                                    />

                                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                                                                            <IoPlay className="text-base" />
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-2 text-center">
                                                                    <IoDocumentTextOutline className="text-xl text-[#858d84]" />

                                                                    <span className="line-clamp-2 text-[10px] text-[#aeb5ac]">
                                                                        {getDocumentName(
                                                                            item,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* PROFILE INFORMATION */}

                        <div className="mt-8 border-t border-white/[0.06] pt-8">
                            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">

                                {/* LEFT — BIO + MEMBER SINCE + DAYS */}
                                <div className="min-w-0">

                                    {/* BIO */}
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8d918c]">
                                            Bio
                                        </p>

                                        <p className="mt-3 max-w-3xl whitespace-pre-wrap break-words text-sm leading-6 text-[#d0d2ce]">
                                            {profile.bio?.trim() ? (
                                                profile.bio
                                            ) : (
                                                <span className="text-[#777b76]">
                                                    No bio yet.
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {/* MEMBER SINCE + DAYS */}
                                    <div className="space-y-5 pt-4">

                                        {/* MEMBER SINCE */}
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/35">
                                                Member Since
                                            </p>

                                            <div className="mt-2 flex items-center gap-2.5 text-sm text-white/65">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-full">
                                                    <img
                                                        src="/favicon.png"
                                                        alt="Aetherion"
                                                        className="h-15 w-15 object-contain"
                                                    />
                                                </div>

                                                <span>
                                                    {profile.createdAt
                                                        ? new Date(
                                                            profile.createdAt,
                                                        ).toLocaleDateString(
                                                            undefined,
                                                            {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            },
                                                        )
                                                        : "—"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* DAYS ON AETHERION */}
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/35">
                                                Days on Aetherion
                                            </p>

                                            <div className="mt-1 flex items-center">
                                                <span className="text-sm font-medium text-white/80">
                                                    {aetherionDays}{" "}
                                                    {aetherionDays === 1
                                                        ? "day"
                                                        : "days"}
                                                </span>

                                                {aetherionMilestone && (
                                                    <AetherionDayBadge
                                                        milestone={
                                                            aetherionMilestone
                                                        }
                                                        size="small"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* RIGHT — CONNECTIONS */}
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-[#bebdbc]">
                                        Connections
                                    </p>

                                    {profile.connections?.length > 0 ? (
                                        <Connections
                                            connections={profile.connections}
                                            readOnly
                                        />
                                    ) : (
                                        <div className="border-l border-white/[0.08] pl-4 mt-3">
                                            <p className="text-sm text-[#777b76]">
                                                No connections
                                            </p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                    </div>

                    {/* CONTACTS */}
                    <section
                        id="contact-profile-contacts"
                        className="pt-8"
                    >
                        <div className="-mt-6 mx-5 border-t border-white/[0.06] pt-8 sm:mx-8 lg:mx-10">
                            <ContactList
                                ownerId={profile?._id}
                                isOwnProfile={false}
                            />
                        </div>
                    </section>

                </div>
            </main>

            {/* ALL MEDIA MODAL */}
            {allMediaOpen && (
                <div className="fixed inset-0 z-[80] bg-[#0b100c]">
                    <div className="flex h-full flex-col">
                        {/* HEADER */}
                        <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-4 py-4 sm:px-6">
                            <button
                                type="button"
                                onClick={() =>
                                    setAllMediaOpen(false)
                                }
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#aeb5aa] transition hover:text-white"
                                aria-label="Back"
                            >
                                <IoArrowBack className="text-lg" />
                            </button>

                            <div className="min-w-0">
                                <h2 className="text-base font-semibold text-[#f1eee8]">
                                    All Media
                                </h2>

                                <p className="mt-0.5 text-xs text-[#626960]">
                                    {mediaTotal} shared items
                                </p>
                            </div>
                        </div>

                        {/* TABS */}
                        <div className="flex border-b border-[#d8f45a]/10">
                            <button
                                type="button"
                                onClick={() => setAllMediaTab("media")}
                                className={`flex flex-1 items-center justify-center py-3 text-sm font-semibold transition ${allMediaTab === "media"
                                    ? "border-b-2 border-[#c1e344] text-[#d8f45a]"
                                    : "text-[#858d84] hover:text-[#f1eee8]"
                                    }`}
                            >
                                Media
                            </button>

                            <button
                                type="button"
                                onClick={() => setAllMediaTab("docs")}
                                className={`flex flex-1 items-center justify-center py-3 text-sm font-semibold transition ${allMediaTab === "docs"
                                    ? "border-b-2 border-[#d8f45a] text-[#d8f45a]"
                                    : "text-[#858d84] hover:text-[#f1eee8]"
                                    }`}
                            >
                                Docs
                            </button>
                        </div>

                        {/* CONTENT */}
                        <div className="scrollbar-aetherion flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                            {allMediaLoading ? (
                                <div className="flex min-h-[40vh] items-center justify-center">
                                    <p className="text-sm text-[#626960]">
                                        Loading...
                                    </p>
                                </div>
                            ) : groupedAllMedia.length ===
                                0 ? (
                                <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
                                    {allMediaTab ===
                                        "media" ? (
                                        <IoImageOutline className="text-3xl text-[#454c45]" />
                                    ) : (
                                        <IoDocumentTextOutline className="text-3xl text-[#454c45]" />
                                    )}

                                    <p className="mt-3 text-sm text-[#626960]">
                                        No{" "}
                                        {allMediaTab ===
                                            "media"
                                            ? "media"
                                            : "documents"}{" "}
                                        shared yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="mx-auto w-full max-w-6xl space-y-8">
                                    {groupedAllMedia.map(
                                        ([
                                            groupName,
                                            items,
                                        ]) => (
                                            <section
                                                key={
                                                    groupName
                                                }
                                            >
                                                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#626960]">
                                                    {
                                                        groupName
                                                    }
                                                </h3>

                                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                                                    {items.map(
                                                        (
                                                            item,
                                                        ) => {
                                                            const visual =
                                                                isVisualMedia(
                                                                    item,
                                                                );

                                                            return (
                                                                <button
                                                                    key={
                                                                        item._id
                                                                    }
                                                                    type="button"
                                                                    disabled={
                                                                        !visual
                                                                    }
                                                                    onClick={() =>
                                                                        openAllMediaItem(
                                                                            item,
                                                                        )
                                                                    }
                                                                    className={`group relative aspect-square overflow-hidden rounded-xl bg-[#151a16] ${visual
                                                                        ? "cursor-pointer"
                                                                        : "cursor-default"
                                                                        }`}
                                                                >
                                                                    {visual &&
                                                                        item.mediaUrl ? (
                                                                        <>
                                                                            <img
                                                                                src={
                                                                                    item.mediaUrl
                                                                                }
                                                                                alt="Shared media"
                                                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                                            />

                                                                            {item.type ===
                                                                                "video" && (
                                                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
                                                                                            <IoPlay className="ml-0.5 text-sm" />
                                                                                        </span>
                                                                                    </div>
                                                                                )}

                                                                            {item.type ===
                                                                                "gif" && (
                                                                                    <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/65 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                                                                                        GIF
                                                                                    </span>
                                                                                )}
                                                                        </>
                                                                    ) : (
                                                                        <div className="flex h-full flex-col items-center justify-center gap-3 px-3">
                                                                            <IoDocumentTextOutline className="text-2xl text-[#777f76]" />

                                                                            <p className="line-clamp-3 text-center text-[10px] leading-4 text-[#858d84]">
                                                                                {getDocumentName(
                                                                                    item,
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </section>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MEDIA VIEWER */}
            {mediaViewerOpen &&
                visualMedia.length > 0 && (
                    <MediaViewer
                        mediaItems={visualMedia}
                        initialIndex={
                            mediaViewerIndex
                        }
                        onClose={closeMediaViewer}
                        currentUser={null}
                        otherUser={profile}
                    />
                )}

            {/* REMOVE CONTACT MODAL */}
            {showRemoveContactModal && (<div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm sm:items-center sm:px-5 sm:pb-0" onMouseDown={() => {
                if (!isRemovingContact) {
                    setShowRemoveContactModal(
                        false,
                    );
                }
            }}
            >
                <div
                    className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111611] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
                    onMouseDown={(event) =>
                        event.stopPropagation()
                    }
                >
                    <div className="border-b border-white/[0.06] px-5 py-4">
                        <h2 className="text-sm font-semibold text-[#f1eee8]">
                            Remove contact?
                        </h2>

                        <p className="mt-1.5 text-xs leading-5 text-[#777f76]">
                            Remove{" "}
                            <span className="font-medium text-[#b9beb7]">
                                {fullName}
                            </span>{" "}
                            from your contacts?
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 p-4">
                        <button
                            type="button"
                            onClick={
                                handleRemoveContact
                            }
                            disabled={
                                isRemovingContact
                            }
                            className="flex h-10 w-full items-center justify-center rounded-xl bg-[#d8f45a] px-4 text-sm font-semibold text-[#10120d] transition hover:bg-[#e4ff6f] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isRemovingContact
                                ? "Removing..."
                                : "Remove contact"}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setShowRemoveContactModal(
                                    false,
                                )
                            }
                            disabled={
                                isRemovingContact
                            }
                            className="flex h-10 w-full items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm font-medium text-[#aeb5aa] transition hover:bg-white/[0.05] hover:text-[#f1eee8] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
            )}

            {/* ADD CONTACT MODAL */}
            {showAddContactModal && (
                <div
                    className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm sm:items-center sm:px-5 sm:pb-0"
                    onMouseDown={() => {
                        if (!isAddingContact) {
                            setShowAddContactModal(
                                false,
                            );
                        }
                    }}
                >
                    <div
                        className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111611] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="border-b border-white/[0.06] px-5 py-4">
                            <h2 className="text-sm font-semibold text-[#f1eee8]">
                                Add contact?
                            </h2>

                            <p className="mt-1.5 text-xs leading-5 text-[#777f76]">
                                Add{" "}
                                <span className="font-medium text-[#b9beb7]">
                                    {fullName}
                                </span>{" "}
                                to your contacts?
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 p-4">
                            <button
                                type="button"
                                onClick={handleAddContact}
                                disabled={
                                    isAddingContact
                                }
                                className="flex h-10 w-full items-center justify-center rounded-xl bg-[#d8f45a] px-4 text-sm font-semibold text-[#10120d] transition hover:bg-[#e4ff6f] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isAddingContact
                                    ? "Adding..."
                                    : "Add contact"}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowAddContactModal(
                                        false,
                                    )
                                }
                                disabled={
                                    isAddingContact
                                }
                                className="flex h-10 w-full items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm font-medium text-[#aeb5aa] transition hover:bg-white/[0.05] hover:text-[#f1eee8] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactProfile;