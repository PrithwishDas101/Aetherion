import { FiFileText, FiMapPin, FiUser } from "react-icons/fi";
import { IoBarChartOutline } from "react-icons/io5";

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

  const replySenderId =
    replyTo.sender?._id || replyTo.sender;

  const isReplyToMyMessage =
    String(replySenderId) === String(currentUserId);

  const senderName = isReplyToMyMessage
    ? "You"
    : otherUserName || "User";

  const isImage =
    replyTo.type === "image" && !!replyTo.mediaUrl;

  const isVideo =
    replyTo.type === "video" && !!replyTo.mediaUrl;

  const isGif =
    replyTo.type === "gif" && !!replyTo.mediaUrl;

  const isDocument =
    replyTo.type === "document";

  const isPoll =
    replyTo.type === "poll";

  const isLocation =
    replyTo.type === "location";

  const isContact =
    replyTo.type === "contact";

  const contactName =
    `${replyTo.contact?.firstName || ""} ${replyTo.contact?.lastName || ""
      }`.trim() ||
    replyTo.contact?.email ||
    "Contact";

  const pollQuestion =
    replyTo.poll?.question ||
    replyTo.text?.trim() ||
    "Poll";

  const documentName =
    replyTo.document?.name ||
    "Document";

  const locationText =
    replyTo.location?.address?.trim() ||
    "Location";

  const normalText =
    replyTo.text?.trim() ||
    "Message";

  const secondaryTextClass = isMyMessage
    ? "text-[#343b16]"
    : "text-[#aab3a8]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-2 block w-full overflow-hidden rounded-lg border-l-4 text-left transition active:scale-[0.99] ${isMyMessage
          ? "border-[#68752d] bg-[#b8cd4f]/35 hover:bg-[#b8cd4f]/45"
          : "border-[#d8f45a]/50 bg-[#10170f] hover:bg-[#162015]"
        }`}
    >
      <div className="px-3 pb-1.5 pt-1.5">
        {/* SENDER */}
        <p
          className={`mb-1 text-xs font-semibold ${isMyMessage
              ? "text-[#39400f]"
              : "text-[#d8f45a]"
            }`}
        >
          {senderName}
        </p>

        {/* IMAGE */}
        {isImage && (
          <div className="flex items-center gap-2">
            <img
              src={replyTo.mediaUrl}
              alt="Image"
              className="h-14 w-14 shrink-0 rounded-md object-cover"
            />

            <p
              className={`line-clamp-2 min-w-0 whitespace-pre-wrap text-xs ${secondaryTextClass}`}
            >
              {replyTo.text?.trim() || "Image"}
            </p>
          </div>
        )}

        {/* VIDEO */}
        {isVideo && (
          <div className="flex items-center gap-2">
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-black">
              <video
                src={replyTo.mediaUrl}
                className="h-full w-full object-cover"
                muted
                playsInline
                preload="metadata"
              />

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white">
                  ▶
                </span>
              </div>
            </div>

            <p
              className={`line-clamp-2 min-w-0 whitespace-pre-wrap text-xs ${secondaryTextClass}`}
            >
              {replyTo.text?.trim() || "Video"}
            </p>
          </div>
        )}

        {/* GIF */}
        {isGif && (
          <div className="flex items-center gap-2">
            <img
              src={replyTo.mediaUrl}
              alt="GIF"
              className="h-14 w-20 shrink-0 rounded-md object-cover"
            />

            <p
              className={`text-xs ${secondaryTextClass}`}
            >
              GIF
            </p>
          </div>
        )}

        {/* DOCUMENT */}
        {isDocument && (
          <div className="flex items-center gap-2">
            <FiFileText
              className={`shrink-0 text-sm ${secondaryTextClass}`}
            />

            <p
              className={`truncate text-xs ${secondaryTextClass}`}
            >
              {documentName}
            </p>
          </div>
        )}

        {/* POLL */}
        {isPoll && (
          <div className="flex items-center gap-2">
            <IoBarChartOutline
              className={`shrink-0 text-sm ${secondaryTextClass}`}
            />

            <p
              className={`line-clamp-2 min-w-0 text-xs ${secondaryTextClass}`}
            >
              {pollQuestion}
            </p>
          </div>
        )}

        {/* LOCATION */}
        {isLocation && (
          <div className="flex items-center gap-2">
            <FiMapPin
              className={`shrink-0 text-sm ${secondaryTextClass}`}
            />

            <p
              className={`truncate text-xs ${secondaryTextClass}`}
            >
              {locationText}
            </p>
          </div>
        )}

        {/* CONTACT */}
        {isContact && (
          <div className="flex items-center gap-2">
            <FiUser
              className={`shrink-0 text-sm ${secondaryTextClass}`}
            />

            <p
              className={`truncate text-xs ${secondaryTextClass}`}
            >
              {contactName}
            </p>
          </div>
        )}

        {/* TEXT */}
        {!isImage &&
          !isVideo &&
          !isGif &&
          !isDocument &&
          !isPoll &&
          !isLocation &&
          !isContact && (
            <p
              className={`line-clamp-2 whitespace-pre-wrap text-xs ${secondaryTextClass}`}
            >
              {normalText}
            </p>
          )}
      </div>
    </button>
  );
};

export default ReplyMessage;