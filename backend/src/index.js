import express from "express";
import cors from "cors";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { clerkMiddleware } from "@clerk/express";


import User from "./models/user_model.js";
import { connectDB } from "./lib/db.js";
import job from "./lib/cron.js";
import clerkWebhook from "./webhooks/clerk.webhook.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

import { app, server } from "./lib/socket.js";

const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;

const publicDir = path.join(process.cwd(), "public");

// Clerk webhook
// Important: webhook data must remain in raw format.
app.use(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhook
);

// JSON parser
app.use(express.json());

// CORS
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// Clerk middleware
app.use(clerkMiddleware());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve frontend files in production
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (req, res, next) => {
    res.sendFile(
      path.join(publicDir, "index.html"),
      (err) => next(err)
    );
  });
}

// Start server only after MongoDB connects
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log("Server is up and running on PORT:", PORT);

      if (process.env.NODE_ENV === "production") {
        job.start();
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
