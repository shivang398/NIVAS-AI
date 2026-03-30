import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const analyze = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({
      success: false,
      message: "Prompt is required",
    });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are Nivas AI, a highly advanced, friendly real estate assistant for the 'Nivas' platform based in India. You help tenants find homes, answer leasing questions, and guide owners. All property prices are in Indian Rupees (₹/INR). Never use dollars ($) or any other currency. Keep your responses concise, intelligent, and helpful.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.6,
      max_tokens: 300,
    });

    const result = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
    
    return success(res, { result });
  } catch (error) {
    console.error("Groq AI Error:", error?.message || error);
    return success(res, { result: "My AI systems are currently experiencing issues. Please try again in a few moments." });
  }
});