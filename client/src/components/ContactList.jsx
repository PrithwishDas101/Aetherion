import { useSelector } from "react-redux";

const ContactList = () => {
    const { user } = useSelector((state) => state.userReducer);

    /*
     * Friends / contacts functionality is intentionally not implemented yet.
     * This component is currently only the visual shell for the profile page.
     */

    return (
        <section className="w-full">
            {/* HEADER */}

            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-[#f1eee8]">
                        Contacts
                    </h3>

                    <p className="mt-1 text-xs text-[#626960]">
                        People you connect with
                    </p>
                </div>

                <span className="text-xs text-[#626960]">
                    0
                </span>
            </div>

            {/* EMPTY STATE */}

            <div className="mt-4 rounded-2xl border border-[#d8f45a]/10 bg-[#101610] px-5 py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#171d17] text-[#626960]">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="h-6 w-6"
                        aria-hidden="true"
                    >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                </div>

                <p className="mt-4 text-sm font-medium text-[#c5c9c2]">
                    No contacts yet
                </p>

            </div>
        </section>
    );
};

export default ContactList;