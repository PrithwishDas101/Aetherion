import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";
import initializeSocket from "./socket/socket.js";
import { logSafeError } from "./utils/safeLogging.js";

dotenv.config({
  quiet: true,
});

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

const io = initializeSocket(server);

app.set("io", io);

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server started at PORT: ${PORT}`);
    });
  })
  .catch((error) => {
    logSafeError("Database connection", error);
    process.exit(1);
  });
