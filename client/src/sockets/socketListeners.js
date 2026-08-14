const registerSocketListeners = (
  socket,
  {
    onReceiveMessage,
    onTyping,
    onStopTyping,
    onMessagesRead,
    onUserOnline,
    onUserOffline,
    onPresenceState,
  } = {},
) => {
  if (!socket) {
    return () => {};
  }

  if (onReceiveMessage) {
    socket.on("receive-message", onReceiveMessage);
  }

  if (onTyping) {
    socket.on("typing", onTyping);
  }

  if (onStopTyping) {
    socket.on("stop-typing", onStopTyping);
  }

  if (onMessagesRead) {
    socket.on("messages-read", onMessagesRead);
  }

  if (onUserOnline) {
    socket.on("user-online", onUserOnline);
  }

  if (onUserOffline) {
    socket.on("user-offline", onUserOffline);
  }

  if (onPresenceState) {
    socket.on("presence-state", onPresenceState);
  }

  return () => {
    if (onReceiveMessage) {
      socket.off("receive-message", onReceiveMessage);
    }

    if (onTyping) {
      socket.off("typing", onTyping);
    }

    if (onStopTyping) {
      socket.off("stop-typing", onStopTyping);
    }

    if (onMessagesRead) {
      socket.off("messages-read", onMessagesRead);
    }

    if (onUserOnline) {
      socket.off("user-online", onUserOnline);
    }

    if (onUserOffline) {
      socket.off("user-offline", onUserOffline);
    }

    if (onPresenceState) {
      socket.off("presence-state", onPresenceState);
    }
  };
};

export default registerSocketListeners;
