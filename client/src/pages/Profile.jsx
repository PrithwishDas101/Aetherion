import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Profile = () => {

    const { user } = useSelector(state => state.userReducer);

    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [profilePreview, setProfilePreview] = useState(user?.profilePic || null);

    const handleProfilePictureChange = event => {

        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        setProfilePreview(previewUrl);
    };

    if (!user) {
        return null;
    }

    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

    const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

    return (
        <div className="flex min-h-screen flex-col bg-[#080d09] text-[#f1eee8]">

            {/* HEADER */}

            <div className="flex items-center gap-3 border-b border-[#d8f45a]/15 px-4 py-4">

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#858d84] transition hover:bg-[#d8f45a]/10 hover:text-[#d8f45a]"
                    aria-label="Go back"
                >
                    ←
                </button>

                <h1 className="text-lg font-bold">
                    Profile
                </h1>

            </div>

            {/* PROFILE */}

            <div className="flex flex-1 flex-col items-center px-5 py-10">

                {/* AVATAR */}

                <div className="relative">

                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#171d17] text-2xl font-bold text-[#d8f45a] ring-2 ring-[#d8f45a]/20 sm:h-28 sm:w-28 sm:text-3xl">

                        {profilePreview ? (
                            <img
                                src={profilePreview}
                                alt={fullName || "Profile"}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            initials || "?"
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#080d09] bg-[#d8f45a] text-sm font-bold text-[#10120d] transition hover:bg-[#e4ff6f] active:scale-95 sm:h-9 sm:w-9 sm:text-lg"
                        aria-label="Change profile picture"
                    >
                        +
                    </button>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                />

                {/* NAME */}

                <h2 className="mt-5 text-2xl font-bold">
                    {fullName || "User"}
                </h2>

                {/* EMAIL */}

                <p className="mt-2 text-sm text-[#858d84]">
                    {user.email}
                </p>

            </div>

        </div>
    );
};

export default Profile;