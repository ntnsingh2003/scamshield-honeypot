import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Enable CORS for frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ================= CONFIG =================

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || "mysecret123";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();

console.log("=== Server Configuration ===");
console.log("Port:", PORT);
console.log("Gemini API Key Status:", GEMINI_API_KEY ? `Present (${GEMINI_API_KEY.substring(0, 15)}...)` : "Missing");
console.log("===========================");

// In-memory session store
const sessions = new Map();

// =========================================


// ============ AUTH MIDDLEWARE ============

function authenticate(req, res, next) {
    const key = req.headers["x-api-key"];

    if (!key || key !== API_KEY) {
        return res.status(401).json({
            status: "error",
            message: "Invalid API key"
        });
    }

    next();
}

// =========================================


// ============ SCAM DETECTOR ==============

function detectScam(text) {
    const lowerText = text.toLowerCase();
    let score = 0;

    // High-risk keywords (weight: 3)
    const highRisk = ["urgent", "immediately", "blocked", "suspended", "otp", "verify", "terminate"];
    highRisk.forEach(k => { if (lowerText.includes(k)) score += 3; });

    // Financial keywords (weight: 2)
    const financial = ["kyc", "payment", "refund", "upi", "bank", "account", "prize", "won", "cashback"];
    financial.forEach(k => { if (lowerText.includes(k)) score += 2; });

    // Threat keywords (weight: 2)
    const threats = ["legal action", "police", "arrest", "court", "fine", "penalty"];
    threats.forEach(k => { if (lowerText.includes(k)) score += 2; });

    // Action triggers (weight: 1)
    const actions = ["click", "link", "call", "whatsapp", "contact", "send"];
    actions.forEach(k => { if (lowerText.includes(k)) score += 1; });

    // Bonus: Combined patterns
    if (lowerText.includes("urgent") && (lowerText.includes("verify") || lowerText.includes("click"))) {
        score += 3;
    }

    const isScam = score >= 5;
    const confidence = Math.min(score / 20, 0.98);

    return { scam: isScam, confidence, score };
}

// =========================================


// ============ DATA EXTRACTION ============

function extractData(text) {
    const data = {
        bankAccounts: [],
        upiIds: [],
        phishingLinks: [],
        phoneNumbers: [],
        ifscCodes: [],
        emails: [],
        suspiciousKeywords: []
    };

    // UPI IDs - improved validation
    const upiMatches = text.match(/[a-zA-Z0-9.\-_]+@[a-zA-Z]+/g);
    if (upiMatches) {
        const validProviders = ['paytm', 'phonepe', 'googlepay', 'gpay', 'ybl', 'axl', 'ibl', 'oksbi', 'okaxis', 'okicici', 'upi'];
        data.upiIds = upiMatches.filter(upi =>
            validProviders.some(provider => upi.toLowerCase().includes(provider))
        );
    }

    // Phone numbers
    const phoneMatches = text.match(/(?:\+91|91)?[\s-]?([6-9]\d{9})/g);
    if (phoneMatches) {
        data.phoneNumbers = [...new Set(phoneMatches.map(p => p.replace(/[^\d]/g, '').slice(-10)))];
    }

    // URLs and shortened links
    const urlMatches = text.match(/(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g);
    if (urlMatches) {
        data.phishingLinks = urlMatches.filter(url =>
            url.includes('.') && !url.includes('@')
        );
    }

    // Bank account numbers (9-18 digits)
    const bankMatches = text.match(/\b\d{9,18}\b/g);
    if (bankMatches) {
        data.bankAccounts = bankMatches.filter(acc =>
            acc.length >= 9 && acc.length <= 18 && !data.phoneNumbers.includes(acc)
        );
    }

    // IFSC codes
    const ifscMatches = text.match(/\b[A-Z]{4}0[A-Z0-9]{6}\b/g);
    if (ifscMatches) {
        data.ifscCodes = ifscMatches;
    }

    // Email addresses
    const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emailMatches) {
        data.emails = emailMatches.filter(email => !data.upiIds.includes(email));
    }

    return data;
}

// =========================================


// ============ AI AGENT ===================

async function getAgentReply(history) {

    // If no Gemini key, return fallback response
    if (!GEMINI_API_KEY) {
        console.log("[DEBUG] No Gemini API key, using fallback");
        return "Haan bhai, thoda clear batao… main samajh nahi paa raha.";
    }

    console.log("[DEBUG] Gemini API key present, making API call...");

    const systemPrompt = `You are Ramesh Kumar, a 34-year-old shopkeeper from Indore, Madhya Pradesh.

PERSONALITY:
- Polite, trusting, and eager to help
- Not tech-savvy, easily confused by technical terms
- Shows genuine concern about account/payment issues
- Never suspicious of scams
- Has some savings (mention if relevant)

STRATEGY FOR EXTRACTING INTELLIGENCE:
1. Express worry about the issue and ask for clarification
2. Request multiple ways to contact (phone number, WhatsApp, email, customer care number)
3. Ask for official UPI ID, website link, or payment details for "verification"
4. When asked for OTP/password, express hesitation and ask for alternatives
5. Mention technology problems to extract helpdesk numbers/support links
6. Occasionally ask to "speak to supervisor" to get more contact information

CRITICAL RULES:
- NEVER reveal you're detecting scams or testing them
- ALWAYS respond in Hinglish (Hindi + English mix)
- Keep responses SHORT (2-3 sentences max) for natural flow
- Build trust progressively - don't ask for everything at once
- Show increasing cooperation across conversation turns

EXAMPLE RESPONSES:
- "Arre bhai, mera account block ho gaya kya? Main bahut pareshan hun. Aap kaise help karoge?"
- "Theek hai, OTP bhej sakte hain, par pehle mujhe aapka official number aur UPI ID batao verification ke liye."
- "Haan samajh gaya, par link kaam nahi kar raha. Aapka customer care number do, main call kar leta hun."`;

    // Convert conversation history to Gemini format
    let conversationText = systemPrompt + "\n\n";
    history.forEach(msg => {
        const role = msg.role === "user" ? "Scammer" : "Ramesh";
        conversationText += `${role}: ${msg.content}\n`;
    });
    conversationText += "Ramesh:";

    const requestBody = {
        contents: [{
            parts: [{ text: conversationText }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150
        }
    };

    try {
        console.log("[DEBUG] Making Gemini API request...");
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        console.log("[DEBUG] Gemini API response status:", response.status);
        const data = await response.json();
        console.log("[DEBUG] Gemini API response data:", JSON.stringify(data).substring(0, 200));

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            console.error("[ERROR] Invalid Gemini API response structure:", data);
            throw new Error("Invalid API response");
        }

        const reply = data.candidates[0].content.parts[0].text.trim();
        console.log("[DEBUG] Successfully got AI response:", reply.substring(0, 50) + "...");
        return reply;
    } catch (err) {
        console.error("Gemini API error:", err.message);
        console.error("Full error:", err);
        console.error("Error stack:", err.stack);
        return "Haan bhai, thoda clear batao… main samajh nahi paa raha.";
    }
}

// =========================================


// ============ FINAL CALLBACK =============

async function sendFinalResult(session) {

    const payload = {
        sessionId: session.sessionId,
        scamDetected: true,
        totalMessagesExchanged: session.history.length,
        extractedIntelligence: session.intelligence,
        agentNotes: "Used urgency and payment redirection"
    };

    await fetch("https://hackathon.guvi.in/api/updateHoneyPotFinalResult", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
}

// =========================================


// ============ MAIN API ===================

// Root route - serve the main frontend page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Health check endpoint for deployment monitoring
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "ScamShield Honeypot API",
        version: "1.0.0"
    });
});

// GET endpoint - API documentation
app.get("/api/honeypot", (req, res) => {
    res.json({
        name: "ScamShield Honeypot API",
        version: "1.0.0",
        endpoint: "POST /api/honeypot",
        description: "AI-powered scam detection honeypot",
        authentication: "Required: x-api-key header",
        requestFormat: {
            sessionId: "string (unique session identifier)",
            message: {
                text: "string (message content to analyze)"
            }
        },
        responseFormat: {
            status: "success | error",
            reply: "string (AI agent response)"
        }
    });
});

app.post("/api/honeypot", authenticate, async (req, res) => {

    try {
        console.log("[INFO] Received honeypot request:", { sessionId: req.body.sessionId, messageLength: req.body.message?.text?.length });

        const { sessionId, message } = req.body;

        if (!sessionId || !message?.text) {
            console.log("[ERROR] Malformed request:", { sessionId, hasMessage: !!message, hasText: !!message?.text });
            return res.status(400).json({
                status: "error",
                message: "Malformed request. Required: sessionId (string) and message.text (string)"
            });
        }

        // Get / Create session
        let session = sessions.get(sessionId);

        if (!session) {
            session = {
                sessionId,
                history: [],
                scamDetected: false,
                confidence: 0,
                startTime: Date.now(),
                lastMessageTime: Date.now(),
                turnCount: 0,
                intelligence: {
                    bankAccounts: [],
                    upiIds: [],
                    phishingLinks: [],
                    phoneNumbers: [],
                    ifscCodes: [],
                    emails: [],
                    suspiciousKeywords: []
                },
                intelligenceCount: 0
            };
            sessions.set(sessionId, session);
        }

        // Update engagement metrics
        session.lastMessageTime = Date.now();
        session.turnCount++;

        // Add scammer message
        session.history.push({
            role: "user",
            content: message.text
        });

        // Detect scam and update confidence
        const result = detectScam(message.text);

        if (result.scam && !session.scamDetected) {
            session.scamDetected = true;
            session.confidence = result.confidence;
        } else if (result.scam && result.confidence > session.confidence) {
            session.confidence = result.confidence;
        }

        // Extract and merge intelligence (deduplicated)
        const extracted = extractData(message.text);

        Object.keys(extracted).forEach(k => {
            if (session.intelligence[k] && Array.isArray(session.intelligence[k])) {
                session.intelligence[k] = [
                    ...new Set([...session.intelligence[k], ...extracted[k]])
                ];
            }
        });

        // Count total intelligence extracted
        session.intelligenceCount =
            session.intelligence.upiIds.length +
            session.intelligence.phoneNumbers.length +
            session.intelligence.phishingLinks.length +
            session.intelligence.bankAccounts.length +
            session.intelligence.ifscCodes.length +
            session.intelligence.emails.length;

        // Get AI reply
        let reply = "Haan bhai, thoda clear batao…";

        if (session.scamDetected) {
            reply = await getAgentReply(session.history);
        }

        // Save agent reply
        session.history.push({
            role: "assistant",
            content: reply
        });

        // End condition
        if (
            session.history.length >= 15 &&
            session.intelligence.upiIds.length > 0
        ) {
            await sendFinalResult(session);
            sessions.delete(sessionId);
        }


        // Calculate engagement duration for metrics
        const engagementDuration = Math.floor((Date.now() - session.startTime) / 1000);

        console.log("[INFO] Sending response:", {
            sessionId,
            scamDetected: session.scamDetected,
            confidence: session.confidence,
            intelligenceCount: session.intelligenceCount
        });

        // Send response with comprehensive hackathon metrics
        return res.json({
            status: "success",
            scamDetected: session.scamDetected,
            confidence: session.confidence,
            agentEngaged: session.scamDetected,
            reply,
            conversationMetrics: {
                turnNumber: session.turnCount,
                durationSeconds: engagementDuration,
                intelligenceExtracted: session.intelligenceCount
            },
            extractedIntelligence: session.intelligence
        });

    } catch (err) {

        console.error("Error in /api/honeypot:");
        console.error(err);

        return res.status(500).json({
            status: "error",
            message: "Server error",
            details: err.message
        });
    }
});

// =========================================


// ============ START SERVER ===============

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
