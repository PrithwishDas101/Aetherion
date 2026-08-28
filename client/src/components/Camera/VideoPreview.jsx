import { useRef, useState } from "react";
import { FiRefreshCw, FiVolume2, FiVolumeX, FiX } from "react-icons/fi";

import MediaTools from "./MediaTools.jsx";
import PhotoTextEditor from "./TextEditor/PhotoTextEditor.jsx";
import DoodleEditor from "./Doodle/DoodleEditor.jsx";
import DoodleDisplay from "./Doodle/DoodleDisplay.jsx";
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

  const [isProcessing, setIsProcessing] = useState(false);
  const videoPreviewRef = useRef(null);

  const handleSend = async () => {
    if (!videoBlob || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const finalBlob = await renderVideoWithOverlays({
        videoBlob,
        texts: videoTexts,
        doodles: videoDoodles,
      });

      onSend?.({
        blob: finalBlob,
        caption: videoCaption.trim(),
        muted: isMuted,
      });
    } catch (error) {
      console.error("Unable to render video overlays:", error);

      // Fallback: still send the original video.
      onSend?.({
        blob: videoBlob,
        caption: videoCaption.trim(),
        muted: isMuted,
      });
    } finally {
      setIsProcessing(false);
    }
  };

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

      <div className="absolute inset-0 overflow-hidden bg-black">
        <video
          ref={videoPreviewRef}
          src={videoUrl}
          controls
          autoPlay
          playsInline
          muted={isMuted}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* SAVED DOODLES */}

        <DoodleDisplay doodles={videoDoodles} />

        {/* SAVED TEXT */}

        {!isTextEditing
          ? videoTexts.map((text) => (
              <VideoTextBlock
                key={text.id}
                text={text}
                onPositionChange={(x, y) => {
                  setVideoTexts((previous) =>
                    previous.map((item) =>
                      item.id === text.id
                        ? {
                            ...item,
                            x,
                            y,
                          }
                        : item,
                    ),
                  );
                }}
              />
            ))
          : null}
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
            onDownload={() => onDownload?.(videoBlob)}
            onRetake={onRetake}
            mediaType="video"
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
            onClick={handleSend}
            disabled={isProcessing}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d8f45a] text-[#10120d] shadow-lg transition hover:bg-[#e4ff6f] active:scale-95"
            aria-label="Send video"
          >
            <span className="text-sm font-bold">
              {isProcessing ? "..." : "➤"}
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

const VideoTextBlock = ({ text, onPositionChange }) => {
  const background = getBackground(text.background);
  const fontClass = getFontClass(text.font);

  const handlePointerDown = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const parent = event.currentTarget.parentElement;

    if (!parent) return;

    const rect = parent.getBoundingClientRect();

    const startX = event.clientX;
    const startY = event.clientY;

    const initialX = text.x;
    const initialY = text.y;

    const handlePointerMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const nextX = Math.min(
        95,
        Math.max(5, initialX + (deltaX / rect.width) * 100),
      );

      const nextY = Math.min(
        95,
        Math.max(5, initialY + (deltaY / rect.height) * 100),
      );

      onPositionChange(nextX, nextY);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      className="absolute z-20 max-w-[82vw] -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none active:cursor-grabbing"
      style={{
        left: `${text.x}%`,
        top: `${text.y}%`,
      }}
    >
      <div
        className={`w-max max-w-[82vw] whitespace-pre-wrap break-words text-[30px] leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] ${fontClass}`}
        style={{
          color: text.color,
          textAlign: text.alignment,
        }}
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
    </div>
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

const renderVideoWithOverlays = ({ videoBlob, texts, doodles }) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");

    video.src = URL.createObjectURL(videoBlob);
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    const cleanup = () => {
      URL.revokeObjectURL(video.src);
      video.remove();
    };

    video.onloadedmetadata = async () => {
      try {
        const width = video.videoWidth;
        const height = video.videoHeight;

        if (!width || !height) {
          cleanup();
          reject(new Error("Invalid video dimensions."));
          return;
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          cleanup();
          reject(new Error("Canvas is unavailable."));
          return;
        }

        const canvasStream = canvas.captureStream(30);

        let combinedStream = canvasStream;

        if (typeof video.captureStream === "function") {
          const audioStream = video.captureStream();

          audioStream.getAudioTracks().forEach((track) => {
            canvasStream.addTrack(track);
          });

          combinedStream = canvasStream;
        }

        let mimeType = "";

        const supportedTypes = [
          "video/webm;codecs=vp9,opus",
          "video/webm;codecs=vp8,opus",
          "video/webm",
        ];

        for (const type of supportedTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            break;
          }
        }

        const recorder = mimeType
          ? new MediaRecorder(combinedStream, {
              mimeType,
            })
          : new MediaRecorder(combinedStream);

        const chunks = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onerror = () => {
          cleanup();
          reject(new Error("Unable to record composed video."));
        };

        recorder.onstop = () => {
          const finalBlob = new Blob(chunks, {
            type: recorder.mimeType || "video/webm",
          });

          canvasStream.getTracks().forEach((track) => track.stop());

          cleanup();

          resolve(finalBlob);
        };

        const drawText = (text) => {
          if (!text?.text) return;

          const x = (text.x / 100) * width;
          const y = (text.y / 100) * height;

          const fontSize = Math.max(
            20,
            Math.round((30 / Math.min(window.innerWidth, 430)) * width),
          );

          let fontWeight = "400";
          let fontStyle = "normal";
          let fontFamily = "sans-serif";

          switch (text.font) {
            case "serif":
              fontFamily = "serif";
              break;

            case "mono":
              fontFamily = "monospace";
              break;

            case "italic":
              fontStyle = "italic";
              break;

            case "bold":
              fontWeight = "900";
              break;

            case "slab":
              fontFamily = "serif";
              fontWeight = "700";
              break;

            case "wide":
              fontFamily = "sans-serif";
              break;

            default:
              fontFamily = "sans-serif";
          }

          context.save();

          context.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
          context.fillStyle = text.color || "#FFFFFF";
          context.textBaseline = "middle";

          const lines = text.text.split("\n");
          const lineHeight = fontSize * 1.2;

          const totalHeight = lines.length * lineHeight;
          const startY = y - totalHeight / 2 + lineHeight / 2;

          let textAlign = "center";

          if (text.alignment === "left") {
            textAlign = "left";
          }

          if (text.alignment === "right") {
            textAlign = "right";
          }

          context.textAlign = textAlign;

          lines.forEach((line, index) => {
            const lineY = startY + index * lineHeight;

            let background = "transparent";

            if (text.background === "white") {
              background = "#FFFFFF";
            } else if (text.background === "black") {
              background = "#000000";
            } else if (text.background === "transparent") {
              background = "rgba(0,0,0,0.45)";
            }

            if (text.background !== "none" && background !== "transparent") {
              const metrics = context.measureText(line || " ");

              const paddingX = fontSize * 0.27;
              const paddingY = fontSize * 0.1;

              let backgroundX = x - metrics.width / 2 - paddingX;

              if (textAlign === "left") {
                backgroundX = x - paddingX;
              }

              if (textAlign === "right") {
                backgroundX = x - metrics.width - paddingX;
              }

              context.fillStyle = background;

              context.beginPath();

              context.roundRect(
                backgroundX,
                lineY - fontSize / 2 - paddingY,
                metrics.width + paddingX * 2,
                fontSize + paddingY * 2,
                fontSize * 0.2,
              );

              context.fill();

              context.fillStyle = text.color || "#FFFFFF";
            }

            context.fillText(line || " ", x, lineY);
          });

          context.restore();
        };

        const drawDoodles = () => {
          if (!Array.isArray(doodles)) return;

          doodles.forEach((stroke) => {
            if (!stroke?.points?.length) return;

            const points = stroke.points;

            context.save();

            context.strokeStyle = stroke.color || "#FFFFFF";
            context.fillStyle = stroke.color || "#FFFFFF";

            /*
             * Doodle coordinates are scaled from the
             * preview coordinate system to the real video.
             */
            const previewWidth = Math.min(window.innerWidth, 430);
            const scale = width / previewWidth;

            context.lineWidth = (stroke.size || 5) * scale;
            context.lineCap = "round";
            context.lineJoin = "round";

            if (points.length === 1) {
              const point = points[0];

              context.beginPath();
              context.arc(
                point.x * scale,
                point.y * scale,
                ((stroke.size || 5) * scale) / 2,
                0,
                Math.PI * 2,
              );
              context.fill();

              context.restore();
              return;
            }

            context.beginPath();

            context.moveTo(points[0].x * scale, points[0].y * scale);

            for (let index = 1; index < points.length; index += 1) {
              context.lineTo(points[index].x * scale, points[index].y * scale);
            }

            context.stroke();
            context.restore();
          });
        };

        const drawFrame = () => {
          if (video.ended || video.paused) {
            return;
          }

          context.drawImage(video, 0, 0, width, height);

          drawDoodles();

          texts.forEach(drawText);

          if ("requestVideoFrameCallback" in video) {
            video.requestVideoFrameCallback(drawFrame);
          } else {
            requestAnimationFrame(drawFrame);
          }
        };

        video.onended = () => {
          if (recorder.state !== "inactive") {
            recorder.stop();
          }
        };

        recorder.start();

        await video.play();

        drawFrame();
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Unable to load video for rendering."));
    };

    video.load();
  });
};

export default VideoPreview;
