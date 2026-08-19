import { useState } from "react";
import { FiX } from "react-icons/fi";

import PhotoTools from "./PhotoTools.jsx";
import PhotoTextEditor from "./TextEditor/PhotoTextEditor.jsx";
import DoodleEditor from "./Doodle/DoodleEditor.jsx";
import StickerEditor from "./Sticker/StickerEditor.jsx";

const PhotoPreview = ({
  photoUrl,
  activeTool,
  onToolChange,
  onClose,
  onDownload,
  onRetake,
  onSend,
  recipientName,
  photoCaption,
  onCaptionChange,
  downloadMessage,
}) => {
  const [photoTexts, setPhotoTexts] = useState([]);

  const isTextEditing = activeTool === "text";

  /*
   * TEXT EDITOR
   *
   * photoTexts belongs HERE, so leaving text mode
   * does NOT destroy the annotations.
   */

  const handleOpenTextEditor = () => {
    onToolChange("text");
  };

  const handleTextChange = (updatedTexts) => {
    setPhotoTexts(updatedTexts);
  };

  const handleTextDone = (updatedTexts) => {
    setPhotoTexts(updatedTexts);
    onToolChange(null);
  };

  const handleTextClose = () => {
    onToolChange(null);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black">
      {/* =========================================================
          PHOTO
          ========================================================= */}

      <img
        src={photoUrl}
        alt="Captured photo"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* =========================================================
          COMMITTED TEXT
          
          These stay attached to the photo even after leaving
          text-edit mode.
          ========================================================= */}

      {!isTextEditing
        ? photoTexts.map((text) => (
            <PhotoTextBlock
              key={text.id}
              text={text}
              onEdit={handleOpenTextEditor}
            />
          ))
        : null}

      {/* =========================================================
          CLOSE BUTTON
          
          This ALWAYS remains visible.
          ========================================================= */}

      <div
        className="
          absolute
          left-0
          top-0
          z-[100]
          px-4
          pt-[max(12px,env(safe-area-inset-top))]
        "
      >
        <button
          type="button"
          onClick={onClose}
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            border
            border-white/10
            bg-black/35
            text-white
            shadow-lg
            backdrop-blur-xl
            transition
            active:scale-95
          "
          aria-label="Discard photo"
        >
          <FiX className="text-[23px]" />
        </button>
      </div>

      {/* =========================================================
          NORMAL PHOTO TOOLS
          ========================================================= */}

      {!isTextEditing ? (
        <div
          className="
            absolute
            right-4
            top-0
            z-40
            pt-[max(12px,env(safe-area-inset-top))]
          "
        >
          <PhotoTools
            activeTool={activeTool}
            onToolChange={onToolChange}
            onDownload={onDownload}
            onRetake={onRetake}
          />
        </div>
      ) : null}

      {/* =========================================================
          TEXT EDITOR
          
          Existing photoTexts are passed in.
          Therefore reopening T never resets them.
          ========================================================= */}

      {isTextEditing ? (
        <PhotoTextEditor
          texts={photoTexts}
          onChange={handleTextChange}
          onDone={handleTextDone}
          onClose={handleTextClose}
        />
      ) : null}

      {/* =========================================================
          DOODLE EDITOR
          ========================================================= */}

      {activeTool === "doodle" ? (
        <DoodleEditor />
      ) : null}

      {/* =========================================================
          STICKER EDITOR
          ========================================================= */}

      {activeTool === "sticker" ? (
        <StickerEditor />
      ) : null}

      {/* =========================================================
          DOWNLOAD MESSAGE
          ========================================================= */}

      {downloadMessage ? (
        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-24
            z-[110]
            -translate-x-1/2
          "
        >
          <div
            className="
              flex
              items-center
              gap-2.5
              rounded-full
              border
              border-white/10
              bg-black/65
              px-4
              py-2.5
              text-sm
              font-medium
              text-white
              shadow-xl
              backdrop-blur-xl
            "
          >
            <span>{downloadMessage}</span>
          </div>
        </div>
      ) : null}

      {/* =========================================================
          CAPTION
          ========================================================= */}

      {!isTextEditing ? (
        <div
          className="
            absolute
            inset-x-0
            bottom-[82px]
            z-30
            px-3
          "
        >
          <div className="mx-auto w-full max-w-xl">
            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-black/45
                px-4
                py-2.5
                shadow-2xl
                backdrop-blur-xl
              "
            >
              <textarea
                value={photoCaption}
                onChange={onCaptionChange}
                placeholder="Add a caption..."
                rows={1}
                className="
                  scrollbar-aetherion
                  block
                  min-h-9
                  max-h-24
                  w-full
                  resize-none
                  overflow-y-auto
                  bg-transparent
                  py-1
                  text-[15px]
                  leading-5
                  text-white
                  outline-none
                  placeholder:text-white/50
                "
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* =========================================================
          SEND BAR
          ========================================================= */}

      {!isTextEditing ? (
        <div
          className="
            absolute
            inset-x-0
            bottom-0
            z-40
            flex
            min-h-[72px]
            items-center
            justify-between
            gap-3
            border-t
            border-white/10
            bg-[#080d09]
            px-5
            pb-[max(8px,env(safe-area-inset-bottom))]
            pt-2
          "
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {recipientName}
            </p>

            <p className="text-xs text-white/45">
              Send photo
            </p>
          </div>

          <button
            type="button"
            onClick={onSend}
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#d8f45a]
              text-[#10120d]
              shadow-lg
              transition
              hover:bg-[#e4ff6f]
              active:scale-95
            "
            aria-label="Send photo"
          >
            <span className="translate-x-[1px] text-xl">
              ➤
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

/* =============================================================
   COMMITTED PHOTO TEXT
   ============================================================= */

const PhotoTextBlock = ({
  text,
  onEdit,
}) => {
  const background =
    getBackground(text.background);

  const fontClass =
    getFontClass(text.font);

  return (
    <button
      type="button"
      onClick={onEdit}
      className="
        absolute
        z-20
        -translate-x-1/2
        -translate-y-1/2
        border-0
        bg-transparent
        p-0
        text-left
        outline-none
      "
      style={{
        left: `${text.x}%`,
        top: `${text.y}%`,
      }}
      aria-label="Edit text"
    >
      <span
        className={`
          inline-block
          max-w-[82vw]
          whitespace-pre-wrap
          break-words
          rounded-md
          px-3
          py-1.5
          text-[30px]
          leading-tight
          drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]
          ${fontClass}
        `}
        style={{
          color: text.color,
          backgroundColor: background,
          textAlign: text.alignment,
        }}
      >
        {text.text}
      </span>
    </button>
  );
};

const getBackground = (background) => {
  switch (background) {
    case "white":
      return "#FFFFFF";

    case "black":
      return "#000000";

    case "transparent":
      return "rgba(0,0,0,0.45)";

    case "none":
    default:
      return "transparent";
  }
};

const getFontClass = (font) => {
  switch (font) {
    case "serif":
      return "font-serif";

    case "mono":
      return "font-mono";

    case "italic":
      return "font-sans italic";

    case "bold":
      return "font-sans font-black";

    case "slab":
      return "font-serif font-bold";

    case "wide":
      return "font-sans tracking-[0.12em]";

    case "sans":
    default:
      return "font-sans";
  }
};

export default PhotoPreview;