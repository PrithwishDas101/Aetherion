import { useEffect, useRef, useState, } from "react";
import { useDispatch, useSelector, } from "react-redux";
import { FiArrowLeft, } from "react-icons/fi";
import { FaPaperPlane, } from "react-icons/fa";
import toast from "react-hot-toast";

import { createMessage, getAllMessages, } from "../apiCalls/messageApi.js";

import { clearUnreadMessage, } from "../apiCalls/chatApi.js";
import { showLoader, hideLoader, } from "../redux/sliceLoader.js";
import { setAllChats, setSelectedChat, } from "../redux/userSlice.js";
import { formatDateLabel, shouldShowDateSeparator, } from "../utils/messageDate.js";
import MessageBubble from "./MessageBubble.jsx";
import DateSeparator from "./DateSeparator.jsx";
import ReplyPreview from "./ReplyPreview.jsx";
import { sendMessage as emitSendMessage, sendTyping, sendStopTyping, } from "../sockets/socketEmitters.js";
import registerSocketListeners from "../sockets/socketListeners.js";

const Chat = ({ socket }) => {

    const dispatch = useDispatch();

    const {
        selectedChat,
        user,
        allChats,
        typingChats,
    } = useSelector(
        state => state.userReducer
    );

    const [message, setMessage] = useState("");
    const [allMessages, setAllMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const messageInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const typingTimeout = useRef(null);

    const isTyping =
        !!selectedChat?._id &&
        !!typingChats[selectedChat._id] &&
        String(typingChats[selectedChat._id]) !==
        String(user._id);

    const selectedUser = selectedChat?.members?.find(
        member =>
            String(member._id) !==
            String(user._id)
    );

    const unreadMessageCount = Number(
        selectedChat
            ?.unreadMessageCount
        ?.[String(user._id)]
    ) || 0;

    const startReply = selectedMessage => {

        setReplyingTo(
            selectedMessage
        );

        requestAnimationFrame(
            () => {

                messageInputRef.current
                    ?.focus();

            }
        );

    };

    const cancelReply = () => {

        setReplyingTo(
            null
        );

        messageInputRef.current
            ?.focus();

    };

    const updateChatInRedux = updatedChat => {

        if (!updatedChat) {
            return;
        }

        const existingChats =
            allChats || [];

        const updatedChats = [
            updatedChat,

            ...existingChats.filter(
                chat =>
                    String(chat._id) !==
                    String(updatedChat._id)
            ),
        ];

        dispatch(
            setAllChats(
                updatedChats
            )
        );

        dispatch(
            setSelectedChat(
                updatedChat
            )
        );

    };

    const updateChatWithoutReordering = updatedChat => {

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

        dispatch(
            setSelectedChat(
                updatedChat
            )
        );

    };

    const sendMessage = async () => {

        const messageText =
            message.trim();

        if (
            !messageText ||
            !selectedChat?._id ||
            isSending
        ) {
            return;
        }

        try {

            setIsSending(true);

            const response =
                await createMessage({

                    chatId:
                        selectedChat._id,

                    text:
                        messageText,

                    replyTo:
                        replyingTo?._id ||
                        null,

                });

            if (response?.success) {

                emitSendMessage(socket, {
                    message: response.data,
                    chat: response.chat,
                    members: selectedChat.members.map(
                        member => String(member._id)
                    ),
                });

                setAllMessages(
                    previousMessages => [

                        ...previousMessages,

                        response.data,

                    ]
                );

                if (response?.chat) {

                    updateChatInRedux(
                        response.chat
                    );

                }

                setMessage("");

                clearTimeout(
                    typingTimeout.current
                );

                sendStopTyping(socket, {
                    sender: user._id,
                    chatId: selectedChat._id,
                    members: selectedChat.members.map(
                        member => String(member._id)
                    ),
                });

                setReplyingTo(null);

                if (
                    messageInputRef.current
                ) {

                    messageInputRef.current.style.height =
                        "48px";

                    messageInputRef.current?.focus();

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

        } finally {

            setIsSending(false);

        }

    };

    const getMessages = async () => {

        if (
            !selectedChat?._id
        ) {
            return;
        }


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

    const clearUnreadMessages = async () => {

        if (
            !selectedChat?._id ||

            unreadMessageCount <= 0
        ) {
            return;
        }


        try {

            const response =
                await clearUnreadMessage(
                    selectedChat._id
                );


            if (
                !response?.success
            ) {

                console.error(

                    response?.message ||

                    "Unable to clear unread messages."

                );

                return;

            }


            if (
                response?.data
            ) {

                updateChatWithoutReordering(
                    response.data
                );

            }

        } catch (error) {

            console.error(

                "Clear unread messages error:",

                error

            );

        }

    };

    const handleMessageChange = event => {

        const value = event.target.value;

        setMessage(value);

        if (!selectedChat?._id) return;

        sendTyping(socket, {
            sender: user._id,
            chatId: selectedChat._id,
            members: selectedChat.members.map(
                member => String(member._id)
            ),
        });

        clearTimeout(
            typingTimeout.current
        );

        typingTimeout.current = setTimeout(() => {

            sendStopTyping(socket, {
                sender: user._id,
                chatId: selectedChat._id,
                members: selectedChat.members.map(
                    member => String(member._id)
                ),
            });

        }, 1000);

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

    useEffect(() => {

        if (!selectedChat?._id) {
            return;
        }

        getMessages();

        clearUnreadMessages();

    }, [selectedChat?._id]);

    useEffect(() => {

        const handleReceiveMessage = async data => {

            if (
                String(data.message.chatId) !==
                String(selectedChat?._id)
            ) {
                return;
            }

            setAllMessages(previous => {

                const alreadyExists = previous.some(
                    message =>
                        String(message._id) ===
                        String(data.message._id)
                );

                if (alreadyExists) {
                    return previous;
                }

                return [
                    ...previous,
                    data.message,
                ];

            });

            if (data.chat) {

                updateChatInRedux(
                    data.chat
                );

            }

            // CHAT IS CURRENTLY OPEN
            // Mark the incoming message as read immediately.

            try {

                const response =
                    await clearUnreadMessage(
                        selectedChat._id
                    );

                if (
                    response?.success &&
                    response?.data
                ) {

                    updateChatWithoutReordering(
                        response.data
                    );

                }

            } catch (error) {

                console.error(
                    "Instant read receipt error:",
                    error
                );

            }

        };

        return registerSocketListeners(
            socket,
            {
                onReceiveMessage:
                    handleReceiveMessage,
            }
        );
    }, [
        socket,
        selectedChat?._id,
    ]);

    useEffect(() => {

        const handleMessagesRead = data => {

            if (
                String(data.chatId) !==
                String(selectedChat?._id)
            ) {
                return;
            }

            setAllMessages(previousMessages =>
                previousMessages.map(message => {

                    const senderId =
                        typeof message.sender === "object"
                            ? message.sender?._id
                            : message.sender;

                    if (
                        String(senderId) ===
                        String(user._id)
                    ) {
                        return {
                            ...message,
                            read: true,
                        };
                    }

                    return message;

                })
            );

        };

        return registerSocketListeners(
            socket,
            {
                onMessagesRead:
                    handleMessagesRead,
            }
        );
    }, [
        socket,
        selectedChat?._id,
        user?._id,
    ]);

    useEffect(() => {

        return () => {

            clearTimeout(typingTimeout.current);

            if (selectedChat?._id) {

                sendStopTyping(socket, {
                    sender: user._id,
                    chatId: selectedChat._id,
                    members: selectedChat.members.map(
                        member => String(member._id)
                    ),
                });

            }

        };

    }, [selectedChat?._id]);

    useEffect(() => {

        messagesEndRef.current
            ?.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "end",

            });

        messageInputRef.current?.focus();

    }, [allMessages, isTyping]);


    if (!selectedChat) {
        return null;
    }

    return (

        <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#d8f45a]/15 bg-[#0b100c] px-4 py-4 sm:px-6 sm:py-5 lg:px-8">


            {/* CHAT HEADER */}

            <div className="mb-4 flex shrink-0 items-center border-b border-[#d8f45a]/15 px-2 py-3 sm:mb-5 sm:px-4">


                <button
                    type="button"

                    onClick={() =>
                        dispatch(
                            setSelectedChat(
                                null
                            )
                        )
                    }

                    className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#f9fbf2] transition hover:bg-[#d8f45a]/10 md:hidden"

                    aria-label="Back to chats"
                >

                    <FiArrowLeft
                        className="text-xl"
                    />

                </button>


                <div className="min-w-0 flex-1">

                    <p className="truncate text-right font-bold text-[#edefe5]">
                        {
                            selectedUser
                                ? `${selectedUser.firstName} ${selectedUser.lastName}`
                                : "Chat"
                        }
                    </p>

                    {
                        isTyping && (
                            <p className="text-right text-xs text-[#f1eee8]">
                                typing...
                            </p>
                        )
                    }

                </div>

            </div>

            {/* CHAT MESSAGES */}

            <div className="scrollbar-aetherion min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-1 py-3 sm:px-2">

                <div className="flex min-h-full min-w-0 flex-col gap-2">

                    {
                        allMessages.length === 0 && (

                            <div className="flex flex-1 items-center justify-center">

                                <p className="text-sm text-[#70786f]">

                                    No messages yet.

                                </p>

                            </div>

                        )
                    }


                    {
                        allMessages.map(

                            (
                                currentMessage,
                                index
                            ) => {

                                const previousMessage =

                                    allMessages[
                                    index - 1
                                    ];


                                const senderId =

                                    typeof currentMessage.sender ===
                                        "object"

                                        ? currentMessage
                                            .sender
                                            ?._id

                                        : currentMessage
                                            .sender;


                                const isMyMessage =

                                    String(senderId) ===

                                    String(user._id);


                                const showDate =

                                    shouldShowDateSeparator(

                                        currentMessage,

                                        previousMessage

                                    );


                                return (

                                    <div
                                        key={
                                            currentMessage._id
                                        }
                                    >


                                        {
                                            showDate && (

                                                <DateSeparator

                                                    label={
                                                        formatDateLabel(

                                                            currentMessage
                                                                .createdAt

                                                        )
                                                    }

                                                />

                                            )
                                        }


                                        <MessageBubble
                                            message={
                                                currentMessage
                                            }

                                            isMyMessage={
                                                isMyMessage
                                            }

                                            onReply={
                                                startReply
                                            }
                                        />

                                    </div>

                                );

                            }

                        )
                    }

                    {
                        isTyping && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl bg-[#171d17] px-3 py-2 max-w-fit transition-all duration-200 shadow-sm">
                                    <div className="flex items-center gap-1">
                                        <span
                                            className="h-1.5 w-1.5 rounded-full bg-[#d8f45a] animate-bounce"
                                        />
                                        <span
                                            className="h-1.5 w-1.5 rounded-full bg-[#d8f45a] animate-bounce"
                                            style={{ animationDelay: "0.15s" }}
                                        />
                                        <span
                                            className="h-1.5 w-1.5 rounded-full bg-[#d8f45a] animate-bounce"
                                            style={{ animationDelay: "0.3s" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    <div
                        ref={
                            messagesEndRef
                        }
                    />

                </div>

            </div>


            {/* MESSAGE INPUT */}

            <div className="mt-4 shrink-0 sm:mt-5">

                <ReplyPreview
                    message={
                        replyingTo
                    }

                    isMyMessage={
                        String(
                            replyingTo?.sender?._id ||
                            replyingTo?.sender
                        ) ===
                        String(
                            user._id
                        )
                    }

                    otherUserName={
                        selectedUser
                            ? `${selectedUser.firstName} ${selectedUser.lastName}`
                            : "User"
                    }

                    onCancel={
                        cancelReply
                    }
                />

                <div className="flex items-end gap-2 sm:gap-3">

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

                        onKeyDown={
                            event => {

                                if (
                                    event.key ===
                                    "Enter" &&
                                    !event.shiftKey
                                ) {

                                    event.preventDefault();

                                    sendMessage();

                                }

                            }
                        }

                        placeholder="Message"

                        rows="1"

                        disabled={
                            isSending
                        }

                        className="scrollbar-aetherion min-h-12 max-h-[120px] min-w-0 flex-1 resize-none overflow-x-hidden overflow-y-auto rounded-2xl border border-[#d8f45a]/15 bg-[#080d09] px-4 py-3 text-sm leading-5 text-[#f1eee8] outline-none placeholder:text-[#70786f] transition focus:border-[#d8f45a]/50 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
                    />

                    <button
                        type="button"

                        onClick={
                            sendMessage
                        }

                        disabled={
                            isSending ||
                            !message.trim()
                        }

                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d8f45a] text-[#10120d] transition hover:bg-[#e4ff6f] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"

                        aria-label="Send message"
                    >

                        <FaPaperPlane
                            className="ml-0.5 text-xl"
                        />

                    </button>

                </div>

            </div>

        </div >

    );

};

export default Chat;