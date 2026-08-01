import mongoose from "mongoose";

import Chat from "../models/Chat.js";
import Message from "../models/Message.js";


// CREATE OR GET ONE-TO-ONE CHAT

export const createChat = async (req, res) => {

    try {

        const chat = new Chat(
            req.body
        );

        const savedChat = await chat.save();

        await savedChat.populate(
            "members"
        );

        return res.status(201).send({

            success: true,

            message:
                "Chat created successfully!",

            data:
                savedChat,

        });

    } catch (error) {

        console.error(
            "Create chat error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Internal server error",

        });

    }

};


// GET ALL CHATS OF LOGGED-IN USER

export const getAllChats = async (
    req,
    res
) => {

    try {

        const chats = await Chat

            .find({

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


        return res.status(200).send({

            success: true,

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

            success: false,

            message:
                "Internal server error",

        });

    }

};


// CLEAR UNREAD MESSAGES

export const clearUnreadMessages = async (
    req,
    res
) => {

    try {

        const {
            chatId,
        } = req.body;


        if (
            !chatId
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Chat ID is required.",

            });

        }


        if (
            !mongoose.Types.ObjectId.isValid(
                chatId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid chat ID.",

            });

        }


        const chat = await Chat.findOne({

            _id:
                chatId,

            members:
                req.user.userId,

        });


        if (
            !chat
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Chat not found.",

            });

        }


        const updatedChat =
            await Chat

                .findByIdAndUpdate(

                    chatId,

                    {

                        unreadMessageCount:
                            0,

                    },

                    {

                        new:
                            true,

                    }

                )

                .populate(
                    "members"
                )

                .populate(
                    "lastMessage"
                );


        await Message.updateMany(

            {

                chatId:
                    chatId,

                read:
                    false,

                sender: {

                    $ne:
                        req.user.userId,

                },

            },

            {

                $set: {

                    read:
                        true,

                },

            }

        );


        return res.status(200).json({

            success: true,

            message:
                "Unread messages cleared successfully.",

            data:
                updatedChat,

        });

    } catch (error) {

        console.error(
            "Clear unread messages error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Internal server error",

        });

    }

};