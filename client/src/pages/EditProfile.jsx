import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { updatePersonalProfile } from "../apiCalls/userApi.js";
import { updateUser } from "../redux/userSlice.js";

const EditProfile = () => {
    const { user } = useSelector((state) => state.userReducer);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [pronouns, setPronouns] = useState("");
    const [bio, setBio] = useState("");

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!user) {
            return;
        }

        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
        setPronouns(user.pronouns || "");
        setBio(user.bio || "");
    }, [user]);

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

            dispatch(updateUser(response.data));

            toast.success("Profile updated successfully.");

            navigate("/profile");
        } catch (error) {
            console.error("Profile update error:", error);

            toast.error("Couldn't update your profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return null;
    }

    const fullName = `${firstName} ${lastName}`.trim();

    const initials =
        `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

    return (
        <div className="min-h-screen bg-[#080d09] text-[#f1eee8]">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-[#d8f45a]/15 px-4 py-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/profile")}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[#858d84] transition hover:bg-[#d8f45a]/10 hover:text-[#d8f45a]"
                        aria-label="Back to profile"
                    >
                        ←
                    </button>

                    <h1 className="text-lg font-bold">Edit profile</h1>
                </div>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-full bg-[#d8f45a] px-5 py-2 text-sm font-bold text-[#10120d] transition hover:bg-[#e4ff6f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSaving ? "Saving..." : "Save"}
                </button>
            </div>

            {/* CONTENT */}

            <div className="flex w-full max-w-2xl flex-col px-5 py-10 sm:px-8">
                {/* AVATAR / STATUS VISUAL */}

                <div className="flex items-start gap-5">
                    <div className="relative">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#171d17] text-2xl font-bold text-[#d8f45a] ring-2 ring-[#d8f45a]/20">
                            {user.profilePic ? (
                                <img
                                    src={user.profilePic}
                                    alt={fullName || "Profile"}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span>{initials || "?"}</span>
                            )}
                        </div>

                        {/* AVATAR EDIT BUTTON */}

                        <button
                            type="button"
                            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#080d09] bg-[#d8f45a] text-[#10120d] shadow-sm transition hover:bg-[#e4ff6f] active:scale-95"
                            aria-label="Edit avatar"
                            title="Edit avatar"
                            onClick={() => {
                                toast("Avatar editor coming next.");
                            }}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-4 w-4"
                                aria-hidden="true"
                            >
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1 1-4Z" />
                            </svg>
                        </button>
                    </div>

                    {/* STATUS CLOUD PLACEHOLDER */}

                    <div className="flex items-center">
                        <div className="mr-1 h-2.5 w-2.5 rounded-full bg-[#858d84]/60" />
                        <div className="mr-1.5 h-3.5 w-3.5 rounded-full bg-[#858d84]/50" />

                        <button
                            type="button"
                            onClick={() => {
                                toast("Status editor coming next.");
                            }}
                            className="min-w-28 rounded-2xl border border-[#d8f45a]/15 bg-[#101610] px-4 py-3 text-left text-sm text-[#858d84] transition hover:border-[#d8f45a]/30 hover:text-[#d8f45a]"
                        >
                            {user.customStatus || "+ Add a status"}
                        </button>
                    </div>
                </div>

                {/* CURRENT IDENTITY */}

                <div className="mt-8">
                    <h2 className="text-2xl font-bold">
                        {fullName || "User"}
                    </h2>

                    <p className="mt-2 text-sm text-[#858d84]">
                        {user.email}
                        {pronouns.trim() ? ` • ${pronouns.trim()}` : ""}
                    </p>
                </div>

                {/* FORM */}

                <div className="mt-10 space-y-6">
                    {/* DISPLAY NAME */}

                    <div>
                        <label
                            htmlFor="firstName"
                            className="mb-2 block text-sm font-semibold text-[#c5c9c2]"
                        >
                            Display Name
                        </label>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <input
                                id="firstName"
                                type="text"
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                                maxLength={50}
                                placeholder="First name"
                                className="w-full rounded-xl border border-[#d8f45a]/10 bg-[#101610] px-4 py-3 text-sm text-[#f1eee8] outline-none transition placeholder:text-[#626960] focus:border-[#d8f45a]/40"
                            />

                            <input
                                id="lastName"
                                type="text"
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
                                maxLength={50}
                                placeholder="Last name"
                                className="w-full rounded-xl border border-[#d8f45a]/10 bg-[#101610] px-4 py-3 text-sm text-[#f1eee8] outline-none transition placeholder:text-[#626960] focus:border-[#d8f45a]/40"
                            />
                        </div>
                    </div>

                    {/* PRONOUNS */}

                    <div>
                        <label
                            htmlFor="pronouns"
                            className="mb-2 block text-sm font-semibold text-[#c5c9c2]"
                        >
                            Display Pronoun
                        </label>

                        <input
                            id="pronouns"
                            type="text"
                            value={pronouns}
                            onChange={(event) => setPronouns(event.target.value)}
                            maxLength={50}
                            placeholder="e.g. he/him"
                            className="w-full rounded-xl border border-[#d8f45a]/10 bg-[#101610] px-4 py-3 text-sm text-[#f1eee8] outline-none transition placeholder:text-[#626960] focus:border-[#d8f45a]/40"
                        />
                    </div>

                    {/* BIO */}

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label
                                htmlFor="bio"
                                className="text-sm font-semibold text-[#c5c9c2]"
                            >
                                Bio
                            </label>

                            <span className="text-xs text-[#626960]">
                                {bio.length}/250
                            </span>
                        </div>

                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(event) => setBio(event.target.value)}
                            maxLength={250}
                            rows={5}
                            placeholder="Tell people a little about yourself..."
                            className="w-full resize-none rounded-xl border border-[#d8f45a]/10 bg-[#101610] px-4 py-3 text-sm leading-6 text-[#f1eee8] outline-none transition placeholder:text-[#626960] focus:border-[#d8f45a]/40"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;