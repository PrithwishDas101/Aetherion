import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import chatRoutes from "./routes/chatRoute.js";
import contactRoutes from "./routes/contactRoute.js";
import contactRequestRoutes from "./routes/contactRequestRoute.js";
import messageRoutes from "./routes/MessageRoute.js";
import pollRoutes from "./routes/pollRoute.js";
import contactProfileRoutes from "./routes/contactProfileRoute.js";
import { logSafeError } from "./utils/safeLogging.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const trustProxy = process.env.TRUST_PROXY?.trim();

if (trustProxy) {
  app.set("trust proxy", trustProxy);
}

app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    strictTransportSecurity: isProduction,
  }),
);

const configuredClientOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || "").split(","),
];

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...configuredClientOrigins
    .map((value) => value?.trim())
    .filter(Boolean)
    .map((value) => {
      try {
        // Store origins only, so a trailing slash on an env value doesn't break CORS.
        return new URL(value).origin;
      } catch {
        return null;
      }
    })
    .filter(Boolean),
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      logSafeError("CORS origin rejected", new Error("Origin not allowed"));

      return callback(new Error("CORS origin not allowed"));
    },

    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],

    credentials: true,
  }),
);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/contact-request", contactRequestRoutes);
app.use("/api/v1/message", messageRoutes);
app.use("/api/v1/poll", pollRoutes);
app.use("/api/v1/contact-profile", contactProfileRoutes);

export default app;
