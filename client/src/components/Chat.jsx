import { useDispatch, useSelector } from "react-redux";
import { FiArrowLeft } from "react-icons/fi";

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

    const { selectedChat, user } = useSelector(
        state => state.userReducer
    );

    const selectedUser = selectedChat.members.find(
        u => u._id !== user._id
    );

    const sendMessage = async () => {

        try {

            const message = {
                chat: selectedChat._id,
                sender: user._id,
                text: '',
            };

            dispatch(showLoader());

            const response = await createMessage(
                message
            );

            dispatch(hideLoader());

        } catch (error) {

            dispatch(hideLoader());

            return error.response?.data;

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
                            setSelectedChat(null)
                        )
                    }
                    className="mr-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#f9fbf2] transition hover:bg-[#d8f45a]/10 md:hidden"
                    aria-label="Back to chats"
                >

                    <FiArrowLeft className="text-xl" />

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
            <div>
                Chat Area
            </div>

            {/* SEND MESSAGE */}
            <div>
                Send Message
            </div>

        </div>

    );

};

export default Chat;