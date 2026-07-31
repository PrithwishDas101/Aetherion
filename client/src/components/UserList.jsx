import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { createChat } from "../apiCalls/chatApi.js";

import {
    hideLoader,
    showLoader,
} from "../redux/sliceLoader.js";

import {
    setAllChats,
    setSelectedChat,
} from "../redux/userSlice.js";

function UserList({ searchKey }) {

    const {
        allUsers,
        allChats,
        user: currentUser,
        selectedChat,
    } = useSelector(
        state => state.userReducer
    );

    const dispatch = useDispatch();

    const startNewChat = async (searchedUserId) => {

        try {

            dispatch(showLoader());

            const response = await createChat([
                currentUser._id,
                searchedUserId,
            ]);

            if (response.success) {

                toast.success(
                    response.message
                );

                const newChat =
                    response.data;

                const updatedChats = [
                    ...(allChats || []),
                    newChat,
                ];

                dispatch(
                    setAllChats(
                        updatedChats
                    )
                );

                dispatch(
                    setSelectedChat(
                        newChat
                    )
                );

            } else {

                toast.error(
                    response.message
                );

            }

        } catch (error) {

            toast.error(
                "Unable to create chat."
            );

        } finally {

            dispatch(hideLoader());

        }

    };

    const openChat = (selectedUserId) => {

        const chat = allChats?.find(
            chat =>
                chat.members
                    .map(m => m._id)
                    .includes(
                        currentUser._id
                    ) &&

                chat.members
                    .map(m => m._id)
                    .includes(
                        selectedUserId
                    )
        );

        if (chat) {

            dispatch(
                setSelectedChat(
                    chat
                )
            );

        }

    };

    return (

        <div>

            {allUsers
                ?.filter(user => {

                    const matchesSearch =

                        user.firstName
                            .toLowerCase()
                            .includes(
                                searchKey.toLowerCase()
                            ) ||

                        user.lastName
                            .toLowerCase()
                            .includes(
                                searchKey.toLowerCase()
                            );

                    const alreadyHasChat =

                        allChats?.some(
                            chat =>
                                chat.members
                                    .map(m => m._id)
                                    .includes(
                                        user._id
                                    )
                        );

                    return (

                        (
                            matchesSearch &&
                            searchKey
                        ) ||

                        alreadyHasChat

                    );

                })
                .map(user => {

                    const isSelected =

                        selectedChat?.members.some(
                            member =>
                                member._id ===
                                user._id
                        );

                    const userClass = isSelected

                        ? "border-l-[3px] border-l-[#d8f45a] bg-[#182018] shadow-[inset_0_0_18px_rgba(216,244,90,0.035)]"

                        : "border-l-[3px] border-l-transparent hover:bg-[#101710]";

                    return (

                        <div
                            key={user._id}
                            onClick={() =>
                                openChat(
                                    user._id
                                )
                            }
                            className={`group relative cursor-pointer border-b border-[#d8f45a]/10 px-3 py-4 transition-all duration-200 ${userClass}`}
                        >

                            <div className="flex items-center gap-3">

                                {/* Avatar */}
                                {user.profilePic && (

                                    <img
                                        src={
                                            user.profilePic
                                        }
                                        alt="Profile Pic"
                                        className="h-12 w-12 shrink-0 rounded-full bg-[#cacfb4] object-cover"
                                    />

                                )}

                                {!user.profilePic && (

                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#cacfb4] text-sm font-bold text-[#10120d]">

                                        {
                                            user.firstName
                                                .charAt(0)
                                                .toUpperCase() +

                                            user.lastName
                                                .charAt(0)
                                                .toUpperCase()
                                        }

                                    </div>

                                )}

                                {/* User details */}
                                <div className="min-w-0 flex-1">

                                    <div
                                        className={`truncate text-sm font-semibold transition-colors ${isSelected

                                                ? "text-[#f7f7d0]"

                                                : "text-[#f1eee8]"
                                            }`}
                                    >

                                        {
                                            user.firstName +
                                            " " +
                                            user.lastName
                                        }

                                    </div>

                                    <div
                                        className={`mt-1 truncate text-xs transition-colors ${isSelected

                                                ? "text-[#b4bcae]"

                                                : "text-[#858d84]"
                                            }`}
                                    >

                                        {
                                            user.email
                                        }

                                    </div>

                                </div>

                                {/* Start chat */}
                                {
                                    !allChats?.find(
                                        chat =>
                                            chat.members
                                                .map(
                                                    m => m._id
                                                )
                                                .includes(
                                                    user._id
                                                )
                                    ) && (

                                        <button
                                            type="button"
                                            className="shrink-0 rounded-lg bg-[#d8f45a] px-3 py-2 text-xs font-semibold text-[#10120d] transition hover:bg-[#e4ff6c]"
                                            onClick={
                                                event => {

                                                    event.stopPropagation();

                                                    startNewChat(
                                                        user._id
                                                    );

                                                }
                                            }
                                        >

                                            Start Chat

                                        </button>

                                    )
                                }

                            </div>

                        </div>

                    );

                })}

        </div>

    );

}

export default UserList;