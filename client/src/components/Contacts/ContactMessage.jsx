import { FiMessageCircle } from "react-icons/fi";

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
        <div className="w-[260px] max-w-full rounded-2xl border border-[#d8f45a]/10 bg-[#18221a] p-3">
            <div className="flex items-center gap-3">
                {/* PROFILE PICTURE */}
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#0d120e]">
                    {contact?.profilePic ? (
                        <img
                            src={contact.profilePic}
                            alt={fullName}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#d8f45a]">
                            {fullName.charAt(0).toUpperCase()}
                        </div>
                    )}
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
            <button
                type="button"
                onClick={handleChat}
                className="mt-3 inline-flex items-center gap-1.5 px-0.5 text-xs font-medium text-[#d8f45a] transition hover:text-[#e4ff6c] hover:underline"
            >
                <FiMessageCircle className="text-sm" />
                Chat
            </button>
        </div>
    );
};

export default ContactMessage;