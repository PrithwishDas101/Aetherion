const isSameDay = (firstDate, secondDate) => {

    return (
        firstDate.getFullYear() ===
        secondDate.getFullYear() &&

        firstDate.getMonth() ===
        secondDate.getMonth() &&

        firstDate.getDate() ===
        secondDate.getDate()
    );

};


export const formatMessageTime = (
    dateString
) => {

    if (!dateString) {
        return "";
    }

    return new Date(
        dateString
    ).toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit",
        }
    );

};


export const formatDateLabel = (
    dateString
) => {

    if (!dateString) {
        return "";
    }

    const messageDate =
        new Date(
            dateString
        );

    const today =
        new Date();

    const yesterday =
        new Date();

    yesterday.setDate(
        today.getDate() - 1
    );


    if (
        isSameDay(
            messageDate,
            today
        )
    ) {

        return "Today";

    }


    if (
        isSameDay(
            messageDate,
            yesterday
        )
    ) {

        return "Yesterday";

    }


    const isCurrentYear =

        messageDate.getFullYear() ===
        today.getFullYear();


    return messageDate.toLocaleDateString(
        [],
        isCurrentYear

            ? {
                weekday: "long",
                day: "numeric",
                month: "long",
            }

            : {
                day: "numeric",
                month: "long",
                year: "numeric",
            }
    );

};


export const shouldShowDateSeparator = (
    currentMessage,
    previousMessage
) => {

    if (!currentMessage) {
        return false;
    }


    if (!previousMessage) {
        return true;
    }


    const currentDate =
        new Date(
            currentMessage.createdAt
        );

    const previousDate =
        new Date(
            previousMessage.createdAt
        );


    return !isSameDay(
        currentDate,
        previousDate
    );

};

export const formatChatPreviewTime = (
    dateValue
) => {

    if (!dateValue) {
        return "";
    }

    const messageDate =
        new Date(dateValue);

    const currentDate =
        new Date();


    const isToday =

        messageDate
            .toDateString() ===

        currentDate
            .toDateString();


    if (isToday) {

        return messageDate
            .toLocaleTimeString(

                "en-US",

                {
                    hour:
                        "numeric",

                    minute:
                        "2-digit",
                }

            );

    }


    const yesterday =
        new Date();

    yesterday.setDate(
        currentDate.getDate() - 1
    );


    const isYesterday =

        messageDate
            .toDateString() ===

        yesterday
            .toDateString();


    if (isYesterday) {

        return "Yesterday";

    }


    const isCurrentYear =

        messageDate.getFullYear() ===

        currentDate.getFullYear();


    return messageDate
        .toLocaleDateString(

            "en-US",

            isCurrentYear

                ? {

                    month:
                        "short",

                    day:
                        "numeric",

                }

                : {

                    month:
                        "short",

                    day:
                        "numeric",

                    year:
                        "numeric",

                }

        );

};