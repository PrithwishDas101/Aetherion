import { axiosInstance } from "./index.js";

// SEND MESSAGE
export const createMessage = async (message) => {

    try {

        const response =
            await axiosInstance.post(
                "/api/v1/message/send-message",
                message
            );

        return response.data;

    } catch (error) {

        return error.response?.data;

    }

};

// GET ALL MESSAGES
export const getAllMessages = async (chatId) => {

    try {

        const response =
            await axiosInstance.get(
                `/api/v1/message/${chatId}`
            );

        return response.data;

    } catch (error) {

        return error.response?.data;

    }

};