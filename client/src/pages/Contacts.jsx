import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    IoArrowBack,
    IoChatbubbleOutline,
    IoPersonAddOutline,
    IoSearch,
} from "react-icons/io5";

import { getContacts } from "../apiCalls/contactApi.js";
import { startChatWithUser } from "../utils/startChat.js";
import {
    getEffectivePresenceStatus,
} from "../utils/presenceStatus.js";
import PresenceIcon from "../components/PresenceIcon.jsx";

const CONTACTS_PER_PAGE = 50;

const getInitials = (user) => {
    const firstName = (user?.firstName || "")
        .trim();

    const lastName = (user?.lastName || "")
        .trim();

    const initials = [
        firstName.charAt(0),
        lastName.charAt(0),
    ]
        .filter(Boolean)
        .join("");

    return initials.toUpperCase() || "?";
};

const getFullName = (user) => {
    return `${user?.firstName || ""} ${user?.lastName || ""
        }`.trim();
};

const groupContacts = (contacts) => {
    return contacts.reduce((groups, contact) => {
        const letter =
            contact?.firstName
                ?.trim()
                ?.charAt(0)
                ?.toUpperCase() || "#";

        if (!groups[letter]) {
            groups[letter] = [];
        }

        groups[letter].push(contact);

        return groups;
    }, {});
};

function Contacts() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        user: currentUser,
        allChats,
    } = useSelector(
        (state) => state.userReducer,
    );

    const [contacts, setContacts] = useState([]);
    const [searchInput, setSearchInput] =
        useState("");

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] =
        useState(false);

    const [total, setTotal] = useState(0);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    /*
     * Load contacts whenever the search or page changes.
     */
    useEffect(() => {
        let cancelled = false;

        const loadContacts = async () => {
            setLoading(true);
            setError("");

            const response = await getContacts({
                search: searchInput.trim(),
                page,
                limit: CONTACTS_PER_PAGE,
            });

            if (cancelled) {
                return;
            }

            if (response?.success) {
                setContacts(response.data || []);

                setTotal(
                    response.pagination?.total || 0,
                );

                setHasMore(
                    Boolean(
                        response.pagination?.hasMore,
                    ),
                );
            } else {
                setContacts([]);
                setTotal(0);
                setHasMore(false);

                setError(
                    response?.message ||
                    "Unable to load contacts.",
                );
            }

            setLoading(false);
        };

        loadContacts();

        return () => {
            cancelled = true;
        };
    }, [searchInput, page]);

    /*
     * Search always starts from page 1.
     */
    const handleSearchChange = (event) => {
        setSearchInput(event.target.value);
        setPage(1);
    };

    /*
     * Group only when we are NOT searching.
     */
    const groupedContacts = useMemo(() => {
        if (searchInput.trim()) {
            return {};
        }

        return groupContacts(contacts);
    }, [contacts, searchInput]);

    const groupedLetters = Object.keys(
        groupedContacts,
    ).sort();

    const handleStartChat = async (
        contactId,
    ) => {
        if (!currentUser?._id) {
            return;
        }

        await startChatWithUser({
            currentUserId: currentUser._id,
            targetUserId: contactId,
            allChats,
            dispatch,
        });

        /*
         * Home owns the actual chat panel.
         * After selecting the chat, take the user there.
         */
        navigate("/");
    };

    const handleBack = () => {
        navigate(-1);
    };

    const isSearching =
        searchInput.trim().length > 0;

    return (
        <div className="min-h-screen bg-[#080b08] text-[#f1eee8]">
            <div className="mx-auto min-h-screen w-full max-w-4xl px-4 py-4 sm:px-6 sm:py-6">
                {/* HEADER */}

                <header className="flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#a5ada2] transition hover:bg-[#151b15] hover:text-[#f1eee8]"
                            aria-label="Go back"
                        >
                            <IoArrowBack className="text-xl" />
                        </button>

                        <div className="min-w-0">
                            <h1 className="truncate text-lg font-semibold tracking-tight text-[#f1eee8]">
                                Contacts
                            </h1>

                            <p className="text-xs text-[#697168]">
                                {total}{" "}
                                {total === 1
                                    ? "contact"
                                    : "contacts"}
                            </p>
                        </div>
                    </div>

                    {/* FUTURE ADD CONTACT */}

                    <button
                        type="button"
                        disabled
                        className="flex shrink-0 items-center gap-2 rounded-xl border border-[#d8f45a]/10 bg-[#101510] px-3 py-2 text-xs font-semibold text-[#555d54] opacity-70"
                        title="Add Contact is coming later"
                    >
                        <IoPersonAddOutline className="text-base" />

                        <span className="hidden sm:inline">
                            Add Contact
                        </span>
                    </button>
                </header>

                {/* SEARCH */}

                <div className="mt-5">
                    <div className="flex h-11 items-center gap-3 rounded-xl border border-[#d8f45a]/10 bg-[#101510] px-4 transition focus-within:border-[#d8f45a]/30">
                        <IoSearch className="shrink-0 text-lg text-[#687166]" />

                        <input
                            type="text"
                            value={searchInput}
                            onChange={handleSearchChange}
                            placeholder="Search contacts..."
                            className="min-w-0 flex-1 bg-transparent text-sm text-[#f1eee8] outline-none placeholder:text-[#596158]"
                        />

                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchInput("");
                                    setPage(1);
                                }}
                                className="text-xs text-[#687166] transition hover:text-[#d8f45a]"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* CONTENT */}

                <main className="mt-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#d8f45a]/20 border-t-[#d8f45a]" />

                            <p className="mt-4 text-xs text-[#626960]">
                                Loading contacts...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="rounded-2xl border border-red-400/10 bg-[#120d0d] px-6 py-10 text-center">
                            <p className="text-sm font-medium text-[#e8b4b4]">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() => setPage(1)}
                                className="mt-4 rounded-lg bg-[#d8f45a] px-4 py-2 text-xs font-semibold text-[#10120d]"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111711] text-[#687166]">
                                <IoPersonAddOutline className="text-2xl" />
                            </div>

                            <h2 className="mt-4 text-sm font-semibold text-[#f1eee8]">
                                {isSearching
                                    ? "No contacts found"
                                    : "No contacts yet"}
                            </h2>

                            <p className="mt-2 max-w-sm text-xs leading-5 text-[#626960]">
                                {isSearching
                                    ? `No contacts match "${searchInput.trim()}".`
                                    : "Start a chat with someone and they will automatically appear here."}
                            </p>
                        </div>
                    ) : isSearching ? (
                        /* SEARCH RESULTS */

                        <div className="overflow-hidden rounded-2xl border border-[#d8f45a]/10 bg-[#0d120d]">
                            {contacts.map(
                                (contact, index) => (
                                    <ContactRow
                                        key={contact._id}
                                        contact={contact}
                                        currentUser={currentUser}
                                        onChat={handleStartChat}
                                        isLast={
                                            index ===
                                            contacts.length - 1
                                        }
                                    />
                                ),
                            )}
                        </div>
                    ) : (
                        /* ALPHABETICAL CONTACT LIST */

                        <div className="space-y-6">
                            {groupedLetters.map(
                                (letter) => (
                                    <section
                                        key={letter}
                                    >
                                        <div className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.18em] text-[#70786f]">
                                            {letter}
                                        </div>

                                        <div className="overflow-hidden rounded-2xl border border-[#d8f45a]/10 bg-[#0d120d]">
                                            {groupedContacts[
                                                letter
                                            ].map(
                                                (
                                                    contact,
                                                    index,
                                                ) => (
                                                    <ContactRow
                                                        key={
                                                            contact._id
                                                        }
                                                        contact={
                                                            contact
                                                        }
                                                        currentUser={
                                                            currentUser
                                                        }
                                                        onChat={
                                                            handleStartChat
                                                        }
                                                        isLast={
                                                            index ===
                                                            groupedContacts[
                                                                letter
                                                            ].length -
                                                            1
                                                        }
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </section>
                                ),
                            )}
                        </div>
                    )}

                    {/* PAGINATION */}

                    {!loading &&
                        !error &&
                        contacts.length > 0 && (
                            <div className="mt-6 flex items-center justify-center gap-3">
                                {page > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPage(
                                                (currentPage) =>
                                                    Math.max(
                                                        currentPage - 1,
                                                        1,
                                                    ),
                                            )
                                        }
                                        className="rounded-lg border border-[#d8f45a]/10 bg-[#101510] px-4 py-2 text-xs font-semibold text-[#aab1a6] transition hover:border-[#d8f45a]/25 hover:text-[#f1eee8]"
                                    >
                                        Previous
                                    </button>
                                )}

                                <span className="text-xs text-[#596158]">
                                    Page {page}
                                </span>

                                {hasMore && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPage(
                                                (currentPage) =>
                                                    currentPage + 1,
                                            )
                                        }
                                        className="rounded-lg bg-[#d8f45a] px-4 py-2 text-xs font-semibold text-[#10120d] transition hover:bg-[#e5ff70]"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                        )}
                </main>
            </div>
        </div>
    );
}

/* =========================================================
   CONTACT ROW
   ========================================================= */

function ContactRow({
    contact,
    currentUser,
    onChat,
    isLast,
}) {
    const effectivePresenceStatus =
        getEffectivePresenceStatus({
            user: contact,
            livePresence: null,
        });

    return (
        <div
            className={`group flex items-center gap-3 px-4 py-3.5 transition hover:bg-[#111811] sm:px-5 ${!isLast
                    ? "border-b border-[#d8f45a]/10"
                    : ""
                }`}
        >
            {/* AVATAR */}

            <div className="relative shrink-0">
                {contact.profilePic ? (
                    <img
                        src={contact.profilePic}
                        alt={getFullName(contact)}
                        className="h-11 w-11 rounded-full bg-[#cacfb4] object-cover"
                    />
                ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#cacfb4] text-xs font-bold text-[#10120d]">
                        {getInitials(contact)}
                    </div>
                )}

                <div className="absolute -bottom-0.5 -right-0.5">
                    <PresenceIcon
                        status={effectivePresenceStatus}
                        size="small"
                    />
                </div>
            </div>

            {/* NAME */}

            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-[#f1eee8]">
                    {getFullName(contact)}
                </div>

                <div className="mt-0.5 truncate text-xs text-[#626960]">
                    {contact.publicPresenceStatus ===
                        "off_planet"
                        ? "Off planet"
                        : contact.publicPresenceStatus ===
                            "dnd"
                            ? "Do not disturb"
                            : contact.publicPresenceStatus ===
                                "idle"
                                ? "Idle"
                                : "Available to chat"}
                </div>
            </div>

            {/* CHAT */}

            <button
                type="button"
                onClick={() =>
                    onChat(contact._id)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d8f45a]/10 bg-[#121812] text-[#8f998c] transition hover:border-[#d8f45a]/30 hover:bg-[#d8f45a] hover:text-[#10120d]"
                aria-label={`Open chat with ${getFullName(contact)}`}
            >
                <IoChatbubbleOutline className="text-base" />
            </button>
        </div>
    );
}

export default Contacts;