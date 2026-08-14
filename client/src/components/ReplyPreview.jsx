import { IoClose } from "react-icons/io5";

const ReplyPreview = ({ message, isMyMessage, otherUserName, onCancel }) => {
  if (!message) {
    return null;
  }

  const senderName = isMyMessage ? "You" : otherUserName;

  return (
    <div className="mb-2 flex items-center gap-3 rounded-xl border border-[#d8f45a]/15 bg-[#111811] px-3 py-2">
      <div className="h-10 w-1 shrink-0 rounded-full bg-[#d8f45a]" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-[#d8f45a]">
          {senderName}
        </p>

        <p className="mt-0.5 truncate text-xs text-[#aab3a8]">{message.text}</p>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#aab3a8] transition hover:bg-[#d8f45a]/10 hover:text-[#f1eee8]"
        aria-label="Cancel reply"
      >
        <IoClose className="text-xl" />
      </button>
    </div>
  );
};

export default ReplyPreview;
