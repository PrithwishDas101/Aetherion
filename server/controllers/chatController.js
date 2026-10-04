import mongoose from "mongoose";

import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { socketEventLimiter } from "../socket/socketEventLimiter.js";
import { logSafeError } from "../utils/safeLogging.js";
import { MAX_CHATS_PER_USER } from "../utils/queryLimits.js";

const findPopulatedChat = (filter) =>
  Chat.findOne(filter).populate("members").populate("lastMessage");

const respondWithExistingChat = (res, chat) =>
  res.status(200).json({
    success: true,
    message: "Chat already exists.",
    data: chat,
  });

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

    if (
      !members.every(
        (member) =>
          typeof member === "string" && mongoose.Types.ObjectId.isValid(member),
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat member.",
      });
    }

    const memberIds = members.map((member) =>
      new mongoose.Types.ObjectId(member).toHexString(),
    );
    const authenticatedUserId = new mongoose.Types.ObjectId(
      String(req.user.userId),
    ).toHexString();

    if (!memberIds.includes(authenticatedUserId)) {
      return res.status(403).json({
        success: false,
        message: "You can only create a chat that includes yourself.",
      });
    }

    if (new Set(memberIds).size !== 2) {
      return res.status(400).json({
        success: false,
        message: "You cannot create a chat with yourself.",
      });
    }

    const memberObjectIds = memberIds.map(
      (memberId) => new mongoose.Types.ObjectId(memberId),
    );
    const existingUserCount = await User.countDocuments({
      _id: { $in: memberObjectIds },
    });

    if (existingUserCount !== 2) {
      return res.status(404).json({
        success: false,
        message: "Unable to create chat.",
      });
    }

    const pairKey = [...memberIds].sort().join(":");
    const existingChat =
      (await findPopulatedChat({ pairKey })) ||
      (await findPopulatedChat({
        members: { $all: memberObjectIds },
        $expr: {
          $eq: [{ $size: "$members" }, 2],
        },
      }));

    if (existingChat) {
      return respondWithExistingChat(res, existingChat);
    }

    const unreadMessageCount = new Map(
      memberIds.map((memberId) => [memberId, 0]),
    );
    let chat;

    try {
      chat = await Chat.create({
        members: memberObjectIds,
        pairKey,
        unreadMessageCount,
      });
    } catch (error) {
      if (error?.code !== 11000) {
        throw error;
      }

      const racedChat = await findPopulatedChat({ pairKey });

      if (!racedChat) {
        throw error;
      }

      return respondWithExistingChat(res, racedChat);
    }

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

      message: "Internal server error.",
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
      lastMessage: {
        $ne: null,
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

      message: "Internal server error.",
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

    if (otherMember && socketEventLimiter.allow(userId, "messages-read")) {
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

      message: "Internal server error.",
    });
  }
};
