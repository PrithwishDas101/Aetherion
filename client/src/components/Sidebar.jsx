import React, { useState } from "react";

import Search from "./Search.jsx";

function Sidebar() {
    const [searchKey, setSearchKey] = useState("");

    return (
        <div className="w-[30%] px-5">

            <Search
                searchKey={searchKey}
                setSearchKey={setSearchKey}
            />

            {/* USER LIST */}

        </div>
    );
}

export default Sidebar;