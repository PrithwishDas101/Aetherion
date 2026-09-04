import {
  FiDownload,
  FiEdit3,
  FiRefreshCw,
  FiSmile,
  FiType,
} from "react-icons/fi";

const MediaTools = ({
  activeTool,
  onToolChange,
  onDownload,
  onRetake,
  mediaType = "photo",
  showRetake = true,
  disabledTools = [],
}) => {
  const isDisabled = (tool) => disabledTools.includes(tool);

  const toggleTool = (tool) => {
    if (isDisabled(tool)) {
      return;
    }

    onToolChange?.((previous) => (previous === tool ? null : tool));
  };

  return (
    <div className="flex items-center gap-2">
      {/* DOWNLOAD */}

      <button
        type="button"
        onClick={onDownload}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white shadow-lg backdrop-blur-xl transition hover:bg-black/45 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={`Download ${mediaType}`}
      >
        <FiDownload className="text-[21px]" />
      </button>

      {/* RETAKE */}

      {showRetake ? (
        <button
          type="button"
          onClick={onRetake}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white shadow-lg backdrop-blur-xl transition hover:bg-black/45 active:scale-95"
          aria-label={`Retake ${mediaType}`}
        >
          <FiRefreshCw className="text-[21px]" />
        </button>
      ) : null}

      {/* STICKER */}

      <button
        type="button"
        onClick={() => toggleTool("sticker")}
        disabled={isDisabled("sticker")}
        className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/10 shadow-lg backdrop-blur-xl transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
          activeTool === "sticker"
            ? "bg-white text-black"
            : "bg-black/30 text-white hover:bg-black/45"
        }`}
        aria-label="Add sticker"
      >
        <FiSmile className="text-[21px]" />
      </button>

      {/* TEXT */}

      <button
        type="button"
        onClick={() => toggleTool("text")}
        disabled={isDisabled("text")}
        className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/10 shadow-lg backdrop-blur-xl transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
          activeTool === "text"
            ? "bg-white text-black"
            : "bg-black/30 text-white hover:bg-black/45"
        }`}
        aria-label="Add text"
      >
        <FiType className="text-[21px]" />
      </button>

      {/* DOODLE */}

      <button
        type="button"
        onClick={() => toggleTool("doodle")}
        disabled={isDisabled("doodle")}
        className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/10 shadow-lg backdrop-blur-xl transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
          activeTool === "doodle"
            ? "bg-white text-black"
            : "bg-black/30 text-white hover:bg-black/45"
        }`}
        aria-label={`Draw on ${mediaType}`}
      >
        <FiEdit3 className="text-[21px]" />
      </button>
    </div>
  );
};

export default MediaTools;
