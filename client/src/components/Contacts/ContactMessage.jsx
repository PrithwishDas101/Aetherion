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
        <div className="w-[280px] max-w-full rounded-2xl border border-[#d8f45a]/10 bg-[#18221a] p-3.5">
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
                        avatarClassName="bg-[#0d120e] text-[#d8f45a] font-semibold transition duration-200 group-hover/avatar:scale-[1.04]"
                    />
                </button>

                {/* NAME + EMAIL */}
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#f1eee8]">
                        {fullName}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-[#8d9689]">
                        {contact?.email || "No email"}
                    </p>
                </div>
            </div>

            {/* CHAT BUTTON */}
            <div className="mt-3 flex justify-center">
                <button
                    type="button"
                    onClick={handleChat}
                    className="text-xs font-medium text-[#ebf6bb] transition-colors hover:text-[#f4f7e8] hover:underline"
                >
                    Chat
                </button>
            </div>
        </div>
    );
};

export default ContactMessage;