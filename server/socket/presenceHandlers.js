import { addConnection, removeConnection, getOnlineUsers } from "./presenceStore.js";
import User from "../models/User.js";

const registerPresenceHandlers = io => {

    io.on("connection", socket => {

        let userId = null;

        socket.on("join-room", incomingUserId => {

            if (!incomingUserId) {
                return;
            }

            userId = String(incomingUserId);

            socket.join(userId);

            const becameOnline =
                addConnection(userId);

            if (becameOnline) {

                io.emit(
                    "user-online",
                    {
                        userId,
                    }
                );

            }

        });

        socket.on("disconnect", async () => {

            if (!userId) {
                return;
            }

            const result =
                removeConnection(userId);

            if (!result.becameOffline) {
                return;
            }

            try {

                await User.findByIdAndUpdate(
                    userId,
                    {
                        lastSeen:
                            result.lastSeen,
                    }
                );

            } catch (error) {

                console.error(
                    "Failed to update last seen:",
                    error
                );

                return;
            }

            io.emit(
                "user-offline",
                {
                    userId,
                    lastSeen: result.lastSeen,
                }
            );

        });

        socket.on("get-presence", () => {

            socket.emit(
                "presence-state",
                {
                    userIds:
                        getOnlineUsers(),
                }
            );

        });

    });

};

export default registerPresenceHandlers;