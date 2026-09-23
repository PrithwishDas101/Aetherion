import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
    IoArrowBack,
    IoChevronForward,
    IoPersonAddOutline,
} from "react-icons/io5";

import Avatar from "../components/Avatar.jsx";
import PresenceIcon from "../components/PresenceIcon.jsx";
import ProfileBanner from "../components/ProfileBanner.jsx";
import Connections from "../components/Connections.jsx";

import { getContactProfile } from "../apiCalls/contactProfileApi.js";
import {
    getEffectivePresenceStatus,
} from "../utils/presenceStatus.js";
import { getDaysOnAetherion } from "../utils/aetherionDays.js";

const getFullName = (user) => {
    return `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        "Unknown user";
};

const getInitials = (user) => {
    const firstName = (user?.firstName || "").trim();
    const lastName = (user?.lastName || "").trim();

    return [
        firstName.charAt(0),
        lastName.charAt(0),
    ]
        .filter(Boolean)
        .join("")
        .toUpperCase() || "?";
};

const ContactProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const {
        user: currentUser,
        presence,
    } = useSelector((state) => state.userReducer);

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const loadContactProfile = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            setLoading(true);

            const response = await getContactProfile(userId);

            if (cancelled) {
                return;
            }

            if (!response?.success) {
                toast.error(
                    response?.message || "Unable to load contact profile.",
                );

                setProfileData(null);
                setLoading(false);

                return;
            }

            setProfileData(response.data || null);
            setLoading(false);
        };

        loadContactProfile();

        return () => {
            cancelled = true;
        };
    }, [userId]);

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
            return null;
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

    const daysOnAetherion = useMemo(() => {
        if (!profile?.createdAt) {
            return 0;
        }

        return getDaysOnAetherion(profile.createdAt);
    }, [profile?.createdAt]);

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#080d09]">
                <div className="flex flex-col items-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d8f45a]/20 border-t-[#d8f45a]" />

                    <p className="mt-4 text-xs font-medium text-[#687166]">
                        Loading profile...
                    </p>
                </div>
            </div>
        );
    }

    if (!profileData?.profile) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-[#080d09] px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.025] text-[#687166]">
                    <IoPersonAddOutline className="text-xl" />
                </div>

                <h1 className="mt-4 text-base font-semibold text-[#f1eee8]">
                    Profile unavailable
                </h1>

                <p className="mt-2 max-w-[280px] text-xs leading-5 text-[#70786f]">
                    This profile could not be loaded.
                </p>

                <button
                    type="button"
                    onClick={handleBack}
                    className="mt-6 rounded-xl bg-[#d8f45a] px-4 py-2.5 text-xs font-bold text-[#10120d] transition hover:bg-[#e4ff6c]"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen overflow-y-auto bg-[#080d09] text-[#f1eee8]">
            {/* PAGE HEADER */}
            <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#080d09]/95 backdrop-blur-xl">
                <div className="mx-auto flex h-16 w-full max-w-[1100px] items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* BACK */}
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-[#9da59a] transition hover:bg-white/[0.05] hover:text-[#f1eee8]"
                        aria-label="Go back"
                        title="Go back"
                    >
                        <IoArrowBack className="text-xl" />
                    </button>

                    {/* TITLE */}
                    <div className="absolute left-1/2 -translate-x-1/2">
                        <h1 className="text-sm font-semibold tracking-wide text-[#e7e9e1]">
                            Profile
                        </h1>
                    </div>

                    {/* CONTACT STATE */}
                    <div className="flex h-10 w-10 items-center justify-center">
                        {profileData.isContact && (
                            <button
                                type="button"
                                className="flex h-10 w-10 items-center justify-center rounded-full text-[#d8f45a] transition hover:bg-[#d8f45a]/[0.08]"
                                aria-label={`Contact options for ${fullName}`}
                                title="Contact options"
                            >
                                <IoPersonAddOutline className="text-xl" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* CONTENT */}
            <main className="mx-auto w-full max-w-[1100px] px-4 pb-12 sm:px-6 lg:px-8">
                {/* PROFILE HERO */}
                <section className="relative mt-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c120d] shadow-[0_20px_70px_rgba(0,0,0,0.24)] sm:mt-6">
                    {/* BANNER */}
                    <div className="relative h-[180px] overflow-hidden sm:h-[230px] lg:h-[280px]">
                        <ProfileBanner
                            profileBanner={profile.profileBanner}
                            readOnly
                        />

                        {/* DARK GRADIENT */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0c120d]" />
                    </div>

                    {/* AVATAR + PROFILE INFO */}
                    <div className="relative px-5 pb-7 sm:px-8 lg:px-10">
                        {/* AVATAR */}
                        <div className="-mt-[58px] flex justify-center sm:-mt-[72px]">
                            <div className="relative">
                                <Avatar
                                    profilePic={profile.profilePic}
                                    initials={initials}
                                    alt={fullName}
                                    decoration={profile.avatarDecoration}
                                    size="xl"
                                    avatarClassName="bg-[#cacfb4] text-[#10120d] font-bold ring-[6px] ring-[#0c120d] shadow-[0_10px_35px_rgba(0,0,0,0.45)]"
                                >
                                    {presenceStatus && (
                                        <div className="absolute bottom-1 right-1 z-30 rounded-full bg-[#0c120d] p-1.5">
                                            <PresenceIcon
                                                status={presenceStatus}
                                                size="small"
                                            />
                                        </div>
                                    )}
                                </Avatar>
                            </div>
                        </div>

                        {/* NAME */}
                        <div className="mt-4 text-center">
                            <h2 className="text-xl font-bold tracking-[-0.02em] text-[#f1eee8] sm:text-2xl">
                                {fullName}
                            </h2>

                            {/* EMAIL + PRONOUNS */}
                            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-[#7f887d]">
                                {profile.email && (
                                    <span>{profile.email}</span>
                                )}

                                {profile.email && profile.pronouns && (
                                    <span className="text-[#4f584e]">
                                        •
                                    </span>
                                )}

                                {profile.pronouns && (
                                    <span>{profile.pronouns}</span>
                                )}
                            </div>
                        </div>

                        {/* PRESENCE */}
                        {presenceStatus && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <PresenceIcon
                                    status={presenceStatus}
                                    size="small"
                                />

                                <span className="text-xs font-medium text-[#a4aca0]">
                                    {presenceStatus}
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                {/* MEDIA */}
                <section className="mt-4 rounded-2xl border border-white/[0.06] bg-[#0c120d]">
                    <button
                        type="button"
                        className="flex w-full items-center justify-between px-5 py-4 text-left sm:px-6"
                    >
                        <div>
                            <h3 className="text-sm font-semibold text-[#e8ebe4]">
                                Media and documents
                            </h3>

                            <p className="mt-1 text-[11px] text-[#626b61]">
                                Shared media preview
                            </p>
                        </div>

                        <IoChevronForward className="text-lg text-[#687166]" />
                    </button>

                    <div className="border-t border-white/[0.05] px-5 py-5 sm:px-6">
                        {profileData.media?.length ? (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {profileData.media.map((item) => (
                                    <div
                                        key={item._id}
                                        className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/[0.06] bg-[#111711] sm:h-24 sm:w-24"
                                    >
                                        {item.type === "image" ||
                                            item.type === "gif" ? (
                                            item.mediaUrl ? (
                                                <img
                                                    src={item.mediaUrl}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-xs text-[#687166]">
                                                    {item.type === "gif"
                                                        ? "GIF"
                                                        : "Image"}
                                                </div>
                                            )
                                        ) : item.type === "video" ? (
                                            <div className="relative flex h-full items-center justify-center bg-[#111711]">
                                                <span className="text-xs font-semibold text-[#9ca69a]">
                                                    VIDEO
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center gap-1 px-2 text-center">
                                                <span className="text-[10px] font-semibold uppercase text-[#9ca69a]">
                                                    DOC
                                                </span>

                                                <span className="max-w-full truncate text-[9px] text-[#626b61]">
                                                    {item.document?.name ||
                                                        "Document"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex min-h-[100px] items-center justify-center text-center">
                                <p className="text-xs text-[#626b61]">
                                    No shared media or documents yet.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* BIO + CONNECTIONS */}
                <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
                    {/* BIO */}
                    <div className="rounded-2xl border border-white/[0.06] bg-[#0c120d] p-5 sm:p-6">
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d867a]">
                            Bio
                        </h3>

                        <p className="mt-4 text-sm leading-6 text-[#b4bbb0]">
                            {profile.bio || "No bio added yet."}
                        </p>
                    </div>

                    {/* CONNECTIONS */}
                    <div className="rounded-2xl border border-white/[0.06] bg-[#0c120d] p-5 sm:p-6">
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d867a]">
                            Connections
                        </h3>

                        <div className="mt-4">
                            <Connections
                                connections={profile.connections}
                                readOnly
                            />
                        </div>
                    </div>
                </section>

                {/* AETHERION STATS */}
                <section className="mt-4 rounded-2xl border border-white/[0.06] bg-[#0c120d] p-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#626b61]">
                                Member Since
                            </p>

                            <p className="mt-2 text-sm font-semibold text-[#e5e9df]">
                                {profile.createdAt
                                    ? new Date(
                                        profile.createdAt,
                                    ).toLocaleDateString(
                                        undefined,
                                        {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        },
                                    )
                                    : "Unknown"}
                            </p>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#626b61]">
                                Days on Aetherion
                            </p>

                            <p className="mt-2 text-sm font-semibold text-[#e5e9df]">
                                {daysOnAetherion}
                            </p>
                        </div>
                    </div>
                </section>

                {/* CONTACTS */}
                <section className="mt-4 rounded-2xl border border-white/[0.06] bg-[#0c120d]">
                    <button
                        type="button"
                        className="flex w-full items-center justify-between px-5 py-4 sm:px-6"
                    >
                        <div>
                            <h3 className="text-sm font-semibold text-[#e8ebe4]">
                                Contacts
                            </h3>

                            <p className="mt-1 text-[11px] text-[#626b61]">
                                {profileData.contacts?.length || 0} shown
                            </p>
                        </div>

                        <IoChevronForward className="text-lg text-[#687166]" />
                    </button>

                    <div className="border-t border-white/[0.05] px-5 py-5 sm:px-6">
                        {profileData.contacts?.length ? (
                            <div className="flex items-center gap-3 overflow-x-auto pb-1">
                                {profileData.contacts.map((contact) => {
                                    const contactName = getFullName(contact);

                                    return (
                                        <button
                                            key={contact._id}
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/contact-profile/${contact._id}`,
                                                )
                                            }
                                            className="group flex shrink-0 flex-col items-center"
                                            aria-label={contactName}
                                        >
                                            <Avatar
                                                profilePic={contact.profilePic}
                                                initials={getInitials(contact)}
                                                alt={contactName}
                                                decoration={
                                                    contact.avatarDecoration
                                                }
                                                size="md"
                                                avatarClassName="bg-[#cacfb4] text-[#10120d] font-bold ring-2 ring-[#0c120d] transition duration-200 group-hover:scale-105"
                                            />

                                            <span className="mt-2 max-w-[70px] truncate text-[10px] font-medium text-[#8d968a]">
                                                {contact.firstName ||
                                                    contactName}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex min-h-[80px] items-center justify-center">
                                <p className="text-xs text-[#626b61]">
                                    No contacts to display.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ContactProfile;