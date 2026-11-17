import { useEffect, useState } from "react";
import {
    IoArrowBack,
    IoCheckmark,
    IoClose,
    IoSearch,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Avatar from "../components/Avatar.jsx";
import {
    acceptContactRequest,
    declineContactRequest,
    getIncomingContactRequests,
} from "../apiCalls/contactRequestApi.js";
import socket from "../sockets/socket.js";

const REQUESTS_PER_PAGE = 50;

const getFullName = (user) => {
    return (
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        "Unknown user"
    );
};

const getInitials = (user) => {
    const first = String(user?.firstName || "").trim();
    const last = String(user?.lastName || "").trim();

    return (
        `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() ||
        "?"
    );
};

function ContactRequests() {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [searchInput, setSearchInput] = useState("");

    const [page, setPage] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [processingId, setProcessingId] = useState(null);

    // Ensure the socket is authenticated and connected.
    useEffect(() => {
        socket.auth = {
            token: localStorage.getItem("token"),
        };

        if (!socket.connected) {
            socket.connect();
        }
    }, []);

    // Realtime contact-request lifecycle.
    useEffect(() => {
        const handleIncomingRequest = () => {
            setPage(1);
            setRefreshKey((current) => current + 1);
        };

        const handleCancelledRequest = ({
            requestId,
        } = {}) => {
            if (!requestId) {
                return;
            }

            setRequests((current) =>
                current.filter(
                    (request) =>
                        request._id !== requestId,
                ),
            );

            setTotal((current) =>
                Math.max(current - 1, 0),
            );
        };

        socket.on(
            "contact-request-received",
            handleIncomingRequest,
        );

        socket.on(
            "contact-request-cancelled",
            handleCancelledRequest,
        );

        return () => {
            socket.off(
                "contact-request-received",
                handleIncomingRequest,
            );

            socket.off(
                "contact-request-cancelled",
                handleCancelledRequest,
            );
        };
    }, []);

    // Load incoming contact requests.
    useEffect(() => {
        let cancelled = false;

        const loadRequests = async () => {
            setLoading(true);
            setError("");

            const response =
                await getIncomingContactRequests({
                    search: searchInput.trim(),
                    page,
                    limit: REQUESTS_PER_PAGE,
                });

            if (cancelled) {
                return;
            }

            if (response?.success) {
                setRequests(response.data || []);

                setTotal(
                    Number(response.pagination?.total) || 0,
                );

                setHasMore(
                    Boolean(
                        response.pagination?.hasMore,
                    ),
                );
            } else {
                setRequests([]);
                setTotal(0);
                setHasMore(false);

                setError(
                    response?.message ||
                    "Unable to load contact requests.",
                );
            }

            setLoading(false);
        };

        loadRequests();

        return () => {
            cancelled = true;
        };
    }, [searchInput, page, refreshKey]);

    const handleSearchChange = (event) => {
        setSearchInput(event.target.value);
        setPage(1);
    };

    const handleAccept = async (requestId) => {
        if (!requestId || processingId) {
            return;
        }

        setProcessingId(requestId);

        const response =
            await acceptContactRequest(requestId);

        if (!response?.success) {
            toast.error(
                response?.message ||
                "Unable to accept request.",
            );

            setProcessingId(null);
            return;
        }

        setRequests((current) =>
            current.filter(
                (request) =>
                    request._id !== requestId,
            ),
        );

        setTotal((current) =>
            Math.max(current - 1, 0),
        );

        toast.success(
            "Contact request accepted.",
        );

        setProcessingId(null);
    };

    const handleDecline = async (requestId) => {
        if (!requestId || processingId) {
            return;
        }

        setProcessingId(requestId);

        const response =
            await declineContactRequest(requestId);

        if (!response?.success) {
            toast.error(
                response?.message ||
                "Unable to decline request.",
            );

            setProcessingId(null);
            return;
        }

        setRequests((current) =>
            current.filter(
                (request) =>
                    request._id !== requestId,
            ),
        );

        setTotal((current) =>
            Math.max(current - 1, 0),
        );

        toast.success(
            "Contact request declined.",
        );

        setProcessingId(null);
    };

    const isSearching = searchInput.trim().length > 0;

    return (
        <div className="aetherion-requests-page min-h-screen w-full bg-[#080b08] text-[#f1eee8]">
            <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
                {/* HEADER */}
                <header className="flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="aetherion-button h-9 w-9 text-base"
                            aria-label="Go back"
                        >
                            <span>
                                <IoArrowBack />
                            </span>
                        </button>

                        <div className="flex min-w-0 items-center gap-2">
                            <div className="min-w-0">
                                <h1 className="truncate text-xl font-semibold tracking-tight text-[#f1eee8] sm:text-2xl">
                                    Contact requests
                                </h1>
                                <p className="mt-1 text-xs text-[#626960] sm:text-sm">
                                    Manage the people who want to connect with you.
                                </p>
                            </div>

                            {total > 0 && (
                                <span className="rounded-full bg-[#ffffff]/[0.08] px-2 py-0.5 text-[10px] font-semibold text-[#c9cec5]">
                                    {total}
                                </span>
                            )}
                        </div>
                    </div>
                </header>

                {/* SEARCH */}
                <div className="mt-8 w-full max-w-2xl">
                    <div className="flex h-12 items-center gap-3 rounded-2xl border border-[#ffffff]/[0.08] bg-[#111711] px-4 transition focus-within:border-[#777d72]">
                        <IoSearch className="shrink-0 text-lg text-[#697168]" />

                        <input
                            type="text"
                            value={searchInput}
                            onChange={
                                handleSearchChange
                            }
                            placeholder="Search contact requests..."
                            className="min-w-0 flex-1 bg-transparent text-sm text-[#f1eee8] outline-none placeholder:text-[#596158]"
                        />

                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchInput("");
                                    setPage(1);
                                }}
                                className="text-xs text-[#687166] transition hover:text-[#d3d3cf]"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* CONTENT */}
                <main className="mt-7">
                    {loading ? (
                        <LoadingState />
                    ) : error ? (
                        <ErrorState
                            message={error}
                            onRetry={() => {
                                setRefreshKey(
                                    (current) =>
                                        current + 1,
                                );
                            }}
                        />
                    ) : requests.length === 0 ? (
                        <EmptyState
                            isSearching={isSearching}
                            searchValue={searchInput}
                        />
                    ) : (
                        <div className="grid gap-3">
                            {requests.map((request) => (
                                    <RequestRow
                                        key={
                                            request._id
                                        }
                                        request={
                                            request
                                        }
                                        processing={
                                            processingId ===
                                            request._id
                                        }
                                        onAccept={
                                            handleAccept
                                        }
                                        onDecline={
                                            handleDecline
                                        }
                                    />
                                ),
                            )}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        requests.length > 0 &&
                        (page > 1 || hasMore) && (
                            <div className="mt-6 flex items-center justify-center gap-4 border-t border-[#ffffff]/[0.06] pt-5">
                                {page > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPage(
                                                (
                                                    current,
                                                ) =>
                                                    Math.max(
                                                        current -
                                                        1,
                                                        1,
                                                    ),
                                            )
                                        }
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
                                        onClick={() =>
                                            setPage(
                                                (
                                                    current,
                                                ) =>
                                                    current +
                                                    1,
                                            )
                                        }
                                        className="rounded-lg px-3 py-2 text-xs font-medium text-[#a8b19f] transition hover:bg-[#151a15] hover:text-[#d8f45a]"
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

function RequestRow({
    request,
    processing,
    onAccept,
    onDecline,
}) {
    const requester = request?.requester;
    const fullName = getFullName(requester);

    return (
        <div className="aetherion-request-row group flex min-h-[88px] items-center gap-4 rounded-2xl border border-[#ffffff]/[0.07] bg-[#111711] px-4 py-4 transition sm:px-5">
            <Avatar
                profilePic={requester?.profilePic}
                initials={getInitials(requester)}
                alt={fullName}
                decoration={requester?.avatarDecoration}
                size="sm"
                avatarClassName="bg-[#cacfb4] text-[#10120d] font-bold"
            />

            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-[#e8e5de] sm:text-base">
                    {fullName}
                </div>
                <p className="mt-1 text-xs text-[#737b71]">
                    Wants to add you as a contact
                </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <button
                    type="button"
                    onClick={() => onAccept(request._id)}
                    disabled={processing}
                    className="aetherion-request-accept flex h-9 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-40 sm:px-4"
                    aria-label={`Accept contact request from ${fullName}`}
                    title="Accept"
                >
                    <IoCheckmark className="text-base" />
                    <span className="hidden sm:inline">Accept</span>
                </button>

                <button
                    type="button"
                    onClick={() => onDecline(request._id)}
                    disabled={processing}
                    className="aetherion-request-decline flex h-9 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-40 sm:px-4"
                    aria-label={`Decline contact request from ${fullName}`}
                    title="Decline"
                >
                    <IoClose className="text-base" />
                    <span className="hidden sm:inline">Decline</span>
                </button>
            </div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="aetherion-requests-state py-20 text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#d8f45a]/20 border-t-[#eceee3]" />

            <p className="mt-4 text-xs text-[#626960]">
                Loading contact requests...
            </p>
        </div>
    );
}

function ErrorState({
    message,
    onRetry,
}) {
    return (
        <div className="aetherion-requests-state py-20 text-center">
            <p className="text-sm font-medium text-[#e8b4b4]">
                {message}
            </p>

            <button
                type="button"
                onClick={onRetry}
                className="aetherion-request-retry mt-4 rounded-xl px-4 py-2.5 text-xs font-semibold transition"
            >
                Try Again
            </button>
        </div>
    );
}

function EmptyState({
    isSearching,
    searchValue,
}) {
    return (
        <div className="aetherion-requests-state py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111711] text-[#697168]">
                <IoSearch className="text-xl" />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-[#f1eee8]">
                {isSearching
                    ? "No contact requests found"
                    : "No new requests yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#626960]">
                {isSearching
                    ? `No contact requests match "${searchValue.trim()}".`
                    : "When someone sends you a contact request, it will appear here."}
            </p>
        </div>
    );
}

export default ContactRequests;