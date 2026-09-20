import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  updatePersonalProfile,
  updateProfileBanner,
  updateConnections,
} from "../apiCalls/userApi.js";
import {
  getEffectivePresenceStatus,
  PRESENCE_STATUS,
} from "../utils/presenceStatus.js";
import { setUser } from "../redux/userSlice.js";
import ContactList from "../components/ContactList.jsx";
import PresenceIcon from "../components/PresenceIcon.jsx";
import Connections from "../components/Connections.jsx";
import AetherionDayBadge from "../components/AetherionDayBadge.jsx";
import {
  getAetherionDays,
  getAetherionDayMilestone,
} from "../utils/aetherionDays.js";
import ProfileBanner from "../components/ProfileBanner.jsx";

const Profile = () => {
  const { user, presence } = useSelector(
    (state) => state.userReducer,
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showStatusModal, setShowStatusModal] =
    useState(false);

  const [showPresenceModal, setShowPresenceModal] =
    useState(false);

  const [statusText, setStatusText] = useState(
    user?.customStatus || "",
  );

  const [isSavingStatus, setIsSavingStatus] =
    useState(false);

  const [isSavingPresence, setIsSavingPresence] =
    useState(false);

  useEffect(() => {
    setStatusText(user?.customStatus || "");
  }, [user?.customStatus]);

  // PROFILE DATA

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";

  const aetherionDays = getAetherionDays(user?.createdAt);
  const aetherionMilestone = getAetherionDayMilestone(aetherionDays);

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "?";

  const profileMeta = [
    user?.email,
    user?.pronouns?.trim(),
  ]
    .filter(Boolean)
    .join(" • ");

  const livePresence = user?._id ? presence?.[String(user._id)] : null;

  const effectivePresenceStatus =
    getEffectivePresenceStatus({
      user,
      livePresence,
    });

  const automaticPresenceStatus =
    getEffectivePresenceStatus({
      user: {
        ...user,
        publicPresenceStatus:
          PRESENCE_STATUS.AUTOMATIC,
      },
      livePresence,
    });

  const hasCustomStatus = Boolean(user?.customStatus?.trim());

  //STATUS
  const handleStatusSave = async () => {
    if (isSavingStatus) {
      return;
    }

    setIsSavingStatus(true);

    try {
      const response =
        await updatePersonalProfile({
          customStatus: statusText.trim(),
        });

      if (!response?.success) {
        toast.error(
          response?.message ||
          "Couldn't update your status.",
        );
        return;
      }

      dispatch(setUser(response.data));

      toast.success("Status updated.");

      setShowStatusModal(false);
    } catch (error) {
      console.error(
        "Status update error:",
        error,
      );

      toast.error(
        "Couldn't update your status.",
      );
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
      const response =
        await updatePersonalProfile({
          customStatus: "",
        });

      if (!response?.success) {
        toast.error(
          response?.message ||
          "Couldn't delete your status.",
        );
        return;
      }

      dispatch(setUser(response.data));

      setStatusText("");

      toast.success("Status deleted.");

      setShowStatusModal(false);
    } catch (error) {
      console.error(
        "Status deletion error:",
        error,
      );

      toast.error(
        "Couldn't delete your status.",
      );
    } finally {
      setIsSavingStatus(false);
    }
  };

  // BANNER
  const handleBannerChange = async (bannerFile) => {
    const formData = new FormData();

    formData.append("profileBanner", bannerFile);

    const response = await updateProfileBanner(
      formData,
    );

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

  // CONNECTIONS
  const handleConnectionsSave = async (
    connections,
  ) => {
    const response =
      await updateConnections(connections);

    if (!response?.success) {
      toast.error(
        response?.message ||
        "Couldn't update your connections.",
      );

      throw new Error(
        response?.message ||
        "Connections update failed.",
      );
    }

    dispatch(setUser(response.data));

    toast.success("Connections updated.");
  };

  // PUBLIC PRESENCE
  const handlePresenceStatusChange = async (
    status,
  ) => {
    if (!status || isSavingPresence) {
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

  // MODAL CLOSE
  const closeStatusModal = () => {
    if (!isSavingStatus) {
      setShowStatusModal(false);
    }
  };

  const closePresenceModal = () => {
    if (!isSavingPresence) {
      setShowPresenceModal(false);
    }
  };

  // UI
  return (
    <div className="min-h-screen bg-[#080d09] text-[#f1eee8]">
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#080d09]/90 backdrop-blur-xl">
        <div className="flex h-16 items-center px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="group flex h-10 w-10 items-center justify-center rounded-full text-xl text-[#858d84] transitio hover:text-[#e8e8e5]"
            aria-label="Back to home"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
          </button>

          <div className="ml-3">
            <h1 className="text-base font-bold tracking-tight sm:text-lg">
              Profile
            </h1>
          </div>
        </div>
      </header>

      {/* ===================================================
          MAIN
      =================================================== */}
      <main className="w-full px-4 py-7 sm:px-7 sm:py-10 lg:px-10">
        <div className="w-full">
          {/* =================================================
                BANNER
            ================================================= */}

          <ProfileBanner
            bannerUrl={user?.profileBanner}
            onBannerChange={handleBannerChange}
          />

          {/* =================================================
                PROFILE CONTENT
            ================================================= */}

          <div className="relative px-5 pb-10 sm:px-8 sm:pb-12 lg:px-10 lg:pb-14">
            {/* =================================================
      AVATAR + STATUS
  ================================================= */}

            <div className="relative min-h-[6rem] sm:min-h-[6.5rem] lg:min-h-[7rem]">

              {/* AVATAR */}

              <div className="absolute left-0 top-0 z-10 -translate-y-16 sm:-translate-y-20">
                <div className="relative shrink-0">

                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[4px] border-[#101218] bg-[#171d17] text-3xl font-bold text-[#d8f45a] shadow-xl sm:h-32 sm:w-32 sm:text-4xl lg:h-36 lg:w-36">
                    {user?.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>

                  {/* PRESENCE */}

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
                      status={effectivePresenceStatus}
                      size="small"
                    />
                  </button>

                </div>
              </div>

              {/* STATUS */}
              <div className=" absolute left-[7.5rem] right-0 -top-[8px] z-20 sm:left-[8.5rem] lg:left-[9.5rem]">
                <div className="flex min-w-0 items-start">

                  {/* CONNECTOR DOT */}
                  <div className="mr-1 mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#1a1c1a]" />
                  <div className="mr-1.5 mt-4 h-3 w-3 shrink-0 rounded-full bg-[#1a1c1a]" />

                  {/* STATUS BUBBLE */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowStatusModal(true)
                    }
                    className="min-w-0 max-w-[calc(100vw-9rem)] rounded-[1.35rem] rounded-bl-md border border-white/[0.1] bg-white/[0.035] px-4 py-2.5 text-left text-sm leading-5 text-[#d4d7d1] shadow-[0_8px_30px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-white sm:max-w-[calc(100vw-10rem)] lg:max-w-[28rem]"
                  >
                    {hasCustomStatus ? (
                      <span className="block max-h-[3.75rem] overflow-hidden break-all">
                        {user.customStatus}
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

            {/* =================================================
                  IDENTITY
              ================================================= */}

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

            {/* =================================================
                  ACTIONS
              ================================================= */}

            <div className="mt-6 flex max-w-3xl flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  navigate("/profile/edit")
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#d8f45a] px-4 text-sm font-semibold text-[#10120d] transition hover:bg-[#e4ff6f] active:scale-[0.98]"
              >
                <span>✎</span>
                <span>Edit Profile</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById(
                      "profile-contacts",
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    })
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-[#111611] text-[#c5c9c2] transition hover:border-white/[0.1] hover:bg-[#1a1c1a] hover:text-white active:scale-95"
                aria-label="Contacts"
                title="Contacts"
              >
                <span className="text-base">
                  ♟
                </span>
              </button>
            </div>

            {/* PROFILE INFORMATION */}
            <div className="mt-8 border-t border-white/[0.06] pt-8">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">

                {/* LEFT — BIO + MEMBER SINCE */}
                <div className="min-w-0">

                  {/* BIO */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8d918c]">
                      Bio
                    </p>

                    <p className="mt-3 max-w-3xl whitespace-pre-wrap break-words text-sm leading-6 text-[#d0d2ce]">
                      {user?.bio?.trim() ? (
                        user.bio
                      ) : (
                        <span className="text-[#777b76]">
                          No bio yet.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* MEMBER SINCE */}
                  <div className="pt-4 space-y-5">
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
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
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

                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/35">
                        Days on Aetherion
                      </p>

                      <div className="mt-1 flex items-center">
                        <span className="text-sm font-medium text-white/80">
                          {aetherionDays}{" "}
                          {aetherionDays === 1 ? "day" : "days"}
                        </span>

                        {aetherionMilestone && (
                          <AetherionDayBadge
                            milestone={aetherionMilestone}
                            size="small"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* RIGHT - CONNECTIONS */}
                <Connections
                  connections={user?.connections || []}
                  onSave={handleConnectionsSave}
                />
              </div>
            </div>
          </div>

          {/* CONTACTS */}
          <section
            id="profile-contacts"
            className="pt-8"
          >
            <div className="-mt-6 mx-5 border-t border-white/[0.06] pt-8 sm:mx-8 lg:mx-10">
              <ContactList />
            </div>
          </section>
        </div>
      </main>

      {/* STATUS MODAL */}
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
            {/* HEADER */}
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
              {/* PREVIEW */}
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
                      {statusText.trim() || "No status"}
                    </p>
                  </div>
                </div>
              </div>

              {/* FIELD */}
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="profile-status"
                    className="text-sm font-semibold text-[#c5c9c2]"
                  >
                    Status
                  </label>

                  <span className="text-xs text-[#4f564f]">
                    {statusText.length}/100
                  </span>
                </div>

                <textarea
                  id="profile-status"
                  value={statusText}
                  onChange={(event) =>
                    setStatusText(
                      event.target.value.slice(0, 100),
                    )
                  }
                  maxLength={100}
                  rows={2}
                  placeholder="What are you up to?"
                  className="mt-2 w-full resize-none rounded-xl border border-white/[0.08] bg-[#0b100c] px-3.5 py-3 pb-3 text-sm leading-6 text-[#f1eee8] outline-none transition placeholder:text-[#4f564f] focus:border-[#d8f45a]/30"
                />
              </div>

              {/* ACTIONS */}
              <div className="mt-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleStatusDelete}
                  disabled={
                    isSavingStatus ||
                    !statusText.trim()
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
                    {isSavingStatus ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRESENCE MODAL */}
      {showPresenceModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-3 pb-3 sm:items-center sm:px-5 sm:pb-0"
          onMouseDown={closePresenceModal}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111611] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
              <h2 className="text-sm font-semibold text-[#f1eee8]">
                Online Status
              </h2>

              <button
                type="button"
                onClick={closePresenceModal}
                disabled={isSavingPresence}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-[#626960] transition hover:bg-white/[0.05] hover:text-[#f1eee8] disabled:opacity-40"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* OPTIONS */}
            <div className="p-5 sm:p-6">
              <div className="space-y-2">
                <PresenceOption
                  label="Automatic"
                  description="Use your live connection status"
                  status={
                    PRESENCE_STATUS.AUTOMATIC
                  }
                  currentStatus={
                    user?.publicPresenceStatus
                  }
                  automaticStatus={
                    automaticPresenceStatus
                  }
                  onClick={() =>
                    handlePresenceStatusChange(
                      PRESENCE_STATUS.AUTOMATIC,
                    )
                  }
                  disabled={isSavingPresence}
                />

                <PresenceOption
                  label="Online"
                  description="Always appear online"
                  status={PRESENCE_STATUS.ONLINE}
                  currentStatus={
                    user?.publicPresenceStatus
                  }
                  onClick={() =>
                    handlePresenceStatusChange(
                      PRESENCE_STATUS.ONLINE,
                    )
                  }
                  disabled={isSavingPresence}
                />

                <PresenceOption
                  label="Off Planet"
                  description="Appear away from Aetherion"
                  status={
                    PRESENCE_STATUS.OFF_PLANET
                  }
                  currentStatus={
                    user?.publicPresenceStatus
                  }
                  onClick={() =>
                    handlePresenceStatusChange(
                      PRESENCE_STATUS.OFF_PLANET,
                    )
                  }
                  disabled={isSavingPresence}
                />

                <PresenceOption
                  label="Idle"
                  description="Let others know you're idle"
                  status={PRESENCE_STATUS.IDLE}
                  currentStatus={
                    user?.publicPresenceStatus
                  }
                  onClick={() =>
                    handlePresenceStatusChange(
                      PRESENCE_STATUS.IDLE,
                    )
                  }
                  disabled={isSavingPresence}
                />

                <PresenceOption
                  label="Do Not Disturb"
                  description="Show that you don't want interruptions"
                  status={PRESENCE_STATUS.DND}
                  currentStatus={
                    user?.publicPresenceStatus
                  }
                  onClick={() =>
                    handlePresenceStatusChange(
                      PRESENCE_STATUS.DND,
                    )
                  }
                  disabled={isSavingPresence}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* PRESENCE OPTION */

const PresenceOption = ({
  label,
  description,
  status,
  currentStatus,
  automaticStatus,
  onClick,
  disabled,
}) => {
  const isSelected =
    currentStatus === status;

  const iconStatus =
    status === PRESENCE_STATUS.AUTOMATIC
      ? automaticStatus
      : status;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${isSelected
        ? "bg-white/[0.065]"
        : "hover:bg-white/[0.035]"
        } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
        <PresenceIcon
          status={iconStatus}
          size="small"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${isSelected
            ? "text-[#f1eee8]"
            : "text-[#c5c9c2]"
            }`}
        >
          {label}
        </p>

        <p className="mt-0.5 text-[11px] text-[#626960]">
          {description}
        </p>
      </div>

      {isSelected && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#c3e5d4]" />
      )}
    </button>
  );
};

export default Profile;