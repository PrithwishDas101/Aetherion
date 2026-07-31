import React, { useState } from "react";

import Search from "./Search.jsx";
import UserList from "./UserList.jsx";

function Sidebar() {

    const [searchKey, setSearchKey] =
        useState("");

    return (

        <div className="flex h-full w-full min-w-0 flex-col overflow-hidden">

            {/* SEARCH */}
            <div className="shrink-0">

                <Search
                    searchKey={searchKey}
                    setSearchKey={setSearchKey}
                />

            </div>

            {/* USER LIST — ONLY THIS AREA SCROLLS */}
            <div className="scrollbar-aetherion min-h-0 flex-1 overflow-y-auto">

                <UserList
                    searchKey={searchKey}
                />

            </div>

        </div>

    );

}

export default Sidebar;