import React from "react";
import { FiCamera } from "react-icons/fi";

const MessageCameraButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[#e3ece27a] transition hover:bg-[#2a2a2988] hover:text-[#d6dbce]"
      aria-label="Take a photo"
    >
      <FiCamera className="text-xl" />
    </button>
  );
};

export default MessageCameraButton;