import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });


  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = decoded; // { id, role }

      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });


  io.on("connection", (socket) => {
    const user = socket.user;

    console.log("✅ Socket Connected:", user.id, user.role);


    socket.join(user.id);


    socket.join(user.role);


    socket.on("disconnect", () => {
      console.log("❌ Socket Disconnected:", user.id);
    });
  });
};

//////////////////////////////////////////////////////
// 📡 GET IO INSTANCE
//////////////////////////////////////////////////////
export const getIO = () => {
  if (!io) {
    throw new Error("Socket not initialized");
  }
  return io;
};