import React from "react";
import { FiPaperclip } from "react-icons/fi";

const MessageAttachmentButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[#E5E5E5] transition hover:text-[#737373] active:scale-95"
      aria-label="Open attachments"
    >
      <FiPaperclip className="text-xl" />
    </button>
  );
};

export default MessageAttachmentButton;
