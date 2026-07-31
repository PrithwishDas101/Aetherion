import React, { useState } from "react";

import Search from "./Search.jsx";
import UserList from "./UserList.jsx";

function Sidebar() {

    const [searchKey, setSearchKey] =
        useState("");

    return (

        <div className="flex min-h-0 w-[30%] min-w-[320px] flex-col overflow-hidden">

            <Search
                searchKey={searchKey}
                setSearchKey={setSearchKey}
            />

            <div className="min-h-0 flex-1 overflow-y-auto">

                <UserList
                    searchKey={searchKey}
                />

            </div>

        </div>

    );import React, { useState } from "react";

import Search from "./Search.jsx";
import UserList from "./UserList.jsx";

function Sidebar() {

    const [searchKey, setSearchKey] =
        useState("");

    return (

        <div className="flex h-full w-[30%] min-w-[320px] flex-col overflow-hidden">

            {/* SEARCH STAYS FIXED */}
            <Search
                searchKey={searchKey}
                setSearchKey={setSearchKey}
            />

            {/* ONLY USER LIST SCROLLS */}
            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-aetherion">

                <UserList
                    searchKey={searchKey}
                />

            </div>

        </div>

    );

}

export default Sidebar;

}

export default Sidebar;