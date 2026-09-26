import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import { registerSocketHandlers } from "./socketHandlers.js";
import registerPresenceHandlers from "./presenceHandlers.js";

const initializeSocket = (server) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.1.33:5173",
    process.env.CLIENT_URL,
    "https://nvidia-distribute-skating-motorola.trycloudflare.com",
  ].filter(Boolean);

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authenticate every Socket.IO connection before it can reach any handler.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded?.userId) {
        return next(new Error("Invalid authentication token"));
      }

      socket.data.userId = String(decoded.userId);

      return next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);

      return next(new Error("Invalid or expired authentication token"));
    }
  });

  registerSocketHandlers(io);
  registerPresenceHandlers(io);

  return io;
};

export default initializeSocket;
