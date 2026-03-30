import { chatbotService } from './src/services/ai.service.js';
import prisma from './src/config/prisma.js';

async function testAI() {
  console.log("--- AI TEST: HALLUCINATION CHECK ---");
  try {
    const res = await chatbotService("Show me houses in Pune", null);
    console.log("User: Show me houses in Pune");
    console.log("AI:", res);
  } catch (err) {
    console.error(err);
  }

  console.log("\n--- AI TEST: TENANT CONTEXT ---");
  try {
    const tenant = await prisma.user.findFirst({ where: { role: 'TENANT' } });
    if (tenant) {
      const res = await chatbotService("What is my status?", tenant);
      console.log(`User (${tenant.name}): What is my status?`);
      console.log("AI:", res);
    }
  } catch (err) {
    console.error(err);
  }

  console.log("\n--- AI TEST: OWNER CONTEXT ---");
  try {
    const owner = await prisma.user.findFirst({ where: { role: 'OWNER' } });
    if (owner) {
      const res = await chatbotService("What is the status of my listings?", owner);
      console.log(`User (${owner.name}): What is the status of my listings?`);
      console.log("AI:", res);
    }
  } catch (err) {
    console.error(err);
  }

  process.exit(0);
}

testAI();
