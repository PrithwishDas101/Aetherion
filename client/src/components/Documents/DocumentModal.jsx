import {
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

const DocumentModal = ({
    isOpen,
    onClose,
    onSend,
    source = "chat",
}) => {
    const fileInputRef =
        useRef(null);

    const [isSending, setIsSending] =
        useState(false);

    const handleCancel = () => {
        onClose?.();
    };

    const handleContinue = () => {
        // This runs directly inside the user's
        // button click, so browsers can open
        // the native document picker.
        fileInputRef.current?.click();
    };

    const handleFileInputChange =
        async (event) => {
            const files =
                Array.from(
                    event.target.files || [],
                );

            // Reset so selecting the same file
            // later still triggers change.
            event.target.value = "";

            // User closed the native picker.
            if (!files.length) {
                onClose?.();

                return;
            }

            try {
                setIsSending(true);

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

                onClose?.();
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

            {/* DOCUMENT ACCESS */}

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
        </>,
        document.body,
    );
};

export default DocumentModal;