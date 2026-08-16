import React from "react";
import { FiPaperclip } from "react-icons/fi";

const MessageAttachmentButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[#e3ece27a] transition hover:bg-[#2a2a2988] hover:text-[#d6dbce] active:scale-95"
      aria-label="Open attachments"
    >
      <FiPaperclip className="text-xl" />
    </button>
  );
};

export default MessageAttachmentButton;
