import { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowLeft, FiSend, FiX } from "react-icons/fi";

import ContactListItem from "./ContactListItem.jsx";

const ContactsModal = ({
    isOpen,
    onClose,
    contacts = [],
    onSend,
}) => {
    const [selectedContactIds, setSelectedContactIds] = useState([]);

    const modalRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setSelectedContactIds([]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose?.();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    const normalizedContacts = useMemo(() => {
        return (contacts || []).filter(
            (contact) => contact?._id,
        );
    }, [contacts]);

    if (!isOpen) {
        return null;
    }

    const toggleContact = (contactId) => {
        setSelectedContactIds((previous) => {
            const id = String(contactId);

            if (previous.includes(id)) {
                return previous.filter(
                    (selectedId) => selectedId !== id,
                );
            }

            return [...previous, id];
        });
    };

    const handleSend = async () => {
        if (!selectedContactIds.length) {
            return;
        }

        const selectedContacts = normalizedContacts.filter(
            (contact) =>
                selectedContactIds.includes(
                    String(contact._id),
                ),
        );

        const result = await onSend?.(selectedContacts);

        if (result !== false) {
            setSelectedContactIds([]);
        }
    };

    const handleBackdropMouseDown = (event) => {
        if (event.target === event.currentTarget) {
            onClose?.();
        }
    };

    return (
        <div className=" fixed inset-0 z-[100] flex items-center justify-center bg-[#0d120e] md:bg-black/60 md:px-3 md:py-4"
            onMouseDown={handleBackdropMouseDown}
        >
            <div
                ref={modalRef}
                className="relative flex h-auto w-full max-h-[100dvh] flex-col overflow-hidden bg-[#0d120e] md:max-h-[calc(100dvh-80px)] md:w-[390px] md:rounded-2xl md:border md:border-[#d8f45a]/10 md:shadow-2xl"
                onMouseDown={(event) => {
                    event.stopPropagation();
                }}
            >
                {/* HEADER */}
                <div className="flex shrink-0 items-center gap-3 border-b border-[#d8f45a]/10 px-4 py-4">
                    {/* BACCK BUTTON */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#aeb7aa] transition hover:bg-white/[0.05] hover:text-[#f1eee8] md:hidden"
                        aria-label="Back"
                    >
                        <FiArrowLeft className="text-lg" />
                    </button>

                    <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-[#f1eee8]">
                        Contacts
                    </h2>

                    {/* DESKTOP CLOSE */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#aeb7aa] transition hover:bg-white/[0.05] hover:text-[#f1eee8] md:flex"
                        aria-label="Close contacts"
                    >
                        <FiX className="text-lg" />
                    </button>
                </div>

                {/* CONTACT LIST */}
                <div className="scrollbar-aetherion min-h-0 max-h-[calc(100dvh-130px)] overflow-y-auto overscroll-contain px-2 py-2 pb-2 md:max-h-[370px]">
                    {normalizedContacts.length === 0 ? (
                        <div className="flex h-full items-center justify-center px-6 text-center">
                            <div>
                                <h3 className="text-sm font-semibold text-[#f1eee8]">
                                    No contacts
                                </h3>

                                <p className="mt-2 text-xs leading-5 text-[#70786f]">
                                    There are no other Aetherion users to
                                    share.
                                </p>
                            </div>
                        </div>
                    ) : (
                        normalizedContacts.map((contact) => (
                            <ContactListItem
                                key={contact._id}
                                contact={contact}
                                selected={selectedContactIds.includes(
                                    String(contact._id),
                                )}
                                onToggle={toggleContact}
                            />
                        ))
                    )}
                </div>

                {/* FIXED SEND BUTTON */}

                {selectedContactIds.length > 0 && (
                    <div className="pointer-events-none absolute bottom-0 right-0 z-10 p-4">
                        <button
                            type="button"
                            onClick={handleSend}
                            className="
                pointer-events-auto
                flex h-12 w-12
                items-center justify-center
                rounded-full
                bg-[#d8f45a]
                text-[#10120d]
                shadow-lg
                transition
                hover:bg-[#e4ff6c]
                active:scale-95
              "
                            aria-label={`Send ${selectedContactIds.length} contact${selectedContactIds.length === 1
                                ? ""
                                : "s"
                                }`}
                            title={`Send ${selectedContactIds.length
                                } contact${selectedContactIds.length === 1
                                    ? ""
                                    : "s"
                                }`}
                        >
                            <FiSend className="text-lg" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactsModal;