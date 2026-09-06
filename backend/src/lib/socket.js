import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// Use FRONTEND_URL when set, otherwise fall back to localhost dev origin
const allowedOrigin = process.env.FRONTEND_URL && process.env.FRONTEND_URL.length > 0
  ? process.env.FRONTEND_URL
  : "http://localhost:5173";
const corsOrigins = Array.isArray(allowedOrigin) ? allowedOrigin : [allowedOrigin];

const io = new Server(server, { cors: { origin: corsOrigins } });

// online users map = { userId: socketId }
const userSocketMap = {};

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  // socket.io v4 can put auth on handshake.auth; older clients might use handshake.query
  const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;

  if (userId) userSocketMap[userId] = socket.id;

  // broadcast online users to everyone
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    // only delete if this socket was the one stored for the user
    if (userId && userSocketMap[userId] === socket.id) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io, getReceiverSocketId };
