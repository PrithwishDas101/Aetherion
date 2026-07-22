import mongoose from "mongoose";

import Chat from "../models/Chat.js";
import User from "../models/User.js";

// CREATE OR GET ONE-TO-ONE CHAT
export const createChat = async (req, res) => {
    try {
        const chat = new Chat(req.body);
        const savedChat = await chat.save();

        res.status(201).send({
            success: true,
            message: "Chat created succesfully!",
            data: savedChat
        })
    } catch (error) {
        console.error("Create chat error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};