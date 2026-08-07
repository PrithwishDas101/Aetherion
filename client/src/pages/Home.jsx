import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";

import Header from "../components/Header.jsx";
import Sidebar from "../components/SideBar.jsx";
import Chat from "../components/Chat.jsx";
import { setTyping, clearTyping, setAllChats, setSelectedChat, } from "../redux/userSlice.js";

const socket = io("http://localhost:8000");

const Home = () => {

    const { selectedChat, user, allChats } = useSelector(state => state.userReducer);
    const dispatch = useDispatch();

    useEffect(() => {

        if (!user?._id) {
            return;
        }

        const joinUserRoom = () => {

            

            socket.emit(
                "join-room",
                user._id
            );

        };

        if (socket.connected) {

            joinUserRoom();

        }

        socket.on(
            "connect",
            joinUserRoom
        );

        return () => {

            socket.off(
                "connect",
                joinUserRoom
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

            const updatedChat = data.chat;

            if (!updatedChat) {
                return;
            }

            const updatedChats = (allChats || []).map(
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

        socket.on(
            "typing",
            handleTyping
        );

        socket.on(
            "stop-typing",
            handleStopTyping
        );

        socket.on(
            "messages-read",
            handleMessagesRead
        );

        return () => {

            socket.off(
                "typing",
                handleTyping
            );

            socket.off(
                "stop-typing",
                handleStopTyping
            );

            socket.off(
                "messages-read",
                handleMessagesRead
            );

        };

    }, [dispatch, allChats, selectedChat]);

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