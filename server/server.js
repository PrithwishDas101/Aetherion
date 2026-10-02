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

const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLIENT_URL",
];

const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]?.trim());

if (missingEnvVars.length > 0) {
  logSafeError(
    "Server environment validation",
    new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`),
  );
  process.exit(1);
}

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
