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

const REQUESTS_PER_PAGE = 50;

const getFullName = (user) => {
    return (
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        "Unknown user"
    );
};

const getInitials = (user) => {
    const first = String(
        user?.firstName || "",
    ).trim();

    const last = String(
        user?.lastName || "",
    ).trim();

    return (
        `${first.charAt(0)}${last.charAt(0)}`
            .toUpperCase() || "?"
    );
};

function ContactRequests() {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [searchInput, setSearchInput] = useState("");

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [processingId, setProcessingId] = useState(null);

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
                setRequests(
                    response.data || [],
                );

                setTotal(
                    response.pagination?.total || 0,
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
    }, [searchInput, page]);

    const handleSearchChange = (
        event,
    ) => {
        setSearchInput(
            event.target.value,
        );

        setPage(1);
    };

    const handleAccept = async (
        requestId,
    ) => {
        if (
            !requestId ||
            processingId
        ) {
            return;
        }

        setProcessingId(requestId);

        const response =
            await acceptContactRequest(
                requestId,
            );

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

    const handleDecline = async (
        requestId,
    ) => {
        if (
            !requestId ||
            processingId
        ) {
            return;
        }

        setProcessingId(requestId);

        const response =
            await declineContactRequest(
                requestId,
            );

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
        <div className="min-h-screen w-full bg-[#080b08] text-[#f1eee8]">
            <div className="w-full px-5 py-5 sm:px-8 lg:px-10 xl:px-14">
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
                            <h1 className="truncate text-lg font-semibold tracking-tight text-[#f1eee8]">
                                Contact Requests
                            </h1>

                            {total > 0 && (
                                <span className="rounded-full bg-[#ffffff]/[0.08] px-2 py-0.5 text-[10px] font-semibold text-[#c9cec5]">
                                    {total}
                                </span>
                            )}
                        </div>
                    </div>
                </header>

                {/* SEARCH */}
                <div className="mt-6 w-full lg:max-w-xl">
                    <div className="flex h-10 items-center gap-3 border-b border-[#ffffff]/[0.08] px-1 transition focus-within:border-[#454644]">
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
                <main className="mt-8">
                    {loading ? (
                        <LoadingState />
                    ) : error ? (
                        <ErrorState
                            message={error}
                            onRetry={() => setPage(1)}
                        />
                    ) : requests.length === 0 ? (
                        <EmptyState
                            isSearching={isSearching}
                            searchValue={searchInput}
                        />
                    ) : (
                        <div>
                            {requests.map(
                                (request, index) => (
                                    <RequestRow
                                        key={request._id}
                                        request={request}
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
                                        isLast={
                                            index ===
                                            requests.length - 1
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
                            <div className="mt-8 flex items-center justify-center gap-4 border-t border-[#ffffff]/[0.06] pt-5">
                                {page > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPage(
                                                (current) =>
                                                    Math.max(
                                                        current - 1,
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
                                                (current) =>
                                                    current + 1,
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
    isLast,
}) {
    const requester = request?.requester;
    const fullName = getFullName(requester);

    return (
        <div
            className={`group flex min-h-[68px] items-center gap-3 border-b border-[#ffffff]/[0.06] px-2 py-3 transition hover:bg-[#101010bd] ${isLast
                ? "border-b-0"
                : ""
                }`}
        >
            <Avatar
                profilePic={requester?.profilePic}
                initials={getInitials(requester,)}
                alt={fullName}
                decoration={requester?.avatarDecoration}
                size="xs"
                avatarClassName="bg-[#cacfb4] text-[#10120d] font-bold"
            />

            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-[#e8e5de]">
                    {fullName}
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <button
                    type="button"
                    onClick={() =>
                        onAccept(request._id)
                    }
                    disabled={processing}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#5af48b]/15 bg-[#5af48b]/10 text-[#5af48b] transition hover:bg-[#5af48b]/20 disabled:cursor-wait disabled:opacity-40"
                    aria-label={`Accept contact request from ${fullName}`}
                    title="Accept"
                >
                    <IoCheckmark className="text-lg" />
                </button>

                <button
                    type="button"
                    onClick={() =>
                        onDecline(request._id)
                    }
                    disabled={processing}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-red-400/10 bg-red-400/5 text-[#ec5353] transition hover:bg-red-400/10 hover:text-red-500 disabled:cursor-wait disabled:opacity-40"
                    aria-label={`Decline contact request from ${fullName}`}
                    title="Decline"
                >
                    <IoClose className="text-lg" />
                </button>
            </div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="py-20 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#d8f45a]/20 border-t-[#eceee3]" />

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
        <div className="py-20 text-center">
            <p className="text-sm font-medium text-[#e8b4b4]">
                {message}
            </p>

            <button
                type="button"
                onClick={onRetry}
                className="mt-4 rounded-lg bg-[#eef1de] px-4 py-2 text-xs font-semibold text-[#10120d] transition hover:bg-[#e5ff70]"
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
        <div className="py-20 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#111711] text-[#697168]">
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