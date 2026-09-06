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
const FRONTEND_URL = process.env.FRONTEND_URL || "";

const publicDir = path.join(process.cwd(), "public");

// it's important that you don't parse the webhook event data, it should be in the raw format
app.use("/api/webhooks/clerk", express.raw({ type: "application/json" }), clerkWebhook);

app.use(express.json());
// If FRONTEND_URL isn't set, allow all origins (useful for local/dev). In production, set FRONTEND_URL explicitly.
if (FRONTEND_URL) {
  app.use(cors({ origin: FRONTEND_URL, credentials: true }));
} else {
  app.use(cors({ origin: true, credentials: true }));
}

app.use(clerkMiddleware());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// if the public directory exists, serve the static files (production build)
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  // Use a proper Express wildcard for SPA client-side routing
  app.get("/*", (req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

// Start server only after DB connection succeeds
async function startServer() {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log("Server is up and running on PORT:", PORT);

      if (process.env.NODE_ENV === "production") {
        try {
          job.start();
          console.log("Cron job started (production).");
        } catch (err) {
          console.error("Failed to start cron job:", err);
        }
      }
    });
  } catch (error) {
    console.error("Failed to connect to DB:", error);
    // fail fast if DB is required for the app
    process.exit(1);
  }
}

startServer();
