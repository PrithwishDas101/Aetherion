import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    IoChevronForward,
    IoSearch,
} from "react-icons/io5";

import { getRecentContacts } from "../apiCalls/contactApi.js";
import Avatar from "./Avatar.jsx";
import PresenceIcon from "./PresenceIcon.jsx";
import {
    getEffectivePresenceStatus,
} from "../utils/presenceStatus.js";

const getInitials = (contact) => {
    const firstName = (
        contact?.firstName || ""
    ).trim();

    const lastName = (
        contact?.lastName || ""
    ).trim();

    return [
        firstName.charAt(0),
        lastName.charAt(0),
    ]
        .filter(Boolean)
        .join("")
        .toUpperCase() || "?";
};

const getFullName = (contact) => {
    return `${contact?.firstName || ""} ${
        contact?.lastName || ""
    }`.trim();
};

const ContactList = ({
    ownerId,
    isOwnProfile = true,
}) => {
    const navigate = useNavigate();

    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const loadRecentContacts = async () => {
            setLoading(true);

            const response =
                await getRecentContacts(
                    isOwnProfile
                        ? null
                        : ownerId,
                );

            if (cancelled) {
                return;
            }

            if (response?.success) {
                setContacts(
                    response.data || [],
                );
            } else {
                setContacts([]);
            }

            setLoading(false);
        };

        loadRecentContacts();

        return () => {
            cancelled = true;
        };
    }, [ownerId, isOwnProfile]);

    const hasContacts = contacts.length > 0;

    const openContacts = () => {
        if (isOwnProfile) {
            navigate("/contacts");
            return;
        }

        if (ownerId) {
            navigate(`/contacts/${ownerId}`);
        }
    };

    const openContactProfile = (contactId) => {
        if (!contactId) {
            return;
        }

        navigate(
            `/contact-profile/${contactId}`,
        );
    };

    const focusHomeSearch = () => {
        navigate("/", {
            state: {
                focusUserSearch: true,
            },
        });
    };

    return (
        <section className="w-full">
            {/* HEADER */}
            <div className="flex items-center justify-between gap-5">
                <div className="min-w-0">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8d918c]">
                        Contacts
                    </h3>
                </div>

                {loading ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center sm:h-10 sm:w-10 lg:h-12 lg:w-12">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#d8f45a]/20 border-t-[#d8f45a]" />
                    </div>
                ) : hasContacts ? (
                    <div className="flex min-w-0 items-center justify-end">

                        {/* AVATARS */}
                        <div className="flex items-center -space-x-2 sm:-space-x-2.5 lg:-space-x-3">
                            {contacts
                                .slice(0, 5)
                                .map((contact) => {
                                    const status =
                                        getEffectivePresenceStatus({
                                            user: contact,
                                            livePresence: null,
                                        });

                                    return (
                                        <button
                                            key={contact._id}
                                            type="button"
                                            onClick={() =>
                                                openContactProfile(
                                                    contact._id,
                                                )
                                            }
                                            className="group relative shrink-0"
                                            aria-label={`View ${getFullName(
                                                contact,
                                            )}'s profile`}
                                            title={`View ${getFullName(
                                                contact,
                                            )}'s profile`}
                                        >
                                            <Avatar
                                                profilePic={
                                                    contact.profilePic
                                                }
                                                initials={getInitials(
                                                    contact,
                                                )}
                                                alt={getFullName(
                                                    contact,
                                                )}
                                                decoration={
                                                    contact.avatarDecoration
                                                }
                                                size="xs"
                                                avatarClassName="bg-[#cacfb4] text-[#10120d] font-bold ring-2 ring-[#080d09] transition duration-200 group-hover:z-10 group-hover:scale-105 sm:h-12 sm:w-12 sm:text-sm lg:h-[50px] lg:w-[50px] lg:text-base"
                                            />

                                            {/* PRESENCE */}
                                            <div className="absolute bottom-0 right-0 rounded-full bg-[#080d09] p-0.5 sm:p-[3px] lg:p-1">
                                                <PresenceIcon
                                                    status={status}
                                                    size="small"
                                                />
                                            </div>
                                        </button>
                                    );
                                })}
                        </div>

                        {/* VIEW ALL */}
                        <button
                            type="button"
                            onClick={openContacts}
                            className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#687166] transition hover:text-[#ededea] sm:h-10 sm:w-10 lg:h-11 lg:w-11"
                            aria-label="View all contacts"
                            title="View all contacts"
                        >
                            <IoChevronForward className="text-base sm:text-lg lg:text-xl" />
                        </button>
                    </div>
                ) : null}
            </div>

            {/* EMPTY STATE */}
            {!loading && !hasContacts && (
                <div className="flex min-h-[150px] flex-col items-center justify-center py-10 text-center sm:min-h-[170px]">
                    <p className="text-sm font-semibold text-[#d9ddd5]">
                        No contacts yet
                    </p>

                    <p className="mt-1.5 text-xs text-[#626960]">
                        Start a chat to add someone
                    </p>

                    {isOwnProfile && (
                        <button
                            type="button"
                            onClick={focusHomeSearch}
                            className="mt-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.025] text-[#687166] transition hover:border-[#d8f45a]/30 hover:bg-[#d8f45a] hover:text-[#10120d] active:scale-95"
                            aria-label="Find someone"
                            title="Find someone"
                        >
                            <IoSearch className="text-base" />
                        </button>
                    )}
                </div>
            )}

            {/* SECTION DIVIDER */}
            <div className="mt-8 border-b border-white/[0.06]" />
        </section>
    );
};

export default ContactList;