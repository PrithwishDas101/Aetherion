import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import {
    getLoggedUser,
    getAllUsers,
} from "../apiCalls/userApi.js";

import {
    showLoader,
    hideLoader,
} from "../redux/sliceLoader.js";

import {
    setUser,
    setAllUser,
} from "../redux/userSlice.js";

function ProtectedRoute({ children }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const getLoggedInUser = async () => {
        try {
            dispatch(showLoader());

            const response = await getLoggedUser();

            if (response.success) {
                dispatch(
                    setUser(response.data)
                );
            } else {
                localStorage.removeItem("token");

                toast.error(response.message);

                navigate("/login");
            }

        } catch (error) {
            localStorage.removeItem("token");

            navigate("/login");

        } finally {
            dispatch(hideLoader());
        }
    };

    const getAllUser = async () => {
        try {
            dispatch(showLoader());

            const response = await getAllUsers();

            if (response.success) {
                dispatch(
                    setAllUser(response.data)
                );
            } else {
                localStorage.removeItem("token");

                toast.error(response.message);

                navigate("/login");
            }

        } catch (error) {
            localStorage.removeItem("token");

            navigate("/login");

        } finally {
            dispatch(hideLoader());
        }
    };

    useEffect(() => {
        if (token) {
            getLoggedInUser();

            getAllUser();
        } else {
            navigate("/login");
        }
    }, []);

    return children;
}

export default ProtectedRoute;