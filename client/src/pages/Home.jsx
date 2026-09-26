import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import Header from "../components/Header.jsx";
import Sidebar from "../components/SideBar.jsx";
import Chat from "../components/Chat.jsx";
import {
  setTyping,
  clearTyping,
  setAllChats,
  setSelectedChat,
  setUserOnline,
  setUserOffline,
  setPresenceState,
  updateUserPublicPresenceStatus,
} from "../redux/userSlice.js";
import socket from "../sockets/socket.js";
import { joinRoom, getPresence } from "../sockets/socketEmitters.js";
import registerSocketListeners from "../sockets/socketListeners.js";
import EmptyChatState from "../components/EmptyChatState.jsx";

const Home = () => {
  const { selectedChat, user, allChats } = useSelector(
    (state) => state.userReducer,
  );
  const dispatch = useDispatch();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const [highlightSearch, setHighlightSearch] = useState(false);

  const hasNoChats = Array.isArray(allChats) && allChats.length === 0;

  const handleFindSomeone = () => {
    searchInputRef.current?.focus();

    setHighlightSearch(true);

    window.setTimeout(() => {
      setHighlightSearch(false);
    }, 1800);
  };

  useEffect(() => {
    if (!location.state?.focusUserSearch) {
      return;
    }

    // Sidebar/Search mounts as part of Home. Wait one frame so the ref is available.
    const frame = window.requestAnimationFrame(() => {
      handleFindSomeone();
    });

    // Clear the navigation state so pressing back/re-rendering doesn't repeatedly focus the search field.
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname,
    );

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [location.state?.focusUserSearch]);

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    socket.auth = {
      token: localStorage.getItem("token"),
    };

    const handleConnect = () => {
      getPresence(socket);
    };

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [user?._id]);

  useEffect(() => {
    const handleTyping = (data) => {
      dispatch(
        setTyping({
          chatId: data.chatId,
          userId: data.sender,
        }),
      );
    };

    const handleStopTyping = (data) => {
      dispatch(
        clearTyping({
          chatId: data.chatId,
        }),
      );
    };

    const handleMessagesRead = (data) => {
      const updatedChat = data.chat;

      if (!updatedChat) {
        return;
      }

      const updatedChats = (allChats || []).map((chat) =>
        String(chat._id) === String(updatedChat._id) ? updatedChat : chat,
      );

      dispatch(setAllChats(updatedChats));

      if (String(selectedChat?._id) === String(updatedChat._id)) {
        dispatch(setSelectedChat(updatedChat));
      }
    };

    const cleanup = registerSocketListeners(socket, {
      onTyping: handleTyping,

      onStopTyping: handleStopTyping,

      onMessagesRead: handleMessagesRead,
    });

    return cleanup;
  }, [dispatch, allChats, selectedChat]);

  useEffect(() => {
    const handleUserOnline = (data) => {
      if (!data?.userId) {
        return;
      }

      dispatch(setUserOnline(data.userId));
    };

    const handleUserOffline = (data) => {
      if (!data?.userId) {
        return;
      }

      dispatch(
        setUserOffline({
          userId: data.userId,

          lastSeen: data.lastSeen,
        }),
      );
    };

    const handlePresenceState = (data) => {
      dispatch(setPresenceState(data?.userIds || []));
    };

    const handlePublicPresenceUpdated = (data) => {
      if (
        !data?.userId ||
        !data?.publicPresenceStatus
      ) {
        return;
      }

      dispatch(
        updateUserPublicPresenceStatus({
          userId: data.userId,
          publicPresenceStatus:
            data.publicPresenceStatus,
        }),
      );
    };

    return registerSocketListeners(socket, {
      onUserOnline: handleUserOnline,

      onUserOffline: handleUserOffline,

      onPresenceState: handlePresenceState,

      onPublicPresenceUpdated:
        handlePublicPresenceUpdated,
    });
  }, [dispatch]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#080d09]">
      <div className={selectedChat ? "hidden md:block" : "block"}>
        <Header />
      </div>

      <div className="flex min-h-0 flex-1 gap-3 px-0 py-[10px] md:px-5">
        {/* CHAT LIST */}
        <div
          className={`min-h-0 w-full ${selectedChat ? "hidden" : "block"} md:block md:w-[30%] md:min-w-[320px]`}
        >
          <Sidebar
            socket={socket}
            searchInputRef={searchInputRef}
            highlightSearch={highlightSearch}
            onFindSomeone={handleFindSomeone}
          />
        </div>

        {/* CHAT AREA */}
        <div
          className={`min-h-0 flex-1 overflow-hidden ${selectedChat || hasNoChats ? "block" : "hidden"
            } md:block`}
        >
          {selectedChat ? (
            <Chat socket={socket} />
          ) : hasNoChats ? (
            <EmptyChatState onFindSomeone={handleFindSomeone} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Home;
