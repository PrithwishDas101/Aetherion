const ReplyMessage = ({
  replyTo,
  isMyMessage,
  currentUserId,
  otherUserName,
  onClick,
}) => {
  if (!replyTo) {
    return null;
  }

  const replySenderId = replyTo.sender?._id || replyTo.sender;

  const isReplyToMyMessage = String(replySenderId) === String(currentUserId);

  const senderName = isReplyToMyMessage ? "You" : otherUserName;

  const isGif = replyTo.type === "gif" && replyTo.mediaUrl;

  const isImage = replyTo.type === "image" && replyTo.mediaUrl;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-2 block w-full overflow-hidden rounded-lg border-l-4 text-left transition active:scale-[0.99] ${
        isMyMessage
          ? "border-[#68752d] bg-[#b8cd4f]/35 hover:bg-[#b8cd4f]/45"
          : "border-[#d8f45a]/50 bg-[#10170f] hover:bg-[#162015]"
      }`}
    >
      <div className="px-3 pb-1.5 pt-1.5">
        <p
          className={`mb-1 text-xs font-semibold ${
            isMyMessage ? "text-[#39400f]" : "text-[#d8f45a]"
          }`}
        >
          {senderName}
        </p>

        {isImage ? (
          <div className="flex items-center gap-2">
            <img
              src={replyTo.mediaUrl}
              alt="Photo"
              className="h-14 w-14 shrink-0 rounded-md object-cover"
            />

            <p
              className={`line-clamp-2 min-w-0 whitespace-pre-wrap text-xs ${
                isMyMessage ? "text-[#343b16]" : "text-[#aab3a8]"
              }`}
            >
              {replyTo.text?.trim() || "Photo"}
            </p>
          </div>
        ) : isGif ? (
          <div className="flex items-center gap-2">
            <img
              src={replyTo.mediaUrl}
              alt="GIF"
              className="h-14 w-20 shrink-0 rounded-md object-cover"
            />

            <p
              className={`text-xs ${
                isMyMessage ? "text-[#343b16]" : "text-[#aab3a8]"
              }`}
            >
              GIF
            </p>
          </div>
        ) : (
          <p
            className={`line-clamp-2 whitespace-pre-wrap text-xs ${
              isMyMessage ? "text-[#343b16]" : "text-[#aab3a8]"
            }`}
          >
            {replyTo.text}
          </p>
        )}
      </div>
    </button>
  );
};

export default ReplyMessage;
