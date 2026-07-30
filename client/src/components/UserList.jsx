import { useSelector } from "react-redux";

function UserList({ searchKey }) {

    const { allUsers } = useSelector(
        state => state.userReducer
    );

    return (
        <div>

            {allUsers?.
                filter(user => {
                    return (user.firstName.toLowerCase().includes(searchKey.toLowerCase()) ||
                        user.lastName.toLowerCase().includes(searchKey.toLowerCase())) && searchKey
                }).
                map(user => {

                    return (
                        <div
                            key={user._id}
                            className="cursor-pointer border-b border-[#d8f45a]/10 px-3 py-4 transition hover:bg-[#d8f45a]/5"
                        >

                            <div className="flex items-center gap-3">

                                {/* Avatar */}
                                {user.profilePic && <img src={user.profilePic} alt="Profile Pic" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#cacfb4] text-sm font-bold text-[#10120d]" />}
                                {!user.profilePic && <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#cacfb4] text-sm font-bold text-[#10120d]">
                                    {
                                        user.firstName.charAt(0).toUpperCase() +
                                        user.lastName.charAt(0).toUpperCase()
                                    }
                                </div>}

                                {/* User details */}
                                <div className="min-w-0 flex-1">

                                    <div className="truncate text-sm font-semibold text-[#f1eee8]">
                                        {
                                            user.firstName + " " +
                                            user.lastName
                                        }
                                    </div>

                                    <div className="mt-1 truncate text-xs text-[#858d84]">
                                        {
                                            user.email
                                        }
                                    </div>

                                </div>

                            </div>

                        </div>
                    );

                })}

        </div>
    );
}

export default UserList;