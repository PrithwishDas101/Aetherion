import { useState, } from "react";
import { createPortal, } from "react-dom";
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
    const [options, setOptions] =
        useState([
            createOption(),
            createOption(),
        ]);
    const [allowMultipleAnswers, setAllowMultipleAnswers,] = useState(false)
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

    const removeOption = (optionId,) => {
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
        const trimmedQuestion =
            question.trim();

        const cleanedOptions =
            options.map((option) => ({
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
                question:
                    trimmedQuestion,

                options:
                    cleanedOptions.map(
                        (option) =>
                            option.text,
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
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-4">

            {/* MODAL */}
            <div className="flex max-h-[92dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-3xl border border-[#d8f45a]/15 bg-[#0b100c] shadow-[0_18px_70px_rgba(0,0,0,0.6)] sm:rounded-3xl">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">

                    <div>
                        <h2 className="text-lg font-semibold text-[#edefe5]">
                            Create poll
                        </h2>

                        <p className="mt-0.5 text-xs text-[#7f887a]">
                            Ask the chat something.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSending}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-[#a7afa2] transition hover:bg-white/[0.06] hover:text-[#edefe5] disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Close poll"
                    >
                        <FiX className="text-xl" />
                    </button>

                </div>

                {/* CONTENT */}
                <div className="scrollbar-aetherion min-h-0 flex-1 overflow-y-auto px-5 py-5">

                    {/* QUESTION */}
                    <div>

                        <label
                            htmlFor="poll-question"
                            className="mb-2 block text-sm font-semibold text-[#edefe5]"
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
                            rows={3}
                            className="scrollbar-aetherion min-h-[88px] w-full resize-none rounded-2xl border border-[#d8f45a]/10 bg-[#080d09] px-4 py-3 text-sm leading-6 text-[#edefe5] outline-none transition placeholder:text-[#697267] focus:border-[#d8f45a]/45 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <div className="mt-1.5 text-right text-[11px] text-[#667060]">
                            {question.length}/500
                        </div>

                    </div>

                    {/* OPTIONS */}
                    <div className="mt-5">

                        <div className="mb-2 flex items-center justify-between">

                            <h3 className="text-sm font-semibold text-[#edefe5]">
                                Options
                            </h3>

                            <span className="text-xs text-[#70796c]">
                                {options.length}/{MAX_OPTIONS}
                            </span>

                        </div>

                        <div className="space-y-2.5">

                            {options.map((option, index,) => (

                                <div
                                    key={option.id}
                                    className="flex items-center gap-2"
                                >

                                    <div className="flex h-10 w-8 shrink-0 items-center justify-center text-xs font-semibold text-[#687164]">
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
                                        className="h-11 min-w-0 flex-1 rounded-xl border border-[#d8f45a]/10 bg-[#080d09] px-3.5 text-sm text-[#edefe5] outline-none transition placeholder:text-[#697267] focus:border-[#d8f45a]/45 disabled:cursor-not-allowed disabled:opacity-60"
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
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#7e877a] transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                                            aria-label={`Remove option ${index + 1}`}
                                        >
                                            <FiTrash2 />
                                        </button>

                                    ) : null}

                                </div>

                            ),
                            )}

                        </div>


                        {/* ADD OPTION */}
                        {options.length <
                            MAX_OPTIONS ? (

                            <button
                                type="button"
                                onClick={addOption}
                                disabled={isSending}
                                className="mt-3 flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-[#d8f45a] transition hover:bg-[#d8f45a]/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <FiPlus className="text-base" />

                                Add option
                            </button>

                        ) : null}

                    </div>

                    {/* MULTIPLE ANSWERS */}

                    <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#080d09] px-4 py-3.5">

                        <div>

                            <p className="text-sm font-semibold text-[#edefe5]">
                                Allow multiple answers
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[#747d70]">
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
                            className={`relative h-8 w-14 shrink-0 rounded-full transition ${allowMultipleAnswers
                                ? "bg-[#d8f45a]"
                                : "bg-[#283028]"
                                } disabled:cursor-not-allowed disabled:opacity-50`}
                            aria-label="Toggle multiple answers"
                            aria-pressed={
                                allowMultipleAnswers
                            }
                        >

                            <span
                                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all ${allowMultipleAnswers
                                    ? "left-7"
                                    : "left-1"
                                    }`}
                            />

                        </button>

                    </div>

                    {/* ERROR */}

                    {error ? (

                        <p className="mt-4 text-sm text-red-400">
                            {error}
                        </p>

                    ) : null}

                </div>

                {/* FOOTER */}

                <div className="border-t border-white/[0.06] bg-[#0b100c] px-5 py-4">

                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={isSending}
                        className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#e4ff6f] text-sm font-bold text-[#10120d] transition hover:bg-[#dcf95e] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
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