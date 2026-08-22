import { useEffect, useRef, useState } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 8;

const getDistance = (first, second) =>
  Math.hypot(second.x - first.x, second.y - first.y);

const MediaZoomSurface = ({ children, className = "" }) => {
  const surfaceRef = useRef(null);

  const pointersRef = useRef(new Map());
  const pinchRef = useRef(null);
  const panRef = useRef(null);

  const transformRef = useRef({
    scale: MIN_SCALE,
    x: 0,
    y: 0,
  });

  const [transform, setTransform] = useState(transformRef.current);

  const applyTransform = (nextTransform) => {
    transformRef.current = nextTransform;
    setTransform(nextTransform);
  };

  const clampTransform = (scale, x, y) => {
    const surface = surfaceRef.current;

    if (!surface || scale <= MIN_SCALE) {
      return {
        scale: MIN_SCALE,
        x: 0,
        y: 0,
      };
    }

    const rect = surface.getBoundingClientRect();

    const maxX = ((scale - 1) * rect.width) / 2;
    const maxY = ((scale - 1) * rect.height) / 2;

    return {
      scale,
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  const resetZoom = () => {
    pointersRef.current.clear();
    pinchRef.current = null;
    panRef.current = null;

    applyTransform({
      scale: MIN_SCALE,
      x: 0,
      y: 0,
    });
  };

  /*
   * DESKTOP WHEEL ZOOM
   *
   * Native listener is used with passive: false.
   * React's onWheel is not reliable enough here because
   * we need preventDefault() to stop page-level scrolling.
   */
  useEffect(() => {
    const surface = surfaceRef.current;

    if (!surface) return undefined;

    const handleWheel = (event) => {
      event.preventDefault();

      const rect = surface.getBoundingClientRect();
      const current = transformRef.current;

      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const zoomFactor = event.deltaY < 0 ? 1.035 : 0.965;

      const nextScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, current.scale * zoomFactor),
      );

      if (nextScale === MIN_SCALE) {
        applyTransform({
          scale: MIN_SCALE,
          x: 0,
          y: 0,
        });

        return;
      }

      /*
       * Zoom towards the actual cursor position.
       *
       * Convert the cursor into a point relative to
       * the transformed media, then preserve that point.
       */
      const mediaX = (mouseX - rect.width / 2 - current.x) / current.scale;

      const mediaY = (mouseY - rect.height / 2 - current.y) / current.scale;

      const nextX = mouseX - rect.width / 2 - mediaX * nextScale;

      const nextY = mouseY - rect.height / 2 - mediaY * nextScale;

      applyTransform(clampTransform(nextScale, nextX, nextY));
    };

    surface.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      surface.removeEventListener("wheel", handleWheel);
    };
  }, []);

  /*
   * POINTER DOWN
   */
  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture?.(event.pointerId);

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const points = [...pointersRef.current.values()];
    const current = transformRef.current;

    /*
     * TWO POINTERS = PINCH ZOOM
     */
    if (points.length === 2) {
      const [first, second] = points;

      pinchRef.current = {
        startDistance: getDistance(first, second),
        startTransform: { ...current },
      };

      panRef.current = null;

      return;
    }

    /*
     * ONE POINTER + ZOOMED = PAN
     */
    if (points.length === 1 && current.scale > MIN_SCALE) {
      panRef.current = {
        startPointer: points[0],
        startTransform: { ...current },
      };
    }
  };

  /*
   * POINTER MOVE
   */
  const handlePointerMove = (event) => {
    if (!pointersRef.current.has(event.pointerId)) {
      return;
    }

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const points = [...pointersRef.current.values()];

    /*
     * PINCH
     */
    if (points.length === 2 && pinchRef.current) {
      const [first, second] = points;

      const currentDistance = getDistance(first, second);

      if (!currentDistance || !pinchRef.current.startDistance) {
        return;
      }

      const current = transformRef.current;

      const zoomRatio = currentDistance / pinchRef.current.startDistance;

      const nextScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, pinchRef.current.startTransform.scale * zoomRatio),
      );

      applyTransform(clampTransform(nextScale, current.x, current.y));

      return;
    }

    /*
     * PAN
     */
    if (points.length === 1 && panRef.current) {
      const point = points[0];

      const deltaX = point.x - panRef.current.startPointer.x;

      const deltaY = point.y - panRef.current.startPointer.y;

      applyTransform(
        clampTransform(
          panRef.current.startTransform.scale,
          panRef.current.startTransform.x + deltaX,
          panRef.current.startTransform.y + deltaY,
        ),
      );
    }
  };

  /*
   * POINTER UP / CANCEL
   */
  const handlePointerEnd = (event) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    pointersRef.current.delete(event.pointerId);

    const points = [...pointersRef.current.values()];

    if (points.length < 2) {
      pinchRef.current = null;
    }

    if (points.length === 1 && transformRef.current.scale > MIN_SCALE) {
      panRef.current = {
        startPointer: points[0],
        startTransform: {
          ...transformRef.current,
        },
      };
    } else if (points.length === 0) {
      panRef.current = null;
    }
  };

  /*
   * DOUBLE CLICK / DOUBLE TAP RESET
   */
  const handleDoubleClick = () => {
    resetZoom();
  };

  return (
    <div
      ref={surfaceRef}
      className={`absolute inset-0 overflow-hidden touch-none select-none ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className="absolute inset-0 h-full w-full will-change-transform"
        style={{
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MediaZoomSurface;
