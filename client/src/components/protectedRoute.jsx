import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getLoggedUser } from "../apiCalls/userApi.js";

function ProtectedRoute({ children }) {
    const [user, setUser] = useState(null);

    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const getLoggedinUser = async () => {
        try {
            const response = await getLoggedUser();

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
    }, [token, navigate]);

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