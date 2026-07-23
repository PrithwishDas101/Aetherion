import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

// SEND MESSAGE
export const sendMessage = async (req, res) => {
    try {
        // 1. Create message
        const message = new Message(req.body);

        // 2. Save message
        const savedMessage = await message.save();

        // 3. Update chat
        await Chat.findOneAndUpdate(
            {
                _id: req.body.chatId,
            },
            {
                lastMessage: savedMessage._id,
                $inc: {
                    unreadMessageCount: 1,
                },
            }
        );

        return res.status(201).send({
            success: true,
            message: "Message sent successfully!",
            data: savedMessage,
        });
    } catch (error) {
        console.error("Send message error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// GET ALL MESSAGES OF A CHAT
export const getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            chatId: req.params.chatId,
        }).sort({
            createdAt: 1,
        });

        return res.status(200).send({
            success: true,
            message: "Messages fetched successfully!",
            data: messages,
        });
    } catch (error) {
        console.error("Get all messages error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};