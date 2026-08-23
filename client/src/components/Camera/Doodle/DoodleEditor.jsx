import { useState } from "react";

import DoodleCanvas from "./DoodleCanvas.jsx";
import DoodleControls from "./DoodleControls.jsx";

import {
  DEFAULT_BRUSH_SIZE,
  DEFAULT_DOODLE_COLOR,
} from "./doodleConstants.js";

const DoodleEditor = ({
  doodles = [],
  onChange,
  onDone,
}) => {
  const [activeColor, setActiveColor] = useState(
    DEFAULT_DOODLE_COLOR,
  );

  const [activeBrushSize, setActiveBrushSize] = useState(
    DEFAULT_BRUSH_SIZE,
  );

  const handleDoodlesChange = (updatedDoodles) => {
    onChange?.(updatedDoodles);
  };

  const handleDone = () => {
    onDone?.();
  };

  return (
    <div className="absolute inset-0 z-[60] touch-none">
      {/* Doodle drawing layer */}
      <DoodleCanvas
        doodles={doodles}
        activeColor={activeColor}
        activeBrushSize={activeBrushSize}
        onChange={handleDoodlesChange}
      />

      {/* Doodle controls */}
      <DoodleControls
        activeColor={activeColor}
        activeBrushSize={activeBrushSize}
        onColorChange={setActiveColor}
        onBrushSizeChange={setActiveBrushSize}
        onDone={handleDone}
      />
    </div>
  );
};

export default DoodleEditor;