const joinRoom = (socket, userId) => {
  if (!socket || !userId) {
    return;
  }

  socket.emit("join-room", String(userId));
};

const sendMessage = (socket, { message, chat, members }) => {
  if (!socket) {
    return;
  }

  socket.emit("send-message", {
    message,
    chat,
    members,
  });
};

const sendMessageChanged = (socket, { messageId, chatId, action }) => {
  if (!socket || !messageId || !chatId || !action) return;
  socket.emit("message-changed", { messageId, chatId, action });
};

const sendTyping = (socket, { sender, chatId, members }) => {
  if (!socket) {
    return;
  }

  socket.emit("typing", {
    sender,
    chatId,
    members,
  });
};

const sendStopTyping = (socket, { sender, chatId, members }) => {
  if (!socket) {
    return;
  }

  socket.emit("stop-typing", {
    sender,
    chatId,
    members,
  });
};

const getPresence = (socket) => {
  if (!socket) {
    return;
  }

  socket.emit("get-presence");
};

const sendPollUpdate = (socket, { poll, chatId, sender, members }) => {
  if (!socket || !poll?._id || !chatId || !sender || !Array.isArray(members)) {
    return;
  }

  socket.emit("poll-updated", {
    poll,
    chatId,
    sender,
    members,
  });
};

export { joinRoom, sendMessage, sendMessageChanged, sendTyping, sendStopTyping, getPresence, sendPollUpdate };
