import { useEffect, useRef, useState } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 8;
const SWIPE_THRESHOLD = 70;

const getDistance = (first, second) =>
  Math.hypot(second.x - first.x, second.y - first.y);

const MediaZoomSurface = ({
  children,
  className = "",
  onSwipeLeft,
  onSwipeRight,
}) => {
  const surfaceRef = useRef(null);

  const pointersRef = useRef(new Map());

  const pinchRef = useRef(null);
  const panRef = useRef(null);
  const swipeRef = useRef(null);

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
    swipeRef.current = null;

    applyTransform({
      scale: MIN_SCALE,
      x: 0,
      y: 0,
    });
  };

  /*
   * DESKTOP WHEEL ZOOM
   */

  useEffect(() => {
    const surface = surfaceRef.current;

    if (!surface) {
      return undefined;
    }

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

      const mediaX =
        (mouseX - rect.width / 2 - current.x) / current.scale;

      const mediaY =
        (mouseY - rect.height / 2 - current.y) / current.scale;

      const nextX =
        mouseX - rect.width / 2 - mediaX * nextScale;

      const nextY =
        mouseY - rect.height / 2 - mediaY * nextScale;

      applyTransform(
        clampTransform(
          nextScale,
          nextX,
          nextY,
        ),
      );
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
    if (
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    /*
     * Capture the pointer so that a swipe still finishes
     * correctly even if the finger moves outside the element.
     */

    event.currentTarget.setPointerCapture?.(
      event.pointerId,
    );

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const points = [
      ...pointersRef.current.values(),
    ];

    const current = transformRef.current;

    /*
     * ONE POINTER AT NORMAL SCALE
     *
     * Could become a swipe.
     */

    if (
      points.length === 1 &&
      current.scale === MIN_SCALE
    ) {
      swipeRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
      };

      return;
    }

    /*
     * TWO POINTERS
     *
     * Begin pinch zoom.
     */

    if (points.length === 2) {
      const [first, second] = points;

      pinchRef.current = {
        startDistance: getDistance(first, second),
        startTransform: {
          ...current,
        },
      };

      panRef.current = null;
      swipeRef.current = null;

      return;
    }

    /*
     * ONE POINTER WHILE ZOOMED
     *
     * Pan the media instead of swiping.
     */

    if (
      points.length === 1 &&
      current.scale > MIN_SCALE
    ) {
      panRef.current = {
        pointerId: event.pointerId,
        startPointer: points[0],
        startTransform: {
          ...current,
        },
      };

      swipeRef.current = null;
    }
  };

  /*
   * POINTER MOVE
   */

  const handlePointerMove = (event) => {
    if (
      !pointersRef.current.has(event.pointerId)
    ) {
      return;
    }

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const points = [
      ...pointersRef.current.values(),
    ];

    /*
     * PINCH ZOOM
     */

    if (
      points.length === 2 &&
      pinchRef.current
    ) {
      const [first, second] = points;

      const currentDistance = getDistance(
        first,
        second,
      );

      if (
        !currentDistance ||
        !pinchRef.current.startDistance
      ) {
        return;
      }

      const zoomRatio =
        currentDistance /
        pinchRef.current.startDistance;

      const nextScale = Math.max(
        MIN_SCALE,
        Math.min(
          MAX_SCALE,
          pinchRef.current.startTransform.scale *
            zoomRatio,
        ),
      );

      applyTransform(
        clampTransform(
          nextScale,
          pinchRef.current.startTransform.x,
          pinchRef.current.startTransform.y,
        ),
      );

      return;
    }

    /*
     * PAN ZOOMED MEDIA
     */

    if (
      points.length === 1 &&
      panRef.current
    ) {
      const point = points[0];

      const deltaX =
        point.x -
        panRef.current.startPointer.x;

      const deltaY =
        point.y -
        panRef.current.startPointer.y;

      applyTransform(
        clampTransform(
          panRef.current.startTransform.scale,
          panRef.current.startTransform.x +
            deltaX,
          panRef.current.startTransform.y +
            deltaY,
        ),
      );
    }
  };

  /*
   * POINTER END
   */

  const handlePointerEnd = (event) => {
    const swipe = swipeRef.current;
    const current = transformRef.current;

    /*
     * IMPORTANT:
     *
     * Calculate the swipe BEFORE removing the pointer.
     *
     * The old implementation depended on
     * pointersRef.current.size === 1 in a way that could
     * fail depending on pointer event ordering.
     */

    if (
      swipe &&
      swipe.pointerId === event.pointerId &&
      current.scale === MIN_SCALE &&
      pointersRef.current.size === 1
    ) {
      const deltaX =
        event.clientX - swipe.startX;

      const deltaY =
        event.clientY - swipe.startY;

      const isHorizontalSwipe =
        Math.abs(deltaX) >= SWIPE_THRESHOLD &&
        Math.abs(deltaX) >
          Math.abs(deltaY);

      if (isHorizontalSwipe) {
        if (deltaX < 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }
    }

    /*
     * Now remove the finished pointer.
     */

    pointersRef.current.delete(
      event.pointerId,
    );

    try {
      event.currentTarget.releasePointerCapture?.(
        event.pointerId,
      );
    } catch {
      /*
       * Pointer may already have been released.
       */
    }

    swipeRef.current = null;

    const points = [
      ...pointersRef.current.values(),
    ];

    /*
     * Pinch ends when fewer than two pointers remain.
     */

    if (points.length < 2) {
      pinchRef.current = null;
    }

    /*
     * If one finger remains after pinch zoom,
     * allow that finger to continue panning.
     */

    if (
      points.length === 1 &&
      transformRef.current.scale > MIN_SCALE
    ) {
      panRef.current = {
        pointerId: null,
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
   * DOUBLE CLICK / DOUBLE TAP
   */

  const handleDoubleClick = () => {
    if (
      transformRef.current.scale >
      MIN_SCALE
    ) {
      resetZoom();
      return;
    }

    applyTransform({
      scale: 2.5,
      x: 0,
      y: 0,
    });
  };

  return (
    <div
      ref={surfaceRef}
      className={`absolute inset-0 overflow-hidden select-none ${className}`}
      style={{
        touchAction: "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className="absolute inset-0 h-full w-full will-change-transform"
        style={{
          transform: `
            translate3d(
              ${transform.x}px,
              ${transform.y}px,
              0
            )
            scale(${transform.scale})
          `,
          transformOrigin:
            "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MediaZoomSurface;