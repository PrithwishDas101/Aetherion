import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config({
    quiet: true,
});

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin:
            process.env.CLIENT_URL || "http://localhost:5173",

        methods: ["GET", "POST",],

        credentials: true,
    },
}
);

io.on(
    "connection", socket => {

        console.log("Client connected:", socket.id);

        socket.on("disconnect", () => {

            console.log("Client disconnected:", socket.id);
        }
        );
    }
);

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server started at PORT: ${PORT}`);
    });
})
    .catch(error => {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
    );