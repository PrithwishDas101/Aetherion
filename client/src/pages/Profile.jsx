import { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import compressImage from "../utils/compressImage.js";
import {
  updateProfilePicture,
  removeProfilePicture,
  updatePersonalProfile,
} from "../apiCalls/userApi.js";
import { setUser } from "../redux/userSlice.js";
import ContactList from "../components/ContactList.jsx";

const Profile = () => {
  const { user } = useSelector((state) => state.userReducer);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [profilePreview, setProfilePreview] = useState(
    user?.profilePic || null,
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPresenceModal, setShowPresenceModal] = useState(false);
  const [statusText, setStatusText] = useState(user?.customStatus || "",);
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  useEffect(() => {
    setProfilePreview(user?.profilePic || null);
  }, [user?.profilePic]);

  const handleStatusSave = async () => {
    if (isSavingStatus) {
      return;
    }

    setIsSavingStatus(true);

    try {
      const response = await updatePersonalProfile({
        customStatus: statusText,
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
      setStatusText("");

      toast.success("Status deleted.");
      setShowStatusModal(false);
    } catch (error) {
      console.error("Status deletion error:", error);

      toast.error("Couldn't delete your status.");
    } finally {
      setIsSavingStatus(false);
    }
  };

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "?";

  const profileMeta = [
    user.email,
    user.pronouns?.trim(),
  ]
    .filter(Boolean)
    .join(" • ");

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
      day:"2-digit",
      month: "long",
      year: "numeric",
    })
    : "Unknown";

  return (
    <div className="min-h-screen bg-[#080d09] text-[#f1eee8]">
      {/* HEADER */}

      <header className="flex items-center gap-3 border-b border-[#d8f45a]/10 px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#858d84] transition hover:bg-[#d8f45a]/10 hover:text-[#d8f45a]"
          aria-label="Back to home"
        >
          ←
        </button>

        <h1 className="text-lg font-bold">
          Profile
        </h1>
      </header>

      {/* MAIN */}

      <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
        {/* PROFILE HERO */}

        <section>
          <div className="flex items-start gap-4 sm:gap-6">
            {/* AVATAR */}

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowPresenceModal(true)}
                className="relative"
                aria-label="Change online status"
              >
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#171d17] text-2xl font-bold text-[#d8f45a] ring-2 ring-[#d8f45a]/15 sm:h-28 sm:w-28 sm:text-3xl">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt={fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                {/* PUBLIC PRESENCE INDICATOR */}

                <span
                  className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-[#080d09] bg-[#4ade80] shadow-sm"
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* STATUS CLOUD */}

            <div className="flex min-w-0 items-start pt-3">
              <div className="mr-1.5 mt-3 h-2 w-2 rounded-full bg-[#858d84]/50" />

              <div className="mr-1.5 mt-1.5 h-3 w-3 rounded-full bg-[#858d84]/40" />

              <button
                type="button"
                onClick={() => setShowStatusModal(true)}
                className="max-w-[240px] rounded-2xl border border-[#d8f45a]/10 bg-[#101610] px-4 py-3 text-left text-sm leading-5 text-[#c5c9c2] transition hover:text-[#f5f6f3] sm:max-w-xs"
              >
                {statusText.trim() || (
                  <span className="text-[#626960]">
                    + Add a status
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* NAME */}

          <h2 className="mt-7 text-2xl font-bold tracking-tight sm:text-3xl">
            {fullName}
          </h2>

          {/* EMAIL / PRONOUNS */}

          <p className="mt-2 text-sm text-[#858d84]">
            {profileMeta}
          </p>

          {/* EDIT */}

          <button
            type="button"
            onClick={() => navigate("/profile/edit")}
            className="mt-6 flex items-center gap-2 rounded-xl bg-[#d8f45a] px-5 py-3 text-sm font-bold text-[#10120d] transition hover:bg-[#e4ff6f] active:scale-95"
          >
            <span>✎</span>
            Edit Profile
          </button>
        </section>

        {/* BIO */}

        <section className="mt-10">
          <h3 className="text-sm font-semibold text-[#858d84]">
            Bio
          </h3>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#c5c9c2]">
            {user.bio?.trim() || (
              <span className="text-[#626960]">
                No bio yet.
              </span>
            )}
          </p>
        </section>

        {/* MEMBER SINCE */}

        <section className="mt-9">
          <h3 className="text-sm font-semibold text-[#858d84]">
            Member Since
          </h3>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center">
              <img src="/public/favicon.png"/>
            </div>

            <span className="text-sm text-[#c5c9c2]">
              {memberSince}
            </span>
          </div>
        </section>

        {/* CONTACTS */}

        <section className="mt-10 border-t border-[#d8f45a]/10 pt-8">
          <ContactList />
        </section>
      </main>

      {/* STATUS MODAL */}

      {showStatusModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 backdrop-blur-sm"
          onMouseDown={() => setShowStatusModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-[#d8f45a]/10 bg-[#101610] p-6 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                Set Your Status
              </h2>

              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#858d84] transition hover:bg-white/5 hover:text-[#f1eee8]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* MINI STATUS VISUAL */}

            <div className="mt-7 flex items-center">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#171d17] text-lg font-bold text-[#d8f45a]">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt={fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="ml-3 mr-1 h-2 w-2 rounded-full bg-[#858d84]/50" />
              <div className="mr-2 h-3 w-3 rounded-full bg-[#858d84]/40" />

              <div className="rounded-2xl bg-[#171d17] px-4 py-3 text-sm text-[#858d84]">
                {statusText.trim() || "+ Add a status"}
              </div>
            </div>

            <div className="mt-7">
              <label className="text-sm font-semibold text-[#c5c9c2]">
                Status
              </label>

              <textarea
                value={statusText}
                onChange={(event) => setStatusText(event.target.value)}
                maxLength={100}
                rows={3}
                placeholder="What are you up to?"
                className="mt-2 w-full resize-none rounded-xl border border-[#d8f45a]/10 bg-[#080d09] px-4 py-3 text-sm leading-6 text-[#f1eee8] outline-none placeholder:text-[#626960] focus:border-[#d8f45a]/35"
              />
            </div>

            <div className="mt-6 flex justify-between gap-3">
              <button
                type="button"
                onClick={handleStatusDelete}
                disabled={isSavingStatus}
                className="rounded-xl border border-red-400/15 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-400/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete status
              </button>

              <button
                type="button"
                onClick={handleStatusSave}
                disabled={isSavingStatus}
                className="rounded-xl bg-[#d8f45a] px-5 py-3 text-sm font-bold text-[#10120d] transition hover:bg-[#e4ff6f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingStatus ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLIC PRESENCE MODAL */}

      {showPresenceModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 backdrop-blur-sm"
          onMouseDown={() => setShowPresenceModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-[#d8f45a]/10 bg-[#101610] p-6 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                Change Online Status
              </h2>

              <button
                type="button"
                onClick={() => setShowPresenceModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#858d84] transition hover:bg-white/5 hover:text-[#f1eee8]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="mt-6 text-sm font-semibold text-[#858d84]">
              Online Status
            </p>

            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() => toast("Online status will be wired next.")}
                className="flex w-full items-center gap-3 rounded-xl bg-[#171d17] px-4 py-3 text-left text-sm transition hover:bg-[#1d261d]"
              >
                <span className="h-3 w-3 rounded-full bg-[#4ade80]" />
                Online
              </button>

              <button
                type="button"
                onClick={() =>
                  toast("Off Planet status will be wired next.")
                }
                className="flex w-full items-center gap-3 rounded-xl bg-[#171d17] px-4 py-3 text-left text-sm transition hover:bg-[#1d261d]"
              >
                <span className="h-3 w-3 rounded-full bg-[#858d84]" />
                Off Planet
              </button>

              <button
                type="button"
                onClick={() =>
                  toast("DND status will be wired next.")
                }
                className="flex w-full items-center gap-3 rounded-xl bg-[#171d17] px-4 py-3 text-left text-sm transition hover:bg-[#1d261d]"
              >
                <span className="flex h-3 w-3 items-center justify-center rounded-full border border-red-500 bg-black">
                  <span className="h-1 w-1 rounded-full bg-red-500" />
                </span>
                Do Not Disturb
              </button>

              <button
                type="button"
                onClick={() =>
                  toast("Idle status will be wired next.")
                }
                className="flex w-full items-center gap-3 rounded-xl bg-[#171d17] px-4 py-3 text-left text-sm transition hover:bg-[#1d261d]"
              >
                <span className="relative h-4 w-4 rounded-full bg-yellow-300">
                  <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-[#171d17]" />
                </span>
                Idle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;