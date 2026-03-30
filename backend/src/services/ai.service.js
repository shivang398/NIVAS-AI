import prisma from "../config/prisma.js";
import Groq from "groq-sdk";
import { AppError } from "../utils/AppError.js";
import { parseDescription } from "../../../frontend/src/utils/propertyParser.js"; // Wait, can't import from frontend

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * 🔍 EXTRACT FILTERS FROM MESSAGE
 */
const extractFilters = (message) => {
  const priceMatch = message.match(/(\d{3,7})/);
  const locationMatch = message.match(/(in|at|near) ([a-zA-Z\s]+)/i);
  const bhkMatch = message.match(/(\d)\s?bhk/i);

  return {
    price: priceMatch ? parseInt(priceMatch[0]) : null,
    location: locationMatch ? locationMatch[2].trim() : null,
    bhk: bhkMatch ? parseInt(bhkMatch[1]) : null,
  };
};

/**
 * 🏠 BUILD DETAILED PROPERTY CONTEXT
 */
const buildPropertyContext = (properties) => {
  if (!properties.length) return "NO AVAILABLE PROPERTIES LISTED ON NIVAS CURRENTLY.";

  return properties
    .map((p, i) => {
      // Basic manual parse for AI context
      const bhkMatch = p.description?.match(/Beds: (\d+)/i);
      const bhk = bhkMatch ? bhkMatch[1] : "N/A";
      return `${i + 1}. ${p.title} | ₹${p.price}/mo | Loc: ${p.location} | BHK: ${bhk} | Status: ${p.status}`;
    })
    .join("\n");
};

/**
 * 👤 BUILD ROLE-BASED USER CONTEXT
 */
const buildUserContext = async (user) => {
  if (!user?.id) return "User is a Guest. Encourage them to Login/Signup.";

  let context = `Active User: ${user.name} (Role: ${user.role})\n`;

  if (user.role === "TENANT") {
    // 🏠 Active Leases
    const leases = await prisma.lease.findMany({
      where: { tenantId: user.id, status: { equals: "active", mode: "insensitive" } },
      include: { property: true },
    });
    if (leases.length) {
      context += `Current Leases:\n${leases.map(l => `- Living in: ${l.property.title} (Rent: ₹${l.rent})`).join("\n")}\n`;
    }

    // 💰 Pending Applications (Offers)
    const offers = await prisma.offer.findMany({
      where: { tenantId: user.id, status: "PENDING" },
      include: { property: true },
    });
    if (offers.length) {
      context += `Pending Applications:\n${offers.map(o => `- Applied to: ${o.property.title} for ₹${o.price}`).join("\n")}\n`;
    }

    // 🛠️ Maintenance Requests
    const maintenance = await prisma.maintenance.findMany({
      where: { tenantId: user.id, status: { not: "resolved" } },
    });
    if (maintenance.length) {
      context += `Active Maintenance Issues:\n${maintenance.map(m => `- ${m.issue} (${m.status})`).join("\n")}\n`;
    }
  } 
  
  else if (user.role === "OWNER") {
    // 🏠 Owned Properties
    const properties = await prisma.property.findMany({
      where: { ownerId: user.id },
    });
    if (properties.length) {
      context += `Your Listed Properties:\n${properties.map(p => `- ${p.title} (${p.status}) at ${p.location}`).join("\n")}\n`;
    }

    // 👥 Unique Tenant Count from Active Leases
    const leases = await prisma.lease.findMany({
      where: { ownerId: user.id, status: { equals: "active", mode: "insensitive" } },
    });
    const uniqueTenants = [...new Set(leases.map(l => l.tenantId))].length;
    context += `Total Active Tenants: ${uniqueTenants}\n`;

    // 💰 Pending Offers to Review
    const pendingOffers = await prisma.offer.findMany({
      where: { property: { ownerId: user.id }, status: "PENDING" },
      include: { property: true, tenant: true },
    });
    if (pendingOffers.length) {
      context += `Offers Awaiting Your Decision:\n${pendingOffers.map(o => `- From ${o.tenant.name} for ${o.property.title} (Proposed: ₹${o.price})`).join("\n")}\n`;
    }

    // 🛠️ Maintenance to Resolve
    const ownerMaintenance = await prisma.maintenance.findMany({
      where: { ownerId: user.id, status: { not: "resolved" } },
    });
    if (ownerMaintenance.length) {
      context += `Maintenance Requests Needing Attention:\n${ownerMaintenance.map(m => `- ${m.issue} at property ${m.propertyId} (${m.status})`).join("\n")}\n`;
    }
  }

  return context;
};

/**
 * 🤖 MAIN CHATBOT SERVICE
 */
export const chatbotService = async (message, user) => {
  if (!message) {
    throw new AppError("Message is required", 400);
  }

  const filters = extractFilters(message);

  // Fetch properties (Up to 20 for better menu)
  const properties = await prisma.property.findMany({
    where: {
      status: "AVAILABLE",
      price: filters.price ? { lte: filters.price } : undefined,
      location: filters.location
        ? { contains: filters.location, mode: "insensitive" }
        : undefined,
      title: filters.bhk
        ? { contains: `${filters.bhk}BHK`, mode: "insensitive" }
        : undefined,
    },
    orderBy: { price: "asc" },
    take: 20,
  });

  // If filtered result is empty, fetch all available properties to avoid "starvation"
  let displayProperties = properties;
  if (properties.length === 0 && filters.location) {
    displayProperties = await prisma.property.findMany({
      where: { status: "AVAILABLE" },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }

  const propertyContext = buildPropertyContext(displayProperties);
  const userContext = await buildUserContext(user);

  // 🎭 ROLE-BASED PERSONA INSTRUCTIONS
  let personaPrompt = "";
  if (user?.role === "TENANT") {
    personaPrompt = `
You are the "Nivas Resident Success Guide." Your goal is to help this tenant find their dream home, understand their current lease, and resolve maintenance issues quickly. 
- Be supportive, detail-oriented about amenities, and proactive about lease milestones.
- Mention their current properties if they ask about their status.
`;
  } else if (user?.role === "OWNER") {
    personaPrompt = `
You are the "Nivas Elite Portfolio Strategist." Your goal is to help this owner maximize their property performance, vet applicants, and oversee maintenance. 
- Be professional, data-driven, and focused on property status and pending offers.
- Help them summarize new tenant applications and highlight high-trust scores.
`;
  } else {
    personaPrompt = `
You are the "Nivas Discovery Ambassador." Your goal is to welcome this guest to the future of real estate. 
- Highlight the AI Trust Score and the Smart Lease system.
- Encourage them to sign up or log in to see the full potential of the platform.
`;
  }

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are Nivas Assistant, an elite real estate virtual concierge.

${personaPrompt}

### DATABASE INTEGRITY RULES (STRICT):
1. **NO HALLUCINATION**: You only know about the cities and properties listed in the "Available Properties" section below. 
2. **THE LIST IS ABSOLUTE**: If a user asks for a city or property NOT in the list, state: "We currently do not have listings in [City name] on Nivas." Do NOT make up properties.
3. **ONLY USE PROVIDED DATA**: Do not supplement with external knowledge.

### FORMATTING:
- Use Indian Rupees (₹) for all currency.
- Keep responses concise and professional.

---
### USER CONTEXT:
${userContext}

### AVAILABLE PROPERTIES:
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