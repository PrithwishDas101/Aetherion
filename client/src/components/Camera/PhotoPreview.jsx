import { useRef, useState } from "react";
import { FiTrash2, FiX } from "react-icons/fi";

import MediaTools  from "./MediaTools.jsx";
import PhotoTextEditor from "./TextEditor/PhotoTextEditor.jsx";
import DoodleEditor from "./Doodle/DoodleEditor.jsx";
import DoodleDisplay from "./Doodle/DoodleDisplay.jsx";
import StickerEditor from "./Sticker/StickerEditor.jsx";
import MediaZoomSurface from "./MediaZoomSurface.jsx";
import { composePhoto } from "./Composition/composePhoto.js";

const TRASH_RADIUS = 64;

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
  const [editingTextId, setEditingTextId] = useState(null);
  const [photoDoodles, setPhotoDoodles] = useState([]);
  const [draggingTextId, setDraggingTextId] = useState(null);
  const [isOverTrash, setIsOverTrash] = useState(false);

  const previewRef = useRef(null);
  const dragStartRef = useRef(null);
  const didDragRef = useRef(false);
  const trashRef = useRef(null);

  const isTextEditing = activeTool === "text";
  const isDoodling = activeTool === "doodle";
  const isDraggingCommittedText = Boolean(draggingTextId);

  const handleOpenTextEditor = (textId = null) => {
    setEditingTextId(textId);
    onToolChange("text");
  };

  const isPointerInsideTrash = (clientX, clientY) => {
    const trash = trashRef.current;

    if (!trash) return false;

    const rect = trash.getBoundingClientRect();

    const trashX = rect.left + rect.width / 2;
    const trashY = rect.top + rect.height / 2;

    const distance = Math.hypot(clientX - trashX, clientY - trashY);

    return distance <= TRASH_RADIUS;
  };

  const handleCommittedTextPointerDown = (event, textId) => {
    event.preventDefault();
    event.stopPropagation();

    event.currentTarget.setPointerCapture?.(event.pointerId);

    const preview = previewRef.current;

    if (!preview) return;

    const previewRect = preview.getBoundingClientRect();

    const currentText = photoTexts.find((text) => text.id === textId);

    if (!currentText) return;

    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      textX: currentText.x,
      textY: currentText.y,
      previewWidth: previewRect.width,
      previewHeight: previewRect.height,
    };

    didDragRef.current = false;

    setDraggingTextId(textId);
    setIsOverTrash(false);
  };

  const handleCommittedTextPointerMove = (event) => {
    if (!draggingTextId) return;

    const preview = previewRef.current;

    if (!preview) return;

    const rect = preview.getBoundingClientRect();

    const distanceFromStart = dragStartRef.current
      ? Math.hypot(
          event.clientX - dragStartRef.current.pointerX,
          event.clientY - dragStartRef.current.pointerY,
        )
      : 0;

    if (distanceFromStart > 5) {
      didDragRef.current = true;
    }

    // No left/right/top/bottom clamping.

    const draggedTextElement = document.querySelector(
      `[data-photo-text-id="${draggingTextId}"]`,
    );

    const textRect = draggedTextElement?.getBoundingClientRect();

    const textWidth = textRect?.width || 0;
    const textHeight = textRect?.height || 0;

    const pointerDeltaX =
      ((event.clientX - dragStartRef.current.pointerX) / rect.width) * 100;

    const pointerDeltaY =
      ((event.clientY - dragStartRef.current.pointerY) / rect.height) * 100;

    const x = dragStartRef.current.textX + pointerDeltaX;
    const y = dragStartRef.current.textY + pointerDeltaY;

    const minX = -(textWidth / 2 / rect.width) * 100;
    const maxX = 100 + (textWidth / 2 / rect.width) * 100;

    const minY = -(textHeight / 2 / rect.height) * 100;
    const maxY = 100 + (textHeight / 2 / rect.height) * 100;

    const clampedX = Math.max(minX, Math.min(maxX, x));
    const clampedY = Math.max(minY, Math.min(maxY, y));

    const overTrash = isPointerInsideTrash(event.clientX, event.clientY);

    setIsOverTrash(overTrash);

    setPhotoTexts((previous) =>
      previous.map((text) =>
        text.id === draggingTextId
          ? {
              ...text,
              x: clampedX,
              y: clampedY,
            }
          : text,
      ),
    );
  };

  const handleCommittedTextPointerUp = (event) => {
    if (!draggingTextId) return;

    event.currentTarget.releasePointerCapture?.(event.pointerId);

    const shouldDelete = isPointerInsideTrash(event.clientX, event.clientY);

    const textIdToHandle = draggingTextId;
    const wasDragged = didDragRef.current;

    if (shouldDelete && wasDragged) {
      setPhotoTexts((previous) =>
        previous.filter((text) => text.id !== textIdToHandle),
      );
    }

    setDraggingTextId(null);
    setIsOverTrash(false);

    // A tap edits. A real drag only moves.

    if (!wasDragged && !shouldDelete) {
      handleOpenTextEditor(textIdToHandle);
    }

    dragStartRef.current = null;

    requestAnimationFrame(() => {
      didDragRef.current = false;
    });
  };

  const handleTextChange = (updatedTexts) => {
    setPhotoTexts(updatedTexts);
  };

  const handleTextDone = (updatedTexts) => {
    setPhotoTexts(updatedTexts);
    setEditingTextId(null);
    onToolChange(null);
  };

  const handleTextClose = () => {
    setEditingTextId(null);
    onToolChange(null);
  };

  const handleDoodleChange = (updatedDoodles) => {
    setPhotoDoodles(updatedDoodles);
  };

  const handleDoodleDone = () => {
    onToolChange(null);
  };

  const handleSendPhoto = async () => {
    try {
      const finalBlob = await composePhoto({
        photoUrl,
        doodles: photoDoodles,
        texts: photoTexts,
      });

      onSend?.(finalBlob);
    } catch (error) {
      console.error("Unable to compose photo for sending:", error);
    }
  };

  const handleDownloadPhoto = async () => {
    try {
      const finalBlob = await composePhoto({
        photoUrl,
        doodles: photoDoodles,
        texts: photoTexts,
      });

      onDownload?.(finalBlob);
    } catch (error) {
      console.error("Unable to compose photo for download:", error);
    }
  };

  return (
    <div
      ref={previewRef}
      data-photo-preview
      className="absolute inset-0 flex items-center justify-center overflow-visible bg-black"
      onPointerMove={handleCommittedTextPointerMove}
      onPointerUp={handleCommittedTextPointerUp}
      onPointerCancel={handleCommittedTextPointerUp}
    >
      {/* PHOTO */}

      <MediaZoomSurface>
        <div className="absolute inset-0 h-full w-full">
          <img
            src={photoUrl}
            alt="Captured photo"
            draggable={false}
            className="h-full w-full select-none object-cover"
          />

          {!isTextEditing
            ? photoTexts.map((text) => (
                <PhotoTextBlock
                  key={text.id}
                  text={text}
                  isDragging={draggingTextId === text.id}
                  onPointerDown={(event) =>
                    handleCommittedTextPointerDown(event, text.id)
                  }
                />
              ))
            : null}

          <DoodleDisplay doodles={photoDoodles} />
        </div>
      </MediaZoomSurface>

      {/* DRAG MODE — TRASH TARGET */}

      {isDraggingCommittedText ? (
        <div className="pointer-events-none absolute left-4 top-0 z-[120] pt-[max(12px,env(safe-area-inset-top))]">
          <div
            ref={trashRef}
            className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-2xl backdrop-blur-xl transition-all duration-150 ${
              isOverTrash
                ? "scale-110 border-red-300/80 bg-red-500/90 text-white shadow-[0_0_30px_rgba(239,68,68,0.95)]"
                : "border-white/15 bg-black/65 text-white/80 shadow-black/50"
            }`}
          >
            <FiTrash2 className="text-[22px]" />
          </div>
        </div>
      ) : null}

      {/* CLOSE BUTTON */}

      {!isDraggingCommittedText && !isDoodling ? (
        <div className="absolute left-0 top-0 z-[100] px-4 pt-[max(12px,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white shadow-lg backdrop-blur-xl transition active:scale-95"
            aria-label="Discard photo"
          >
            <FiX className="text-[23px]" />
          </button>
        </div>
      ) : null}

      {/* NORMAL PHOTO TOOLS */}

      {!isTextEditing && !isDoodling && !isDraggingCommittedText ? (
        <div className="absolute right-4 top-0 z-40 pt-[max(12px,env(safe-area-inset-top))]">
          <MediaTools 
            activeTool={activeTool}
            onToolChange={onToolChange}
            onDownload={handleDownloadPhoto}
            onRetake={onRetake}
          />
        </div>
      ) : null}

      {/* TEXT EDITOR */}

      {isTextEditing ? (
        <PhotoTextEditor
          texts={photoTexts}
          editingTextId={editingTextId}
          onChange={handleTextChange}
          onDone={handleTextDone}
          onClose={handleTextClose}
        />
      ) : null}

      {/* DOODLE EDITOR */}

      {isDoodling ? (
        <DoodleEditor
          doodles={photoDoodles}
          onChange={handleDoodleChange}
          onDone={handleDoodleDone}
        />
      ) : null}

      {/* STICKER EDITOR */}

      {activeTool === "sticker" ? <StickerEditor /> : null}

      {/* DOWNLOAD MESSAGE */}

      {downloadMessage && !isDraggingCommittedText && !isDoodling ? (
        <div className="pointer-events-none absolute left-1/2 top-24 z-[110] -translate-x-1/2">
          <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-black/65 px-4 py-2.5 text-sm font-medium text-white shadow-xl backdrop-blur-xl">
            <span>{downloadMessage}</span>
          </div>
        </div>
      ) : null}

      {/* CAPTION */}

      {!isTextEditing && !isDoodling && !isDraggingCommittedText ? (
        <div className="absolute inset-x-0 bottom-[82px] z-30 px-3">
          <div className="mx-auto w-full max-w-xl">
            <div className="rounded-2xl border border-white/10 bg-black/45 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
              <textarea
                value={photoCaption}
                onChange={onCaptionChange}
                placeholder="Add a caption..."
                rows={1}
                className="scrollbar-aetherion block min-h-9 max-h-24 w-full resize-none overflow-y-auto bg-transparent py-1 text-[15px] leading-5 text-white outline-none placeholder:text-white/50"
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* SEND BAR */}

      {!isTextEditing && !isDoodling && !isDraggingCommittedText ? (
        <div className="absolute inset-x-0 bottom-0 z-40 flex min-h-[72px] items-center justify-between gap-3 border-t border-white/10 bg-[#080d09] px-5 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {recipientName}
            </p>

            <p className="text-xs text-white/45">Send photo</p>
          </div>

          <button
            type="button"
            onClick={handleSendPhoto}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d8f45a] text-[#10120d] shadow-lg transition hover:bg-[#e4ff6f] active:scale-95"
            aria-label="Send photo"
          >
            <span className="translate-x-[1px] text-xl">➤</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

/* COMMITTED PHOTO TEXT */

const PhotoTextBlock = ({ text, isDragging, onPointerDown }) => {
  const background = getBackground(text.background);
  const fontClass = getFontClass(text.font);

  return (
    <button
      type="button"
      data-photo-text-id={text.id}
      onPointerDown={onPointerDown}
      className={`absolute z-20 max-w-[82vw] -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none border-0 bg-transparent p-0 text-left outline-none transition-opacity active:cursor-grabbing ${isDragging ? "z-[130]" : ""}`}
      style={{
        left: `${text.x}%`,
        top: `${text.y}%`,
      }}
      aria-label="Move or edit text"
    >
      <div
        className={`w-max max-w-[82vw] whitespace-pre-wrap break-words text-[30px] leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] ${fontClass}`}
        style={{ color: text.color, textAlign: text.alignment }}
      >
        {text.text.split("\n").map((line, index, lines) => {
          const isLastLine = index === lines.length - 1;

          return (
            <span key={`${text.id}-${index}`}>
              {line ? (
                <span
                  style={{
                    display: "inline",
                    backgroundColor:
                      text.background === "none" ? "transparent" : background,
                    padding: text.background === "none" ? "0" : "3px 8px",
                    borderRadius: text.background === "none" ? "0" : "6px",
                    boxDecorationBreak: "clone",
                    WebkitBoxDecorationBreak: "clone",
                  }}
                >
                  {line}
                </span>
              ) : (
                "\u00A0"
              )}

              {!isLastLine && <br />}
            </span>
          );
        })}
      </div>
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
