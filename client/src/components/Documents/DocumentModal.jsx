import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    createPortal,
} from "react-dom";

import {
    FileText,
} from "lucide-react";

import toast from "react-hot-toast";

const DOCUMENT_ACCESS_KEY =
    "aetherion-document-access-granted";

const DocumentModal = ({
    isOpen,
    onClose,
    onSend,
    source = "chat",
}) => {
    const fileInputRef =
        useRef(null);


    const hasOpenedPickerRef =
        useRef(false);

    const [isSending, setIsSending] =
        useState(false);

    const [
        hasDocumentAccess,
        setHasDocumentAccess,
    ] = useState(false);

    // CHECK SAVED DOCUMENT ACCESS
    useEffect(() => {
        if (!isOpen) {
            hasOpenedPickerRef.current =
                false;

            return;
        }

        const accessGranted =
            localStorage.getItem(
                DOCUMENT_ACCESS_KEY,
            ) === "true";

        setHasDocumentAccess(
            accessGranted,
        );
    }, [isOpen]);

    // IF ACCESS WAS ALREADY GRANTED,
    // OPEN THE PICKER DIRECTLY.
    useEffect(() => {
        if (
            !isOpen ||
            !hasDocumentAccess ||
            hasOpenedPickerRef.current ||
            isSending
        ) {
            return;
        }

        hasOpenedPickerRef.current =
            true;

        const openPicker = () => {
            fileInputRef.current?.click();
        };

        const timeout =
            setTimeout(
                openPicker,
                0,
            );

        return () => {
            clearTimeout(
                timeout,
            );
        };
    }, [
        isOpen,
        hasDocumentAccess,
        isSending,
    ]);

    const handleCancel = () => {
        onClose?.();
    };

    const handleContinue = () => {
        // REMEMBER THAT THE USER HAS
        // ALREADY ACCEPTED DOCUMENT ACCESS.

        localStorage.setItem(
            DOCUMENT_ACCESS_KEY,
            "true",
        );

        setHasDocumentAccess(
            true,
        );

        hasOpenedPickerRef.current =
            true;

        // This runs directly inside the
        // user's button click, allowing
        // browsers to open the native
        // document picker.

        fileInputRef.current?.click();
    };

    const handleFileInputChange = async (event) => {
        const files =
            Array.from(
                event.target.files || [],
            );

        // Reset so selecting the same
        // file later still triggers
        // change.

        event.target.value = "";

        // User closed the native picker.

        if (!files.length) {
            onClose?.();

            return;
        }

        try {
            setIsSending(true);

            const success =
                await onSend?.({
                    items: files.map(
                        (file) => ({
                            id: [
                                file.name,
                                file.size,
                                file.lastModified,
                            ].join("-"),

                            file,
                        }),
                    ),

                    source,
                });

            // Close only if the send
            // operation did not explicitly
            // report failure.

            if (success !== false) {
                onClose?.();
            }
        } catch (error) {
            console.error(
                "Document send error:",
                error,
            );

            toast.error(
                "Unable to send selected document.",
            );
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return createPortal(
        <>
            {/* HIDDEN NATIVE DOCUMENT PICKER */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
                multiple
                className="hidden"
                onChange={
                    handleFileInputChange
                }
            />

            {/* ONLY SHOW THE ACCESS MODAL WHEN ACCESS HAS NOT ALREADY BEEN GRANTED. */}

            {!hasDocumentAccess ? (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="w-full max-w-[340px] rounded-2xl border border-[#d8f45a]/15 bg-[#0b100c] px-5 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">

                        {/* DOCUMENT ICON */}
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#181f1a]">
                            <FileText
                                size={20}
                                strokeWidth={2}
                                className="text-[#506fb9]"
                            />
                        </div>

                        {/* TEXT */}
                        <h2 className="text-[17px] font-semibold text-[#edefe5]">
                            Access your files?
                        </h2>

                        <p className="mt-2 text-sm leading-5 text-[#8a9385]">
                            Choose documents to send
                            in this chat.
                        </p>

                        {/* ACTIONS */}
                        <div className="mt-5 flex gap-3">

                            <button
                                type="button"
                                onClick={
                                    handleCancel
                                }
                                disabled={
                                    isSending
                                }
                                className="flex-1 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-[#edefe5] transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleContinue
                                }
                                disabled={
                                    isSending
                                }
                                className="flex-1 rounded-xl bg-[#e4ff6f] px-4 py-2.5 text-sm font-semibold text-[#10120d] transition hover:bg-[#e1fe5d] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Continue
                            </button>

                        </div>

                    </div>
                </div>
            ) : null}
        </>,
        document.body,
    );


};

export default DocumentModal;
