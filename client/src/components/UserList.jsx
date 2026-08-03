import {
    useDispatch,
    useSelector,
} from "react-redux";

import toast from "react-hot-toast";

import {
    createChat,
} from "../apiCalls/chatApi.js";

import {
    hideLoader,
    showLoader,
} from "../redux/sliceLoader.js";

import {
    setAllChats,
    setSelectedChat,
} from "../redux/userSlice.js";

import {
    formatChatPreviewTime,
} from "../utils/messageDate.js";

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

    if (!currentUser?._id) {
        return null;
    }

    const startNewChat = async searchedUserId => {
        try {
            dispatch(
                showLoader()
            );

            const response =
                await createChat([
                    currentUser._id,
                    searchedUserId,
                ]);

            if (response?.success) {
                const newChat =
                    response.data;

                toast.success(
                    response.message
                );

                const chatAlreadyExists =
                    (allChats || []).some(
                        chat =>
                            String(
                                chat._id
                            ) ===
                            String(
                                newChat._id
                            )
                    );

                dispatch(
                    setAllChats(
                        chatAlreadyExists
                            ? allChats
                            : [
                                ...(allChats || []),
                                newChat,
                            ]
                    )
                );

                dispatch(
                    setSelectedChat(
                        newChat
                    )
                );
            } else {
                toast.error(
                    response?.message ||
                    "Unable to create chat."
                );
            }
        } catch (error) {
            console.error(
                "Create chat error:",
                error
            );

            toast.error(
                "Unable to create chat."
            );
        } finally {
            dispatch(
                hideLoader()
            );
        }
    };

    const findChatWithUser = userId => {
        return (
            allChats || []
        ).find(
            chat => {
                const memberIds =
                    (chat.members || [])
                        .filter(Boolean)
                        .map(
                            member =>
                                String(
                                    member?._id ||
                                    member
                                )
                        );

                return (
                    memberIds.includes(
                        String(
                            currentUser._id
                        )
                    ) &&
                    memberIds.includes(
                        String(
                            userId
                        )
                    )
                );
            }
        );
    };

    const openChat = selectedUserId => {
        const chat =
            findChatWithUser(
                selectedUserId
            );

        if (chat) {
            dispatch(
                setSelectedChat(
                    chat
                )
            );
        }
    };

    const normalizedSearchKey =
        (searchKey || "")
            .trim()
            .toLowerCase();

    const visibleUsers =
        (allUsers || [])
            .filter(
                user => {
                    if (
                        String(
                            user?._id
                        ) ===
                        String(
                            currentUser._id
                        )
                    ) {
                        return false;
                    }

                    const firstName =
                        (
                            user?.firstName ||
                            ""
                        )
                            .toLowerCase();

                    const lastName =
                        (
                            user?.lastName ||
                            ""
                        )
                            .toLowerCase();

                    const fullName =
                        `${firstName} ${lastName}`
                            .trim();

                    const matchesSearch =
                        firstName.includes(
                            normalizedSearchKey
                        ) ||
                        lastName.includes(
                            normalizedSearchKey
                        ) ||
                        fullName.includes(
                            normalizedSearchKey
                        );

                    const alreadyHasChat =
                        Boolean(
                            findChatWithUser(
                                user._id
                            )
                        );

                    if (
                        normalizedSearchKey
                    ) {
                        return matchesSearch;
                    }

                    return alreadyHasChat;
                }
            )
            .sort(
                (firstUser, secondUser) => {
                    const firstUserChat =
                        findChatWithUser(
                            firstUser._id
                        );

                    const secondUserChat =
                        findChatWithUser(
                            secondUser._id
                        );

                    if (
                        normalizedSearchKey
                    ) {
                        return 0;
                    }

                    return (
                        new Date(
                            secondUserChat
                                ?.updatedAt ||
                            0
                        ) -
                        new Date(
                            firstUserChat
                                ?.updatedAt ||
                            0
                        )
                    );
                }
            );

    return (
        <div>
            {
                visibleUsers.map(
                    user => {
                        const userChat =
                            findChatWithUser(
                                user._id
                            );

                        const lastMessage =
                            userChat
                                ?.lastMessage
                                ?.text ||
                            "";

                        const lastMessageTime =
                            formatChatPreviewTime(
                                userChat
                                    ?.lastMessage
                                    ?.createdAt
                            );

                        const lastMessageSenderId =
                            typeof userChat
                                ?.lastMessage
                                ?.sender ===
                                "object"
                                ? userChat
                                    ?.lastMessage
                                    ?.sender
                                    ?._id
                                : userChat
                                    ?.lastMessage
                                    ?.sender;

                        const currentUserId =
                            String(
                                currentUser._id
                            );

                        const unreadCount =
                            String(
                                lastMessageSenderId
                            ) !==
                                currentUserId
                                ? Number(
                                    userChat
                                        ?.unreadMessageCount
                                    ?.[
                                    currentUserId
                                    ]
                                ) || 0
                                : 0;

                        const isSelected =
                            String(
                                selectedChat?._id
                            ) ===
                            String(
                                userChat?._id
                            );

                        const userClass =
                            isSelected
                                ? "border-l-[3px] border-l-[#d8f45a] bg-[#182018] shadow-[inset_0_0_18px_rgba(216,244,90,0.035)]"
                                : "border-l-[3px] border-l-transparent hover:bg-[#101710]";

                        return (
                            <div
                                key={
                                    user._id
                                }
                                onClick={() =>
                                    openChat(
                                        user._id
                                    )
                                }
                                className={`group relative cursor-pointer border-b border-[#d8f45a]/10 px-3 py-4 transition-all duration-200 ${userClass}`}
                            >
                                <div className="flex items-center gap-3">
                                    {
                                        user.profilePic
                                            ? (
                                                <img
                                                    src={
                                                        user.profilePic
                                                    }
                                                    alt={`${user.firstName} ${user.lastName}`}
                                                    className="h-12 w-12 shrink-0 rounded-full bg-[#cacfb4] object-cover"
                                                />
                                            )
                                            : (
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#cacfb4] text-sm font-bold text-[#10120d]">

                                                    {
                                                        [
                                                            (user.firstName || "")
                                                                .trim()
                                                                .charAt(0),

                                                            ...(user.lastName || "")
                                                                .trim()
                                                                .split(/\s+/)
                                                                .map(
                                                                    name =>
                                                                        name.charAt(0)
                                                                ),
                                                        ]
                                                            .filter(Boolean)
                                                            .slice(0, 3)
                                                            .join("")
                                                            .toUpperCase()
                                                    }
                                                </div>
                                            )
                                    }

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`min-w-0 flex-1 truncate text-sm font-semibold transition-colors ${isSelected
                                                    ? "text-[#f7f7d0]"
                                                    : unreadCount > 0
                                                        ? "text-[#f7f7d0]"
                                                        : "text-[#f1eee8]"
                                                    }`}
                                            >
                                                {
                                                    `${user.firstName} ${user.lastName}`
                                                }
                                            </div>

                                            {
                                                lastMessageTime && (
                                                    <span
                                                        className={`shrink-0 text-[10px] font-medium transition-colors ${unreadCount > 0 &&
                                                            !isSelected
                                                            ? "text-[#e9fb95]"
                                                            : "text-[#7f8a7c]"
                                                            }`}
                                                    >
                                                        {
                                                            lastMessageTime
                                                        }
                                                    </span>
                                                )
                                            }
                                        </div>

                                        <div className="mt-1 flex items-center gap-2">
                                            <p
                                                className={`min-w-0 flex-1 truncate text-xs transition-colors ${unreadCount > 0 &&
                                                    !isSelected
                                                    ? "font-semibold text-[#999999]"
                                                    : isSelected
                                                        ? "text-[#b4bcae]"
                                                        : "text-[#858d84]"
                                                    }`}
                                            >
                                                {
                                                    userChat
                                                        ? (
                                                            lastMessage ||
                                                            "No messages yet."
                                                        )
                                                        : (
                                                            user.email
                                                        )
                                                }
                                            </p>

                                            {
                                                unreadCount > 0 &&
                                                !isSelected && (
                                                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#f1ffb5] px-1.5 text-[10px] font-bold text-[#10120d]">
                                                        {
                                                            unreadCount > 99
                                                                ? "99+"
                                                                : unreadCount
                                                        }
                                                    </span>
                                                )
                                            }
                                        </div>
                                    </div>

                                    {
                                        !userChat && (
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
                    }
                )
            }
        </div>
    );
}

export default UserList;