import Chat from "../models/Chat.js";

const getChatForUser = async (chatId, userId) => {
  if (!chatId || !userId) {
    return null;
  }

  return Chat.findOne({
    _id: chatId,
    members: userId,
  }).lean();
};

const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    socket.on("send-message", async ({ message, chat }) => {
      try {
        const chatId = chat?._id || message?.chatId;

        if (!message || !chatId) {
          return;
        }

        const authorizedChat = await getChatForUser(chatId, userId);

        if (!authorizedChat) {
          return;
        }

        const recipients = authorizedChat.members || [];

        const safeMessage = {
          ...message,
          sender: userId,
        };

        recipients.forEach((memberId) => {
          if (String(memberId) !== userId) {
            socket.to(String(memberId)).emit("receive-message", {
              message: safeMessage,
              chat,
            });
          }
        });
      } catch (error) {
        console.error("Socket send-message error:", error.message);
      }
    });

    socket.on("typing", async ({ chatId }) => {
      try {
        if (!chatId) {
          return;
        }

        const authorizedChat = await getChatForUser(chatId, userId);

        if (!authorizedChat) {
          return;
        }

        authorizedChat.members.forEach((memberId) => {
          if (String(memberId) !== userId) {
            socket.to(String(memberId)).emit("typing", {
              sender: userId,
              chatId,
            });
          }
        });
      } catch (error) {
        console.error("Socket typing error:", error.message);
      }
    });

    socket.on("stop-typing", async ({ chatId }) => {
      try {
        if (!chatId) {
          return;
        }

        const authorizedChat = await getChatForUser(chatId, userId);

        if (!authorizedChat) {
          return;
        }

        authorizedChat.members.forEach((memberId) => {
          if (String(memberId) !== userId) {
            socket.to(String(memberId)).emit("stop-typing", {
              sender: userId,
              chatId,
            });
          }
        });
      } catch (error) {
        console.error("Socket stop-typing error:", error.message);
      }
    });

    socket.on("poll-updated", async ({ poll, chatId }) => {
      try {
        if (!poll?._id || !chatId) {
          return;
        }

        const authorizedChat = await getChatForUser(chatId, userId);

        if (!authorizedChat) {
          return;
        }

        authorizedChat.members.forEach((memberId) => {
          if (String(memberId) !== userId) {
            socket.to(String(memberId)).emit("poll-updated", {
              poll,
              chatId,
            });
          }
        });
      } catch (error) {
        console.error("Socket poll-updated error:", error.message);
      }
    });
  });
};

export { registerSocketHandlers };
