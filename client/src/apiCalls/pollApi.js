import { axiosInstance } from "./index.js";

// CREATE POLL
export const createPoll = async (pollData) => {
  try {
    const response = await axiosInstance.post("/api/v1/poll", pollData);

    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};

// GET POLL
export const getPoll = async (pollId) => {
  try {
    const response = await axiosInstance.get(`/api/v1/poll/${pollId}`);

    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};

// VOTE ON POLL
export const voteOnPoll = async (pollId, optionIds) => {
  try {
    const response = await axiosInstance.put(`/api/v1/poll/${pollId}/vote`, {
      optionIds,
    });

    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};
