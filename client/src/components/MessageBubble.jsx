import {
    formatMessageTime,
} from "../utils/messageDate.js";


const MessageBubble = ({
    message,
    isMyMessage,
}) => {

    const messageTime =
        formatMessageTime(
            message.createdAt
        );


    return (

        <div
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

                <div className="whitespace-pre-wrap">

                    {message.text}

                </div>


                <div
                    className={`mt-1 flex justify-end text-[10px] leading-none ${
                        isMyMessage

                            ? "text-[#10120d]/60"

                            : "text-[#aab3a8]"
                    }`}
                >

                    {messageTime}

                </div>

            </div>

        </div>

    );

};


export default MessageBubble;