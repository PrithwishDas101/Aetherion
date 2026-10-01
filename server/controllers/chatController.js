import mongoose from "mongoose";

import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import { socketEventLimiter } from "../socket/socketEventLimiter.js";
import { logSafeError } from "../utils/safeLogging.js";
import { MAX_CHATS_PER_USER } from "../utils/queryLimits.js";

// CREATE ONE-TO-ONE CHAT
export const createChat = async (req, res) => {
  try {
    const { members } = req.body;

    if (!Array.isArray(members) || members.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "A chat must have exactly two members.",
      });
    }

    const authenticatedUserId = String(req.user.userId);

    if (!members.some((member) => String(member) === authenticatedUserId)) {
      return res.status(403).json({
        success: false,
        message: "You can only create a chat that includes yourself.",
      });
    }

    // Make sure both member IDs are valid MongoDB ObjectIds.
    if (!members.every((member) => mongoose.Types.ObjectId.isValid(member))) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat member.",
      });
    }

    // A user cannot start a chat with themselves.
    if (String(members[0]) === String(members[1])) {
      return res.status(400).json({
        success: false,
        message: "You cannot create a chat with yourself.",
      });
    }

    const existingChat = await Chat.findOne({
      members: {
        $all: members,
      },

      $expr: {
        $eq: [
          {
            $size: "$members",
          },

          2,
        ],
      },
    })
      .populate("members")
      .populate("lastMessage");

    // Even if the chat already exists, make sure the contact relationship exists.
    if (existingChat) {
      return res.status(200).json({
        success: true,

        message: "Chat already exists.",

        data: existingChat,
      });
    }

    const unreadMessageCount = new Map([
      [String(members[0]), 0],

      [String(members[1]), 0],
    ]);

    const chat = await Chat.create({
      members,

      unreadMessageCount,
    });

    await chat.populate("members");

    return res.status(201).json({
      success: true,

      message: "Chat created successfully!",

      data: chat,
    });
  } catch (error) {
    logSafeError("Create chat", error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// GET ALL CHATS
export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      members: {
        $in: [req.user.userId],
      },
    })
      .populate("members")
      .populate("lastMessage")
      .sort({
        updatedAt: -1,
        _id: -1,
      })
      .limit(MAX_CHATS_PER_USER);

    return res.status(200).json({
      success: true,

      message: "Chats fetched successfully!",

      data: chats,
    });
  } catch (error) {
    logSafeError("Get all chats", error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// CLEAR ONLY CURRENT USER'S UNREAD COUNT
export const clearUnreadMessages = async (req, res) => {
  try {
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({
        success: false,

        message: "Chat ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,

        message: "Invalid chat ID.",
      });
    }

    const userId = String(req.user.userId);

    const chat = await Chat.findOne({
      _id: chatId,

      members: userId,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,

        message: "Chat not found.",
      });
    }

    await Message.updateMany(
      {
        chatId,

        sender: {
          $ne: userId,
        },

        read: false,
      },

      {
        $set: {
          read: true,
        },
      },
    );

    const unreadField = `unreadMessageCount.${userId}`;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,

      {
        $set: {
          [unreadField]: 0,
        },
      },

      {
        returnDocument: "after",

        timestamps: false,
      },
    )
      .populate("members")
      .populate("lastMessage");

    const io = req.app.get("io");

    const otherMember = updatedChat.members.find(
      (member) => String(member._id) !== String(userId),
    );

    if (
      otherMember &&
      socketEventLimiter.allow(userId, "messages-read")
    ) {
      io.to(String(otherMember._id)).emit("messages-read", {
        chatId: String(chatId),
        userId: String(userId),
        chat: updatedChat,
      });
    }

    return res.status(200).json({
      success: true,

      message: "Unread messages cleared successfully.",

      data: updatedChat,
    });
  } catch (error) {
    logSafeError("Clear unread messages", error, {
      chatId: req.body?.chatId,
    });

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
