import { axiosInstance } from "./index.js";

// GET RECENT CONTACTS
export const getRecentContacts = async (
  ownerId = null,
) => {
  try {
    const response = await axiosInstance.get(
      "/api/v1/contact/recent",
      {
        params: ownerId
          ? {
              ownerId,
            }
          : {},
      },
    );

    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message:
          "Unable to fetch recent contacts.",
      }
    );
  }
};

// GET CONTACTS
// Supports:
// search
// page
// limit
// ownerId
//
// No ownerId = logged-in user's contacts.
// ownerId = another user's contacts.
export const getContacts = async ({
  search = "",
  page = 1,
  limit = 50,
  ownerId = null,
} = {}) => {
  try {
    const response = await axiosInstance.get(
      ownerId
        ? `/api/v1/contact/user/${ownerId}`
        : "/api/v1/contact",
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
        message:
          "Unable to fetch contacts.",
      }
    );
  }
};

// REMOVE CONTACT
export const removeContact = async (
  contactId,
) => {
  try {
    const response =
      await axiosInstance.delete(
        `/api/v1/contact/${contactId}`,
      );

    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message:
          "Unable to remove contact.",
      }
    );
  }
};

// ADD CONTACT
export const addContact = async (
  contactId,
) => {
  try {
    if (!contactId) {
      return {
        success: false,
        message: "Contact ID is required.",
      };
    }

    const response =
      await axiosInstance.post(
        `/api/v1/contact/${contactId}`,
      );

    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message:
          "Unable to add contact.",
      }
    );
  }
};