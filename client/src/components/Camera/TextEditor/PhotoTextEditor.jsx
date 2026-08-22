import { useEffect, useRef, useState } from "react";
import {
  FiAlignCenter,
  FiAlignLeft,
  FiAlignRight,
  FiCheck,
  FiSettings,
} from "react-icons/fi";

const TEXT_COLORS = [
  "#FFFFFF",
  "#000000",
  "#FF3B30",
  "#FF9500",
  "#FFCC00",
  "#34C759",
  "#00C7BE",
  "#32ADE6",
  "#007AFF",
  "#5856D6",
  "#AF52DE",
  "#FF2D55",
];

const TEXT_FONTS = [
  {
    id: "sans",
    label: "Sans",
    className: "font-sans",
  },
  {
    id: "serif",
    label: "Serif",
    className: "font-serif",
  },
  {
    id: "mono",
    label: "Mono",
    className: "font-mono",
  },
  {
    id: "italic",
    label: "Italic",
    className: "font-sans italic",
  },
  {
    id: "bold",
    label: "Bold",
    className: "font-sans font-black",
  },
  {
    id: "slab",
    label: "Slab",
    className: "font-serif font-bold",
  },
  {
    id: "wide",
    label: "Wide",
    className: "font-sans tracking-[0.12em]",
  },
];

const BACKGROUNDS = [
  {
    id: "none",
    color: "transparent",
  },
  {
    id: "white",
    color: "#FFFFFF",
  },
  {
    id: "black",
    color: "#000000",
  },
  {
    id: "transparent",
    color: "rgba(0,0,0,0.45)",
  },
];

const createText = () => ({
  id: `${Date.now()}-${Math.random()}`,
  text: "",
  color: "#FF3B30",
  hasCustomColor: false,
  font: "sans",
  alignment: "center",
  background: "none",
  x: 50,
  y: 50,
});

const getFontClass = (font) => {
  return TEXT_FONTS.find((item) => item.id === font)?.className || "font-sans";
};

const getBackgroundColor = (background) => {
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

const PhotoTextEditor = ({
  texts = [],
  editingTextId = null,
  onChange,
  onDone,
}) => {
  const [localTexts, setLocalTexts] = useState(texts);
  const [activeTextId, setActiveTextId] = useState(null);

  const inputRef = useRef(null);
  const measureRef = useRef(null);

  // use incoming text or create new text object
  useEffect(() => {
    if (editingTextId) {
      setLocalTexts(texts);

      const textToEdit = texts.find((text) => text.id === editingTextId);

      if (textToEdit) {
        setActiveTextId(textToEdit.id);
      }

      return;
    }

    const newText = createText();

    setLocalTexts((previous) => [...previous, newText]);
    setActiveTextId(newText.id);
  }, [editingTextId]);

  // sending changes back to photo preview
  useEffect(() => {
    onChange?.(localTexts);
  }, [localTexts, onChange]);

  // focus on active texts

  useEffect(() => {
    if (!activeTextId) return;

    requestAnimationFrame(() => {
      inputRef.current?.focus();

      if (editingTextId) {
        inputRef.current?.select();
      }
    });
  }, [activeTextId, editingTextId]);

  const activeText = localTexts.find((text) => text.id === activeTextId);

  // text area
  useEffect(() => {
    const textarea = inputRef.current;
    const measure = measureRef.current;

    if (!textarea || !measure || !activeText) return;

    const lines = activeText.text.split("\n");

    const longestLine =
      lines.reduce(
        (longest, line) => (line.length > longest.length ? line : longest),
        "",
      ) || " ";

    measure.textContent = longestLine;

    const measuredWidth = Math.ceil(measure.scrollWidth);

    const nextWidth = Math.max(40, measuredWidth + 2);

    textarea.style.width = `${nextWidth}px`;

    textarea.style.height = "0px";

    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [activeText?.text, activeText?.font, activeText?.alignment, activeTextId]);

  // updating a created text

  const updateText = (id, changes) => {
    setLocalTexts((previous) =>
      previous.map((text) =>
        text.id === id
          ? {
              ...text,
              ...changes,
            }
          : text,
      ),
    );
  };

  // selecting existing texts

  const selectText = (text) => {
    setActiveTextId(text.id);
  };

  // color picker management
  const handleColorChange = (color) => {
    if (!activeTextId) return;

    updateText(activeTextId, {
      color,
      hasCustomColor: true,
    });
  };

  // Font management
  const handleFontChange = (font) => {
    if (!activeTextId) return;

    updateText(activeTextId, {
      font,
    });
  };

  // alignment management
  const handleAlignmentChange = () => {
    if (!activeText) return;

    let next = "center";

    if (activeText.alignment === "center") {
      next = "left";
    } else if (activeText.alignment === "left") {
      next = "right";
    }

    updateText(activeText.id, {
      alignment: next,
    });
  };

  // background management
  const handleBackgroundChange = () => {
    if (!activeText) return;

    const currentIndex = BACKGROUNDS.findIndex(
      (item) => item.id === activeText.background,
    );

    const nextIndex =
      currentIndex < 0 ? 0 : (currentIndex + 1) % BACKGROUNDS.length;

    const nextBackground = BACKGROUNDS[nextIndex].id;

    const changes = {
      background: nextBackground,
    };

    // automatic color change when user picks a color
    if (!activeText.hasCustomColor) {
      if (nextBackground === "black") {
        changes.color = "#FFFFFF";
      } else if (nextBackground === "white") {
        changes.color = "#000000";
      } else {
        changes.color = "#FF3B30";
      }
    }

    updateText(activeText.id, changes);
  };

  // editing text, items can't be dragged, dragging happens after creating text
  const handlePointerDown = (event, text) => {
    event.preventDefault();
    event.stopPropagation();

    selectText(text);
  };

  // alignment icon
  const alignmentIcon =
    activeText?.alignment === "left" ? (
      <FiAlignLeft className="text-[21px]" />
    ) : activeText?.alignment === "right" ? (
      <FiAlignRight className="text-[21px]" />
    ) : (
      <FiAlignCenter className="text-[21px]" />
    );

  // done
  const handleDone = () => {
    const cleanedTexts = localTexts.filter(
      (text) => text.text.trim().length > 0,
    );

    onDone?.(cleanedTexts);
  };

  return (
    <div
      data-photo-editor
      className="
        absolute
        inset-0
        z-[60]
        touch-none
      "
    >
      {/* TOP TOOLBAR*/}
      <div className=" absolute inset-x-0 top-0 z-[90] flex h-11 items-center justify-center px-4 pt-[max(12px,env(safe-area-inset-top))] box-content">
        {/* ALIGNMENT */}
        <button
          type="button"
          onClick={handleAlignmentChange}
          className=" absolute left-1/2 -translate-x-[58px] flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white shadow-lg backdrop-blur-xl transition active:scale-95"
          aria-label="Change text alignment"
        >
          {alignmentIcon}
        </button>

        {/* BACKGROUND */}
        <button
          type="button"
          onClick={handleBackgroundChange}
          className=" absolute left-1/2 translate-x-[14px] flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white shadow-lg backdrop-blur-xl transition active:scale-95"
          aria-label="Change text background"
        >
          <FiSettings className="block h-5 w-5 border-2 border-white" />
        </button>

        {/* DONE */}
        <button
          type="button"
          onClick={handleDone}
          className=" absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white shadow-lg backdrop-blur-xl transition active:scale-95"
          aria-label="Done"
        >
          <FiCheck className="text-[23px]" />
        </button>
      </div>

      {/* TEXT OBJECTS */}

      {localTexts.map((text) => {
        const fontClass = getFontClass(text.font);

        const isActive = text.id === activeTextId;

        return (
          <div
            key={text.id}
            className=" absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${text.x}%`,
              top: `${text.y}%`,
            }}
          >
            {isActive ? (
              <div className=" relative inline-block">
                {/* VISUAL TEXT COVER */}

                <div
                  aria-hidden="true"
                  className={` pointer-events-none absolute inset-0 z-0 text-[30px] leading-tight whitespace-pre drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]
                     ${fontClass} `}
                  style={{
                    color: text.color,
                    textAlign: text.alignment,
                  }}
                >
                  {text.text.split("\n").map((line, index, lines) => {
                    const isLastLine = index === lines.length - 1;

                    return (
                      <span key={`${text.id}-edit-${index}`}>
                        {line ? (
                          <span
                            style={{
                              display: "inline",
                              backgroundColor:
                                text.background === "none"
                                  ? "transparent"
                                  : getBackgroundColor(text.background),
                              padding:
                                text.background === "none" ? "0" : "3px 8px",
                              borderRadius:
                                text.background === "none" ? "0" : "6px",
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

                {/* HIDDEN WIDTH MEASUREMENT */}

                <span
                  ref={isActive ? measureRef : null}
                  aria-hidden="true"
                  className={` invisible absolute left-0 top-0 z-[-1] whitespace-pre text-[30px] leading-tight 
                    ${fontClass} `}
                />

                {/* REAL TEXTAREA */}

                <textarea
                  ref={isActive ? inputRef : null}
                  value={text.text}
                  onChange={(event) => {
                    updateText(text.id, {
                      text: event.target.value,
                    });
                  }}
                  placeholder="Add text..."
                  rows={1}
                  wrap="off"
                  className={` relative z-10 block min-w-[40px] resize-none overflow-hidden border-0 bg-transparent p-0 text-[30px] leading-tight whitespace-pre outline-none caret-white placeholder:text-[#eef1f133] drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]
                    ${fontClass} `}
                  style={{
                    color: "transparent",
                    caretColor: text.color,
                    textAlign: text.alignment,
                    whiteSpace: "pre",
                    overflowWrap: "normal",
                    wordBreak: "normal",
                  }}
                />
              </div>
            ) : (
              <button
                type="button"
                onPointerDown={(event) => handlePointerDown(event, text)}
                className=" block cursor-text select-none border-0 bg-transparent p-0 outline-none shadow-none ring-0 "
              >
                <div
                  className={` whitespace-pre text-[30px] leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] 
                    ${fontClass} `}
                  style={{
                    color: text.color,
                    textAlign: text.alignment,
                  }}
                >
                  {text.text.split("\n").map((line, index, lines) => {
                    const isLastLine = index === lines.length - 1;

                    return (
                      <span key={`${text.id}-inactive-${index}`}>
                        {line ? (
                          <span
                            style={{
                              display: "inline",
                              backgroundColor:
                                text.background === "none"
                                  ? "transparent"
                                  : getBackgroundColor(text.background),
                              padding:
                                text.background === "none" ? "0" : "3px 8px",
                              borderRadius:
                                text.background === "none" ? "0" : "6px",
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
            )}
          </div>
        );
      })}

      {/* COLOR PICKER */}

      <div className=" absolute right-4 top-1/2 z-[85] flex -translate-y-1/2 flex-col items-center gap-2 rounded-full bg-black/45 p-2 shadow-xl backdrop-blur-xl ">
        {TEXT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => handleColorChange(color)}
            className={` h-6 w-6 rounded-full border-2 transition active:scale-90
              ${
                activeText?.color === color
                  ? "scale-110 border-white"
                  : "border-white/30"
              }`}
            style={{
              backgroundColor: color,
            }}
            aria-label={`Text color ${color}`}
          />
        ))}
      </div>

      {/* FONT STRIP */}

      <div className=" absolute inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] z-[85] overflow-hidden px-4 ">
        <div className=" mx-auto max-w-xl overflow-x-auto scrollbar-none">
          <div className=" flex w-max min-w-full justify-center gap-2 pb-1 ">
            {TEXT_FONTS.map((font) => (
              <button
                key={font.id}
                type="button"
                onClick={() => handleFontChange(font.id)}
                className={` shrink-0 rounded-full px-4 py-2 text-sm transition active:scale-95
                  ${
                    activeText?.font === font.id
                      ? "bg-white text-black"
                      : "bg-black/55 text-white/75 backdrop-blur-xl"
                  }
                  ${font.className}`}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoTextEditor;
