import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { chatbotService } from "../services/ai.service.js";

export const analyze = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({
      success: false,
      message: "Prompt is required",
    });
  }

  let user = null;

  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token && token !== "undefined") {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch full user to get name and proper role
        const dbUser = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, name: true, role: true }
        });
        
        if (dbUser) {
          user = dbUser;
        }
      }
    }
  } catch (err) {
    console.log("AI Chat optional auth failed:", err.message);
  }

  try {
    const result = await chatbotService(prompt, user);
    
    return success(res, { result });
  } catch (error) {
    console.error("Groq AI Error in controller:", error?.message || error);
    return res.status(500).json({
        success: false,
        message: "My AI systems are currently experiencing issues. Please try again in a few moments."
    });
  }
});