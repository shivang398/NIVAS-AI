const PORT = 5000;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

const testApis = async () => {
    console.log("🚀 Starting API Health Check...");
    let token = "";
    
    // 1. Check Auth (Register)
    const email = `testbot_${Date.now()}@test.com`;
    try {
        console.log(`\nTesting POST /auth/register... (Creating user ${email})`);
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Test Bot",
                email: email,
                password: "password123",
                role: "TENANT"
            })
        });
        const regData = await regRes.json();
        if (regData.success && regData.data.token) {
            token = regData.data.token;
            console.log("✅ Registration working! Token received.");
        } else {
            console.error("❌ Registration failed: No token", regData);
        }
    } catch (e) {
        console.error("❌ Registration failed:", e.message);
    }

    // 2. Check Auth (Login)
    try {
        console.log(`\nTesting POST /auth/login...`);
        const logRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: "password123"
            })
        });
        const logData = await logRes.json();
        if (logData.success) {
            console.log("✅ Login working!");
        } else {
            console.error("❌ Login failed.");
        }
    } catch (e) {
        console.error("❌ Login failed:", e.message);
    }

    const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // 3. Check Properties GET
    try {
        console.log(`\nTesting GET /properties...`);
        const propRes = await fetch(`${BASE_URL}/properties`, { headers });
        if (propRes.ok) {
            const propData = await propRes.json();
            console.log(`✅ Properties working! Fetched ${propData.data?.length || 0} items.`);
        } else {
            console.error("❌ Properties fetch failed with status:", propRes.status);
        }
    } catch (e) {
        console.error("❌ Properties fetch failed:", e.message);
    }

    // 4. Check Verification GET
    try {
        console.log(`\nTesting GET /verification...`);
        const verRes = await fetch(`${BASE_URL}/verification`, { headers });
        if (verRes.ok) {
            console.log("✅ Verification module working!");
        } else {
            console.error("❌ Verification fetch failed with status:", verRes.status);
        }
    } catch (e) {
        console.error("❌ Verification fetch failed:", e.message);
    }

    // 5. Check AI Endpoint
    try {
        console.log(`\nTesting POST /ai/chat...`);
        const aiRes = await fetch(`${BASE_URL}/ai/chat`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ message: "Hello, I am looking for a 2BHK." })
        });
        if (aiRes.ok) {
            const aiData = await aiRes.json();
            console.log("✅ AI Chatbot module working! Response:", aiData.data.slice(0, 50) + "...");
        } else {
            console.error("❌ AI Chatbot failed with status:", aiRes.status);
        }
    } catch (e) {
        console.error("❌ AI Chatbot failed failed:", e.message);
    }

    console.log("\n🛑 API Check Complete.");
};

testApis();
