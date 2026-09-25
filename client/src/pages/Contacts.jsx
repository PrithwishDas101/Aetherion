import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    useNavigate,
    useParams,
} from "react-router-dom";
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
    PRESENCE_STATUS,
} from "../utils/presenceStatus.js";
import PresenceIcon from "../components/PresenceIcon.jsx";
import AddFriendsModal from "../components/Contacts/AddFriendsModal.jsx";
import Avatar from "../components/Avatar.jsx";

const CONTACTS_PER_PAGE = 50;

const CONTACT_FILTER = {
    ALL: "all",
    ONLINE: "online",
};

const getInitials = (user) => {
    const firstName = (user?.firstName || "").trim();
    const lastName = (user?.lastName || "").trim();

    const initials = [
        firstName.charAt(0),
        lastName.charAt(0),
    ]
        .filter(Boolean)
        .join("");

    return initials.toUpperCase() || "?";
};

const getFullName = (user) => {
    return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
};

const getPresenceLabel = (status) => {
    switch (status) {
        case PRESENCE_STATUS.ONLINE:
            return "Online";

        case PRESENCE_STATUS.IDLE:
            return "Idle";

        case PRESENCE_STATUS.DND:
            return "Do not disturb";

        case PRESENCE_STATUS.OFF_PLANET:
            return "Off planet";

        default:
            return "Offline";
    }
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

const sortContacts = (contacts) => {
    return [...contacts].sort((firstContact, secondContact) => {
        const firstName = getFullName(firstContact);
        const secondName = getFullName(secondContact);

        return firstName.localeCompare(secondName);
    });
};

function Contacts() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userId } = useParams();

    const isOwnContacts = !userId;
    const {
        user: currentUser,
        allChats,
    } = useSelector(
        (state) => state.userReducer,
    );

    const [contacts, setContacts] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [filter, setFilter] = useState(
        CONTACT_FILTER.ALL,
    );

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAddFriends, setShowAddFriends] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadContacts = async () => {
            setLoading(true);
            setError("");

            const response = await getContacts({
                ownerId: userId || null,
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
    }, [searchInput, page, userId]);

    const handleSearchChange = (event) => {
        setSearchInput(event.target.value);
        setPage(1);
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setPage(1);
    };

    const handleFilterChange = (nextFilter) => {
        setFilter(nextFilter);
        setPage(1);
    };

    const filteredContacts = useMemo(() => {
        const sortedContacts = sortContacts(
            contacts,
        );

        if (filter === CONTACT_FILTER.ONLINE) {
            return sortedContacts.filter(
                (contact) => {
                    const status =
                        getEffectivePresenceStatus({
                            user: contact,
                            livePresence: null,
                        });

                    return (
                        status ===
                        PRESENCE_STATUS.ONLINE
                    );
                },
            );
        }

        return sortedContacts;
    }, [contacts, filter]);

    const groupedContacts = useMemo(() => {
        if (searchInput.trim()) {
            return {};
        }

        return groupContacts(filteredContacts);
    }, [
        filteredContacts,
        searchInput,
    ]);

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

        navigate("/");
    };

    const handleOpenProfile = (contactId) => {
        if (!contactId) {
            return;
        }

        navigate(`/contact-profile/${contactId}`);
    };

    const handleBack = () => {
        navigate(-1);
    };

    const isSearching = searchInput.trim().length > 0;

    const hasContacts = filteredContacts.length > 0;

    return (
        <div className="min-h-screen w-full bg-[#080b08] text-[#f1eee8]">
            <div className="w-full px-5 py-5 sm:px-8 lg:px-10 xl:px-14">
                {/* HEADER */}

                <header className="flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <button type="button" onClick={handleBack} className="aetherion-button h-9 w-9 text-base" aria-label="Go back">
                            <span><IoArrowBack /></span>
                        </button>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="truncate text-lg font-semibold tracking-tight text-[#f1eee8]">
                                    Contacts
                                </h1>

                                <span className="text-xs text-[#50584f]">
                                    {total}
                                </span>
                            </div>
                        </div>
                    </div>

                    {isOwnContacts && (
                        <button
                            type="button"
                            onClick={() =>
                                setShowAddFriends(true)
                            }
                            className="flex h-9 shrink-0 items-center gap-2 rounded-full px-3 text-xs font-medium text-[#8a9288] transition-all duration-300 hover:text-[#ecf0dd]"
                        >
                            <IoPersonAddOutline className="text-base" />

                            <span className="hidden sm:inline">
                                Add Contact
                            </span>
                        </button>
                    )}
                </header>

                {/* SEARCH + FILTERS */}
                <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="w-full lg:max-w-xl">
                        <div className="flex h-10 items-center gap-3 border-b border-[#ffffff]/[0.08] px-1 transition focus-within:border-[#454644]">
                            <IoSearch className="shrink-0 text-lg text-[#697168]" />

                            <input
                                type="text"
                                value={searchInput}
                                onChange={
                                    handleSearchChange
                                }
                                placeholder="Search contacts..."
                                className="min-w-0 flex-1 bg-transparent text-sm text-[#f1eee8] outline-none placeholder:text-[#596158]"
                            />

                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={
                                        handleClearSearch
                                    }
                                    className="text-xs text-[#687166] transition hover:text-[#d3d3cf]"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {!isSearching && (
                        <div className="flex items-center gap-1 self-start rounded-full bg-[#0d120d] p-1 lg:self-auto">
                            <button
                                type="button"
                                onClick={() =>
                                    handleFilterChange(
                                        CONTACT_FILTER.ALL,
                                    )
                                }
                                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${filter ===
                                    CONTACT_FILTER.ALL
                                    ? "bg-[#171d17] text-[#f1eee8]"
                                    : "text-[#687166] hover:text-[#aeb6aa]"
                                    }`}
                            >
                                All
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleFilterChange(
                                        CONTACT_FILTER.ONLINE,
                                    )
                                }
                                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${filter ===
                                    CONTACT_FILTER.ONLINE
                                    ? "bg-[#171d17] text-[#f1eee8]"
                                    : "text-[#687166] hover:text-[#aeb6aa]"
                                    }`}
                            >
                                Online
                            </button>
                        </div>
                    )}
                </div>

                {/* CONTENT */}
                <main className="mt-8">
                    {loading ? (
                        <LoadingState />
                    ) : error ? (
                        <ErrorState
                            message={error}
                            onRetry={() =>
                                setPage(1)
                            }
                        />
                    ) : !hasContacts ? (
                        <EmptyState
                            isSearching={
                                isSearching ||
                                filter ===
                                CONTACT_FILTER.ONLINE
                            }
                            searchValue={searchInput}
                            filter={filter}
                        />
                    ) : isSearching ? (
                        <div>
                            {filteredContacts.map(
                                (
                                    contact,
                                    index,
                                ) => (
                                    <ContactRow
                                        key={contact._id}
                                        contact={contact}
                                        onChat={handleStartChat}
                                        onProfile={handleOpenProfile}
                                        isLast={
                                            index ===
                                            filteredContacts.length -
                                            1
                                        }
                                    />
                                ),
                            )}
                        </div>
                    ) : (
                        <div>
                            {groupedLetters.map(
                                (letter) => (
                                    <section
                                        key={letter}
                                        className="mb-8 last:mb-0"
                                    >
                                        <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#70786f]">
                                            {letter}
                                        </div>

                                        <div>
                                            {groupedContacts[
                                                letter
                                            ].map(
                                                (
                                                    contact,
                                                    index,
                                                ) => (
                                                    <ContactRow
                                                        key={contact._id}
                                                        contact={contact}
                                                        onChat={handleStartChat}
                                                        onProfile={handleOpenProfile}
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
                        hasContacts && (
                            <Pagination
                                page={page}
                                hasMore={hasMore}
                                onPrevious={() =>
                                    setPage(
                                        (
                                            currentPage,
                                        ) =>
                                            Math.max(
                                                currentPage -
                                                1,
                                                1,
                                            ),
                                    )
                                }
                                onNext={() =>
                                    setPage(
                                        (
                                            currentPage,
                                        ) =>
                                            currentPage +
                                            1,
                                    )
                                }
                            />
                        )}
                </main>
            </div>
            {isOwnContacts && showAddFriends && (
                <AddFriendsModal
                    onClose={() =>
                        setShowAddFriends(false)
                    }
                />
            )}
        </div>
    );
}

// CONTACT ROW
function ContactRow({
    contact,
    onChat,
    onProfile,
    isLast,
}) {
    const effectivePresenceStatus =
        getEffectivePresenceStatus({
            user: contact,
            livePresence: null,
        });

    const presenceLabel =
        getPresenceLabel(
            effectivePresenceStatus,
        );

    const fullName = getFullName(contact);

    return (
        <div
            className={`group flex min-h-[68px] items-center gap-3 border-b border-[#ffffff]/[0.06] px-2 py-3 transition hover:bg-[#101010bd] ${isLast
                ? "border-b-0"
                : ""
                }`}
        >
            {/* AVATAR */}
            <button
                type="button"
                onClick={() =>
                    onProfile(contact._id)
                }
                className="group/avatar relative shrink-0 rounded-full"
                aria-label={`View ${fullName}'s profile`}
                title={`View ${fullName}'s profile`}
            >
                <Avatar
                    profilePic={contact.profilePic}
                    initials={getInitials(contact)}
                    alt={fullName}
                    decoration={contact.avatarDecoration}
                    size="xs"
                    avatarClassName="bg-[#cacfb4] text-[#10120d] font-bold transition duration-200 group-hover/avatar:scale-[1.04]"
                />

                <div className="absolute -bottom-0.5 -right-0.5">
                    <PresenceIcon
                        status={
                            effectivePresenceStatus
                        }
                        size="small"
                    />
                </div>
            </button>

            {/* USER INFO */}
            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-[#e8e5de]">
                    {fullName}
                </div>

                <div className="mt-0.5 truncate text-xs text-[#626960]">
                    {presenceLabel}
                </div>
            </div>

            {/* CHAT ACTION */}
            <button
                type="button"
                onClick={() =>
                    onChat(contact._id)
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#697168] opacity-60 transition hover:bg-[#151a15] hover:text-[#d8f45a] group-hover:opacity-100"
                aria-label={`Open chat with ${fullName}`}
            >
                <IoChatbubbleOutline className="text-base" />
            </button>
        </div>
    );
}

// LOADING 
function LoadingState() {
    return (
        <div className="py-20 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#d8f45a]/20 border-t-[#d8f45a]" />

            <p className="mt-4 text-xs text-[#626960]">
                Loading contacts...
            </p>
        </div>
    );
}

// ERROR
function ErrorState({
    message,
    onRetry,
}) {
    return (
        <div className="py-20 text-center">
            <p className="text-sm font-medium text-[#e8b4b4]">
                {message}
            </p>

            <button
                type="button"
                onClick={onRetry}
                className="mt-4 rounded-lg bg-[#d8f45a] px-4 py-2 text-xs font-semibold text-[#10120d] transition hover:bg-[#e5ff70]"
            >
                Try Again
            </button>
        </div>
    );
}

// EMPTY
function EmptyState({
    isSearching,
    searchValue,
    filter,
}) {
    let title = "No contacts yet";
    let description =
        "Start a chat with someone and they will automatically appear here.";

    if (searchValue.trim()) {
        title = "No contacts found";
        description = `No contacts match "${searchValue.trim()}".`;
    } else if (
        filter === CONTACT_FILTER.ONLINE
    ) {
        title = "Nobody is online";
        description =
            "None of your contacts are currently online.";
    }

    return (
        <div className="py-20 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#111711] text-[#697168]">
                <IoPersonAddOutline className="text-xl" />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-[#f1eee8]">
                {title}
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#626960]">
                {description}
            </p>
        </div>
    );
}

// PAGINATION
function Pagination({
    page,
    hasMore,
    onPrevious,
    onNext,
}) {
    if (page === 1 && !hasMore) {
        return null;
    }

    return (
        <div className="mt-8 flex items-center justify-center gap-4 border-t border-[#ffffff]/[0.06] pt-5">
            {page > 1 && (
                <button
                    type="button"
                    onClick={onPrevious}
                    className="rounded-lg px-3 py-2 text-xs font-medium text-[#737b71] transition hover:bg-[#151a15] hover:text-[#f1eee8]"
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
                    onClick={onNext}
                    className="rounded-lg px-3 py-2 text-xs font-medium text-[#a8b19f] transition hover:bg-[#151a15] hover:text-[#d8f45a]"
                >
                    Next
                </button>
            )}
        </div>
    );
}

export default Contacts;