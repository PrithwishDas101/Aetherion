import { FiCheck } from "react-icons/fi";

import Avatar from "../Avatar.jsx";

const ContactListItem = ({
    contact,
    selected = false,
    onToggle,
}) => {
    const fullName =
        [contact?.firstName, contact?.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() ||
        contact?.name ||
        "Unknown user";

    const email = contact?.email || "";

    const profilePic = contact?.profilePic;

    const initials = fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");

    const handleClick = () => {
        if (!contact?._id) {
            return;
        }

        onToggle?.(contact._id);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${selected
                ? "bg-[#171717]/[0.08]"
                : "hover:bg-white/[0.04]"
                }`}
            aria-pressed={selected}
        >
            {/* DP */}
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#F5F5F5]">
                <Avatar
                    profilePic={profilePic}
                    initials={initials || "?"}
                    alt={fullName}
                    decoration={contact?.avatarDecoration}
                    size="sm"
                    avatarClassName="bg-[#F5F5F5] text-[#737373] font-semibold"
                />
            </div>

            {/* NAME + EMAIL */}
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#171717]">
                    {fullName}
                </p>

                {email && (
                    <p className="mt-0.5 truncate text-xs text-[#737373]">
                        {email}
                    </p>
                )}
            </div>

            {/* SELECTION */}
            <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${selected
                    ? "border-[#171717] bg-[#171717] text-[#FFFFFF]"
                    : "border-[#737373]/50 bg-transparent"
                    }`}
            >
                {selected && (
                    <FiCheck className="text-xs font-bold" />
                )}
            </div>
        </button>
    );
};

export default ContactListItem;