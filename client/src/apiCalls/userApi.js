import { axiosInstance } from "./index.js";

// GET LOGGED-IN USER
export const getLoggedUser = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/user/get-logged-user");

    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};

// GET ALL USERS
export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/user/get-all-users");

    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};

// UPDATE PROFILE PICTURE
export const updateProfilePicture = async (profileFile) => {
  try {
    const formData = new FormData();

    formData.append("profilePic", profileFile);

    const response = await axiosInstance.post(
      "/api/v1/user/profile-picture",
      formData,
    );

    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};

// REMOVE PROFILE PICTURE
export const removeProfilePicture = async () => {
  try {
    const response = await axiosInstance.delete(
      "/api/v1/user/remove-profile-picture",
    );

    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};

// UPDATE PERSONAL PROFILE
export const updatePersonalProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put(
      "/api/v1/user/profile",
      profileData,
    );

    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};

// UPDATE PROFILE BANNER
export const updateProfileBanner = async (formData) => {
  try {
    const response = await axiosInstance.post(
      "/api/v1/user/profile-banner",
      formData,
    );

    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};

// UPDATE PROFILE CONNECTIONS
export const updateConnections = async (connections) => {
  try {
    const response = await axiosInstance.put("/api/v1/user/connections", {
      connections,
    });

    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};
