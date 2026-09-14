import { useState } from "react";
import { createPortal } from "react-dom";
import {
    FiPlus,
    FiTrash2,
    FiX,
} from "react-icons/fi";


const MAX_OPTIONS = 10;


const createOption = () => ({
    id: crypto.randomUUID(),
    text: "",
});


const PollModal = ({
    isOpen,
    onClose,
    onSend,
}) => {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState([
        createOption(),
        createOption(),
    ]);
    const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
    const [error, setError] = useState("");
    const [isSending, setIsSending] = useState(false);


    const resetPoll = () => {
        setQuestion("");

        setOptions([
            createOption(),
            createOption(),
        ]);

        setAllowMultipleAnswers(false);

        setError("");
    };


    const handleClose = () => {
        if (isSending) {
            return;
        }

        resetPoll();

        onClose?.();
    };


    const updateOption = (
        optionId,
        value,
    ) => {
        setOptions((previous) =>
            previous.map((option) =>
                option.id === optionId
                    ? {
                        ...option,
                        text: value,
                    }
                    : option,
            ),
        );

        setError("");
    };


    const addOption = () => {
        if (options.length >= MAX_OPTIONS) {
            return;
        }

        setOptions((previous) => [
            ...previous,
            createOption(),
        ]);
    };


    const removeOption = (
        optionId,
    ) => {
        if (options.length <= 2) {
            return;
        }

        setOptions((previous) =>
            previous.filter(
                (option) =>
                    option.id !== optionId,
            ),
        );
    };


    const handleSend = async () => {
        const trimmedQuestion = question.trim();

        const cleanedOptions = options.map((option) => ({
            ...option,
            text: option.text.trim(),
        }));

        if (!trimmedQuestion) {
            setError(
                "Enter a question or proposal.",
            );

            return;
        }

        if (
            cleanedOptions.some(
                (option) => !option.text,
            )
        ) {
            setError(
                "Every option needs text.",
            );

            return;
        }

        if (trimmedQuestion.length > 500) {
            setError(
                "The question can be up to 500 characters.",
            );

            return;
        }

        if (
            cleanedOptions.some(
                (option) =>
                    option.text.length > 200,
            )
        ) {
            setError(
                "Each option can be up to 200 characters.",
            );

            return;
        }

        try {
            setIsSending(true);

            setError("");

            await onSend?.({
                question: trimmedQuestion,
                options: cleanedOptions.map(
                    (option) => option.text,
                ),
                allowMultipleAnswers,
            });

            resetPoll();

            onClose?.();
        } catch (sendError) {
            console.error(
                "Poll send error:",
                sendError,
            );

            setError(
                "Unable to create the poll.",
            );
        } finally {
            setIsSending(false);
        }
    };


    if (!isOpen) {
        return null;
    }


    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b100c] p-3 sm:px-4 sm:py-4 md:px-4 md:py-6 lg:bg-transparent lg:p-0 lg:pl-[320px]"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget &&
                    window.matchMedia(
                        "(min-width: 1024px)",
                    ).matches
                ) {
                    handleClose();
                }
            }}
        >

            {/* MODAL */}
            <div
                className="flex max-h-[calc(100dvh-24px)] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl border border-[#d8f45a]/10 bg-[#0b100c] shadow-none sm:max-h-[calc(100dvh-32px)] md:max-h-[calc(100dvh-48px)] lg:max-h-[calc(100dvh-56px)] lg:max-w-[400px] lg:border-[#d8f45a]/15 lg:shadow-[0_18px_70px_rgba(0,0,0,0.55)]"
                onMouseDown={(event) => {
                    event.stopPropagation();
                }}
            >

                {/* HEADER */}
                <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-3 md:py-3.5">

                    <div className="min-w-0">

                        <h2 className="text-base font-semibold text-[#edefe5]">
                            Create poll
                        </h2>

                        <p className="mt-0.5 text-[11px] text-[#7f887a]">
                            Ask the chat something.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSending}
                        className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#a7afa2] transition hover:bg-white/[0.06] hover:text-[#edefe5] disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Close poll"
                    >
                        <FiX className="text-lg" />
                    </button>

                </div>


                {/* CONTENT */}
                <div className="scrollbar-aetherion min-h-0 flex-1 overflow-y-auto px-4 py-3.5 md:py-4">

                    {/* QUESTION */}
                    <div>

                        <label
                            htmlFor="poll-question"
                            className="mb-1.5 block text-xs font-semibold text-[#edefe5]"
                        >
                            Question
                        </label>


                        <textarea
                            id="poll-question"
                            value={question}
                            onChange={(event) => {
                                setQuestion(
                                    event.target.value,
                                );

                                setError("");
                            }}
                            disabled={isSending}
                            placeholder="What do you want to ask?"
                            maxLength={500}
                            rows={2}
                            className="scrollbar-aetherion min-h-[64px] w-full resize-none rounded-xl border border-[#d8f45a]/10 bg-[#080d09] px-3 py-2.5 text-sm leading-5 text-[#edefe5] outline-none transition placeholder:text-[#697267] focus:border-[#d8f45a]/45 disabled:cursor-not-allowed disabled:opacity-60"
                        />


                        <div className="mt-1 text-right text-[10px] text-[#667060]">
                            {question.length}/500
                        </div>

                    </div>


                    {/* OPTIONS */}
                    <div className="mt-3.5">

                        <div className="mb-1.5 flex items-center justify-between">

                            <h3 className="text-xs font-semibold text-[#edefe5]">
                                Options
                            </h3>

                            <span className="text-[10px] text-[#70796c]">
                                {options.length}/{MAX_OPTIONS}
                            </span>

                        </div>


                        <div className="space-y-1.5">

                            {options.map(
                                (
                                    option,
                                    index,
                                ) => (

                                    <div
                                        key={option.id}
                                        className="flex items-center gap-1.5"
                                    >

                                        <div className="flex h-9 w-5 shrink-0 items-center justify-center text-[10px] font-semibold text-[#687164]">
                                            {index + 1}
                                        </div>


                                        <input
                                            type="text"
                                            value={option.text}
                                            onChange={(event) =>
                                                updateOption(
                                                    option.id,
                                                    event.target.value,
                                                )
                                            }
                                            disabled={isSending}
                                            maxLength={200}
                                            placeholder={`Option ${index + 1}`}
                                            className="h-9 min-w-0 flex-1 rounded-lg border border-[#d8f45a]/10 bg-[#080d09] px-3 text-xs text-[#edefe5] outline-none transition placeholder:text-[#697267] focus:border-[#d8f45a]/45 disabled:cursor-not-allowed disabled:opacity-60"
                                        />


                                        {options.length > 2 ? (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeOption(
                                                        option.id,
                                                    )
                                                }
                                                disabled={isSending}
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#7e877a] transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                                                aria-label={`Remove option ${index + 1}`}
                                            >
                                                <FiTrash2 className="text-sm" />
                                            </button>

                                        ) : null}

                                    </div>

                                ),
                            )}

                        </div>


                        {/* ADD OPTION */}
                        {options.length < MAX_OPTIONS ? (

                            <button
                                type="button"
                                onClick={addOption}
                                disabled={isSending}
                                className="mt-2 flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-xs font-medium text-[#d8f45a] transition hover:bg-[#d8f45a]/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <FiPlus className="text-sm" />

                                Add option
                            </button>

                        ) : null}

                    </div>


                    {/* MULTIPLE ANSWERS */}
                    <div className="mt-3.5 flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#080d09] px-3 py-2.5">

                        <div className="min-w-0">

                            <p className="text-xs font-semibold text-[#edefe5]">
                                Allow multiple answers
                            </p>

                            <p className="mt-0.5 text-[10px] leading-4 text-[#747d70]">
                                People can vote for more than one option.
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                setAllowMultipleAnswers(
                                    (previous) =>
                                        !previous,
                                )
                            }
                            disabled={isSending}
                            className={`relative h-7 w-12 shrink-0 rounded-full transition ${allowMultipleAnswers ? "bg-[#d8f45a]" : "bg-[#283028]"} disabled:cursor-not-allowed disabled:opacity-50`}
                            aria-label="Toggle multiple answers"
                            aria-pressed={
                                allowMultipleAnswers
                            }
                        >

                            <span
                                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all ${allowMultipleAnswers ? "left-6" : "left-1"}`}
                            />

                        </button>

                    </div>


                    {/* ERROR */}
                    {error ? (

                        <p className="mt-2.5 text-xs text-red-400">
                            {error}
                        </p>

                    ) : null}

                </div>


                {/* FOOTER */}
                <div className="shrink-0 border-t border-white/[0.06] bg-[#0b100c] px-4 py-3">

                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={isSending}
                        className="flex h-10 w-full items-center justify-center rounded-xl bg-[#e4ff6f] text-xs font-bold text-[#10120d] transition hover:bg-[#dcf95e] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSending
                            ? "Sending poll..."
                            : "Send poll"}
                    </button>

                </div>

            </div>

        </div>,
        document.body,
    );
};


export default PollModal;
