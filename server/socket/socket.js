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

  registerSocketHandlers(io);
  registerPresenceHandlers(io);

  return io;
};

export default initializeSocket;