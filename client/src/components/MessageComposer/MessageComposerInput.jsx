import React from "react";
import { FiSmile } from "react-icons/fi";
import { MdKeyboard } from "react-icons/md";

const MessageComposerInput = ({
  message,
  setMessage,
  messageInputRef,
  isSending,
  onMessageChange,
  onToggleMediaPicker,
  showMediaPicker,
  onSendMessage,
}) => {
  return (
    <div className="relative flex min-w-0 flex-1 items-end">
      {/* Emoji / Media button */}
      <button
        type="button"
        onClick={onToggleMediaPicker}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[#83b47b] transition hover:bg-[#2a2a29] hover:text-[#bcf66b]"
        aria-label={
          showMediaPicker
            ? "Show keyboard"
            : "Open emojis and media"
        }
      >
        {showMediaPicker ? (
          <MdKeyboard className="text-xl" />
        ) : (
          <FiSmile className="text-xl" />
        )}
      </button>

      {/* Message textarea */}
      <textarea
        ref={messageInputRef}
        value={message}
        onChange={onMessageChange}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            onSendMessage();
          }
        }}
        placeholder="Message"
        rows="1"
        disabled={isSending}
        className="scrollbar-aetherion min-h-12 max-h-[120px] min-w-0 flex-1 resize-none overflow-x-hidden overflow-y-auto rounded-2xl border border-[#d8f45a]/15 bg-[#080d09] px-4 py-3 text-sm leading-5 text-[#f1eee8] outline-none placeholder:text-[#70786f] transition focus:border-[#d8f45a]/50 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
      />
    </div>
  );
};

export default MessageComposerInput;