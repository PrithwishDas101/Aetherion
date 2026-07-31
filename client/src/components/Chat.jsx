import { useSelector } from "react-redux";

const Chat = () => {

    const { selectedChat, user } = useSelector(
        state => state.userReducer
    );

    const selectedUser = selectedChat.members.find(
        u => u._id !== user._id
    );

    return (

        <div className="flex h-full flex-col rounded-2xl border border-[#d8f45a]/15 bg-[#0b100c] px-8 py-5">

            {/* RECEIVER DATA */}
            <div className="mb-5 border-b border-[#d8f45a]/15 px-7 py-3 text-right font-bold text-[#d8f45a]">

                {
                    selectedUser.firstName +
                    " " +
                    selectedUser.lastName
                }

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