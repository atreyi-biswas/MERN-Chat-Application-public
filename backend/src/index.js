import express from "express";
import "dotenv/config";
import dns from "dns";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import User from "./models/user_model.js";
import { connectDB } from "./lib/db.js";

// Use Google DNS for MongoDB Atlas SRV lookup
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();

const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Middleware
app.use(express.json());

app.use(
    cors({
        origin: FRONTEND_URL,
        credentials: true,
    })
);

app.use(clerkMiddleware());

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({ ok: true });
});

// Start server
app.listen(PORT, async () => {
    try {
        await connectDB();
        console.log("Server is up and running on PORT:", PORT);
    } catch (error) {
        console.error("Failed to start server:", error);
    }
});