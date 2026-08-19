import { useEffect, useRef, useState } from "react";
import {
  FiAlignCenter,
  FiAlignLeft,
  FiAlignRight,
  FiCheck,
  FiPlus,
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
  {
    id: "none",
    color: "transparent",
  },
];

const createText = () => ({
  id: `${Date.now()}-${Math.random()}`,
  text: "",
  color: "#FFFFFF",
  font: "sans",
  alignment: "center",
  background: "none",
  x: 50,
  y: 50,
});

const getFontClass = (font) => {
  return TEXT_FONTS.find((item) => item.id === font)?.className || "font-sans";
};

const PhotoTextEditor = ({ texts = [], onChange, onDone, onClose }) => {
  const [localTexts, setLocalTexts] = useState(texts);

  const [activeTextId, setActiveTextId] = useState(null);

  const [inputValue, setInputValue] = useState("");

  const [draggingId, setDraggingId] = useState(null);

  const inputRef = useRef(null);

  /*
   * IMPORTANT:
   *
   * We only sync incoming texts when the
   * editor opens with them.
   *
   * We do NOT reset them every render.
   */

  useEffect(() => {
    setLocalTexts(texts);

    /*
     * If there are existing texts, select the
     * last one so T immediately gives the user
     * something to edit.
     */

    if (texts.length > 0) {
      const last = texts[texts.length - 1];

      setActiveTextId(last.id);
      setInputValue(last.text);
    } else {
      const first = createText();

      setLocalTexts([first]);
      setActiveTextId(first.id);
      setInputValue("");
    }
  }, []);

  /*
   * SEND CHANGES TO PHOTO PREVIEW
   */

  useEffect(() => {
    onChange?.(localTexts);
  }, [localTexts, onChange]);

  /*
   * FOCUS INPUT WHEN TEXT IS SELECTED
   */

  useEffect(() => {
    if (!activeTextId) return;

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [activeTextId]);

  /*
   * GET ACTIVE TEXT
   */

  const activeText = localTexts.find((text) => text.id === activeTextId);

  /*
   * UPDATE ONE TEXT
   */

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

  /*
   * SELECT EXISTING TEXT
   */

  const selectText = (text) => {
    setActiveTextId(text.id);
    setInputValue(text.text);
  };

  /*
   * ADD NEW TEXT
   */

  const handleAddText = () => {
    const newText = createText();

    setLocalTexts((previous) => [...previous, newText]);

    setActiveTextId(newText.id);
    setInputValue("");
  };

  /*
   * TEXT INPUT
   */

  const handleInputChange = (event) => {
    const value = event.target.value;

    setInputValue(value);

    if (!activeTextId) return;

    updateText(activeTextId, {
      text: value,
    });
  };

  /*
   * COLOR
   */

  const handleColorChange = (color) => {
    if (!activeTextId) return;

    updateText(activeTextId, {
      color,
    });
  };

  /*
   * FONT
   */

  const handleFontChange = (font) => {
    if (!activeTextId) return;

    updateText(activeTextId, {
      font,
    });
  };

  /*
   * ALIGNMENT
   *
   * CENTER → LEFT → RIGHT → CENTER
   */

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

  /*
   * BACKGROUND
   *
   * NONE → WHITE → BLACK → TRANSPARENT → NONE
   */

  const handleBackgroundChange = () => {
    if (!activeText) return;

    const currentIndex = BACKGROUNDS.findIndex(
      (item) => item.id === activeText.background,
    );

    const nextIndex =
      currentIndex < 0 ? 0 : (currentIndex + 1) % BACKGROUNDS.length;

    updateText(activeText.id, {
      background: BACKGROUNDS[nextIndex].id,
    });
  };

  /*
   * DRAG START
   */

  const handlePointerDown = (event, text) => {
    event.preventDefault();
    event.stopPropagation();

    selectText(text);

    event.currentTarget.setPointerCapture?.(event.pointerId);

    setDraggingId(text.id);
  };

  /*
   * DRAG
   */

  const handlePointerMove = (event) => {
    if (!draggingId) return;

    const editor = event.currentTarget.closest("[data-photo-editor]");

    if (!editor) return;

    const rect = editor.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;

    const y = ((event.clientY - rect.top) / rect.height) * 100;

    updateText(draggingId, {
      x: Math.min(92, Math.max(8, x)),
      y: Math.min(88, Math.max(8, y)),
    });
  };

  const handlePointerUp = () => {
    setDraggingId(null);
  };

  /*
   * ALIGNMENT ICON
   */

  const alignmentIcon =
    activeText?.alignment === "left" ? (
      <FiAlignLeft className="text-[21px]" />
    ) : activeText?.alignment === "right" ? (
      <FiAlignRight className="text-[21px]" />
    ) : (
      <FiAlignCenter className="text-[21px]" />
    );

  /*
   * BACKGROUND BUTTON PREVIEW
   */

  const backgroundId = activeText?.background || "none";

  const background =
    BACKGROUNDS.find((item) => item.id === backgroundId) || BACKGROUNDS[3];

  /*
   * DONE
   *
   * Remove empty text objects but
   * preserve EVERYTHING that has text.
   */

  const handleDone = () => {
    const cleanedTexts = localTexts.filter(
      (text) => text.text.trim().length > 0,
    );

    setLocalTexts(cleanedTexts);

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
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* =====================================================
          TOP TOOLBAR

          SAME TOP PADDING AS THE CLOSE BUTTON.
          ===================================================== */}

      <div
        className="
          absolute
          inset-x-0
          top-0
          z-[90]
          flex
          h-11
          items-center
          justify-center
          px-4
          pt-[max(12px,env(safe-area-inset-top))]
          box-content
        "
      >
        {/* ALIGNMENT */}

        <button
          type="button"
          onClick={handleAlignmentChange}
          className="
            absolute
            left-1/2
            -translate-x-[58px]
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            bg-black/40
            text-white
            shadow-lg
            backdrop-blur-xl
            transition
            active:scale-95
          "
          aria-label="Change text alignment"
        >
          {alignmentIcon}
        </button>

        {/* BACKGROUND */}

        <button
          type="button"
          onClick={handleBackgroundChange}
          className="
            absolute
            left-1/2
            translate-x-[14px]
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            bg-black/40
            text-white
            shadow-lg
            backdrop-blur-xl
            transition
            active:scale-95
          "
          aria-label="Change text background"
        >
          <span
            className="
              block
              h-5
              w-5
              rounded-md
            "
            style={{
              backgroundColor: background.color,
              boxShadow:
                backgroundId === "none"
                  ? "inset 0 0 0 1px rgba(255,255,255,0.5)"
                  : "none",
            }}
          />
        </button>

        {/* TICK */}

        <button
          type="button"
          onClick={handleDone}
          className="
            absolute
            right-4
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            bg-black/40
            text-white
            shadow-lg
            backdrop-blur-xl
            transition
            active:scale-95
          "
          aria-label="Done"
        >
          <FiCheck className="text-[23px]" />
        </button>
      </div>

      {/* =====================================================
          TEXT OBJECTS
          ===================================================== */}

      {localTexts.map((text) => {
        const fontClass = getFontClass(text.font);

        const background = BACKGROUNDS.find(
          (item) => item.id === text.background,
        );

        const isActive = text.id === activeTextId;

        return (
          <div
            key={text.id}
            className="
              absolute
              -translate-x-1/2
              -translate-y-1/2
            "
            style={{
              left: `${text.x}%`,
              top: `${text.y}%`,
            }}
          >
            <button
              type="button"
              onPointerDown={(event) => handlePointerDown(event, text)}
              className={`
                block
                max-w-[82vw]
                cursor-grab
                select-none
                border-0
                p-0
                outline-none
                active:cursor-grabbing
                ${
                  isActive
                    ? "ring-1 ring-white/20 ring-offset-2 ring-offset-transparent"
                    : ""
                }
              `}
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

                  backgroundColor: background?.color || "transparent",

                  textAlign: text.alignment,

                  /*
                   * IMPORTANT:
                   * This prevents a full-width rectangular
                   * background. The background belongs to
                   * the inline text itself.
                   */
                  boxDecorationBreak: "clone",
                  WebkitBoxDecorationBreak: "clone",
                }}
              >
                {text.text || "Type something..."}
              </span>
            </button>
          </div>
        );
      })}

      {/* =====================================================
          COLOR PICKER
          ===================================================== */}

      <div
        className="
          absolute
          right-4
          top-1/2
          z-[85]
          flex
          -translate-y-1/2
          flex-col
          items-center
          gap-2
          rounded-full
          bg-black/45
          p-2
          shadow-xl
          backdrop-blur-xl
        "
      >
        {TEXT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => handleColorChange(color)}
            className={`
                h-6
                w-6
                rounded-full
                border-2
                transition
                active:scale-90
                ${
                  activeText?.color === color
                    ? "scale-110 border-white"
                    : "border-white/30"
                }
              `}
            style={{
              backgroundColor: color,
            }}
            aria-label={`Text color ${color}`}
          />
        ))}
      </div>

      {/* =====================================================
          TEXT INPUT / ADD TEXT
          ===================================================== */}

      <div
        className="
          absolute
          inset-x-0
          bottom-[116px]
          z-[85]
          px-3
        "
      >
        <div
          className="
            mx-auto
            flex
            w-full
            max-w-xl
            items-center
            gap-2
          "
        >
          {/* INPUT */}

          <div
            className="
              min-w-0
              flex-1
              rounded-2xl
              border
              border-white/10
              bg-black/55
              px-4
              py-2.5
              shadow-2xl
              backdrop-blur-xl
            "
          >
            <input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Add text..."
              className="
                block
                h-9
                w-full
                bg-transparent
                text-center
                text-[16px]
                text-white
                outline-none
                placeholder:text-white/45
              "
            />
          </div>

          {/* ADD TEXT */}

          <button
            type="button"
            onClick={handleAddText}
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-black/55
              text-white
              shadow-xl
              backdrop-blur-xl
              transition
              active:scale-95
            "
            aria-label="Add another text"
          >
            <FiPlus className="text-[22px]" />
          </button>
        </div>
      </div>

      {/* =====================================================
          FONT STRIP

          HORIZONTAL SCROLL = MORE FONTS.
          ===================================================== */}

      <div
        className="
          absolute
          inset-x-0
          bottom-[60px]
          z-[85]
          overflow-hidden
          px-4
        "
      >
        <div
          className="
            mx-auto
            max-w-xl
            overflow-x-auto
            scrollbar-none
          "
        >
          <div
            className="
              flex
              w-max
              min-w-full
              justify-center
              gap-2
              pb-1
            "
          >
            {TEXT_FONTS.map((font) => (
              <button
                key={font.id}
                type="button"
                onClick={() => handleFontChange(font.id)}
                className={`
                    shrink-0
                    rounded-full
                    px-4
                    py-2
                    text-sm
                    transition
                    active:scale-95
                    ${
                      activeText?.font === font.id
                        ? "bg-white text-black"
                        : "bg-black/55 text-white/75 backdrop-blur-xl"
                    }
                    ${font.className}
                  `}
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
