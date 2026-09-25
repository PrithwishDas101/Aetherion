import { axiosInstance } from "./index.js";

export const getContactProfile = async (userId) => {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required.",
      };
    }

    const response = await axiosInstance.get(
      `/api/v1/contact-profile/${userId}`,
    );

    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: "Unable to fetch contact profile.",
      }
    );
  }
};

export const getContactProfileMedia = async (userId) => {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required.",
      };
    }

    const response = await axiosInstance.get(
      `/api/v1/contact-profile/${userId}/media`,
    );

    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: "Unable to fetch contact media.",
      }
    );
  }
};
