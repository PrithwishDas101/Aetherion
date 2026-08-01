import mongoose from "mongoose";

import Chat from "../models/Chat.js";
import Message from "../models/Message.js";


// CREATE ONE-TO-ONE CHAT
export const createChat = async (req, res) => {

    try {

        const {
            members,
        } = req.body;


        if (
            !Array.isArray(members) ||
            members.length !== 2
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "A chat must have exactly two members.",

            });

        }


        const existingChat =
            await Chat.findOne({

                members: {
                    $all:
                        members,
                },

                $expr: {
                    $eq: [
                        {
                            $size:
                                "$members",
                        },
                        2,
                    ],
                },

            })
                .populate(
                    "members"
                )
                .populate(
                    "lastMessage"
                );


        if (existingChat) {

            return res.status(200).json({

                success:
                    true,

                message:
                    "Chat already exists.",

                data:
                    existingChat,

            });

        }


        const unreadMessageCount = {

            [String(members[0])]:
                0,

            [String(members[1])]:
                0,

        };


        const chat =
            await Chat.create({

                members,

                unreadMessageCount,

            });


        await chat.populate(
            "members"
        );


        return res.status(201).json({

            success:
                true,

            message:
                "Chat created successfully!",

            data:
                chat,

        });

    } catch (error) {

        console.error(
            "Create chat error:",
            error
        );

        return res.status(500).json({

            success:
                false,

            message:
                "Internal server error",

        });

    }

};


// GET ALL CHATS OF LOGGED-IN USER
export const getAllChats = async (req, res) => {
    try {
        const chats =
            await Chat.find({

                members: {

                    $in: [
                        req.user.userId,
                    ],

                },

            })
                .populate(
                    "members"
                )
                .populate(
                    "lastMessage"
                )
                .sort({

                    updatedAt:
                        -1,

                });


        return res.status(200).json({

            success:
                true,

            message:
                "Chats fetched successfully!",

            data:
                chats,

        });

    } catch (error) {

        console.error(
            "Get all chats error:",
            error
        );

        return res.status(500).json({

            success:
                false,

            message:
                "Internal server error",

        });

    }

};


// CLEAR LOGGED-IN USER'S UNREAD MESSAGES
export const clearUnreadMessages = async (req, res) => {
    try {
        const { chatId } = req.body;

        if (!chatId) {
            return res.status(400).json({
                success: false,
                message: "Chat ID is required.",
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(
                chatId
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid chat ID.",
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

        await Message.updateMany(
            {
                chatId,
                sender: {
                    $ne: req.user.userId,
                },
                read: false,
            },
            {
                $set: {
                    read: true,
                },
            }
        );

        const updatedChat = await Chat
            .findByIdAndUpdate(
                chatId,
                {
                    $set: {
                        unreadMessageCount: 0,
                    },
                },
                {
                    new: true,
                }
            )
            .populate("members")
            .populate("lastMessage");

        return res.status(200).json({
            success: true,
            message:
                "Unread messages cleared successfully.",
            data: updatedChat,
        });
    } catch (error) {
        console.error(
            "Clear unread messages error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};