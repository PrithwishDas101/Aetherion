import { axiosInstance } from "./index.js";

// GET LOGGED-IN USER
export const getLoggedUser = async () => {
    try {
        const response = await axiosInstance.get(
            "/api/v1/user/get-logged-user"
        );

        return response.data;

    } catch (error) {
        return error.response?.data;
    }
};

// GET ALL USERS
export const getAllUsers = async () => {
    try {
        const response = await axiosInstance.get(
            "/api/v1/user/get-all-users"
        );

        return response.data;

    } catch (error) {
        return error.response?.data;
    }
};