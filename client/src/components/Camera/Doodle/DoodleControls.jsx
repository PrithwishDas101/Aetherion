import { FiCheck, FiEdit3 } from "react-icons/fi";

import { BRUSH_SIZES, DOODLE_COLORS } from "./doodleConstants.js";

const DoodleControls = ({
  activeColor,
  activeBrushSize,
  onColorChange,
  onBrushSizeChange,
  onDone,
}) => {
  return (
    <>
      {/* Top controls */}
      <div className="absolute inset-x-0 top-0 z-30 flex h-11 items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))] box-content">
        <button
          type="button"
          onClick={onDone}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white shadow-lg backdrop-blur-xl transition active:scale-95"
          aria-label="Done doodling"
        >
          <FiCheck className="text-[23px]" />
        </button>

        <div
          className="flex h-11 w-11 items-center justify-center rounded-full shadow-lg backdrop-blur-xl"
          style={{
            backgroundColor: activeColor,
          }}
        >
          <FiEdit3 className="text-[21px] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
        </div>
      </div>

      {/* Vertical color picker */}
      <div className="absolute right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2 rounded-full bg-black/45 p-2 shadow-xl backdrop-blur-xl">
        {DOODLE_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorChange(color)}
            className={`h-6 w-6 rounded-full border-2 transition active:scale-90 ${activeColor === color ? "scale-110 border-white" : "border-white/30"}`}
            style={{
              backgroundColor: color,
            }}
            aria-label={`Select doodle color ${color}`}
          />
        ))}
      </div>

      {/* Brush thickness controls */}
      <div className="absolute inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] z-30 flex justify-center px-4">
        <div className="flex items-center gap-3 rounded-full bg-black/45 px-4 py-3 shadow-xl backdrop-blur-xl">
          {BRUSH_SIZES.map((brush) => {
            const isActive = activeBrushSize === brush.size;

            return (
              <button
                key={brush.id}
                type="button"
                onClick={() => onBrushSizeChange(brush.size)}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition active:scale-90 ${isActive ? "bg-white/20 ring-2 ring-white" : "bg-white/5"}`}
                aria-label={`Select ${brush.label} brush`}
              >
                <span
                  className="rounded-full bg-white"
                  style={{
                    width: `${Math.max(brush.size, 4)}px`,
                    height: `${Math.max(brush.size, 4)}px`,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default DoodleControls;
