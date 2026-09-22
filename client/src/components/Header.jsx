import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiUser } from "react-icons/fi";

import Avatar from "./Avatar.jsx";
import { logoutUser } from "../apiCalls/authApi.js";

function Header() {
  const { user } = useSelector((state) => state.userReducer);

  const navigate = useNavigate();

  const [showProfileHint, setShowProfileHint] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    const hintKey = `aetherion_profile_hint_seen_${user._id}`;
    const hasSeenHint = localStorage.getItem(hintKey);

    if (!hasSeenHint) {
      setShowProfileHint(true);
    }
  }, [user?._id]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        showProfileMenu &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [showProfileMenu]);

  // Close profile menu with Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const dismissProfileHint = () => {
    if (!user?._id) {
      return;
    }

    localStorage.setItem(
      `aetherion_profile_hint_seen_${user._id}`,
      "true"
    );

    setShowProfileHint(false);
  };

  const handleProfileClick = () => {
    dismissProfileHint();
    setShowProfileMenu(false);
    navigate("/profile");
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    setShowProfileMenu(false);

    await logoutUser();

    navigate("/login", { replace: true });
  };

  return (
    <>
      <header className="relative z-10 flex w-full flex-wrap items-center justify-between border-b border-[#d8f45a]/20 px-5 py-3 sm:px-8">
        {/* App logo */}
        <div className="flex items-center">
          <img
            src="/images/logo.png"
            alt="Aetherion logo"
            className="mr-3 h-10 w-10 object-contain"
          />

          <span className="text-xl font-bold text-[#f1eee8] sm:text-2xl">
            Aetherion
          </span>
        </div>

        {/* Logged-in user profile */}
        <div
          ref={profileMenuRef}
          className="relative flex items-center gap-[5px]"
        >
          {/* User name — desktop only */}
          <div className="mr-4 hidden font-bold text-[#d0d4cc] sm:block">
            {user?.firstName} {user?.lastName}
          </div>

          {/* Profile avatar */}
          <button
            type="button"
            onClick={() => {
              dismissProfileHint();
              setShowProfileMenu((prev) => !prev);
            }}
            className={`relative cursor-pointer transition active:scale-95 ${showProfileHint
              ? "z-[60] ring-4 ring-[#d8f45a]/40 shadow-[0_0_25px_rgba(216,244,90,0.6)]"
              : ""
              }`}
            aria-label="Open profile menu"
            aria-haspopup="menu"
            aria-expanded={showProfileMenu}
          >
            <Avatar
              profilePic={user?.profilePic}
              initials={`${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`}
              alt={`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Profile"}
              decoration={user?.avatarDecoration}
              size="xs"
              avatarClassName="bg-[#d8f45a] text-[#10120d] font-bold sm:h-10 sm:w-10 sm:text-base"
            />
          </button>

          {/* PROFILE DROPDOWN */}
          <div
            className={`absolute right-0 top-full z-50 mt-3 origin-top-right transition-all duration-300 ease-out ${showProfileMenu
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-2 opacity-0"
              }`}
          >
            <div className="w-[250px] rounded-2xl border border-white/10 bg-[#101610]/95 p-2 shadow-2xl backdrop-blur-md sm:w-[270px]">
              {/* User info */}
              <div className="flex items-center gap-3 rounded-xl bg-[#151c15] px-3 py-3">
                <Avatar
                  profilePic={user?.profilePic}
                  initials={`${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`}
                  alt="Profile"
                  decoration={user?.avatarDecoration}
                  size="xs"
                  avatarClassName="bg-[#d8f45a] text-[#10120d] font-bold"
                />
                
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#f1eee8]">
                    {user?.firstName} {user?.lastName}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-[#8f998b]">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Profile */}
              <button
                type="button"
                onClick={handleProfileClick}
                className="mt-2 flex w-full items-center gap-3 rounded-xl bg-[#151c15] px-3 py-3 text-left text-sm font-medium text-[#d0d4cc] transition hover:bg-[#1c261c] hover:text-[#5af48b] active:scale-[0.98]"
              >
                <FiUser className="h-[18px] w-[18px]" />

                <span>Profile</span>
              </button>

              {/* Divider */}
              <div className="my-2 h-px bg-white/10" />

              {/* Logout */}
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="flex w-full items-center gap-3 rounded-xl bg-[#151c15] px-3 py-3 text-left text-sm font-medium text-[#d0d4cc] transition hover:bg-[#1c261c] hover:text-red-400 active:scale-[0.98]"
              >
                <FiLogOut className="h-[18px] w-[18px]" />

                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* LOGOUT CONFIRMATION */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-5"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="w-full max-w-[350px] overflow-hidden rounded-2xl border border-white/10 bg-[#111711] shadow-[0_24px_70px_rgba(0,0,0,0.5)]"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Red accent */}
            <div className="h-[3px] w-full bg-red-500/80" />

            <div className="p-5">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  <FiLogOut className="h-[17px] w-[17px]" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-[16px] font-semibold text-[#f1eee8]">
                    Log out of Aetherion?
                  </h2>

                  <p className="mt-1 text-[13px] leading-5 text-[#8f998b]">
                    You'll need to log in again to continue.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-[#151c15] px-4 py-2.5 text-sm font-medium text-[#c9cec5] transition hover:bg-[#1c261c] active:scale-[0.98]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 active:scale-[0.98]"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE ONBOARDING SPOTLIGHT */}
      {showProfileHint && (
        <>
          {/* Dark overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-[1.5px]"
            onClick={dismissProfileHint}
          />

          {/* Coach mark */}
          <div className="fixed right-5 top-[4.7rem] z-[70] w-[270px] sm:right-8 sm:w-[300px]">
            {/* Tooltip */}
            <div className="relative rounded-[14px] border border-[#d8f45a]/15 bg-[#111711]/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
              {/* Pointer */}
              <div className="absolute -top-2 right-5 h-4 w-4 rotate-45 border-l border-t border-[#d8f45a]/15 bg-[#111711]" />

              <div className="relative">
                <p className="text-sm font-semibold tracking-wide text-[#d8f45a]">
                  Your profile is here
                </p>

                <p className="mt-2 text-[13px] leading-5 text-[#aeb8a8]">
                  Tap your profile picture anytime to view or edit your profile.
                </p>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={dismissProfileHint}
                    className="rounded-lg bg-[#d8f45a] px-4 py-2 text-xs font-bold text-[#10120d] shadow-sm transition hover:bg-[#e4ff6f] active:scale-95"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Header;