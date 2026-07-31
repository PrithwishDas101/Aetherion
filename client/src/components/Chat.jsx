import { useDispatch, useSelector } from "react-redux";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import { FiArrowLeft } from "react-icons/fi";
import { FaPaperPlane } from "react-icons/fa";

import toast from "react-hot-toast";

import {
    createMessage,
    getAllMessages,
} from "../apiCalls/messageApi.js";

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


    const [
        message,
        setMessage,
    ] = useState("");


    const [
        allMessages,
        setAllMessages,
    ] = useState([]);


    const messageInputRef =
        useRef(null);


    const messagesEndRef =
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

        const messageText =
            message.trim();


        if (!messageText) {
            return;
        }


        try {

            const messageData = {

                chatId:
                    selectedChat._id,

                text:
                    messageText,

            };


            const response =
                await createMessage(
                    messageData
                );


            if (response?.success) {

                setAllMessages(
                    previousMessages => [

                        ...previousMessages,

                        response.data,

                    ]
                );


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

                    response?.message ||

                    "Unable to send message."

                );

            }

        } catch (error) {

            console.error(
                "Send message error:",
                error
            );


            toast.error(

                error.response
                    ?.data
                    ?.message ||

                "Unable to send message."

            );

        }

    };


    const getMessages = async () => {

        try {

            dispatch(
                showLoader()
            );


            const response =
                await getAllMessages(
                    selectedChat._id
                );


            if (
                response?.success
            ) {

                setAllMessages(

                    response.data || []

                );

            } else {

                toast.error(

                    response?.message ||

                    "Unable to fetch messages."

                );

            }

        } catch (error) {

            console.error(
                "Get messages error:",
                error
            );


            toast.error(
                "Unable to fetch messages."
            );

        } finally {

            dispatch(
                hideLoader()
            );

        }

    };


    /* FETCH MESSAGES
    WHEN CHAT CHANGES */

    useEffect(() => {

        if (
            selectedChat?._id
        ) {

            getMessages();

        }

    }, [
        selectedChat?._id
    ]);


    /* AUTO-SCROLL TO
    THE NEWEST MESSAGE */

    useEffect(() => {

        messagesEndRef
            .current
            ?.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "end",

            });

    }, [
        allMessages
    ]);


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

            <div className="scrollbar-aetherion flex-1 overflow-y-auto px-2 py-3">


                <div className="flex flex-col gap-2">


                    {
                        allMessages.length === 0 && (

                            <div className="flex h-full items-center justify-center">

                                <p className="text-sm text-[#70786f]">

                                    No messages yet.

                                </p>

                            </div>

                        )
                    }


                    {
                        allMessages.map(
                            msg => {

                                const senderId =

                                    typeof msg.sender ===
                                    "object"

                                        ? msg.sender._id

                                        : msg.sender;


                                const isMyMessage =

                                    String(
                                        senderId
                                    ) ===

                                    String(
                                        user._id
                                    );


                                return (

                                    <div

                                        key={
                                            msg._id
                                        }

                                        className={`flex ${
                                            isMyMessage

                                                ? "justify-end"

                                                : "justify-start"
                                        }`}

                                    >


                                        <div

                                            className={`w-fit max-w-[75%] break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                                isMyMessage

                                                    ? "rounded-tr-sm bg-[#d8f164] text-[#10120d]"

                                                    : "rounded-bl-sm border border-[#d8f45a]/10 bg-[#18221a] text-[#f1eee8]"
                                            }`}

                                        >

                                            {
                                                msg.text
                                            }

                                        </div>


                                    </div>

                                );

                            }
                        )
                    }


                    {/* AUTO-SCROLL TARGET */}

                    <div
                        ref={
                            messagesEndRef
                        }
                    />


                </div>


            </div>


            {/* SEND MESSAGE */}

            <div className="mt-5 flex items-end gap-3">


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

                    className="scrollbar-aetherion max-h-[120px] min-h-12 flex-1 resize-none overflow-y-auto rounded-2xl border border-[#d8f45a]/15 bg-[#080d09] px-5 py-3 text-sm text-[#f1eee8] outline-none placeholder:text-[#70786f] transition focus:border-[#d8f45a]/50"

                />


                {/* SEND BUTTON */}

                <button

                    type="button"

                    onClick={
                        sendMessage
                    }

                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d8f45a] text-[#10120d] transition hover:bg-[#e4ff6f] active:scale-95"

                    aria-label="Send message"

                >

                    <FaPaperPlane
                        className="ml-0.5 text-xl"
                    />

                </button>


            </div>


        </div>

    );

};


export default Chat;