import { axiosInstance } from "./index.js";

// CREATE CHAT
export const createChat = async (members) => {
    try {
        const response = await axiosInstance.post(
            "/api/v1/chat/create",
            {
                members,
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

// CLEAR ALL UNREAD MESSAGES
export const clearUnreadMessage = async (chatId) => {
    try {
        const response = await axiosInstance.post(
            "/api/v1/chat/clear-unread-message", { chatId: chatId }
        );

        return response.data;

    } catch (error) {
        return error.response?.data;
    }
};