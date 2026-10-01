import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import Poll from "../models/Poll.js";
import { socketEventLimiter } from "./socketEventLimiter.js";

const getChatForUser = async (chatId, userId) => {
  if (!chatId || !userId) {
    return null;
  }

  return Chat.findOne({
    _id: chatId,
    members: userId,
  }).lean();
};

const registerSocketHandlers = (io, eventLimiter = socketEventLimiter) => {
  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    socket.on("send-message", async ({ message, chat } = {}) => {
      try {
        const chatId = chat?._id || message?.chatId;

        if (!message?._id || !chatId) {
          return;
        }

        if (!eventLimiter.allow(userId, "send-message")) {
          return;
        }

        const authorizedChat = await getChatForUser(chatId, userId);

        if (!authorizedChat) {
          return;
        }

        const persistedMessage = await Message.findOne({
          _id: message._id,
          chatId: authorizedChat._id,
          sender: userId,
        })
          .populate({
            path: "replyTo",
            select: "text sender type mediaUrl document poll location contact",
          })
          .populate("poll");

        if (!persistedMessage) {
          return;
        }

        const broadcastChat = await Chat.findOne({
          _id: authorizedChat._id,
          members: userId,
        })
          .populate("members")
          .populate("lastMessage");

        if (!broadcastChat) {
          return;
        }

        const recipients = authorizedChat.members || [];

        recipients.forEach((memberId) => {
          if (String(memberId) !== userId) {
            socket.to(String(memberId)).emit("receive-message", {
              message: persistedMessage,
              chat: broadcastChat,
            });
          }
        });
      } catch (error) {
        console.error("Socket send-message error:", error.message);
      }
    });

    socket.on("typing", async (payload) => {
      try {
        const chatId = payload?.chatId;

        if (
          typeof chatId !== "string" ||
          !mongoose.Types.ObjectId.isValid(chatId)
        ) {
          return;
        }

        if (!eventLimiter.allow(userId, "typing")) {
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
              chatId: String(authorizedChat._id),
            });
          }
        });
      } catch (error) {
        console.error("Socket typing error:", error.message);
      }
    });

    socket.on("stop-typing", async (payload) => {
      try {
        const chatId = payload?.chatId;

        if (
          typeof chatId !== "string" ||
          !mongoose.Types.ObjectId.isValid(chatId)
        ) {
          return;
        }

        if (!eventLimiter.allow(userId, "stop-typing")) {
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
              chatId: String(authorizedChat._id),
            });
          }
        });
      } catch (error) {
        console.error("Socket stop-typing error:", error.message);
      }
    });

    socket.on("poll-updated", async ({ poll, chatId } = {}) => {
      try {
        if (!poll?._id || !chatId) {
          return;
        }

        if (!eventLimiter.allow(userId, "poll-updated")) {
          return;
        }

        const authorizedChat = await getChatForUser(chatId, userId);

        if (!authorizedChat) {
          return;
        }

        const persistedPoll = await Poll.findOne({
          _id: poll._id,
          chatId: authorizedChat._id,
        });

        if (!persistedPoll) {
          return;
        }

        authorizedChat.members.forEach((memberId) => {
          if (String(memberId) !== userId) {
            socket.to(String(memberId)).emit("poll-updated", {
              poll: persistedPoll,
              chatId: String(authorizedChat._id),
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
