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


    /*
    WAIT UNTIL THE
    LOGGED-IN USER
    IS AVAILABLE
    */

    if (!currentUser?._id) {

        return null;

    }


    const startNewChat = async (
        searchedUserId
    ) => {

        try {

            dispatch(
                showLoader()
            );


            const response =
                await createChat([
                    currentUser._id,
                    searchedUserId,
                ]);


            if (
                response?.success
            ) {

                toast.success(
                    response.message
                );


                const newChat =
                    response.data;


                dispatch(
                    setAllChats([
                        ...(allChats || []),
                        newChat,
                    ])
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


    const findChatWithUser = (
        userId
    ) => {

        return (
            allChats || []
        ).find(
            chat => {

                const memberIds =

                    (
                        chat.members || []
                    )
                        .filter(
                            Boolean
                        )
                        .map(
                            member =>
                                String(
                                    member._id
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


    const openChat = (
        selectedUserId
    ) => {

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


    return (

        <div>

            {
                (allUsers || [])

                    .filter(
                        user => {

                            /*
                            DO NOT SHOW THE
                            CURRENT USER
                            */

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


                            const searchValue =

                                (
                                    searchKey || ""
                                )
                                    .toLowerCase();


                            const matchesSearch =

                                (
                                    user?.firstName ||
                                    ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        searchValue
                                    ) ||

                                (
                                    user?.lastName ||
                                    ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        searchValue
                                    );


                            const alreadyHasChat =

                                Boolean(

                                    findChatWithUser(
                                        user._id
                                    )

                                );


                            return (

                                (

                                    Boolean(
                                        searchValue
                                    ) &&

                                    matchesSearch

                                ) ||

                                alreadyHasChat

                            );

                        }
                    )

                    .map(
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


                                        {/* AVATAR */}

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
                                                            (
                                                                user.firstName ||
                                                                ""
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()
                                                        }

                                                        {
                                                            (
                                                                user.lastName ||
                                                                ""
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()
                                                        }

                                                    </div>

                                                )
                                        }


                                        {/* USER DETAILS */}

                                        <div className="min-w-0 flex-1">


                                            {/* NAME + TIME */}

                                            <div className="flex items-center gap-3">


                                                <div

                                                    className={`min-w-0 flex-1 truncate text-sm font-semibold transition-colors ${isSelected

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

                                                            className={`shrink-0 text-[10px] font-medium transition-colors ${isSelected

                                                                    ? "text-[#c8d17c]"

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


                                            {/* LAST MESSAGE OR EMAIL */}

                                            <div

                                                className={`mt-1 truncate text-xs transition-colors ${isSelected

                                                        ? "text-[#b4bcae]"

                                                        : "text-[#858d84]"

                                                    }`}

                                            >

                                                {
                                                    userChat

                                                        ? (

                                                            lastMessage

                                                        )

                                                        : (

                                                            user.email

                                                        )
                                                }

                                            </div>


                                        </div>


                                        {/* START CHAT */}

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