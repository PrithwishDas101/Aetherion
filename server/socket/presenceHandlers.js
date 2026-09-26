import {
  addConnection,
  removeConnection,
  getOnlineUsers,
} from "./presenceStore.js";
import User from "../models/User.js";

const registerPresenceHandlers = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    socket.join(userId);

    const becameOnline = addConnection(userId);

    if (becameOnline) {
      io.emit("user-online", {
        userId,
      });
    }

    socket.on("get-presence", () => {
      socket.emit("presence-state", {
        userIds: getOnlineUsers(),
      });
    });

    socket.on("disconnect", async () => {
      const result = removeConnection(userId);

      if (!result.becameOffline) {
        return;
      }

      try {
        await User.findByIdAndUpdate(userId, {
          lastSeen: result.lastSeen,
        });
      } catch (error) {
        console.error("Failed to update last seen:", error.message);

        return;
      }

      io.emit("user-offline", {
        userId,
        lastSeen: result.lastSeen,
      });
    });
  });
};

export default registerPresenceHandlers;