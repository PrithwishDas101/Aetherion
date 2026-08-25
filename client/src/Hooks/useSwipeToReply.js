import { useRef, useState } from "react";

const SWIPE_THRESHOLD = 70;
const MAX_SWIPE_DISTANCE = 90;

const useSwipeToReply = ({ isMyMessage, onReply }) => {
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const hasTriggeredReply = useRef(false);

  const [swipeOffset, setSwipeOffset] = useState(0);

  const resetSwipe = () => {
    setSwipeOffset(0);

    startX.current = 0;
    startY.current = 0;
    isDragging.current = false;
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse") {
      return;
    }

    startX.current = event.clientX;
    startY.current = event.clientY;

    isDragging.current = true;
    hasTriggeredReply.current = false;

    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDragging.current || hasTriggeredReply.current) {
      return;
    }

    const deltaX = event.clientX - startX.current;
    const deltaY = event.clientY - startY.current;

    // User is scrolling vertically, not swiping to reply.
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    // Your message can only be swiped LEFT.
    if (isMyMessage && deltaX >= 0) {
      setSwipeOffset(0);
      return;
    }

    // Other user's message can only be swiped RIGHT.
    if (!isMyMessage && deltaX <= 0) {
      setSwipeOffset(0);
      return;
    }

    const limitedOffset = Math.min(
      Math.abs(deltaX),
      MAX_SWIPE_DISTANCE,
    );

    setSwipeOffset(isMyMessage ? -limitedOffset : limitedOffset);
  };

  const handlePointerUp = () => {
    if (!isDragging.current) {
      return;
    }

    const shouldReply =
      Math.abs(swipeOffset) >= SWIPE_THRESHOLD;

    if (shouldReply && !hasTriggeredReply.current) {
      hasTriggeredReply.current = true;

      onReply?.();
    }

    resetSwipe();
  };

  const handlePointerCancel = () => {
    resetSwipe();
  };

  return {
    swipeOffset,

    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  };
};

export default useSwipeToReply;