import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import logger from "./utils/logger.js";

// 🔥 Routes
import authRoutes from "./routes/auth.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import offerRoutes from "./routes/offer.routes.js";
import verificationRoutes from "./routes/verification.routes.js";
import maintenanceRoutes from "./routes/maintenance.routes.js";
import nocRoutes from "./routes/noc.routes.js";
import leaseRoutes from "./routes/lease.routes.js";
import aiRoutes from "./routes/ai.routes.js";

// 🔐 Middleware
import { authMiddleware } from "./middleware/auth.middleware.js";
import { allowRoles } from "./middleware/role.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//////////////////////////////////////////////////////
// 🔐 CORS
//////////////////////////////////////////////////////
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

//////////////////////////////////////////////////////
// 🔐 BODY PARSER
//////////////////////////////////////////////////////
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

//////////////////////////////////////////////////////
// 🔐 SECURITY
//////////////////////////////////////////////////////
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

//////////////////////////////////////////////////////
// 📂 STATIC FILES
//////////////////////////////////////////////////////
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));
}

//////////////////////////////////////////////////////
// 📊 LOGGING
//////////////////////////////////////////////////////
app.use(morgan("dev"));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

//////////////////////////////////////////////////////
// 🚀 RATE LIMITING (GLOBAL)
//////////////////////////////////////////////////////
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Increased for development — dashboard makes many API calls
});

app.use((req, res, next) => {
  if (req.path.startsWith("/api/ai")) return next();
  globalLimiter(req, res, next);
});

//////////////////////////////////////////////////////
// 🤖 AI LIMITER
//////////////////////////////////////////////////////
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

//////////////////////////////////////////////////////
// 📌 HEALTH CHECK
//////////////////////////////////////////////////////
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Nivas API running 🚀",
  });
});

//////////////////////////////////////////////////////
// 🔥 API ROUTES
//////////////////////////////////////////////////////
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/noc", nocRoutes);
app.use("/api/leases", leaseRoutes);

// 🤖 AI
app.use("/api/ai", aiLimiter, aiRoutes);

//////////////////////////////////////////////////////
// 🔐 TEST ROUTES
//////////////////////////////////////////////////////
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.get(
  "/api/owner-only",
  authMiddleware,
  allowRoles("OWNER"),
  (req, res) => {
    res.json({ success: true, message: "Owner access 👑" });
  }
);

// Catch-all for React Router in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
  });
}

//////////////////////////////////////////////////////
// ❌ 404 HANDLER
//////////////////////////////////////////////////////
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

//////////////////////////////////////////////////////
// ❌ GLOBAL ERROR HANDLER
//////////////////////////////////////////////////////
app.use((err, req, res, next) => {
  logger.error(err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;