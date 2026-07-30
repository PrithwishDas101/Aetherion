import React, { useState } from "react";

import Search from "./Search.jsx";
import UserList from "./UserList.jsx";

function Sidebar() {
    const [searchKey, setSearchKey] = useState("");

    return (
        <div className="w-[30%] min-w-[320px] px-5">

            <Search
                searchKey={searchKey}
                setSearchKey={setSearchKey}
            />

            <UserList
                searchKey={searchKey}
            />

        </div>
    );
}

export default Sidebar;