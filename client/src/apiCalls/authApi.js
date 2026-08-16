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
  console.log("🔵 LOGIN START");
  console.log("🔵 API URL:", import.meta.env.VITE_API_URL);
  console.log("🔵 Login payload:", {
    email: userData.email,
    password: "***",
  });

  try {
    const response = await axiosInstance.post(
      "/api/v1/auth/login",
      userData,
    );

    console.log("🟢 LOGIN SUCCESS");
    console.log("🟢 Status:", response.status);
    console.log("🟢 Response:", response.data);

    return response.data;
  } catch (error) {
    console.error("🔴 LOGIN FAILED");
    console.error("🔴 Message:", error.message);
    console.error("🔴 Code:", error.code);
    console.error("🔴 Status:", error.response?.status);
    console.error("🔴 Response:", error.response?.data);
    console.error("🔴 Request URL:", error.config?.baseURL + error.config?.url);
    console.error("🔴 Full error:", error);

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
