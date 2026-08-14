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
        className={`h-10 w-full rounded-full border border-[#d8f45a]/20 bg-[#0b100c] py-2 pl-5 pr-12 text-sm text-[#f1eee8] outline-none placeholder:text-[#70786f] transition-all duration-300 focus:border-[#d8f45a]/60 ${
          highlightSearch
            ? "ring-1 ring-[#d8f45a]/40 shadow-[0_0_10px_rgba(216,244,90,0.10)] "
            : ""
        }`}
      />

      <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-[#d8f45a]" />
    </div>
  );
};

export default Search;
