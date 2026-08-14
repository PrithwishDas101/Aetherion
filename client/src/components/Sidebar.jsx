import React, { useState } from "react";
import { useSelector } from "react-redux";

import Search from "./Search.jsx";
import UserList from "./UserList.jsx";
import EmptyChatState from "./EmptyChatState.jsx";

const Sidebar = ({
  socket,
  searchInputRef,
  highlightSearch,
  onFindSomeone,
}) => {
  const [searchKey, setSearchKey] = useState("");

  const { allChats } = useSelector((state) => state.userReducer);

  const hasNoChats = Array.isArray(allChats) && allChats.length === 0;

  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden">
      {/* SEARCH */}
      <div className="shrink-0">
        <Search
          searchKey={searchKey}
          setSearchKey={setSearchKey}
          searchInputRef={searchInputRef}
          highlightSearch={highlightSearch}
        />
      </div>

      {/* MOBILE EMPTY STATE */}
      {hasNoChats && (
        <div className="min-h-0 flex-1 md:hidden">
          <EmptyChatState onFindSomeone={onFindSomeone} />
        </div>
      )}

      {/* USER LIST */}
      <div
        className={`scrollbar-aetherion min-h-0 flex-1 overflow-y-auto ${
          hasNoChats ? "hidden md:block" : "block"
        }`}
      >
        <UserList searchKey={searchKey} socket={socket} />
      </div>
    </div>
  );
};

export default Sidebar;
