import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Header from "../components/Header.jsx";
import Sidebar from "../components/SideBar.jsx";
import Chat from "../components/Chat.jsx";
import { setTyping, clearTyping, setAllChats, setSelectedChat, setUserOnline, setUserOffline, setPresenceState } from "../redux/userSlice.js";
import socket from "../sockets/socket.js";
import { joinRoom, getPresence, } from "../sockets/socketEmitters.js";
import registerSocketListeners from "../sockets/socketListeners.js";


const Home = () => {

    const { selectedChat, user, allChats } = useSelector(state => state.userReducer);
    const dispatch = useDispatch();

    useEffect(() => {

        if (!user?._id) {
            return;
        }

        const handleConnect = () => {

            joinRoom(
                socket,
                user._id
            );

            getPresence(
                socket
            );

        };

        if (socket.connected) {

            handleConnect();

        }

        socket.on(
            "connect",
            handleConnect
        );

        return () => {

            socket.off(
                "connect",
                handleConnect
            );

        };

    }, [user?._id]);

    useEffect(() => {

        const handleTyping = data => {

            dispatch(
                setTyping({
                    chatId: data.chatId,
                    userId: data.sender,
                })
            );

        };

        const handleStopTyping = data => {

            dispatch(
                clearTyping({
                    chatId: data.chatId,
                })
            );

        };

        const handleMessagesRead = data => {

            const updatedChat =
                data.chat;

            if (!updatedChat) {
                return;
            }

            const updatedChats =
                (allChats || []).map(
                    chat =>
                        String(chat._id) ===
                            String(updatedChat._id)
                            ? updatedChat
                            : chat
                );

            dispatch(
                setAllChats(
                    updatedChats
                )
            );

            if (
                String(selectedChat?._id) ===
                String(updatedChat._id)
            ) {

                dispatch(
                    setSelectedChat(
                        updatedChat
                    )
                );

            }

        };

        const cleanup =
            registerSocketListeners(
                socket,
                {
                    onTyping:
                        handleTyping,

                    onStopTyping:
                        handleStopTyping,

                    onMessagesRead:
                        handleMessagesRead,
                }
            );

        return cleanup;

    }, [dispatch, allChats, selectedChat,]);

    useEffect(() => {

        const handleUserOnline = data => {

            if (!data?.userId) {
                return;
            }

            dispatch(
                setUserOnline(
                    data.userId
                )
            );

        };

        const handleUserOffline = data => {

            if (!data?.userId) {
                return;
            }

            dispatch(
                setUserOffline({
                    userId:
                        data.userId,

                    lastSeen:
                        data.lastSeen,
                })
            );

        };

        const handlePresenceState = data => {

            dispatch(
                setPresenceState(
                    data?.userIds || []
                )
            );

        };

        return registerSocketListeners(
            socket,
            {
                onUserOnline:
                    handleUserOnline,

                onUserOffline:
                    handleUserOffline,

                onPresenceState:
                    handlePresenceState,
            }
        );

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

                    <Sidebar socket={socket} />

                </div>

                {/* CHAT AREA */}
                <div
                    className={`min-h-0 flex-1 overflow-hidden ${selectedChat ? "block" : "hidden"} md:block`}
                >

                    {selectedChat && (<Chat socket={socket} />)}

                </div>

            </div>

        </div>

    );

};

export default Home;