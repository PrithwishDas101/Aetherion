import express from "express";

import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";



const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);

export default app;