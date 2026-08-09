const registerSocketListeners = (
    socket,
    {
        onReceiveMessage,
        onTyping,
        onStopTyping,
        onMessagesRead,
    } = {}
) => {

    if (!socket) {
        return () => {};
    }

    if (onReceiveMessage) {

        socket.on(
            "receive-message",
            onReceiveMessage
        );

    }

    if (onTyping) {

        socket.on(
            "typing",
            onTyping
        );

    }

    if (onStopTyping) {

        socket.on(
            "stop-typing",
            onStopTyping
        );

    }

    if (onMessagesRead) {

        socket.on(
            "messages-read",
            onMessagesRead
        );

    }

    return () => {

        if (onReceiveMessage) {

            socket.off(
                "receive-message",
                onReceiveMessage
            );

        }

        if (onTyping) {

            socket.off(
                "typing",
                onTyping
            );

        }

        if (onStopTyping) {

            socket.off(
                "stop-typing",
                onStopTyping
            );

        }

        if (onMessagesRead) {

            socket.off(
                "messages-read",
                onMessagesRead
            );

        }

    };

};

export default registerSocketListeners;