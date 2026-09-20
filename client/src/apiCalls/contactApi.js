
import { axiosInstance } from "./index.js";

// GET RECENT CONTACTS
export const getRecentContacts = async () => {
  try {
    const response = await axiosInstance.get(
      "/api/v1/contact/recent",
    );

    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: "Unable to fetch recent contacts.",
      }
    );
  }
};

// GET CONTACTS, Supports: search, page, limit
// /api/v1/contact?search=adrish&page=1&limit=50
export const getContacts = async ({
  search = "",
  page = 1,
  limit = 50,
} = {}) => {
  try {
    const response = await axiosInstance.get(
      "/api/v1/contact",
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
        message: "Unable to fetch contacts.",
      }
    );
  }
};

// REMOVE CONTACT
export const removeContact = async (contactId) => {
  try {
    const response = await axiosInstance.delete(
      `/api/v1/contact/${contactId}`,
    );

    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: "Unable to remove contact.",
      }
    );
  }
};
