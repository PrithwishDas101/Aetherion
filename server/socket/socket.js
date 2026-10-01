import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import User from "../models/User.js";
import { registerSocketHandlers } from "./socketHandlers.js";
import registerPresenceHandlers from "./presenceHandlers.js";

export const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error("Socket authentication error:", error.message);

      return next(new Error("Invalid or expired authentication token"));
    }

    if (
      !decoded?.userId ||
      !Number.isSafeInteger(decoded.authVersion) ||
      decoded.authVersion < 0
    ) {
      return next(new Error("Invalid or expired authentication token"));
    }

    const currentUser = await User.findById(decoded.userId)
      .select("+authVersion")
      .lean();

    const currentAuthVersion =
      currentUser?.authVersion === undefined ? 0 : currentUser?.authVersion;

    if (
      !currentUser ||
      !Number.isSafeInteger(currentAuthVersion) ||
      currentAuthVersion < 0 ||
      currentAuthVersion !== decoded.authVersion
    ) {
      return next(new Error("Invalid or expired authentication token"));
    }

    socket.data.userId = String(decoded.userId);

    return next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);

    return next(new Error("Invalid or expired authentication token"));
  }
};

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

  io.use(authenticateSocket);

  registerSocketHandlers(io);
  registerPresenceHandlers(io);

  return io;
};

export default initializeSocket;
