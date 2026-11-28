import { axiosInstance, getApiErrorResponse } from "./index.js";

// SEND MESSAGE
export const createMessage = async (message) => {
  try {
    const response = await axiosInstance.post(
      "/api/v1/message/send-message",
      message,
    );

    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};

// SEND MEDIA MESSAGE
export const createMediaMessage = async (formData) => {
  try {
    const response = await axiosInstance.post(
      "/api/v1/message/send-message",
      formData,
    );

    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};

// GET ALL MESSAGES
export const getAllMessages = async (chatId, config = {}) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/message/${chatId}`,
      config,
    );

    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};


// MESSAGE INTERACTIONS
export const editMessage = async (messageId, text) => {
  try {
    const response = await axiosInstance.patch(`/api/v1/message/${messageId}`, { text });
    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};

export const deleteMessage = async (messageId, scope) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/message/${messageId}`, { data: { scope } });
    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};

export const reactToMessage = async (messageId, emoji) => {
  try {
    const response = await axiosInstance.post(`/api/v1/message/${messageId}/reaction`, { emoji });
    return response.data;
  } catch (error) {
    return getApiErrorResponse(error, "Could not update reaction. Please try again.");
  }
};
