import React from "react";

function Header() {
    return (
        <header className="flex w-full flex-wrap items-center justify-between border-b border-[#d8f45a]/20 px-5 py-3 sm:px-8">

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
            <div className="flex items-center">

                <div className="mr-4 font-bold text-[#d0d4cc]">
                    Prithwish Das
                </div>

                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#d8f45a] text-base font-bold text-[#10120d]">
                    PD
                </div>

            </div>

        </header>
    );
}

export default Header;