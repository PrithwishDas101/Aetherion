import mongoose from "mongoose";

import Chat from "../models/Chat.js";
import User from "../models/User.js";

// CREATE OR GET ONE-TO-ONE CHAT
export const createChat = async (req, res) => {
    try {
        const chat = new Chat(req.body);
        const savedChat = await chat.save();

        await savedChat.populate("members");

        res.status(201).send({
            success: true,
            message: "Chat created successfully!",
            data: savedChat
        });

    } catch (error) {
        console.error("Create chat error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// GET ALL CHATS OF LOGGED-IN USER
export const getAllChats = async (req, res) => {
    try {
        const chats = await Chat
            .find({
                members: {
                    $in: [req.user.userId],
                },
            }).
            populate('members').
            populate('lastMessage').
            sort({ updatedAt: -1 });

        return res.status(200).send({
            success: true,
            message: "Chats fetched successfully!",
            data: chats,
        });
    } catch (error) {
        console.error("Get all chats error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};