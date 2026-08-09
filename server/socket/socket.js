import { Server } from "socket.io";

import { registerSocketHandlers } from "./socketHandlers.js";

const initializeSocket = server => {

    const io = new Server(
        server,
        {
            cors: {
                origin:
                    process.env.CLIENT_URL ||
                    "http://localhost:5173",

                methods: [
                    "GET",
                    "POST",
                ],

                credentials: true,
            },
        }
    );

    registerSocketHandlers(
        io
    );

    return io;

};

export default initializeSocket;