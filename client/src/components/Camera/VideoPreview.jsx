import { useState } from "react";
import { FiRefreshCw, FiVolume2, FiVolumeX, FiX } from "react-icons/fi";

import MediaTools from "./MediaTools.jsx";
import PhotoTextEditor from "./TextEditor/PhotoTextEditor.jsx";
import DoodleEditor from "./Doodle/DoodleEditor.jsx";
import StickerEditor from "./Sticker/StickerEditor.jsx";

const VideoPreview = ({
  videoUrl,
  videoBlob,
  activeTool,
  onToolChange,
  onClose,
  onDownload,
  onRetake,
  onSend,
  recipientName,
  videoCaption,
  onCaptionChange,
  downloadMessage,
}) => {
  const [videoTexts, setVideoTexts] = useState([]);
  const [editingTextId, setEditingTextId] = useState(null);
  const [videoDoodles, setVideoDoodles] = useState([]);
  const [isMuted, setIsMuted] = useState(false);

  const isTextEditing = activeTool === "text";
  const isDoodling = activeTool === "doodle";

  const handleTextChange = (updatedTexts) => {
    setVideoTexts(updatedTexts);
  };

  const handleTextDone = (updatedTexts) => {
    setVideoTexts(updatedTexts);
    setEditingTextId(null);
    onToolChange(null);
  };

  const handleTextClose = () => {
    setEditingTextId(null);
    onToolChange(null);
  };

  const handleDoodleChange = (updatedDoodles) => {
    setVideoDoodles(updatedDoodles);
  };

  const handleDoodleDone = () => {
    onToolChange(null);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* VIDEO */}

      <div className="absolute inset-0 flex items-center justify-center">
        <video
          src={videoUrl}
          controls
          autoPlay
          playsInline
          muted={isMuted}
          className="h-full w-full object-contain"
        />
      </div>

      {/* CLOSE */}

      {!isTextEditing && !isDoodling ? (
        <div className="absolute left-0 top-0 z-[100] px-4 pt-[max(12px,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white shadow-lg backdrop-blur-xl transition active:scale-95"
            aria-label="Discard video"
          >
            <FiX className="text-[23px]" />
          </button>
        </div>
      ) : null}

      {/* TOP TOOLS */}

      {!isTextEditing && !isDoodling ? (
        <div className="absolute right-4 top-0 z-40 pt-[max(12px,env(safe-area-inset-top))]">
          <MediaTools
            activeTool={activeTool}
            onToolChange={onToolChange}
            onDownload={onDownload}
            onRetake={onRetake}
          />
        </div>
      ) : null}

      {/* SOUND TOGGLE */}

      {!isTextEditing && !isDoodling ? (
        <div className="absolute left-4 top-20 z-40">
          <button
            type="button"
            onClick={() => setIsMuted((previous) => !previous)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white shadow-lg backdrop-blur-xl transition active:scale-95"
            aria-label={isMuted ? "Enable video sound" : "Mute video sound"}
          >
            {isMuted ? (
              <FiVolumeX className="text-[21px]" />
            ) : (
              <FiVolume2 className="text-[21px]" />
            )}
          </button>
        </div>
      ) : null}

      {/* TEXT EDITOR */}

      {isTextEditing ? (
        <PhotoTextEditor
          texts={videoTexts}
          editingTextId={editingTextId}
          onChange={handleTextChange}
          onDone={handleTextDone}
          onClose={handleTextClose}
        />
      ) : null}

      {/* DOODLE EDITOR */}

      {isDoodling ? (
        <DoodleEditor
          doodles={videoDoodles}
          onChange={handleDoodleChange}
          onDone={handleDoodleDone}
        />
      ) : null}

      {/* STICKER EDITOR */}

      {activeTool === "sticker" ? <StickerEditor /> : null}

      {/* DOWNLOAD MESSAGE */}

      {downloadMessage && !isTextEditing && !isDoodling ? (
        <div className="pointer-events-none absolute left-1/2 top-24 z-[110] -translate-x-1/2">
          <div className="rounded-full border border-white/10 bg-black/65 px-4 py-2.5 text-sm font-medium text-white shadow-xl backdrop-blur-xl">
            {downloadMessage}
          </div>
        </div>
      ) : null}

      {/* CAPTION */}

      {!isTextEditing && !isDoodling ? (
        <div className="absolute inset-x-0 bottom-[82px] z-30 px-3">
          <div className="mx-auto w-full max-w-xl">
            <div className="rounded-2xl border border-white/10 bg-black/45 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
              <textarea
                value={videoCaption}
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

      {!isTextEditing && !isDoodling ? (
        <div className="absolute inset-x-0 bottom-0 z-40 flex min-h-[72px] items-center justify-between gap-3 border-t border-white/10 bg-[#080d09] px-5 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {recipientName}
            </p>

            <p className="text-xs text-white/45">Send video</p>
          </div>

          <button
            type="button"
            onClick={() =>
              onSend?.({
                blob: videoBlob,
                caption: videoCaption.trim(),
                muted: isMuted,
                texts: videoTexts,
                doodles: videoDoodles,
              })
            }
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d8f45a] text-[#10120d] shadow-lg transition hover:bg-[#e4ff6f] active:scale-95"
            aria-label="Send video"
          >
            <span className="translate-x-[1px] text-xl">➤</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default VideoPreview;
