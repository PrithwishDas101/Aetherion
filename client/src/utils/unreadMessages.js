export const getUnreadMessageCount = (
    chat,
    userId
) => {

    if (
        !chat ||
        !userId
    ) {
        return 0;
    }

    const unreadCounts =
        chat.unreadMessageCount;

    if (!unreadCounts) {
        return 0;
    }

    // Supports a Mongoose Map
    if (
        typeof unreadCounts.get ===
        "function"
    ) {

        return Number(
            unreadCounts.get(
                String(userId)
            )
        ) || 0;

    }

    // Supports the plain object
    // returned by the API
    return Number(

        unreadCounts[
            String(userId)
        ]

    ) || 0;

};


export const hasUnreadMessages = (
    chat,
    userId
) => {

    return (

        getUnreadMessageCount(
            chat,
            userId
        ) > 0

    );

};


export const getFirstUnreadIndex = (
    messages,
    unreadCount
) => {

    if (

        !Array.isArray(
            messages
        ) ||

        messages.length === 0 ||

        unreadCount <= 0

    ) {

        return -1;

    }

    return Math.max(

        0,

        messages.length -
        unreadCount

    );

};