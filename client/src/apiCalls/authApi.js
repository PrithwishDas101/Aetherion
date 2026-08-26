import { axiosInstance } from "./index.js";

// SIGNUP
export const signupUser = async (formData) => {
  try {
    const response = await axiosInstance.post("/api/v1/auth/signup", formData);

    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};

// LOGIN
export const loginUser = async (userData) => {
  try {
    const response = await axiosInstance.post("/api/v1/auth/login", userData);

    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};

// LOGOUT
export const logoutUser = async () => {
  try {
    const response = await axiosInstance.post("/api/v1/auth/logout");

    localStorage.removeItem("token");

    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};
