import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getLoggedUser } from "../apiCalls/userApi.js";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../redux/sliceLoader.js";

function ProtectedRoute({ children }) {
    const [user, setUser] = useState(null);
    const dispatch = useDispatch();

    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const getLoggedinUser = async () => {
        try {
            dispatch(showLoader());
            const response = await getLoggedUser();
            dispatch(hideLoader());

            if (response.success) {
                setUser(response.data);
            } else {
                navigate("/login");
            }
        } catch (error) {
            navigate("/login");
        }
    };

    useEffect(() => {
        if (token) {
            getLoggedinUser();
        } else {
            navigate("/login");
        }
    }, []);

    return (
        <div>
            {user && (
                <>
                    <p>
                        Name: {user.firstName + " " + user.lastName}
                    </p>
                    <p>
                        Email: {user.email}
                    </p>
                </>
            )}

            {children}
        </div>
    );
}

export default ProtectedRoute;