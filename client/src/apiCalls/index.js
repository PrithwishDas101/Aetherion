import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getApiErrorResponse = (
  error,
  fallbackMessage = "Request failed. Please try again.",
) => ({
  ...(error.response?.data || {}),
  success: false,
  status: error.response?.status ?? null,
  networkError: !error.response,
  message:
    error.response?.data?.message ||
    (error.response
      ? fallbackMessage
      : "Unable to reach the server. Please try again."),
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const hasExplicitAuthorization =
    config.headers?.Authorization !== undefined ||
    config.headers?.authorization !== undefined;

  if (token && !hasExplicitAuthorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
