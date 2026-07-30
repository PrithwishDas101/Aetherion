import { useSelector } from "react-redux";

function UserList({ searchKey }) {

    const { allUsers, allChats } = useSelector(
        state => state.userReducer
    );

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
                                chat.members.includes(
                                    user._id
                                )
                        );

                    return (
                        matchesSearch &&
                        searchKey
                    ) || alreadyHasChat;

                }).
                map(user => {

                    return (

                        <div
                            key={user._id}
                            className="cursor-pointer border-b border-[#d8f45a]/10 px-3 py-4 transition hover:bg-[#d8f45a]/5"
                        >

                            <div className="flex items-center gap-3">

                                {/* Avatar */}
                                {user.profilePic && (

                                    <img
                                        src={user.profilePic}
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

                                    <div className="truncate text-sm font-semibold text-[#f1eee8]">

                                        {
                                            user.firstName +
                                            " " +
                                            user.lastName
                                        }

                                    </div>

                                    <div className="mt-1 truncate text-xs text-[#858d84]">

                                        {
                                            user.email
                                        }

                                    </div>

                                </div>

                                {/* Start chat */}
                                {
                                    !allChats?.find(
                                        chat =>
                                            chat.members.includes(
                                                user._id
                                            )
                                    ) && (

                                        <button
                                            type="button"
                                            className="shrink-0 rounded-lg bg-[#d8f45a] px-3 py-2 text-xs font-semibold text-[#10120d]"
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