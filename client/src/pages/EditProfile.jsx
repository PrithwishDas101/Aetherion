import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
    removeProfilePicture,
    updatePersonalProfile,
    updateProfilePicture,
    updateProfileBanner,
} from "../apiCalls/userApi.js";
import { setUser } from "../redux/userSlice.js";
import {
    getEffectivePresenceStatus,
    PRESENCE_STATUS,
} from "../utils/presenceStatus.js";
import PresenceIcon from "../components/PresenceIcon.jsx";
import ProfileBanner from "../components/ProfileBanner.jsx";
import Connections from "../components/Connections.jsx";

const EditProfile = () => {
    const { user, presence } = useSelector(
        (state) => state.userReducer,
    );

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [pronouns, setPronouns] = useState("");
    const [bio, setBio] = useState("");
    const [connections, setConnections] = useState([]);

    const [showAvatarModal, setShowAvatarModal] =
        useState(false);

    const [showPresenceModal, setShowPresenceModal] =
        useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [isSavingPresence, setIsSavingPresence] =
        useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] =
        useState(false);

    useEffect(() => {
        if (!user) {
            return;
        }

        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
        setPronouns(user.pronouns || "");
        setBio(user.bio || "");
        setConnections(
            Array.isArray(user.connections)
                ? user.connections
                : [],
        );
    }, [user]);

    if (!user) {
        return null;
    }

    const fullName =
        `${firstName} ${lastName}`.trim() || "User";

    const initials =
        `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() ||
        "?";

    const profileMeta = [
        user.email,
        pronouns.trim(),
    ]
        .filter(Boolean)
        .join(" • ");

    const livePresence = user?._id
        ? presence?.[String(user._id)]
        : null;

    const effectivePresenceStatus =
        getEffectivePresenceStatus({
            user,
            livePresence,
        });

    const handleSave = async () => {
        if (isSaving) {
            return;
        }

        if (!firstName.trim() || !lastName.trim()) {
            toast.error(
                "First and last name are required.",
            );
            return;
        }

        setIsSaving(true);

        try {
            const profileResponse =
                await updatePersonalProfile({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    pronouns: pronouns.trim(),
                    bio: bio.trim(),
                });

            if (!profileResponse?.success) {
                toast.error(
                    profileResponse?.message ||
                    "Couldn't update your profile.",
                );
                return;
            }

            dispatch(setUser(profileResponse.data));

            toast.success("Profile updated.");

            navigate("/profile");
        } catch (error) {
            console.error(
                "Profile update error:",
                error,
            );

            toast.error(
                "Couldn't update your profile.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (file) => {
        if (!file || isUploadingAvatar) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error("Please choose an image.");
            return;
        }

        setIsUploadingAvatar(true);

        try {
            const response =
                await updateProfilePicture(file);

            if (!response?.success) {
                toast.error(
                    response?.message ||
                    "Couldn't update your profile picture.",
                );
                return;
            }

            dispatch(setUser(response.data));

            toast.success(
                "Profile picture updated.",
            );

            setShowAvatarModal(false);
        } catch (error) {
            console.error(
                "Profile picture update error:",
                error,
            );

            toast.error(
                "Couldn't update your profile picture.",
            );
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleAvatarRemove = async () => {
        if (isUploadingAvatar) {
            return;
        }

        if (!user.profilePic) {
            setShowAvatarModal(false);
            return;
        }

        setIsUploadingAvatar(true);

        try {
            const response =
                await removeProfilePicture();

            if (!response?.success) {
                toast.error(
                    response?.message ||
                    "Couldn't remove your profile picture.",
                );
                return;
            }

            dispatch(setUser(response.data));

            toast.success(
                "Profile picture removed.",
            );

            setShowAvatarModal(false);
        } catch (error) {
            console.error(
                "Profile picture removal error:",
                error,
            );

            toast.error(
                "Couldn't remove your profile picture.",
            );
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleBannerChange = async (
        bannerFile,
    ) => {
        const formData = new FormData();

        formData.append(
            "profileBanner",
            bannerFile,
        );

        const response =
            await updateProfileBanner(formData);

        if (!response?.success) {
            toast.error(
                response?.message ||
                "Couldn't update your banner.",
            );

            throw new Error(
                response?.message ||
                "Banner update failed.",
            );
        }

        dispatch(setUser(response.data));

        toast.success("Banner updated.");
    };

    const handlePresenceStatusChange = async (
        status,
    ) => {
        if (
            !status ||
            isSavingPresence
        ) {
            return;
        }

        setIsSavingPresence(true);

        try {
            const response =
                await updatePersonalProfile({
                    publicPresenceStatus: status,
                });

            if (!response?.success) {
                toast.error(
                    response?.message ||
                    "Couldn't update your online status.",
                );
                return;
            }

            dispatch(setUser(response.data));

            toast.success(
                "Online status updated.",
            );

            setShowPresenceModal(false);
        } catch (error) {
            console.error(
                "Presence status update error:",
                error,
            );

            toast.error(
                "Couldn't update your online status.",
            );
        } finally {
            setIsSavingPresence(false);
        }
    };

    const handleConnectionsSave = async (
        updatedConnections,
    ) => {
        setConnections(updatedConnections);
    };

    return (
        <div className="min-h-screen bg-[#080d09] text-[#f1eee8]">
            {/* HEADER */}

            <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#080d09]/90 backdrop-blur-xl">
                <div className="flex h-16 items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center">
                        <button
                            type="button"
                            onClick={() => navigate("/profile")}
                            className="aetherion-button"
                            aria-label="Back to profile"
                        >
                            <span>←</span>
                        </button>

                        <div className="ml-3">
                            <h1 className="text-base font-bold tracking-tight sm:text-lg">
                                Edit Profile
                            </h1>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex h-10 items-center rounded-lg bg-[#d8f45a] px-4 text-sm font-semibold text-[#10120d] transition hover:bg-[#e4ff6f] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </button>
                </div>
            </header>

            {/* MAIN */}

            <main className="w-full px-4 py-7 sm:px-7 sm:py-10 lg:px-10">
                <div className="w-full">
                    {/* BANNER */}

                    <ProfileBanner
                        bannerUrl={user?.profileBanner}
                        onBannerChange={handleBannerChange}
                    />

                    {/* PROFILE CONTENT */}

                    <div className="relative px-5 pb-10 sm:px-8 sm:pb-12 lg:px-10 lg:pb-14">
                        {/* AVATAR + PRESENCE */}

                        <div className="relative min-h-[6rem] sm:min-h-[6.5rem] lg:min-h-[7rem]">
                            <div className="absolute left-0 top-0 z-10 -translate-y-16 sm:-translate-y-20">
                                <div className="relative shrink-0">
                                    {/* AVATAR */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowAvatarModal(true)
                                        }
                                        className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[4px] border-[#101218] bg-[#171d17] text-3xl font-bold text-[#d8f45a] shadow-xl transition hover:scale-[1.01] active:scale-[0.99] sm:h-32 sm:w-32 sm:text-4xl lg:h-36 lg:w-36"
                                        aria-label="Edit profile picture"
                                        title="Edit profile picture"
                                    >
                                        {user?.profilePic ? (
                                            <img
                                                src={user.profilePic}
                                                alt={fullName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span>{initials}</span>
                                        )}
                                    </button>

                                    {/* ONLINE INDICATOR */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPresenceModal(true)
                                        }
                                        className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border-[2px] border-[#111317] bg-[#131613] shadow-md transition hover:scale-105 active:scale-95"
                                        aria-label="Change online status"
                                        title="Change online status"
                                    >
                                        <PresenceIcon
                                            status={
                                                effectivePresenceStatus
                                            }
                                            size="small"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* IDENTITY */}

                        <div className="-mt-4 max-w-3xl">
                            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                {fullName}
                            </h2>

                            {profileMeta ? (
                                <p className="mt-1.5 break-words text-sm text-[#b5b8b3]">
                                    {profileMeta}
                                </p>
                            ) : (
                                <p className="mt-1.5 text-sm text-[#777b76]">
                                    Your Aetherion profile
                                </p>
                            )}
                        </div>

                        {/* EDITABLE PROFILE */}

                        <div className="mt-8 border-t border-white/[0.06] pt-8">
                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
                                {/* LEFT */}

                                <div className="min-w-0 space-y-6">
                                    {/* NAME */}

                                    <div>
                                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#8d918c]">
                                            Name
                                        </label>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(event) =>
                                                    setFirstName(
                                                        event.target.value,
                                                    )
                                                }
                                                maxLength={50}
                                                placeholder="First name"
                                                className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-sm text-[#f1eee8] outline-none transition placeholder:text-[#626960] hover:border-white/[0.12] focus:border-[#d8f45a]/30 focus:bg-white/[0.035]"
                                            />

                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(event) =>
                                                    setLastName(
                                                        event.target.value,
                                                    )
                                                }
                                                maxLength={50}
                                                placeholder="Last name"
                                                className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-sm text-[#f1eee8] outline-none transition placeholder:text-[#626960] hover:border-white/[0.12] focus:border-[#d8f45a]/30 focus:bg-white/[0.035]"
                                            />
                                        </div>
                                    </div>

                                    {/* BIO */}

                                    <div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8d918c]">
                                                Bio
                                            </label>

                                            <span className="text-[10px] text-[#4f564f]">
                                                {bio.length}/250
                                            </span>
                                        </div>

                                        <textarea
                                            value={bio}
                                            onChange={(event) =>
                                                setBio(
                                                    event.target.value,
                                                )
                                            }
                                            maxLength={250}
                                            rows={4}
                                            placeholder="Tell people a little about yourself..."
                                            className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm leading-6 text-[#f1eee8] outline-none transition placeholder:text-[#626960] hover:border-white/[0.12] focus:border-[#d8f45a]/30 focus:bg-white/[0.035]"
                                        />
                                    </div>

                                    {/* PRONOUNS */}

                                    <div>
                                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#8d918c]">
                                            Pronouns
                                        </label>

                                        <input
                                            type="text"
                                            value={pronouns}
                                            onChange={(event) =>
                                                setPronouns(
                                                    event.target.value,
                                                )
                                            }
                                            maxLength={50}
                                            placeholder="e.g. he/him"
                                            className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-sm text-[#f1eee8] outline-none transition placeholder:text-[#626960] hover:border-white/[0.12] focus:border-[#d8f45a]/30 focus:bg-white/[0.035]"
                                        />
                                    </div>
                                </div>

                                {/* CONNECTIONS */}

                                <Connections
                                    connections={connections}
                                    onSave={handleConnectionsSave}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* AVATAR MODAL */}

            {showAvatarModal && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-3 pb-3 sm:items-center sm:px-5 sm:pb-0"
                    onMouseDown={() => {
                        if (!isUploadingAvatar) {
                            setShowAvatarModal(false);
                        }
                    }}
                >
                    <div
                        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111611] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        {/* MODAL HEADER */}

                        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
                            <div>
                                <h2 className="text-sm font-semibold text-[#f1eee8]">
                                    Profile Picture
                                </h2>

                                <p className="mt-0.5 text-xs text-[#626960]">
                                    Choose what you want to do
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowAvatarModal(false)
                                }
                                disabled={isUploadingAvatar}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#737b73] transition hover:bg-white/5 hover:text-[#f1eee8] disabled:opacity-40"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        {/* OPTIONS */}

                        <div className="space-y-2 p-5 sm:p-6">
                            {/* UPLOAD */}

                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3.5 transition hover:border-white/[0.13] hover:bg-white/[0.05]">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d8f45a]/[0.08] text-[#d8f45a]">
                                    +
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-[#f1eee8]">
                                        Upload Picture
                                    </p>

                                    <p className="mt-0.5 text-xs text-[#626960]">
                                        Choose a new profile picture
                                    </p>
                                </div>

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    className="hidden"
                                    disabled={isUploadingAvatar}
                                    onChange={(event) => {
                                        const file =
                                            event.target.files?.[0];

                                        event.target.value = "";

                                        if (file) {
                                            handleAvatarUpload(file);
                                        }
                                    }}
                                />
                            </label>

                            {/* DECORATE */}

                            <button
                                type="button"
                                disabled={isUploadingAvatar}
                                onClick={() =>
                                    toast("Avatar decoration is coming later.")
                                }
                                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3.5 text-left transition hover:border-white/[0.13] hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-[#858d84]">
                                    ✦
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-[#f1eee8]">
                                        Decorate
                                    </p>

                                    <p className="mt-0.5 text-xs text-[#626960]">
                                        Add decorations to your avatar later
                                    </p>
                                </div>
                            </button>

                            {/* REMOVE */}

                            <button
                                type="button"
                                disabled={
                                    isUploadingAvatar ||
                                    !user.profilePic
                                }
                                onClick={handleAvatarRemove}
                                className="flex w-full items-center gap-3 rounded-xl border border-red-400/[0.08] bg-red-400/[0.025] px-4 py-3.5 text-left transition hover:border-red-400/[0.15] hover:bg-red-400/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-400/[0.08] text-red-400">
                                    ×
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-red-300">
                                        Remove Picture
                                    </p>

                                    <p className="mt-0.5 text-xs text-[#626960]">
                                        Remove your current profile picture
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PRESENCE MODAL */}

            {showPresenceModal && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-3 pb-3 sm:items-center sm:px-5 sm:pb-0"
                    onMouseDown={() => {
                        if (!isSavingPresence) {
                            setShowPresenceModal(false);
                        }
                    }}
                >
                    <div
                        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111611] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        {/* HEADER */}

                        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
                            <div>
                                <h2 className="text-sm font-semibold text-[#f1eee8]">
                                    Online Status
                                </h2>

                                <p className="mt-0.5 text-xs text-[#626960]">
                                    Choose how others see you
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPresenceModal(false)
                                }
                                disabled={isSavingPresence}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#737b73] transition hover:bg-white/5 hover:text-[#f1eee8] disabled:opacity-40"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-1 p-3 sm:p-4">
                            {[
                                {
                                    value:
                                        PRESENCE_STATUS.AUTOMATIC,
                                    label: "Automatic",
                                    description:
                                        "Use your live activity",
                                },
                                {
                                    value:
                                        PRESENCE_STATUS.ONLINE,
                                    label: "Online",
                                    description:
                                        "Always appear online",
                                },
                                {
                                    value:
                                        PRESENCE_STATUS.OFF_PLANET,
                                    label: "Off Planet",
                                    description:
                                        "Appear away",
                                },
                                {
                                    value:
                                        PRESENCE_STATUS.IDLE,
                                    label: "Idle",
                                    description:
                                        "Appear idle",
                                },
                                {
                                    value:
                                        PRESENCE_STATUS.DND,
                                    label: "Do Not Disturb",
                                    description:
                                        "Appear unavailable",
                                },
                            ].map((option) => {
                                const isSelected =
                                    user.publicPresenceStatus ===
                                    option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() =>
                                            handlePresenceStatusChange(
                                                option.value,
                                            )
                                        }
                                        disabled={isSavingPresence}
                                        className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition ${isSelected
                                                ? "border border-[#d8f45a]/15 bg-[#d8f45a]/[0.06]"
                                                : "border border-transparent hover:bg-white/[0.035]"
                                            }`}
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.035]">
                                            <PresenceIcon
                                                status={option.value}
                                                size="small"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-[#f1eee8]">
                                                {option.label}
                                            </p>

                                            <p className="mt-0.5 text-xs text-[#626960]">
                                                {option.description}
                                            </p>
                                        </div>

                                        {isSelected && (
                                            <span className="text-xs font-semibold text-[#d8f45a]">
                                                Selected
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditProfile;