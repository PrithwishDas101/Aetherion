import { axiosInstance } from "./index.js";

// SEND CONTACT REQUEST
export const sendContactRequest = async (recipientId) => {
  try {
    if (!recipientId) {
      return {
        success: false,
        message: "Recipient ID is required.",
      };
    }

    const response = await axiosInstance.post(
      `/api/v1/contact-request/${recipientId}`,
    );

    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: "Unable to send contact request.",
      }
    );
  }
};

// GET INCOMING REQUESTS
export const getIncomingContactRequests = async ({
  search = "",
  page = 1,
  limit = 50,
} = {}) => {
  try {
    const response = await axiosInstance.get(
      "/api/v1/contact-request/incoming",
      {
        params: {
          search,
          page,
          limit,
        },
      },
    );

    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: "Unable to fetch contact requests.",
      }
    );
  }
};

// GET OUTGOING REQUESTS
export const getOutgoingContactRequests = async () => {
  try {
    const response = await axiosInstance.get(
      "/api/v1/contact-request/outgoing",
    );

    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: "Unable to fetch sent contact requests.",
      }
    );
  }
};

// GET REQUEST COUNT
export const getContactRequestCount = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/contact-request/count");

    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        count: 0,
      }
    );
  }
};

// ACCEPT REQUEST
export const acceptContactRequest = async (requestId) => {
  try {
    const response = await axiosInstance.post(
      `/api/v1/contact-request/${requestId}/accept`,
    );

    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: "Unable to accept contact request.",
      }
    );
  }
};

// DECLINE REQUEST
export const declineContactRequest = async (requestId) => {
  try {
    const response = await axiosInstance.post(
      `/api/v1/contact-request/${requestId}/decline`,
    );

    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: "Unable to decline contact request.",
      }
    );
  }
};

// CANCEL REQUEST
export const cancelContactRequest = async (requestId) => {
  try {
    const response = await axiosInstance.delete(
      `/api/v1/contact-request/${requestId}`,
    );

    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: "Unable to cancel contact request.",
      }
    );
  }
};
