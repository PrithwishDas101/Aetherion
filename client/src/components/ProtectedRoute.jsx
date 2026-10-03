import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import { getLoggedUser, getAllUsers } from "../apiCalls/userApi.js";
import { getAllChats } from "../apiCalls/chatApi.js";
import { showLoader, hideLoader } from "../redux/sliceLoader.js";
import {
  setUser,
  setAllUser,
  setAllChats,
  setInitialPresence,
} from "../redux/userSlice.js";

function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [authStatus, setAuthStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (!cancelled) {
          setAuthStatus("unauthenticated");
          navigate("/login", { replace: true });
        }
        return;
      }

      dispatch(showLoader());

      try {
        const response = await getLoggedUser();

        if (cancelled) {
          return;
        }

        if (!response?.success) {
          if (response?.status === 401 || response?.status === 403) {
            localStorage.removeItem("token");
            setAuthStatus("unauthenticated");
            toast.error(response.message || "Your session has expired.");
            navigate("/login", { replace: true });
          } else {
            setAuthStatus("unavailable");
            toast.error(
              response?.message || "Unable to verify your session right now.",
            );
          }
          return;
        }

        dispatch(setUser(response.data));

        const [usersResponse, chatsResponse] = await Promise.all([
          getAllUsers(),
          getAllChats(),
        ]);

        if (cancelled) {
          return;
        }

        if (
          usersResponse?.status === 401 ||
          usersResponse?.status === 403 ||
          chatsResponse?.status === 401 ||
          chatsResponse?.status === 403
        ) {
          localStorage.removeItem("token");
          setAuthStatus("unauthenticated");
          toast.error("Your session has expired.");
          navigate("/login", { replace: true });
          return;
        }

        if (usersResponse?.success) {
          dispatch(setAllUser(usersResponse.users));
          dispatch(setInitialPresence(usersResponse.users));
        } else {
          toast.error(usersResponse?.message || "Unable to load users.");
        }

        if (chatsResponse?.success) {
          dispatch(setAllChats(chatsResponse.data));
        } else {
          toast.error(chatsResponse?.message || "Unable to load your chats.");
        }

        setAuthStatus("authenticated");
      } catch (error) {
        if (!cancelled) {
          setAuthStatus("unavailable");
          toast.error("Unable to verify your session right now.");
        }
      } finally {
        if (!cancelled) {
          dispatch(hideLoader());
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [dispatch, navigate]);

  if (authStatus !== "authenticated") {
    return null;
  }

  return children;
}

export default ProtectedRoute;
