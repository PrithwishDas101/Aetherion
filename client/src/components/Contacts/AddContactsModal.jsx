import { useEffect, useMemo, useState } from "react";
import { IoArrowBack, IoPersonAddOutline, IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IoChatbubbleOutline } from "react-icons/io5";
import toast from "react-hot-toast";

import { sendContactRequest, } from "../../apiCalls/contactRequestApi.js";
import { getAllUsers } from "../../apiCalls/userApi.js";
import { startChatWithUser } from "../../utils/startChat.js";
import Avatar from "../Avatar.jsx";

const getFullName = (user) => {
    return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
};

const getInitials = (user) => {
    const firstName = (user?.firstName || "").trim();
    const lastName = (user?.lastName || "").trim();

    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

    return initials.toUpperCase() || "?";
};

const getUsername = (user) => {
    return user?.username || user?.userName || "";
};

const normalizeText = (value) => {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
};

const getSearchScore = (user, query) => {
    const firstName = normalizeText(user?.firstName);
    const lastName = normalizeText(user?.lastName);
    const fullName = normalizeText(getFullName(user));
    const username = normalizeText(getUsername(user));
    const search = normalizeText(query).replace(/^@/, "");

    if (!search) {
        return 0;
    }

    const searchWords = search.split(" ").filter(Boolean);

    if (!searchWords.length) {
        return 0;
    }

    let score = 0;

    // Exact full-name match
    if (fullName === search) {
        score += 1000;
    }

    // Full name starts with the complete search
    if (fullName.startsWith(search)) {
        score += 500;
    }

    // Exact username / username prefix
    if (username === search) {
        score += 450;
    } else if (username.startsWith(search)) {
        score += 250;
    }

    // Score every individual search word
    for (const word of searchWords) {
        if (firstName === word) {
            score += 300;
        } else if (firstName.startsWith(word)) {
            score += 220;
        } else if (firstName.includes(word)) {
            score += 120;
        }

        if (lastName === word) {
            score += 300;
        } else if (lastName.startsWith(word)) {
            score += 220;
        } else if (lastName.includes(word)) {
            score += 120;
        }

        if (fullName.includes(word)) {
            score += 50;
        }

        if (username.includes(word)) {
            score += 40;
        }
    }

    // For multi-word searches, every word must match somewhere.
    const everyWordMatches = searchWords.every(
        (word) =>
            firstName.includes(word) ||
            lastName.includes(word) ||
            fullName.includes(word) ||
            username.includes(word),
    );

    if (!everyWordMatches) {
        return 0;
    }

    return score;
};

function AddContactsModal({ onClose }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user: currentUser, allChats } = useSelector(
        (state) => state.userReducer,
    );

    const [users, setUsers] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openingChatId, setOpeningChatId] = useState(null);

    const [requestingUserId, setRequestingUserId] = useState(null);
    useEffect(() => {
        let cancelled = false;

        const loadUsers = async () => {
            setLoading(true);
            setError("");

            const response = await getAllUsers();

            if (cancelled) {
                return;
            }

            if (response?.success) {
                setUsers(response.users || []);
            } else {
                setUsers([]);

                setError(
                    response?.message ||
                    "Unable to load users.",
                );
            }

            setLoading(false);
        };

        loadUsers();

        return () => {
            cancelled = true;
        };
    }, []);

    const results = useMemo(() => {
        const query = searchInput.trim();

        if (!query) {
            return [];
        }

        return users
            .map((user) => ({
                user,
                score: getSearchScore(user, query),
            }))
            .filter((item) => item.score > 0)
            .sort((first, second) => {
                if (second.score !== first.score) {
                    return second.score - first.score;
                }

                return getFullName(
                    first.user,
                ).localeCompare(
                    getFullName(second.user),
                );
            })
            .slice(0, 20)
            .map((item) => item.user);
    }, [users, searchInput]);

    const handleSendRequest = async (
        userId,
    ) => {
        if (
            !userId ||
            requestingUserId
        ) {
            return;
        }

        setRequestingUserId(userId);

        const response =
            await sendContactRequest(userId);

        if (response?.success) {
            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    String(user._id) === String(userId)
                        ? {
                            ...user,
                            relationshipStatus: "outgoing_pending",
                        }
                        : user,
                ),
            );

            toast.success(
                "Contact request sent.",
            );
        } else {
            toast.error(
                response?.message ||
                "Unable to send contact request.",
            );
        }

        setRequestingUserId(null);
    };

    const handleOpenChat = async (userId) => {
        if (!userId || !currentUser?._id || openingChatId) {
            return;
        }

        setOpeningChatId(userId);

        const started = await startChatWithUser({
            currentUserId: currentUser._id,
            targetUserId: userId,
            allChats,
            dispatch,
        });

        setOpeningChatId(null);

        if (started) {
            onClose();
            navigate("/");
        }
    };

    const handleOpenProfile = (userId) => {
        if (!userId) {
            return;
        }

        onClose();

        navigate(`/contact-profile/${userId}`);
    };

    const isSearching = searchInput.trim().length > 0;

    return (
        <div className="aetherion-add-contacts-modal fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-5">
            <div className="aetherion-add-contacts-dialog flex h-[86dvh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-[#ffffff]/[0.07] bg-[#080b08] text-[#f1eee8] shadow-2xl">
                {/* HEADER */}
                <header className="flex min-h-[76px] shrink-0 items-center gap-4 border-b border-[#ffffff]/[0.06] px-5 sm:px-8">
                    <button
                        type="button"
                        onClick={onClose}
                        className="group flex shrink-0 items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-[#8a9288] transition hover:bg-[#151a15] hover:text-[#f1eee8]"
                        aria-label="Back to contacts"
                    >
                        <IoArrowBack className="text-lg transition-transform group-hover:-translate-x-0.5" />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <div className="min-w-0">
                        <h1 className="text-base font-semibold tracking-tight text-[#f1eee8] sm:text-lg">
                            Add contacts
                        </h1>
                        <p className="mt-0.5 text-xs text-[#626960]">
                            Find people and connect on Aetherion
                        </p>
                    </div>
                </header>

                {/* CONTENT */}
                <main className="scrollbar-aetherion flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
                    <div className="mx-auto w-full max-w-3xl">
                        {/* SEARCH */}
                        <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#ffffff]/[0.09] bg-[#0d120d] px-4 sm:px-5 transition focus-within:border-[#d8f45a]/35">
                            <IoSearch className="shrink-0 text-xl text-[#8a9288]" />

                            <input
                                type="text"
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(
                                        event.target.value,
                                    )
                                }
                                placeholder="Search by name or @username"
                                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#f1eee8] outline-none placeholder:text-[#596158] sm:text-[15px]"
                                autoFocus
                            />

                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={() => setSearchInput("")}
                                    className="shrink-0 rounded-lg px-2 py-1.5 text-xs font-medium text-[#8a9288] transition hover:bg-[#151a15] hover:text-[#f1eee8]"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* INITIAL STATE */}
                        {!isSearching && (
                            <section className="mt-8 flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-[#ffffff]/[0.06] bg-[#0d120d] px-6 py-12 text-center sm:mt-10">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ffffff]/[0.07] bg-[#111711] text-[#a4a59d]">
                                    <IoPersonAddOutline className="text-[26px]" />
                                </div>

                                <h2 className="mt-6 text-base font-semibold tracking-tight text-[#f1eee8] sm:text-lg">
                                    Find your people
                                </h2>

                                <p className="mt-2 max-w-md text-sm leading-6 text-[#8a9288]">
                                    Search Aetherion by someone’s name or username. We’ll bring the closest matches to the top.
                                </p>

                                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                                    <span className="rounded-full border border-[#ffffff]/[0.07] bg-[#111711] px-3 py-1.5 text-[11px] font-medium text-[#a4a59d]">First or last name</span>
                                    <span className="rounded-full border border-[#ffffff]/[0.07] bg-[#111711] px-3 py-1.5 text-[11px] font-medium text-[#a4a59d]">@username</span>
                                </div>
                            </section>
                        )}

                        {/* LOADING */}
                        {isSearching && loading && (
                            <div className="mt-8 flex min-h-40 flex-col items-center justify-center rounded-2xl border border-[#ffffff]/[0.06] bg-[#0d120d] text-center">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#d8f45a]/20 border-t-[#d8f45a]" />
                                <p className="mt-4 text-sm text-[#8a9288]">Finding people...</p>
                            </div>
                        )}

                        {/* ERROR */}
                        {isSearching &&
                            !loading &&
                            error && (
                                <div className="mt-8 rounded-2xl border border-[#ffffff]/[0.06] bg-[#0d120d] px-5 py-10 text-center">
                                    <p className="text-sm text-[#e8b4b4]">{error}</p>
                                </div>
                            )}

                        {/* RESULTS */}
                        {isSearching &&
                            !loading &&
                            !error &&
                            results.length > 0 && (
                                <section className="mt-7">
                                    <div className="mb-4 flex items-center justify-between gap-3 px-1">
                                        <div>
                                            <h2 className="text-sm font-semibold text-[#f1eee8]">Search results</h2>
                                            <p className="mt-1 text-xs text-[#70786f]">Best matches appear first</p>
                                        </div>
                                        <span className="rounded-full border border-[#ffffff]/[0.08] bg-[#111711] px-3 py-1.5 text-[11px] font-medium tabular-nums text-[#a4a59d]">
                                            {results.length} {results.length === 1 ? "match" : "matches"}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-2.5">
                                        {results.map(
                                            (user) => {
                                                const fullName =
                                                    getFullName(
                                                        user,
                                                    );

                                                const username =
                                                    getUsername(
                                                        user,
                                                    );

                                                const relationshipStatus =
                                                    user.relationshipStatus || "none";

                                                const isAlreadyContact =
                                                    relationshipStatus === "contact";

                                                const isOutgoingPending =
                                                    relationshipStatus === "outgoing_pending";

                                                const isIncomingPending =
                                                    relationshipStatus === "incoming_pending";

                                                const isRequesting =
                                                    requestingUserId === user._id;

                                                const isOpening =
                                                    openingChatId ===
                                                    user._id;

                                                return (
                                                    <article key={user._id} className="group flex flex-col gap-4 rounded-2xl border border-[#ffffff]/[0.07] bg-[#0d120d] px-4 py-4 transition hover:border-[#ffffff]/[0.13] hover:bg-[#121812] sm:flex-row sm:items-center sm:gap-4 sm:px-5">
                                                        {/* AVATAR */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleOpenProfile(user._id)
                                                            }
                                                            className="group/avatar relative shrink-0 rounded-full"
                                                            aria-label={`View ${fullName}'s profile`}
                                                            title={`View ${fullName}'s profile`}
                                                        >
                                                            <Avatar
                                                                profilePic={user.profilePic}
                                                                initials={fullName
                                                                    .split(" ")
                                                                    .filter(Boolean)
                                                                    .slice(0, 2)
                                                                    .map((part) =>
                                                                        part.charAt(0).toUpperCase(),
                                                                    )
                                                                    .join("")}
                                                                alt={fullName}
                                                                decoration={user.avatarDecoration}
                                                                size="sm"
                                                                avatarClassName="bg-[#cacfb4] text-[#10120d] font-bold transition duration-200 group-hover/avatar:scale-[1.04]"
                                                            />
                                                        </button>
                                                        {/* USER INFO */}
                                                        <div className="min-w-0 flex-1">
                                                            <div className="truncate text-sm font-semibold text-[#e8e5de]">
                                                                {
                                                                    fullName
                                                                }
                                                            </div>

                                                            {username && (
                                                                <div className="mt-0.5 truncate text-xs text-[#626960]">
                                                                    @
                                                                    {
                                                                        username
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* ACTION */}
                                                        <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleSendRequest(user._id)
                                                                }
                                                                disabled={
                                                                    isAlreadyContact ||
                                                                    isOutgoingPending ||
                                                                    isIncomingPending ||
                                                                    isRequesting
                                                                }
                                                                className={`flex h-10 flex-1 items-center justify-center rounded-xl px-4 text-xs font-semibold transition sm:min-w-[132px] sm:flex-none ${isAlreadyContact || isOutgoingPending || isIncomingPending
                                                                    ? "border border-[#ffffff]/[0.09] bg-[#111711] text-[#a4a59d]"
                                                                    : "bg-[#d8f45a] text-[#10120d] hover:bg-[#e5ff70]"
                                                                    } disabled:cursor-default disabled:opacity-70`}
                                                            >
                                                                {isAlreadyContact
                                                                    ? "Already added"
                                                                    : isOutgoingPending
                                                                        ? "Request sent"
                                                                        : isIncomingPending
                                                                            ? "Request received"
                                                                            : isRequesting
                                                                                ? "Sending..."
                                                                                : "Add contact"}
                                                            </button>

                                                            {isAlreadyContact && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleOpenChat(user._id)
                                                                    }
                                                                    disabled={Boolean(openingChatId)}
                                                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#ffffff]/[0.08] text-[#8a9288] transition hover:bg-[#151a15] hover:text-[#d8f45a] disabled:cursor-default disabled:opacity-60"
                                                                    aria-label={`Open chat with ${fullName}`}
                                                                    title={`Open chat with ${fullName}`}
                                                                >
                                                                    {isOpening ? (
                                                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d8f45a]/20 border-t-[#d8f45a]" />
                                                                    ) : (
                                                                        <IoChatbubbleOutline className="text-base" />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </article>
                                                );
                                            },
                                        )}
                                    </div>
                                </section>
                            )}

                        {/* NO RESULTS */}
                        {isSearching &&
                            !loading &&
                            !error &&
                            results.length === 0 && (
                                <div className="mt-7 flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-[#ffffff]/[0.06] bg-[#0d120d] px-6 py-12 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111711] text-[#8a9288]">
                                        <IoSearch className="text-xl" />
                                    </div>
                                    <h2 className="mt-5 text-sm font-semibold text-[#f1eee8]">
                                        No matches yet
                                    </h2>
                                    <p className="mt-2 max-w-sm text-xs leading-5 text-[#8a9288]">
                                        Try another name or username. You can search with a first name, last name, full name, or @username.
                                    </p>
                                </div>
                            )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AddContactsModal;