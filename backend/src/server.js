import app from "./app.js";
import dotenv from "dotenv";
import { createServer } from "http";
import { initSocket } from "./socket/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

//////////////////////////////////////////////////////
// 🚀 START SERVER
//////////////////////////////////////////////////////
const startServer = () => {
  try {
    const server = createServer(app);

    //////////////////////////////////////////////////////
    // 🔥 INIT SOCKET
    //////////////////////////////////////////////////////
    initSocket(server);

    //////////////////////////////////////////////////////
    // 🚀 START LISTENING
    //////////////////////////////////////////////////////
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    //////////////////////////////////////////////////////
    // 🛑 GRACEFUL SHUTDOWN
    //////////////////////////////////////////////////////
    process.on("SIGINT", () => {
      console.log("🛑 Shutting down server...");

      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    });

    process.on("SIGTERM", () => {
      console.log("🛑 SIGTERM received");

      server.close(() => {
        console.log("✅ Server terminated");
        process.exit(0);
      });
    });

  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();