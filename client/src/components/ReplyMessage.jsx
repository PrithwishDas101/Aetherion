const ReplyMessage = ({ replyTo, isMyMessage, currentUserId, otherUserName, }) => {

    if (!replyTo) {
        return null;
    }

    const replySenderId = replyTo.sender?._id || replyTo.sender;
    const isReplyToMyMessage = String(replySenderId) === String(currentUserId);
    const senderName = isReplyToMyMessage ? "You" : otherUserName;

    return (

        <div
            className={`mb-2 rounded-lg border-l-4 px-3 py-1.5 ${isMyMessage
                ? "border-[#68752d] bg-[#b8cd4f]/35"
                : "border-[#d8f45a]/50 bg-[#10170f]"
                }`}
        >

            <p
                className={`mb-1 text-xs font-semibold ${isMyMessage
                    ? "text-[#39400f]"
                    : "text-[#d8f45a]"
                    }`}
            >

                {senderName}

            </p>

            <p
                className={`line-clamp-2 whitespace-pre-wrap text-xs ${isMyMessage
                    ? "text-[#343b16]"
                    : "text-[#aab3a8]"
                    }`}
            >

                {replyTo.text}

            </p>

        </div>

    );

};

export default ReplyMessage;