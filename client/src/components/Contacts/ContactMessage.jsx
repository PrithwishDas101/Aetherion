import Avatar from "../Avatar.jsx";

const ContactMessage = ({
    contact,
    onChat,
}) => {
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

    return (
        <div className="w-[280px] max-w-full rounded-2xl border border-[#d8f45a]/10 bg-[#18221a] p-3.5">
            {/* CONTACT INFO */}
            <div className="flex items-center gap-3">
                {/* DP */}
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#0d120e]">
                    <Avatar
                        profilePic={contact?.profilePic}
                        initials={fullName.charAt(0).toUpperCase()}
                        alt={fullName}
                        decoration={contact?.avatarDecoration}
                        size="md"
                        avatarClassName="bg-[#0d120e] text-[#d8f45a] font-semibold"
                    />
                </div>

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