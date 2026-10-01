import {
  addConnection,
  removeConnection,
  getOnlineUsers,
} from "./presenceStore.js";
import User from "../models/User.js";
import { socketEventLimiter } from "./socketEventLimiter.js";
import { logSafeError } from "../utils/safeLogging.js";

const registerPresenceHandlers = (io, eventLimiter = socketEventLimiter) => {
  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    socket.join(userId);

    const becameOnline = addConnection(userId);
    let presenceTracked = true;

    if (becameOnline) {
      io.emit("user-online", {
        userId,
      });
    }

    socket.on("get-presence", () => {
      if (!eventLimiter.allow(userId, "get-presence")) {
        return;
      }

      socket.emit("presence-state", {
        userIds: getOnlineUsers(),
      });
    });

    socket.on("disconnect", async () => {
      if (!presenceTracked) {
        return;
      }

      presenceTracked = false;
      const result = removeConnection(userId);

      if (!result.becameOffline) {
        return;
      }

      try {
        await User.findByIdAndUpdate(userId, {
          lastSeen: result.lastSeen,
        });
      } catch (error) {
        logSafeError("Update presence lastSeen", error, { userId });

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