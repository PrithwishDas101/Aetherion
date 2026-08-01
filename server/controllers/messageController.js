import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

// SEND MESSAGE
export const sendMessage = async (req, res) => {
    try {
        const { chatId, text } = req.body;

        if (!chatId || !text?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Chat ID and message text are required.",
            });
        }

        const chat = await Chat.findOne({
            _id: chatId,
            members: req.user.userId,
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found.",
            });
        }

        const savedMessage = await Message.create({
            chatId,
            text: text.trim(),
            sender: req.user.userId,
            read: false,
        });

        const updatedChat = await Chat
            .findByIdAndUpdate(
                chatId,
                {
                    $set: {
                        lastMessage: savedMessage._id,
                    },
                    $inc: {
                        unreadMessageCount: 1,
                    },
                },
                {
                    new: true,
                }
            )
            .populate("members")
            .populate("lastMessage");

        return res.status(201).json({
            success: true,
            message: "Message sent successfully!",
            data: savedMessage,
            chat: updatedChat,
        });
    } catch (error) {
        console.error(
            "Send message error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET ALL MESSAGES OF A CHAT
export const getAllMessages = async (req, res) => {
    try {
        const { chatId } = req.params;

        const chat = await Chat.findOne({
            _id: chatId,
            members: req.user.userId,
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found.",
            });
        }

        const messages = await Message
            .find({
                chatId,
            })
            .sort({
                createdAt: 1,
            });

        return res.status(200).json({
            success: true,
            message: "Messages fetched successfully!",
            data: messages,
        });
    } catch (error) {
        console.error(
            "Get all messages error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};