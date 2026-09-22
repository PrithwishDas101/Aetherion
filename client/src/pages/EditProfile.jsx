import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil } from "lucide-react";

import {
    removeProfilePicture,
    updatePersonalProfile,
    updateProfilePicture,
    updateProfileBanner,
} from "../apiCalls/userApi.js";
import { setUser } from "../redux/userSlice.js";

import Connections from "../components/Connections.jsx";
import ProfileBanner from "../components/ProfileBanner.jsx";
import Avatar from "../components/Avatar.jsx";
import AvatarDecorationPicker from "../components/AvatarDecorationPicker.jsx";

const EditProfile = () => {
    const { user } = useSelector((state) => state.userReducer);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [pronouns, setPronouns] = useState("");
    const [bio, setBio] = useState("");
    const [customStatus, setCustomStatus] = useState("");
    const [connections, setConnections] = useState([]);

    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [isSavingStatus, setIsSavingStatus] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    // Avatar decoration
    const [isDecorationPickerOpen, setIsDecorationPickerOpen] =
        useState(false);
    const [isSavingDecoration, setIsSavingDecoration] = useState(false);

    useEffect(() => {
        if (!user) {
            return;
        }

        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
        setPronouns(user.pronouns || "");
        setBio(user.bio || "");
        setCustomStatus(user.customStatus || "");
        setConnections(
            Array.isArray(user.connections) ? user.connections : [],
        );
    }, [user]);

    if (!user) {
        return null;
    }

    const fullName = `${firstName} ${lastName}`.trim() || "User";

    const initials =
        `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";

    const profileMeta = [user.email, pronouns.trim()]
        .filter(Boolean)
        .join(" • ");

    // --------------------------------------------------
    // PROFILE SAVE
    // --------------------------------------------------

    const handleSave = async () => {
        if (isSaving) {
            return;
        }

        if (!firstName.trim() || !lastName.trim()) {
            toast.error("First and last name are required.");
            return;
        }

        setIsSaving(true);

        try {
            const response = await updatePersonalProfile({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                pronouns: pronouns.trim(),
                bio: bio.trim(),
            });

            if (!response?.success) {
                toast.error(
                    response?.message || "Couldn't update your profile.",
                );
                return;
            }

            dispatch(setUser(response.data));

            toast.success("Profile updated.");
            navigate("/profile");
        } catch (error) {
            console.error("Profile update error:", error);
            toast.error("Couldn't update your profile.");
        } finally {
            setIsSaving(false);
        }
    };

    // --------------------------------------------------
    // AVATAR UPLOAD
    // --------------------------------------------------

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
            const response = await updateProfilePicture(file);

            if (!response?.success) {
                toast.error(
                    response?.message ||
                    "Couldn't update your profile picture.",
                );
                return;
            }

            dispatch(setUser(response.data));

            toast.success("Profile picture updated.");
            setShowAvatarModal(false);
        } catch (error) {
            console.error("Profile picture update error:", error);
            toast.error("Couldn't update your profile picture.");
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    // --------------------------------------------------
    // AVATAR REMOVE
    // --------------------------------------------------

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
            const response = await removeProfilePicture();

            if (!response?.success) {
                toast.error(
                    response?.message ||
                    "Couldn't remove your profile picture.",
                );
                return;
            }

            dispatch(setUser(response.data));

            toast.success("Profile picture removed.");
            setShowAvatarModal(false);
        } catch (error) {
            console.error("Profile picture removal error:", error);
            toast.error("Couldn't remove your profile picture.");
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    // --------------------------------------------------
    // AVATAR DECORATION
    // --------------------------------------------------

    const handleApplyDecoration = async (decorationId) => {
        if (isSavingDecoration) {
            return;
        }

        setIsSavingDecoration(true);

        try {
            const response = await updatePersonalProfile({
                avatarDecoration: decorationId,
            });

            if (!response?.success) {
                toast.error(
                    response?.message ||
                    "Couldn't update your avatar decoration.",
                );
                return;
            }

            dispatch(setUser(response.data));

            toast.success("Avatar decoration updated.");

            setIsDecorationPickerOpen(false);
        } catch (error) {
            console.error("Avatar decoration update error:", error);

            toast.error("Couldn't update your avatar decoration.");
        } finally {
            setIsSavingDecoration(false);
        }
    };

    // --------------------------------------------------
    // BANNER
    // --------------------------------------------------

    const handleBannerChange = async (bannerFile) => {
        const formData = new FormData();

        formData.append("profileBanner", bannerFile);

        const response = await updateProfileBanner(formData);

        if (!response?.success) {
            toast.error(
                response?.message || "Couldn't update your banner.",
            );
            throw new Error(
                response?.message || "Banner update failed.",
            );
        }

        dispatch(setUser(response.data));
        toast.success("Banner updated.");
    };

    // --------------------------------------------------
    // STATUS
    // --------------------------------------------------

    const handleStatusSave = async () => {
        if (isSavingStatus) {
            return;
        }

        setIsSavingStatus(true);

        try {
            const response = await updatePersonalProfile({
                customStatus: customStatus.trim(),
            });

            if (!response?.success) {
                toast.error(
                    response?.message || "Couldn't update your status.",
                );
                return;
            }

            dispatch(setUser(response.data));

            toast.success("Status updated.");
            setShowStatusModal(false);
        } catch (error) {
            console.error("Status update error:", error);
            toast.error("Couldn't update your status.");
        } finally {
            setIsSavingStatus(false);
        }
    };

    const handleStatusDelete = async () => {
        if (isSavingStatus) {
            return;
        }

        setIsSavingStatus(true);

        try {
            const response = await updatePersonalProfile({
                customStatus: "",
            });

            if (!response?.success) {
                toast.error(
                    response?.message || "Couldn't delete your status.",
                );
                return;
            }

            dispatch(setUser(response.data));

            setCustomStatus("");

            toast.success("Status deleted.");
            setShowStatusModal(false);
        } catch (error) {
            console.error("Status deletion error:", error);
            toast.error("Couldn't delete your status.");
        } finally {
            setIsSavingStatus(false);
        }
    };

    // --------------------------------------------------
    // CONNECTIONS
    // --------------------------------------------------

    const handleConnectionsSave = async (updatedConnections) => {
        setConnections(updatedConnections);
    };

    const closeStatusModal = () => {
        if (!isSavingStatus) {
            setShowStatusModal(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#080d09] text-[#f1eee8]">
            {/* ============================================================
                HEADER
            ============================================================ */}

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

            {/* ============================================================
                MAIN
            ============================================================ */}

            <main className="w-full px-4 py-7 sm:px-7 sm:py-10 lg:px-10">
                <div className="w-full">
                    <div className="relative">
                        <ProfileBanner
                            bannerUrl={user?.profileBanner}
                            onBannerChange={handleBannerChange}
                            editMode
                        />
                    </div>

                    <div className="relative px-5 pb-10 sm:px-8 sm:pb-12 lg:px-10 lg:pb-14">
                        <div className="relative min-h-[6rem] sm:min-h-[6.5rem] lg:min-h-[7rem]">
                            {/* ====================================================
                                AVATAR
                            ==================================================== */}

                            <div className="absolute left-0 top-0 z-10 -translate-y-16 sm:-translate-y-20">
                                <Avatar
                                    profilePic={user?.profilePic}
                                    initials={initials}
                                    alt={fullName}
                                    decoration={user?.avatarDecoration}
                                    size="lg"
                                    avatarClassName="border-[4px] border-[#101218] bg-[#171d17] font-bold text-[#d8f45a] shadow-xl"
                                >
                                    {/* PENCIL */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowAvatarModal(true)
                                        }
                                        className="absolute right-1 top-1 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-black/80 active:scale-95"
                                        aria-label="Edit profile picture"
                                        title="Edit profile picture"
                                    >
                                        <Pencil
                                            className="h-4 w-4 text-white"
                                            strokeWidth={3.5}
                                        />
                                    </button>
                                </Avatar>
                            </div>

                            {/* ====================================================
                                CUSTOM STATUS
                            ==================================================== */}

                            <div className="absolute left-[7.5rem] right-0 -top-[8px] z-20 sm:left-[8.5rem] lg:left-[9.5rem]">
                                <div className="flex min-w-0 items-start">
                                    <div className="mr-1 mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#1a1c1a]" />

                                    <div className="mr-1.5 mt-4 h-3 w-3 shrink-0 rounded-full bg-[#1a1c1a]" />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowStatusModal(true)
                                        }
                                        className="min-w-0 max-w-[calc(100vw-9rem)] rounded-[1.35rem] rounded-bl-md border border-white/[0.1] bg-white/[0.035] px-4 py-2.5 text-left text-sm leading-5 text-[#d4d7d1] shadow-[0_8px_30px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-white sm:max-w-[calc(100vw-10rem)] lg:max-w-[28rem]"
                                    >
                                        {customStatus.trim() ? (
                                            <span className="block max-h-[3.75rem] overflow-hidden break-all">
                                                {customStatus}
                                            </span>
                                        ) : (
                                            <span className="whitespace-nowrap text-[#8d918c]">
                                                + Add a status
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ====================================================
                            PROFILE INFO
                        ==================================================== */}

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

                        {/* ====================================================
                            FORM
                        ==================================================== */}

                        <div className="mt-8 border-t border-white/[0.06] pt-8">
                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
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
                                                setBio(event.target.value)
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

                                <Connections
                                    connections={connections}
                                    onSave={handleConnectionsSave}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ============================================================
                PROFILE PICTURE MODAL
            ============================================================ */}

            {showAvatarModal && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-3 pb-3 sm:items-center sm:px-5 sm:pb-0"
                    onMouseDown={() =>
                        !isUploadingAvatar &&
                        setShowAvatarModal(false)
                    }
                >
                    <div
                        className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111611] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        {/* HEADER */}

                        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-5 sm:px-6">
                            <div>
                                <h2 className="text-[16px] font-semibold text-[#f1eee8]">
                                    Profile Picture
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowAvatarModal(false)
                                }
                                disabled={isUploadingAvatar}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg leading-none text-[#626960] transition hover:text-[#f1eee8] disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        {/* OPTIONS */}

                        <div className="px-5 py-3 sm:px-6">
                            {/* UPLOAD */}

                            <label
                                className={`group flex cursor-pointer items-center gap-3 py-5 transition-colors hover:bg-white/[0.02] ${isUploadingAvatar
                                        ? "pointer-events-none opacity-50"
                                        : ""
                                    }`}
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#d8f45a]/[0.1] bg-[#d8f45a]/[0.05] text-lg font-medium text-[#d8f45a] transition group-hover:border-[#d8f45a]/[0.18] group-hover:bg-[#d8f45a]/[0.08]">
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

                            <div className="border-t border-white/[0.055]" />

                            {/* ==================================================
                                DECORATE BUTTON

                                THIS IS NOW WIRED TO THE DECORATION MODAL
                            ================================================== */}

                            <button
                                type="button"
                                disabled={isUploadingAvatar}
                                onClick={() => {
                                    setShowAvatarModal(false);
                                    setIsDecorationPickerOpen(true);
                                }}
                                className="group flex w-full items-center gap-3 py-5 text-left transition-colors hover:bg-white/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.025] text-base text-[#858d84] transition group-hover:border-white/[0.1] group-hover:bg-white/[0.04] group-hover:text-[#d8f45a]">
                                    ✦
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-[#c5c9c2]">
                                        Decorate
                                    </p>

                                    <p className="mt-0.5 text-xs text-[#626960]">
                                        Personalize your avatar
                                    </p>
                                </div>
                            </button>

                            <div className="border-t border-white/[0.055]" />

                            {/* REMOVE */}

                            <button
                                type="button"
                                disabled={
                                    isUploadingAvatar ||
                                    !user.profilePic
                                }
                                onClick={handleAvatarRemove}
                                className="group flex w-full items-center gap-3 py-5 text-left transition-colors hover:bg-red-400/[0.025] disabled:cursor-not-allowed disabled:opacity-35"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-400/[0.06] bg-red-400/[0.025] text-base text-red-400/80 transition group-hover:border-red-400/[0.12] group-hover:bg-red-400/[0.04] group-hover:text-red-300">
                                    ×
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-red-300/90">
                                        Remove Picture
                                    </p>

                                    <p className="mt-0.5 text-xs text-[#626960]">
                                        Return to your initials
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================
                AVATAR DECORATION PICKER

                Profile Picture Modal
                       ↓
                   Decorate
                       ↓
                THIS COMPONENT OPENS
            ============================================================ */}

            <AvatarDecorationPicker
                isOpen={isDecorationPickerOpen}
                onClose={() => {
                    if (!isSavingDecoration) {
                        setIsDecorationPickerOpen(false);
                    }
                }}
                currentDecoration={user?.avatarDecoration || "none"}
                profilePic={user?.profilePic}
                initials={initials}
                fullName={fullName}
                onApply={handleApplyDecoration}
                saving={isSavingDecoration}
            />

            {/* ============================================================
                CUSTOM STATUS MODAL
            ============================================================ */}

            {showStatusModal && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-3 pb-3 sm:items-center sm:px-5 sm:pb-0"
                    onMouseDown={closeStatusModal}
                >
                    <div
                        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111611] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
                            <div>
                                <h2 className="text-sm font-semibold text-[#f1eee8]">
                                    Set Your Status
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={closeStatusModal}
                                disabled={isSavingStatus}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#737b73] transition hover:bg-white/5 hover:text-[#f1eee8] disabled:opacity-40"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-5 sm:p-6">
                            <div className="border-b border-white/[0.06] pb-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1a211a] text-sm font-bold text-[#d8f45a]">
                                        {user?.profilePic ? (
                                            <img
                                                src={user.profilePic}
                                                alt={fullName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            initials
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-[#f1eee8]">
                                            {fullName}
                                        </p>

                                        <p className="mt-0.5 truncate text-xs text-[#626960]">
                                            {customStatus.trim() ||
                                                "No status"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5">
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="profile-status"
                                        className="text-sm font-semibold text-[#c5c9c2]"
                                    >
                                        Status
                                    </label>

                                    <span className="text-xs text-[#4f564f]">
                                        {customStatus.length}/100
                                    </span>
                                </div>

                                <textarea
                                    id="profile-status"
                                    value={customStatus}
                                    onChange={(event) =>
                                        setCustomStatus(
                                            event.target.value.slice(
                                                0,
                                                100,
                                            ),
                                        )
                                    }
                                    maxLength={100}
                                    rows={2}
                                    placeholder="What are you up to?"
                                    className="mt-2 w-full resize-none rounded-xl border border-white/[0.08] bg-[#0b100c] px-3.5 py-3 text-sm leading-6 text-[#f1eee8] outline-none transition placeholder:text-[#4f564f] focus:border-[#d8f45a]/30"
                                />
                            </div>

                            <div className="mt-5 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={handleStatusDelete}
                                    disabled={
                                        isSavingStatus ||
                                        !customStatus.trim()
                                    }
                                    className="text-xs font-medium text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    Delete
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={closeStatusModal}
                                        disabled={isSavingStatus}
                                        className="rounded-lg px-3.5 py-2 text-xs font-medium text-[#858d84] transition hover:bg-white/[0.05] hover:text-[#f1eee8]"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleStatusSave}
                                        disabled={isSavingStatus}
                                        className="rounded-lg bg-[#d8f45a] px-4 py-2 text-xs font-bold text-[#10120d] transition hover:bg-[#e4ff6f] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isSavingStatus
                                            ? "Saving..."
                                            : "Save"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditProfile;