import mongoose from "mongoose";

import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import Poll from "../models/Poll.js";
import { logSafeError } from "../utils/safeLogging.js";

// CREATE POLL
export const createPoll = async (req, res) => {
  try {
    const {
      chatId,
      question,
      options,
      allowMultipleAnswers = false,
      replyTo,
    } = req.body;

    const senderId = String(req.user.userId);

    // VALIDATE CHAT
    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Chat ID is required.",
      });
    }

    // VALIDATE QUESTION
    if (!question?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Poll question is required.",
      });
    }

    // VALIDATE QUESTION
    const cleanedQuestion = question.trim();

    if (cleanedQuestion.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Poll question is too long.",
      });
    }

    // VALIDATE OPTIONS
    if (!Array.isArray(options) || options.length < 2 || options.length > 10) {
      return res.status(400).json({
        success: false,
        message: "A poll must have between 2 and 10 options.",
      });
    }

    const cleanedOptions = options
      .filter((option) => typeof option === "string")
      .map((option) => option.trim())
      .filter(Boolean);

    if (cleanedOptions.length < 2) {
      return res.status(400).json({
        success: false,
        message: "A poll requires at least two valid options.",
      });
    }

    if (cleanedOptions.some((option) => option.length > 200)) {
      return res.status(400).json({
        success: false,
        message: "Poll options are too long.",
      });
    }

    // VERIFY CHAT MEMBERSHIP
    const chat = await Chat.findOne({
      _id: chatId,
      members: senderId,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    if (replyTo) {
      if (!mongoose.Types.ObjectId.isValid(replyTo)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reply message ID.",
        });
      }

      const repliedMessage = await Message.findOne({
        _id: replyTo,
        chatId: chat._id,
      });

      if (!repliedMessage) {
        return res.status(400).json({
          success: false,
          message: "Reply message not found in this chat.",
        });
      }
    }

    const receiver = chat.members.find((member) => String(member) !== senderId);

    if (!receiver) {
      return res.status(400).json({
        success: false,
        message: "Poll receiver not found.",
      });
    }

    // CREATE MESSAGE FIRST
    const savedMessage = await Message.create({
      chatId,
      sender: senderId,
      type: "poll",
      text: cleanedQuestion,
      replyTo: replyTo || null,
      read: false,
    });

    // CREATE POLL
    const poll = await Poll.create({
      messageId: savedMessage._id,
      chatId,
      creator: senderId,
      question: cleanedQuestion,
      options: cleanedOptions.map((option) => ({
        text: option,
        votes: [],
      })),
      allowMultipleAnswers: Boolean(allowMultipleAnswers),
    });

    // LINK MESSAGE TO POLL
    savedMessage.poll = poll._id;

    await savedMessage.save();

    // POPULATE REPLY MESSAGE
    await savedMessage.populate({
      path: "replyTo",
      select: "text sender type mediaUrl document",
    });

    // UPDATE CHAT
    const receiverId = String(receiver);

    const unreadField = `unreadMessageCount.${receiverId}`;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $set: {
          lastMessage: savedMessage._id,
        },

        $inc: {
          [unreadField]: 1,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    )
      .populate("members")
      .populate("lastMessage");

    return res.status(201).json({
      success: true,
      message: "Poll created successfully!",
      data: {
        message: savedMessage,
        poll,
      },
      chat: updatedChat,
    });
  } catch (error) {
    logSafeError("Create poll", error, {
      chatId: req.body?.chatId,
      type: "poll",
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// VOTE ON POLL
export const voteOnPoll = async (req, res) => {
  try {
    const { pollId } = req.params;

    const { optionIds } = req.body;

    const userId = String(req.user.userId);

    // VALIDATE OPTIONS
    if (!Array.isArray(optionIds)) {
      return res.status(400).json({
        success: false,
        message: "Invalid poll options.",
      });
    }

    // FIND POLL
    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found.",
      });
    }

    // VERIFY CHAT MEMBERSHIP
    const chat = await Chat.findOne({
      _id: poll.chatId,
      members: userId,
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this poll.",
      });
    }

    // SINGLE ANSWER GUARD
    if (!poll.allowMultipleAnswers && optionIds.length > 1) {
      return res.status(400).json({
        success: false,
        message: "This poll only allows one answer.",
      });
    }

    // REMOVE DUPLICATE IDS
    const uniqueOptionIds = [
      ...new Set(optionIds.map((optionId) => String(optionId))),
    ];

    // VALIDATE OPTION IDS
    const validOptionIds = new Set(
      poll.options.map((option) => String(option._id)),
    );

    const hasInvalidOption = uniqueOptionIds.some(
      (optionId) => !validOptionIds.has(optionId),
    );

    if (hasInvalidOption) {
      return res.status(400).json({
        success: false,
        message: "One or more selected options are invalid.",
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // UPDATE ALL OPTION VOTES ATOMICALLY.
    //
    // The previous read-modify-save flow could lose another user's vote when
    // two votes were submitted concurrently from stale poll documents. A
    // single MongoDB update keeps each vote transition atomic.
    const updatedPoll = await Poll.findOneAndUpdate(
      { _id: pollId },
      [
        {
          $set: {
            options: {
              $map: {
                input: "$options",
                as: "option",
                in: {
                  $mergeObjects: [
                    "$$option",
                    {
                      votes: {
                        $cond: [
                          {
                            $in: [
                              { $toString: "$$option._id" },
                              uniqueOptionIds,
                            ],
                          },
                          {
                            $setUnion: [
                              {
                                $filter: {
                                  input: "$$option.votes",
                                  as: "voteUserId",
                                  cond: {
                                    $ne: ["$$voteUserId", userObjectId],
                                  },
                                },
                              },
                              [userObjectId],
                            ],
                          },
                          {
                            $filter: {
                              input: "$$option.votes",
                              as: "voteUserId",
                              cond: {
                                $ne: ["$$voteUserId", userObjectId],
                              },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      ],
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!updatedPoll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Poll vote updated successfully!",
      data: updatedPoll,
    });
  } catch (error) {
    logSafeError("Vote on poll", error, {
      pollId: req.params?.pollId,
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// GET POLL
export const getPoll = async (req, res) => {
  try {
    const { pollId } = req.params;

    const userId = String(req.user.userId);

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found.",
      });
    }

    // VERIFY CHAT MEMBERSHIP
    const chat = await Chat.findOne({
      _id: poll.chatId,
      members: userId,
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this poll.",
      });
    }

    return res.status(200).json({
      success: true,
      data: poll,
    });
  } catch (error) {
    logSafeError("Get poll", error, {
      pollId: req.params?.pollId,
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
