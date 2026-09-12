import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import Poll from "../models/Poll.js";

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

    // VALIDATE OPTIONS
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: "A poll requires at least two options.",
      });
    }

    const cleanedOptions = options
      .map((option) => option?.trim())
      .filter(Boolean);

    if (cleanedOptions.length < 2) {
      return res.status(400).json({
        success: false,
        message: "A poll requires at least two valid options.",
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
      text: question.trim(),
      replyTo: replyTo || null,
      read: false,
    });

    // CREATE POLL
    const poll = await Poll.create({
      messageId: savedMessage._id,
      chatId,
      question: question.trim(),
      options: cleanedOptions.map((option) => ({
        text: option,
        votes: [],
      })),
      allowMultipleAnswers: Boolean(allowMultipleAnswers),
      createdBy: senderId,
    });

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
    console.error("Create poll error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
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
    if (!Array.isArray(optionIds) || !optionIds.length) {
      return res.status(400).json({
        success: false,
        message: "At least one poll option must be selected.",
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

    // REMOVE USER FROM ALL PREVIOUS VOTES
    poll.options.forEach((option) => {
      option.votes = option.votes.filter(
        (voteUserId) => String(voteUserId) !== userId,
      );
    });

    // ADD USER TO NEWLY SELECTED OPTIONS
    poll.options.forEach((option) => {
      if (uniqueOptionIds.includes(String(option._id))) {
        option.votes.push(userId);
      }
    });

    await poll.save();

    return res.status(200).json({
      success: true,
      message: "Poll vote updated successfully!",
      data: poll,
    });
  } catch (error) {
    console.error("Vote on poll error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
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
    console.error("Get poll error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
