import { useDispatch, useSelector } from "react-redux";
import { useRef, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { FaPaperPlane } from "react-icons/fa";
import toast from "react-hot-toast";

import { createMessage } from "../apiCalls/messageApi.js";

import {
    showLoader,
    hideLoader,
} from "../redux/sliceLoader.js";

import {
    setSelectedChat,
} from "../redux/userSlice.js";

const Chat = () => {

    const dispatch = useDispatch();

    const {
        selectedChat,
        user,
    } = useSelector(
        state => state.userReducer
    );

    const selectedUser =
        selectedChat.members.find(
            u => u._id !== user._id
        );

    const [message, setMessage] =
        useState("");

    const messageInputRef =
        useRef(null);

    const handleMessageChange = (
        event
    ) => {

        setMessage(
            event.target.value
        );

        const textarea =
            event.target;

        textarea.style.height =
            "auto";

        textarea.style.height =
            `${Math.min(
                textarea.scrollHeight,
                120
            )}px`;

    };

    const sendMessage = async () => {

        if (!message.trim()) {
            return;
        }

        try {

            const messageData = {

                chat:
                    selectedChat._id,

                sender:
                    user._id,

                text:
                    message.trim(),

            };

            dispatch(
                showLoader()
            );

            const response =
                await createMessage(
                    messageData
                );

            if (response.success) {

                setMessage("");

                if (
                    messageInputRef.current
                ) {

                    messageInputRef
                        .current
                        .style.height =
                        "48px";

                }

            } else {

                toast.error(
                    response.message
                );

            }

        } catch (error) {

            toast.error(

                error.response
                    ?.data
                    ?.message ||

                "Unable to send message."

            );

        } finally {

            dispatch(
                hideLoader()
            );

        }

    };

    return (

        <div className="flex h-full flex-col rounded-2xl border border-[#d8f45a]/15 bg-[#0b100c] px-8 py-5">

            {/* RECEIVER DATA */}
            <div className="mb-5 flex items-center border-b border-[#d8f45a]/15 px-7 py-3">

                {/* MOBILE BACK BUTTON */}
                <button
                    type="button"

                    onClick={() =>
                        dispatch(
                            setSelectedChat(
                                null
                            )
                        )
                    }

                    className="mr-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#f9fbf2] transition hover:bg-[#d8f45a]/10 md:hidden"

                    aria-label="Back to chats"
                >

                    <FiArrowLeft
                        className="text-xl"
                    />

                </button>

                {/* SELECTED USER */}
                <div className="flex-1 text-right font-bold text-[#edefe5]">

                    {
                        selectedUser.firstName +
                        " " +
                        selectedUser.lastName
                    }

                </div>

            </div>

            {/* CHAT AREA */}
            <div className="flex-1 overflow-y-auto px-2 py-3">

                Chat Area

            </div>

            {/* SEND MESSAGE */}
            <div className="relative mt-5">

                <textarea

                    ref={
                        messageInputRef
                    }

                    value={
                        message
                    }

                    onChange={
                        handleMessageChange
                    }

                    onKeyDown={(
                        event
                    ) => {

                        if (

                            event.key ===
                            "Enter" &&

                            !event.shiftKey

                        ) {

                            event.preventDefault();

                            sendMessage();

                        }

                    }}

                    placeholder="Message"

                    rows="1"

                    className="max-h-[120px] min-h-12 w-full resize-none overflow-y-auto rounded-xl border border-[#d8f45a]/15 bg-[#080d09] py-3 pl-5 pr-14 text-sm text-[#f1eee8] outline-none placeholder:text-[#70786f] transition focus:border-[#d8f45a]/50"

                />

                {/* SEND BUTTON */}
                <button

                    type="button"

                    onClick={
                        sendMessage
                    }

                    className="absolute right-2 bottom-1.5 flex h-9 w-9 items-center justify-center rounded-lg text-[#d8f45a] transition hover:bg-[#d8f45a]/10"

                    aria-label="Send message"

                >

                    <FaPaperPlane
                        className="text-lg"
                    />

                </button>

            </div>

        </div>

    );

};

export default Chat;