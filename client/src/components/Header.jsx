import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Header() {
    const { user } = useSelector(
        (state) => state.userReducer
    );

    const navigate = useNavigate();

    const [showProfileHint, setShowProfileHint] = useState(false);

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

    const dismissProfileHint = () => {
        if (!user?._id) {
            return;
        }

        localStorage.setItem(`aetherion_profile_hint_seen_${user._id}`, "true");

        setShowProfileHint(false);
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
                <div className="flex items-center gap-[5px]">

                    {/* User name — desktop only */}
                    <div className="mr-4 hidden font-bold text-[#d0d4cc] sm:block">
                        {user?.firstName} {user?.lastName}
                    </div>

                    {/* Profile avatar */}
                    <button
                        type="button"
                        onClick={() => {
                            dismissProfileHint();
                            navigate("/profile");
                        }}
                        className={`relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#d8f45a] text-sm font-bold text-[#10120d] transition sm:h-10 sm:w-10 sm:text-base ${showProfileHint
                                ? "z-[60] ring-4 ring-[#d8f45a]/40 shadow-[0_0_25px_rgba(216,244,90,0.6)]"
                                : ""
                            }`}
                        aria-label="Open profile"
                    >
                        {user?.profilePic ? (
                            <img
                                src={user.profilePic}
                                alt={
                                    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                                    "Profile"
                                }
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <>
                                {user?.firstName?.[0]}
                                {user?.lastName?.[0]}
                            </>
                        )}
                    </button>

                </div>
            </header>

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