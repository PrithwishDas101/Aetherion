import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";

import Header from "../components/Header.jsx";
import Sidebar from "../components/SideBar.jsx";
import Chat from "../components/Chat.jsx";
import { setTyping, clearTyping, } from "../redux/userSlice.js";

const socket = io("http://localhost:8000");

const Home = () => {

    const { selectedChat, user, } = useSelector(state => state.userReducer);
    const dispatch = useDispatch();

    useEffect(() => {

        socket.on("connect", () => {

            console.log(
                "Socket connected:",
                socket.id
            );

        });

        return () => {

            socket.off("connect");

        };

    }, []);

    useEffect(() => {

        if (!user?._id) {
            return;
        }

        console.log(
            "Joining room:",
            user._id
        );

        socket.emit(
            "join-room",
            user._id
        );

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

        socket.on("typing", handleTyping);
        socket.on("stop-typing", handleStopTyping);

        return () => {

            socket.off("typing", handleTyping);
            socket.off("stop-typing", handleStopTyping);

        };

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