const joinRoom = (
    socket,
    userId
) => {

    if (!socket || !userId) {
        return;
    }

    socket.emit(
        "join-room",
        String(userId)
    );

};

const sendMessage = (
    socket,
    {
        message,
        chat,
        members,
    }
) => {

    if (!socket) {
        return;
    }

    socket.emit(
        "send-message",
        {
            message,
            chat,
            members,
        }
    );

};

const sendTyping = (
    socket,
    {
        sender,
        chatId,
        members,
    }
) => {

    if (!socket) {
        return;
    }

    socket.emit(
        "typing",
        {
            sender,
            chatId,
            members,
        }
    );

};

const sendStopTyping = (
    socket,
    {
        sender,
        chatId,
        members,
    }
) => {

    if (!socket) {
        return;
    }

    socket.emit(
        "stop-typing",
        {
            sender,
            chatId,
            members,
        }
    );

};

const getPresence = socket => {

    if (!socket) {
        return;
    }

    socket.emit(
        "get-presence"
    );

};

export {
    joinRoom,
    sendMessage,
    sendTyping,
    sendStopTyping,
    getPresence
};