import { useNavigate } from "react-router-dom";

import Avatar from "../Avatar.jsx";

const ContactMessage = ({
    contact,
    onChat,
}) => {

    const navigate = useNavigate();

    const fullName =
        `${contact?.firstName || ""} ${contact?.lastName || ""}`.trim() ||
        contact?.email ||
        "Unknown user";

    const handleChat = (event) => {
        event.stopPropagation();

        if (!contact?.userId) {
            return;
        }

        onChat?.(contact.userId);
    };

    const handleOpenProfile = () => {
        const userId = contact?.userId;

        if (!userId) {
            return;
        }

        navigate(`/contact-profile/${userId}`);
    };

    return (
        <div className="w-[280px] max-w-full rounded-2xl border border-[#E5E5E5] bg-[#FFFFFF] p-3.5">
            {/* CONTACT INFO */}
            <div className="flex items-center gap-3">
                {/* DP */}
                <button
                    type="button"
                    onClick={handleOpenProfile}
                    className="group/avatar relative h-12 w-12 shrink-0 rounded-full"
                    aria-label={`View ${fullName}'s profile`}
                    title={`View ${fullName}'s profile`}
                >
                    <Avatar
                        profilePic={contact?.profilePic}
                        initials={fullName.charAt(0).toUpperCase()}
                        alt={fullName}
                        decoration={contact?.avatarDecoration}
                        size="md"
                        avatarClassName="bg-[#F7F7F5] text-[#171717] font-semibold transition duration-200 group-hover/avatar:scale-[1.04]"
                    />
                </button>

                {/* NAME + EMAIL */}
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#171717]">
                        {fullName}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-[#737373]">
                        {contact?.email || "No email"}
                    </p>
                </div>
            </div>

            {/* CHAT BUTTON */}
            <div className="mt-3 flex justify-center">
                <button
                    type="button"
                    onClick={handleChat}
                    className="text-xs font-medium text-[#F5F5F5] transition-colors hover:text-[#F5F5F5] hover:underline"
                >
                    Chat
                </button>
            </div>
        </div>
    );
};

export default ContactMessage;