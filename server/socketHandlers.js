export const registerSocketHandlers = io => {

    io.on("connection", socket => {

        socket.on("join-room", userId => {

            socket.join(
                String(userId)
            );

        });

        socket.on(
            "send-message",
            ({
                message,
                chat,
                members,
            }) => {

                members.forEach(
                    memberId => {

                        if (
                            memberId !==
                            String(
                                message.sender
                            )
                        ) {

                            socket
                                .to(
                                    String(
                                        memberId
                                    )
                                )
                                .emit(
                                    "receive-message",
                                    {
                                        message,
                                        chat,
                                    }
                                );

                        }

                    }
                );

            }
        );

        socket.on(
            "typing",
            ({
                members,
                sender,
                chatId,
            }) => {

                members.forEach(
                    memberId => {

                        if (
                            String(
                                memberId
                            ) !==
                            String(
                                sender
                            )
                        ) {

                            socket
                                .to(
                                    String(
                                        memberId
                                    )
                                )
                                .emit(
                                    "typing",
                                    {
                                        sender,
                                        chatId,
                                    }
                                );

                        }

                    }
                );

            }
        );

        socket.on(
            "stop-typing",
            ({
                members,
                sender,
                chatId,
            }) => {

                members.forEach(
                    memberId => {

                        if (
                            String(
                                memberId
                            ) !==
                            String(
                                sender
                            )
                        ) {

                            socket
                                .to(
                                    String(
                                        memberId
                                    )
                                )
                                .emit(
                                    "stop-typing",
                                    {
                                        sender,
                                        chatId,
                                    }
                                );

                        }

                    }
                );

            }
        );

    });

};