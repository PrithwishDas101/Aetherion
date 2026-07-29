import React from "react";
import { FiSearch } from "react-icons/fi";

function Search({ searchKey, setSearchKey }) {
    return (
        <div className="relative mb-5">

            <input
                type="text"
                placeholder="Search users..."
                value={searchKey}
                onChange={(e) =>
                    setSearchKey(e.target.value)
                }
                className="h-10 w-full rounded-full border border-[#d8f45a]/20 bg-[#0b100c] py-2 pl-5 pr-12 text-sm text-[#f1eee8] outline-none placeholder:text-[#70786f] focus:border-[#d8f45a]/60"
            />

            <FiSearch
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-[#d8f45a]"
            />

        </div>
    );
}

export default Search;