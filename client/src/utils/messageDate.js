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