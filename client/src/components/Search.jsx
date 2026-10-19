import React from "react";
import { FiSearch } from "react-icons/fi";

const Search = ({
  searchKey,
  setSearchKey,
  searchInputRef,
  highlightSearch,
}) => {
  return (
    <div className="relative mb-5">
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search users..."
        value={searchKey}
        onChange={(e) => setSearchKey(e.target.value)}
        className={`h-10 w-full rounded-full border border-[#E5E5E5] bg-[#FFFFFF] py-2 pl-5 pr-12 text-sm text-[#171717] outline-none placeholder:text-[#737373] transition-all duration-300 focus:border-[#171717]/60 ${
          highlightSearch
            ? "ring-1 ring-[#171717]/40 shadow-[0_0_10px_rgba(0,0,0,0.10)] "
            : ""
        }`}
      />

      <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-[#171717]" />
    </div>
  );
};

export default Search;
