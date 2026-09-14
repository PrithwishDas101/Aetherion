import { useState } from "react";

import PollOption from "./PollOption.jsx";

const PollMessage = ({
    poll,
    isMyMessage,
    currentUserId,
    onVote,
}) => {
    const [isVoting, setIsVoting] = useState(false);

    if (!poll) {
        return null;
    }

    const question = poll.question || "Untitled poll";

    const options = Array.isArray(poll.options)
        ? poll.options
        : [];

    const allowMultipleAnswers = Boolean(
        poll.allowMultipleAnswers,
    );

    const selectedOptionIds = options
        .filter((option) =>
            Array.isArray(option.votes) &&
            option.votes.some(
                (voteUserId) =>
                    String(voteUserId) ===
                    String(currentUserId),
            ),
        )
        .map((option) => String(option._id));

    const totalVotes = options.reduce(
        (total, option) =>
            total +
            Number(
                option.voteCount ||
                option.votes?.length ||
                0,
            ),
        0,
    );

    const handleOptionClick = async (optionId) => {
        if (
            isVoting ||
            !poll._id ||
            !optionId ||
            !onVote
        ) {
            return;
        }

        const normalizedOptionId = String(optionId);

        let nextSelectedOptionIds;

        if (!allowMultipleAnswers) {
            const isAlreadySelected =
                selectedOptionIds.includes(
                    normalizedOptionId,
                );

            nextSelectedOptionIds =
                isAlreadySelected
                    ? []
                    : [normalizedOptionId];
        } else {
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
            className={`min-w-[270px] max-w-[420px] overflow-hidden rounded-2xl border px-3.5 py-3 ${isMyMessage
                    ? "border-[#2b3027] bg-[#1a2018] text-[#edefe5]"
                    : "border-[#202720] bg-[#141a16] text-[#edefe5]"
                }`}
        >
            <h3 className="mb-3 text-sm font-semibold leading-5 text-[#f1f3ed]">
                {question}
            </h3>

            <div className="space-y-1">
                {options.map((option, index) => {
                    const optionId =
                        option._id ||
                        option.id;

                    const voteCount = Number(
                        option.voteCount ||
                        option.votes?.length ||
                        0,
                    );

                    const percentage =
                        totalVotes > 0
                            ? (voteCount / totalVotes) *
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
                })}
            </div>

            <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[10px] font-medium text-[#7d8778]">
                <span>
                    {totalVotes}{" "}
                    {totalVotes === 1
                        ? "vote"
                        : "votes"}
                </span>

                <span>
                    {allowMultipleAnswers
                        ? "Multiple"
                        : "Single"}
                </span>
            </div>
        </div>
    );
};

export default PollMessage;