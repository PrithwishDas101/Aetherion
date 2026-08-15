import React, { useState } from "react";

import MessageAttachmentButton from "./MessageAttachmentButton.jsx";
import MessageCameraButton from "./MessageCameraButton.jsx";
import AttachmentPanel from "./AttachmentPanel.jsx";

const MessageComposer = ({
  message,
  messageInputRef,
  isSending,
  onMessageChange,
  onCamera,
}) => {
  const [showAttachmentPanel, setShowAttachmentPanel] = useState(false);

  const toggleAttachmentPanel = () => {
    setShowAttachmentPanel((previous) => !previous);
  };

  return (
    <div className="relative flex min-w-0 flex-1 items-end">
      {/* TEXT AREA + ATTACHMENT + CAMERA */}

      <div className="flex min-w-0 flex-1 items-end gap-1.5 rounded-2xl border border-[#d8f45a]/15 bg-[#080d09] px-2 transition focus-within:border-[#d8f45a]/50">
        <textarea
          ref={messageInputRef}
          value={message}
          onChange={onMessageChange}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
            }
          }}
          placeholder="Message"
          rows="1"
          disabled={isSending}
          className="scrollbar-aetherion min-h-12 max-h-[120px] min-w-0 flex-1 resize-none overflow-x-hidden overflow-y-auto bg-transparent px-2 py-3 text-sm leading-5 text-[#f1eee8] outline-none placeholder:text-[#70786f] disabled:cursor-not-allowed disabled:opacity-60 sm:px-3"
        />

        {/* ATTACHMENT + PANEL */}

        <div className="relative shrink-0">
          <AttachmentPanel
            isOpen={showAttachmentPanel}
            onCamera={onCamera}
            onPhotos={() => console.log("Photos clicked")}
            onDocument={() => console.log("Document clicked")}
            onPoll={() => console.log("Poll clicked")}
            onLocation={() => console.log("Location clicked")}
            onContact={() => console.log("Contact clicked")}
          />

          <MessageAttachmentButton
            onClick={toggleAttachmentPanel}
          />
        </div>

        {/* CAMERA */}

        <MessageCameraButton onClick={onCamera} />
      </div>
    </div>
  );
};

export default MessageComposer;