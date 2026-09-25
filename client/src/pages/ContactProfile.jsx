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
    IoDownloadOutline,
    IoImageOutline,
    IoVideocamOutline,
    IoGridOutline,
} from "react-icons/io5";

import Avatar from "../components/Avatar.jsx";
import PresenceIcon from "../components/PresenceIcon.jsx";
import ProfileBanner from "../components/ProfileBanner.jsx";
import Connections from "../components/Connections.jsx";
import MediaViewer from "../components/Camera/MediaViewer.jsx";

import { getContactProfile } from "../apiCalls/contactProfileApi.js";
import { removeContact, addContact } from "../apiCalls/contactApi.js";
import { getEffectivePresenceStatus } from "../utils/presenceStatus.js";
import { getAetherionDays } from "../utils/aetherionDays.js";

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

const ContactProfile = () => {
    const navigate = useNavigate();
    const { userId } = useParams();

    const presence = useSelector((state) => state.userReducer?.presence || {},);

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
    const [mediaViewerIndex, setMediaViewerIndex] = useState(0);

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

    const media = Array.isArray(profileData?.media) ? profileData.media : [];

    const visualMedia = useMemo(
        () => media.filter(isVisualMedia),
        [media],
    );

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

    const handleRemoveContact = async () => {
        if (!profile?._id || isRemovingContact) {
            return;
        }

        setIsRemovingContact(true);

        try {
            const response = await removeContact(profile._id);

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
            const response = await addContact(profile._id);

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
            <main className="w-full pb-12">
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
                        className="absolute left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-black/45 text-white shadow-lg backdrop-blur-md transition hover:bg-black/65 active:scale-95 sm:left-5 sm:top-5"
                        aria-label="Go back"
                        title="Go back"
                    >
                        <IoArrowBack className="text-lg" />
                    </button>
                </div>

                {/* PROFILE IDENTITY */}

                <section className="px-5 sm:px-8">
                    <div className="relative">

                        {/* AVATAR + STATUS */}

                        <div className="relative min-h-[8rem] sm:min-h-[9rem] lg:min-h-[10rem]">

                            {/* AVATAR */}

                            <div className="absolute left-0 top-0 z-10 -translate-y-10 sm:-translate-y-12">
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

                            {/* CUSTOM STATUS */}

                            {profile.customStatus?.trim() && (
                                <div className="absolute left-[7.5rem] top-0 z-20 sm:left-[8.5rem] lg:left-[9.5rem]">
                                    <div className="flex items-start">

                                        {/* CONNECTOR DOTS */}

                                        <div className="mr-1 mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#1a1c1a]" />

                                        <div className="mr-1.5 mt-4 h-3 w-3 shrink-0 rounded-full bg-[#1a1c1a]" />

                                        {/* STATUS BUBBLE */}

                                        <div className="max-w-[calc(100vw-10rem)] rounded-[1.35rem] rounded-bl-md border border-white/[0.1] bg-white/[0.035] px-4 py-2.5 text-left text-sm leading-5 text-[#d4d7d1] shadow-[0_8px_30px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:max-w-[24rem] lg:max-w-[28rem]">
                                            <span className="block max-h-[3.75rem] overflow-hidden break-words">
                                                {profile.customStatus}
                                            </span>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>

                        {/* IDENTITY — BELOW AVATAR */}
                        <div className="-mt-8 max-w-3xl">
                            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                {fullName}
                            </h1>

                            <p className="mt-1.5 break-words text-sm text-[#b5b8b3]">
                                {profile.email}
                                {profile.pronouns?.trim() && (
                                    <>
                                        {" • "}
                                        {profile.pronouns}
                                    </>
                                )}
                            </p>

                            {/* PRESENCE */}
                            <div className="mt-3 flex items-center gap-2">
                                <PresenceIcon
                                    status={presenceStatus}
                                    size="small"
                                />

                                <span className="text-xs font-medium text-[#858d84]">
                                    {presenceStatus === "online"
                                        ? "Online"
                                        : presenceStatus === "idle"
                                            ? "Idle"
                                            : presenceStatus === "dnd"
                                                ? "Do Not Disturb"
                                                : "Off Planet"}
                                </span>
                            </div>
                        </div>

                    </div>
                </section>

                {/* MEDIA */}
                <section className="mt-8 px-5 sm:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-[#f1eee8]">
                                Media and documents
                            </h2>

                            <p className="mt-0.5 text-xs text-[#626960]">
                                Shared in your conversations
                            </p>
                        </div>

                        {media.length > 0 && (
                            <span className="text-[11px] text-[#555d55]">
                                Latest {media.length}
                            </span>
                        )}
                    </div>

                    {media.length === 0 ? (
                        <div className="mt-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-8 text-center">
                            <p className="text-sm text-[#626960]">
                                No shared media or documents yet.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-3 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#101510]">
                            <div className="scrollbar-aetherion flex gap-2 overflow-x-auto p-2 scrollbar-hide">
                                {media.map((item, index) => {
                                    const visual = isVisualMedia(item);

                                    const visibilityClass =
                                        index >= 15
                                            ? "hidden lg:flex"
                                            : index >= 10
                                                ? "hidden sm:flex"
                                                : "flex";

                                    return (
                                        <button
                                            key={item._id}
                                            type="button"
                                            onClick={() =>
                                                visual &&
                                                openMediaViewer(item)
                                            }
                                            disabled={!visual}
                                            className={`${visibilityClass} group relative aspect-square shrink-0 basis-[22%] overflow-hidden rounded-xl bg-[#151a16] sm:basis-[18%] lg:basis-[14%] ${visual
                                                    ? "cursor-pointer"
                                                    : "cursor-default"
                                                }`}
                                        >
                                            {visual && item.mediaUrl ? (
                                                <>
                                                    <img
                                                        src={item.mediaUrl}
                                                        alt="Shared media"
                                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                    />

                                                    {item.type === "video" && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm sm:h-9 sm:w-9">
                                                                <IoPlay className="ml-0.5 text-sm" />
                                                            </span>
                                                        </div>
                                                    )}

                                                    {item.type === "gif" && (
                                                        <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/65 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                                                            GIF
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-2">
                                                    <IoDocumentTextOutline className="text-xl text-[#777f76] sm:text-2xl" />

                                                    <p className="line-clamp-2 text-center text-[9px] font-medium leading-4 text-[#858d84] sm:text-[10px]">
                                                        {getDocumentName(item)}
                                                    </p>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div >
                    )}
                </section>

                {/* BIO */}
                {profile.bio && (
                    <section className="mt-8 px-5 sm:px-8">
                        <h2 className="text-sm font-semibold text-[#f1eee8]">
                            About
                        </h2>

                        <div className="mt-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
                            <p className="whitespace-pre-wrap text-sm leading-6 text-[#aeb5aa]">
                                {profile.bio}
                            </p>
                        </div>
                    </section>
                )}

                {/* CONNECTIONS */}

                {Array.isArray(profile.connections) &&
                    profile.connections.length > 0 && (
                        <section className="mt-8 px-5 sm:px-8">
                            <h2 className="mb-3 text-sm font-semibold text-[#f1eee8]">
                                Connections
                            </h2>

                            <div className="pointer-events-none">
                                <Connections
                                    connections={
                                        profile.connections
                                    }
                                />
                            </div>
                        </section>
                    )}

                {/* MEMBER SINCE */}

                <section className="mt-8 px-5 sm:px-8">
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-[#f1eee8]">
                                    On Aetherion
                                </p>

                                <p className="mt-1 text-xs text-[#626960]">
                                    Member since{" "}
                                    {formatDate(
                                        profile.createdAt,
                                    )}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-lg font-bold text-[#d8f45a]">
                                    {aetherionDays}
                                </p>

                                <p className="text-[10px] uppercase tracking-wider text-[#626960]">
                                    days
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CONTACTS */}

                {Array.isArray(profileData.contacts) &&
                    profileData.contacts.length > 0 && (
                        <section className="mt-8 px-5 sm:px-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold text-[#f1eee8]">
                                        Contacts
                                    </h2>

                                    <p className="mt-0.5 text-xs text-[#626960]">
                                        People in their Aetherion contacts
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="flex items-center gap-1 text-xs font-medium text-[#858d84] transition hover:text-[#d8f45a]"
                                >
                                    See all
                                    <IoChevronForward />
                                </button>
                            </div>

                            <div className="scrollbar-aetherion mt-4 flex gap-4 overflow-x-auto pb-2">
                                {profileData.contacts.map(
                                    (contact) => {
                                        const contactName =
                                            getFullName(
                                                contact,
                                            );

                                        return (
                                            <button
                                                key={
                                                    contact._id
                                                }
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/ contact - profile / ${contact._id} `,
                                                    )
                                                }
                                                className="group flex w-16 shrink-0 flex-col items-center gap-2"
                                            >
                                                <Avatar
                                                    profilePic={
                                                        contact.profilePic
                                                    }
                                                    initials={getInitials(
                                                        contact,
                                                    )}
                                                    alt={
                                                        contactName
                                                    }
                                                    decoration={
                                                        contact.avatarDecoration
                                                    }
                                                    size="sm"
                                                    avatarClassName="bg-[#151a16] text-xs font-bold text-[#d8f45a]"
                                                />

                                                <span className="w-full truncate text-center text-[10px] font-medium text-[#858d84] transition group-hover:text-[#f1eee8]">
                                                    {
                                                        contactName
                                                    }
                                                </span>
                                            </button>
                                        );
                                    },
                                )}
                            </div>
                        </section>
                    )}
            </main>

            {/* MEDIA VIEWER */}

            {mediaViewerOpen && visualMedia.length > 0 && (
                <MediaViewer
                    mediaItems={visualMedia}
                    initialIndex={mediaViewerIndex}
                    onClose={closeMediaViewer}
                    currentUser={null}
                    otherUser={profile}
                />
            )}

            {/* REMOVE CONTACT MODAL */}
            {showRemoveContactModal && (
                <div
                    className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm sm:items-center sm:px-5 sm:pb-0"
                    onMouseDown={() => {
                        if (!isRemovingContact) {
                            setShowRemoveContactModal(false);
                        }
                    }}
                >
                    <div
                        className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111611] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        {/* HEADER */}

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

                        {/* ACTIONS */}

                        <div className="flex flex-col gap-2 p-4">
                            <button
                                type="button"
                                onClick={handleRemoveContact}
                                disabled={isRemovingContact}
                                className="flex h-10 w-full items-center justify-center rounded-xl bg-[#d8f45a] px-4 text-sm font-semibold text-[#10120d] transition hover:bg-[#e4ff6f] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isRemovingContact
                                    ? "Removing..."
                                    : "Remove contact"}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowRemoveContactModal(false)
                                }
                                disabled={isRemovingContact}
                                className="flex h-10 w-full items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm font-medium text-[#aeb5aa] transition hover:bg-white/[0.05] hover:text-[#f1eee8] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddContactModal && (
                <div
                    className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm sm:items-center sm:px-5 sm:pb-0"
                    onMouseDown={() => {
                        if (!isAddingContact) {
                            setShowAddContactModal(false);
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
                                disabled={isAddingContact}
                                className="flex h-10 w-full items-center justify-center rounded-xl bg-[#d8f45a] px-4 text-sm font-semibold text-[#10120d] transition hover:bg-[#e4ff6f] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isAddingContact
                                    ? "Adding..."
                                    : "Add contact"}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowAddContactModal(false)
                                }
                                disabled={isAddingContact}
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