import winston from "winston";
import fs from "fs";
import path from "path";

//////////////////////////////////////////////////////
// 📁 ENSURE LOG DIRECTORY
//////////////////////////////////////////////////////
const logDir = "logs";

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

//////////////////////////////////////////////////////
// 🔥 FORMAT
//////////////////////////////////////////////////////
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }), // 🔥 stack trace
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${
      stack || message
    }`;
  })
);

//////////////////////////////////////////////////////
// 🚀 LOGGER
//////////////////////////////////////////////////////
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports: [
    //////////////////////////////////////////////////////
    // 🖥 CONSOLE (DEV FRIENDLY)
    //////////////////////////////////////////////////////
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),

    //////////////////////////////////////////////////////
    // ❌ ERROR FILE
    //////////////////////////////////////////////////////
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),

    //////////////////////////////////////////////////////
    // 📄 ALL LOGS
    //////////////////////////////////////////////////////
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
});

export default logger;