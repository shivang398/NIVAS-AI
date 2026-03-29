import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const analyze = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are Nivas AI, a highly advanced, friendly real estate assistant for the 'Nivas' platform. You help tenants find homes, answer leasing questions, and guide owners. Keep your responses concise, intelligent, and helpful.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-8b-8192",
      temperature: 0.6,
      max_tokens: 150,
    });

    const result = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
    
    return success(res, { result });
  } catch (error) {
    console.error("Groq AI Error:", error);
    return success(res, { result: "My systems are currently updating. Please try again in a few moments." });
  }
});