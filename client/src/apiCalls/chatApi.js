import { axiosInstance } from "./index.js";

// CREATE CHAT
export const createChat = async (userId) => {
    try {
        const response = await axiosInstance.post(
            "/api/v1/chat/create-chat",
            {
                userId,
            }
        );

        return response.data;

    } catch (error) {
        return error.response?.data;
    }
};

// GET ALL CHATS
export const getAllChats = async () => {
    try {
        const response = await axiosInstance.get(
            "/api/v1/chat"
        );

        return response.data;

    } catch (error) {
        return error.response?.data;
    }
};