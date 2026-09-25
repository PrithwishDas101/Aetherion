import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoPersonAddOutline, IoSearch } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";

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
    const search = normalizeText(query);

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

const findExistingChatWithUser = (allChats, userId) => {
    if (!Array.isArray(allChats)) {
        return null;
    }

    return (
        allChats.find((chat) => {
            const users = chat?.users || chat?.members || [];

            return users.some(
                (user) =>
                    String(user?._id || user) ===
                    String(userId),
            );
        }) || null
    );
};

function AddFriendsModal({ onClose }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user: currentUser, allChats } = useSelector(
        (state) => state.userReducer,
    );

    const [users, setUsers] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openingChatId, setOpeningChatId] = useState(null);

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

    const handleStartChat = async (userId) => {
        if (!currentUser?._id || openingChatId) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-5">
            <div className="flex h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[#ffffff]/[0.07] bg-[#080b08] text-[#f1eee8] shadow-2xl">
                {/* HEADER */}
                <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[#ffffff]/[0.06] px-4 sm:px-6">
                    <button type="button" onClick={onClose} className="aetherion-button h-9 w-9 text-base" aria-label="Close Add Friends">
                        <span><IoArrowBack /></span>
                    </button>

                    <h1 className="text-lg font-semibold tracking-tight text-[#f1eee8]">
                        Add Friends
                    </h1>
                </header>

                {/* CONTENT */}
                <main className="scrollbar-aetherion flex-1 overflow-y-auto px-5 py-8 sm:px-8 lg:px-12">
                    <div className="mx-auto w-full max-w-2xl">
                        {/* SEARCH */}
                        <div className="flex h-12 items-center gap-3 rounded-xl border border-[#ffffff]/[0.08] bg-[#0d120d] px-4 transition focus-within:border-[#d8f45a]/35">
                            <IoSearch className="shrink-0 text-lg text-[#697168]" />

                            <input
                                type="text"
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(
                                        event.target.value,
                                    )
                                }
                                placeholder="Search people by name"
                                className="min-w-0 flex-1 bg-transparent text-sm text-[#f1eee8] outline-none placeholder:text-[#596158]"
                                autoFocus
                            />

                            {searchInput && (
                                <button type="button" onClick={() => setSearchInput("")} className="text-xs text-[#687166] transition hover:text-[#d8f45a]">
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* INITIAL STATE */}
                        {!isSearching && (
                            <div className="flex flex-col items-center py-20 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111711] text-[#697168]">
                                    <IoPersonAddOutline className="text-2xl" />
                                </div>

                                <h2 className="mt-5 text-base font-semibold text-[#f1eee8]">
                                    Find someone on Aetherion
                                </h2>

                                <p className="mt-2 max-w-sm text-sm leading-6 text-[#626960]">
                                    Search by first name, last name, or full name to find people on Aetherion.
                                </p>
                            </div>
                        )}

                        {/* LOADING */}
                        {isSearching && loading && (
                            <div className="py-16 text-center">
                                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#d8f45a]/20 border-t-[#d8f45a]" />

                                <p className="mt-4 text-xs text-[#626960]">
                                    Finding people...
                                </p>
                            </div>
                        )}

                        {/* ERROR */}
                        {isSearching &&
                            !loading &&
                            error && (
                                <div className="py-16 text-center">
                                    <p className="text-sm text-[#e8b4b4]">
                                        {error}
                                    </p>
                                </div>
                            )}

                        {/* RESULTS */}
                        {isSearching &&
                            !loading &&
                            !error &&
                            results.length > 0 && (
                                <div className="mt-8">
                                    <div className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#70786f]">
                                        People
                                    </div>

                                    <div className="overflow-hidden rounded-xl border border-[#ffffff]/[0.06]">
                                        {results.map(
                                            (
                                                user,
                                                index,
                                            ) => {
                                                const fullName =
                                                    getFullName(
                                                        user,
                                                    );

                                                const username =
                                                    getUsername(
                                                        user,
                                                    );

                                                const existingChat =
                                                    findExistingChatWithUser(
                                                        allChats,
                                                        user._id,
                                                    );

                                                const isAlreadyContact =
                                                    Boolean(
                                                        existingChat,
                                                    );

                                                const isOpening =
                                                    openingChatId ===
                                                    user._id;

                                                return (
                                                    <div key={user._id} className={`group flex min-h-[68px] items-center gap-3 bg-[#0d120d] px-4 py-3 transition hover:bg-[#121812] ${index === results.length - 1 ? "" : "border-b border-[#ffffff]/[0.06]"}`}>
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
                                                                size="xs"
                                                                avatarClassName="bg-[#cacfb4] text-[#10120d] font-bold transition duration-200 group-hover/avatar:scale-[1.04]"
                                                            />
                                                        </button>
                                                        {/* USER INFO */}
                                                        <div className="min-w-0 flex-1">
                                                            <div className="truncate text-sm font-medium text-[#e8e5de]">
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
                                                        {isAlreadyContact ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleStartChat(
                                                                        user._id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    Boolean(
                                                                        openingChatId,
                                                                    )
                                                                }
                                                                className="flex h-9 shrink-0 items-center rounded-full border border-[#ffffff]/[0.08] bg-[#111711] px-4 text-xs font-medium text-[#9da59a] transition hover:border-[#d8f45a]/30 hover:text-[#d8f45a] disabled:cursor-wait disabled:opacity-50"
                                                            >
                                                                {isOpening
                                                                    ? "Opening..."
                                                                    : "Added"}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleStartChat(
                                                                        user._id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    Boolean(
                                                                        openingChatId,
                                                                    )
                                                                }
                                                                className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-[#d8f45a] px-3 text-xs font-semibold text-[#10120d] transition hover:bg-[#e5ff70] disabled:cursor-wait disabled:opacity-50"
                                                            >
                                                                {isOpening ? (
                                                                    "Opening..."
                                                                ) : (
                                                                    <>
                                                                        <IoPersonAddOutline className="text-sm" />
                                                                        Add
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* NO RESULTS */}
                        {isSearching &&
                            !loading &&
                            !error &&
                            results.length === 0 && (
                                <div className="py-16 text-center">
                                    <div className="flex justify-center text-[#697168]">
                                        <IoSearch className="text-2xl" />
                                    </div>

                                    <h2 className="mt-4 text-sm font-semibold text-[#f1eee8]">
                                        No people found
                                    </h2>

                                    <p className="mt-2 text-xs text-[#626960]">
                                        Try a different name or spelling.
                                    </p>
                                </div>
                            )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AddFriendsModal;