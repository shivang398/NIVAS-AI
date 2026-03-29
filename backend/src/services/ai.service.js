import prisma from "../config/prisma.js";
import Groq from "groq-sdk";
import { AppError } from "../utils/AppError.js";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


const extractFilters = (message) => {
  const priceMatch = message.match(/(\d{3,7})/);
  const locationMatch = message.match(/in ([a-zA-Z\s]+)/i);
  const bhkMatch = message.match(/(\d)\s?bhk/i);

  return {
    price: priceMatch ? parseInt(priceMatch[0]) : null,
    location: locationMatch ? locationMatch[1].trim() : null,
    bhk: bhkMatch ? parseInt(bhkMatch[1]) : null,
  };
};

const buildPropertyContext = (properties) => {
  if (!properties.length) return "No matching properties found.";

  return properties
    .map(
      (p, i) =>
        `${i + 1}. ${p.title} | ₹${p.price} | ${p.location}`
    )
    .join("\n");
};

const buildUserContext = async (user) => {
  if (!user || user.role !== "TENANT") return "";

  const offers = await prisma.offer.findMany({
    where: { tenantId: user.id },
    include: { property: true },
    take: 3,
  });

  if (!offers.length) return "No previous offers.";

  return `User past offers:\n${offers
    .map((o) => `${o.property.title} (${o.status})`)
    .join("\n")}`;
};


export const chatbotService = async (message, user) => {
  if (!message) {
    throw new AppError("Message is required", 400);
  }


  const filters = extractFilters(message);


  const properties = await prisma.property.findMany({
    where: {
      price: filters.price ? { lte: filters.price } : undefined,
      location: filters.location
        ? { contains: filters.location, mode: "insensitive" }
        : undefined,
      title: filters.bhk
        ? { contains: `${filters.bhk}BHK`, mode: "insensitive" }
        : undefined,
    },
    orderBy: { price: "asc" },
    take: 5,
  });

  const propertyContext = buildPropertyContext(properties);
  const userContext = await buildUserContext(user);

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are a smart real estate assistant.

Rules:
- Only use provided data
- Do NOT hallucinate
- Be concise and helpful

User Role: ${user?.role || "GUEST"}

${userContext}

Available Properties:
${propertyContext}
`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    return response?.choices?.[0]?.message?.content || "No response";

  } catch (err) {
    console.error("🔥 AI ERROR:", err.message);
    throw new AppError("AI service failed", 500);
  }
};