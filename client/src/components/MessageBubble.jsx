import { IoCheckmark, IoCheckmarkDone, } from "react-icons/io5";
import { FiCornerUpLeft, FiCornerUpRight, } from "react-icons/fi";

import { formatMessageTime, } from "../utils/messageDate.js";
import ReplyMessage from "./ReplyMessage.jsx";

const MessageBubble = ({ message, isMyMessage, onReply, currentUserId, otherUserName, }) => {

    const messageTime =
        formatMessageTime(
            message.createdAt
        );

    return (

        <div
            className={`group flex items-center gap-2 ${isMyMessage
                ? "justify-end"
                : "justify-start"
                }`}
        >

            {
                !isMyMessage && (

                    <div
                        className="order-2"
                    >

                        <button
                            type="button"

                            onClick={
                                () =>
                                    onReply(
                                        message
                                    )
                            }

                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#8d9689] opacity-0 transition hover:bg-[#d8f45a]/10 hover:text-[#f4ffc3] group-hover:opacity-100"

                            aria-label="Reply to message"
                        >

                            <FiCornerUpRight
                                className="text-lg"
                            />

                        </button>

                    </div>

                )
            }


            <div
                className={`order-1 w-fit max-w-[75%] break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isMyMessage
                    ? "rounded-tr-sm bg-[#d8f164] text-[#10120d]"
                    : "rounded-bl-sm border border-[#d8f45a]/10 bg-[#18221a] text-[#f1eee8]"
                    }`}
            >

                <ReplyMessage
                    replyTo={
                        message.replyTo
                    }

                    isMyMessage={
                        isMyMessage
                    }

                    currentUserId={
                        currentUserId
                    }

                    otherUserName={
                        otherUserName
                    }
                />


                <div
                    className="whitespace-pre-wrap"
                >

                    {message.text}

                </div>


                <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] leading-none ${isMyMessage
                        ? "text-[#10120d]/60"
                        : "text-[#aab3a8]"
                        }`}
                >

                    <span>

                        {messageTime}

                    </span>


                    {
                        isMyMessage && (

                            message.read

                                ? (

                                    <IoCheckmarkDone
                                        className="text-sm text-[#2196f3]"
                                    />

                                )

                                : (

                                    <IoCheckmark
                                        className="text-sm text-[#5d654f]"
                                    />

                                )

                        )
                    }

                </div>

            </div>


            {
                isMyMessage && (

                    <button
                        type="button"

                        onClick={
                            () =>
                                onReply(
                                    message
                                )
                        }

                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#8d9689] opacity-0 transition hover:bg-[#d8f45a]/10 hover:text-[#d8f45a] group-hover:opacity-100"

                        aria-label="Reply to message"
                    >

                        <FiCornerUpLeft
                            className="text-lg"
                        />

                    </button>

                )
            }

        </div>

    );

};


export default MessageBubble;