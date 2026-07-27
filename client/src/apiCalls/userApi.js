import { axiosInstance } from "./index.js";

export const getLoggedUser = async () => {
    try {
        const response = await axiosInstance.get(
            "/api/v1/user/get-logged-user"
        );

        return response.data;

    } catch (error) {
        return error.response.data;
    }
};