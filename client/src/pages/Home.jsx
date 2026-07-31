import React from "react";
import { useSelector } from "react-redux";

import Header from "../components/Header.jsx";
import Sidebar from "../components/SideBar.jsx";
import Chat from "../components/Chat.jsx";

const Home = () => {

    const { selectedChat } = useSelector(
        state => state.userReducer
    );

    return (

        <div className="flex h-screen flex-col overflow-hidden bg-[#080d09]">

            <Header />

            <div className="flex min-h-0 flex-1 gap-5 px-5 py-[10px]">

                {/* LEFT SIDE */}
                <Sidebar />

                {/* RIGHT SIDE — FIXED */}
                <div className="min-h-0 flex-1 overflow-hidden">

                    {selectedChat && <Chat />}

                </div>

            </div>

        </div>

    );

};

export default Home;