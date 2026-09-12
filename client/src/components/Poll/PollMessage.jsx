import { useState } from "react";

import PollOption from "./PollOption.jsx";

const PollMessage = ({
    poll,
    isMyMessage,
    currentUserId,
    onVote,
}) => {
    const [isVoting, setIsVoting] =
        useState(false);

    if (!poll) {
        return null;
    }

    const question =
        poll.question ||
        "Untitled poll";

    const options =
        Array.isArray(poll.options)
            ? poll.options
            : [];

    const allowMultipleAnswers =
        Boolean(
            poll.allowMultipleAnswers,
        );

    // GET OPTIONS CURRENT USER HAS VOTED FOR
    const selectedOptionIds =
        options
            .filter((option) =>
                Array.isArray(option.votes) &&
                option.votes.some(
                    (voteUserId) =>
                        String(voteUserId) ===
                        String(currentUserId),
                ),
            )
            .map((option) =>
                String(option._id),
            );

    const totalVotes =
        options.reduce(
            (total, option) =>
                total +
                Number(
                    option.voteCount ||
                    option.votes?.length ||
                    0,
                ),
            0,
        );

    // HANDLE OPTION CLICK
    const handleOptionClick =
        async (optionId) => {
            if (
                isVoting ||
                !poll._id ||
                !optionId ||
                !onVote
            ) {
                return;
            }


            const normalizedOptionId =
                String(optionId);

            let nextSelectedOptionIds;

            // SINGLE ANSWER
            if (!allowMultipleAnswers) {
                nextSelectedOptionIds = [
                    normalizedOptionId,
                ];
            } else {
                // MULTIPLE ANSWERS
                const isAlreadySelected =
                    selectedOptionIds.includes(
                        normalizedOptionId,
                    );

                if (isAlreadySelected) {
                    nextSelectedOptionIds =
                        selectedOptionIds.filter(
                            (selectedId) =>
                                selectedId !==
                                normalizedOptionId,
                        );
                } else {
                    nextSelectedOptionIds = [
                        ...selectedOptionIds,
                        normalizedOptionId,
                    ];
                }
            }

            // BACKEND DOES NOT CURRENTLY
            // ALLOW EMPTY OPTION ARRAYS
            if (
                nextSelectedOptionIds.length ===
                0
            ) {
                return;
            }

            try {
                setIsVoting(true);

                await onVote(
                    poll._id,
                    nextSelectedOptionIds,
                );
            } finally {
                setIsVoting(false);
            }
        };


    return (
        <div
            className={`min-w-[260px] max-w-[420px] rounded-2xl px-3 py-3 ${isMyMessage
                    ? "bg-[#d8f164] text-[#10120d]"
                    : "border border-[#d8f45a]/10 bg-[#18221a] text-[#f1eee8]"
                }`}
        >
            {/* POLL LABEL */}


            <div className="mb-3 flex items-center gap-2">
                <span
                    className={`text-[10px] font-bold uppercase tracking-[0.14em] ${isMyMessage
                            ? "text-[#10120d]/55"
                            : "text-[#8f998b]"
                        }`}
                >
                    Poll
                </span>
            </div>

            {/* QUESTION */}

            <h3
                className={`mb-4 text-sm font-semibold leading-6 ${isMyMessage
                        ? "text-[#10120d]"
                        : "text-[#edefe5]"
                    }`}
            >
                {question}
            </h3>

            {/* OPTIONS */}

            <div className="space-y-2">
                {options.map(
                    (option, index) => {
                        const optionId =
                            option._id ||
                            option.id;

                        const voteCount =
                            Number(
                                option.voteCount ||
                                option.votes?.length ||
                                0,
                            );

                        const percentage =
                            totalVotes > 0
                                ? (
                                    voteCount /
                                    totalVotes
                                ) *
                                100
                                : 0;

                        const isSelected =
                            selectedOptionIds.includes(
                                String(optionId),
                            );

                        return (
                            <PollOption
                                key={
                                    optionId ||
                                    index
                                }
                                option={{
                                    ...option,
                                    text:
                                        option.text ||
                                        String(option),
                                }}
                                index={index}
                                voteCount={voteCount}
                                percentage={percentage}
                                isSelected={isSelected}
                                allowMultipleAnswers={
                                    allowMultipleAnswers
                                }
                                disabled={
                                    isVoting ||
                                    !optionId
                                }
                                onClick={() =>
                                    handleOptionClick(
                                        optionId,
                                    )
                                }
                            />
                        );
                    },
                )}
            </div>

            {/* FOOTER */}

            <div
                className={`mt-3 flex items-center justify-between text-[11px] ${isMyMessage
                        ? "text-[#10120d]/55"
                        : "text-[#7d8778]"
                    }`}
            >
                <span>
                    {totalVotes}{" "}
                    {totalVotes === 1
                        ? "vote"
                        : "votes"}
                </span>

                {allowMultipleAnswers ? (
                    <span>
                        Multiple answers
                    </span>
                ) : null}
            </div>
        </div>


    );
};

export default PollMessage;
