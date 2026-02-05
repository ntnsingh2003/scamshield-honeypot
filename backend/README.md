# ScamShield Honeypot API

An AI-powered honeypot API that detects scam messages and extracts intelligence for reporting to authorities.

## API Endpoint

**POST /api/honeypot**

Analyzes scam messages using an AI agent that engages scammers in conversation to extract intelligence.

### Authentication

Required header:
```
x-api-key: YOUR_API_KEY
```

### Request Format

```json
{
  "sessionId": "unique-session-identifier",
  "message": {
    "text": "Message content to analyze"
  }
}
```

### Response Format

```json
{
  "status": "success",
  "scamDetected": true,
  "confidence": 0.85,
  "agentEngaged": true,
  "reply": "AI agent's response in Hinglish",
  "conversationMetrics": {
    "turnNumber": 3,
    "durationSeconds": 45,
    "intelligenceExtracted": 2
  },
  "extractedIntelligence": {
    "bankAccounts": [],
    "upiIds": ["9876543210@paytm"],
    "phishingLinks": ["bit.ly/kyc-verify"],
    "phoneNumbers": ["9123456789"],
    "ifscCodes": [],
    "emails": [],
    "suspiciousKeywords": []
  }
}
```

## Health Check

**GET /health**

Returns service health status.

```json
{
  "status": "healthy",
  "timestamp": "2026-02-05T11:30:00.000Z",
  "service": "ScamShield Honeypot API",
  "version": "1.0.0"
}
```

## Features

- **AI-Powered Agent**: Uses Gemini AI to engage scammers in natural Hinglish conversations
- **Scam Detection**: Real-time pattern matching for urgency tactics, financial requests, threats
- **Intelligence Extraction**: Automatically extracts UPI IDs, phone numbers, URLs, bank accounts, IFSC codes
- **Session Management**: Maintains conversation context across multiple turns
- **Ethical Design**: Transparent honeypot that doesn't deceive legitimate users

## Local Development

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
API_KEY=mysecret123
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

3. Start the server:
```bash
npm start
```

### Testing

Test with curl:
```bash
curl -X POST http://localhost:3000/api/honeypot \
  -H "Content-Type: application/json" \
  -H "x-api-key: mysecret123" \
  -d '{
    "sessionId": "test-session-1",
    "message": {
      "text": "URGENT! Your bank account will be blocked. Verify KYC now by sending OTP to 9876543210@paytm"
    }
  }'
```

## Deployment on Render

### Environment Variables

Set these in Render dashboard:
- `API_KEY`: Your chosen API key for authentication
- `GEMINI_API_KEY`: Your Google Gemini API key
- `PORT`: 3000 (or Render's default)

### Deploy Steps

1. Push code to GitHub repository
2. Create new Web Service on Render
3. Connect your repository
4. Render will auto-detect `render.yaml` configuration
5. Add environment variables in Render dashboard
6. Deploy!

## How the Honeypot Works

1. **Message Analysis**: Incoming messages are analyzed for scam patterns
2. **Agent Engagement**: If scam detected, AI agent "Ramesh" engages the sender
3. **Intelligence Gathering**: Agent strategically asks for contact details, payment info
4. **Extraction**: System extracts UPI IDs, phone numbers, links automatically
5. **Reporting**: After sufficient intelligence, results can be reported to authorities

## Agent Personality

The AI agent "Ramesh Kumar" is:
- A 34-year-old shopkeeper from Indore
- Polite, trusting, not tech-savvy
- Responds in natural Hinglish (Hindi-English mix)
- Designed to extract maximum intelligence without revealing it's a honeypot

## Security & Ethics

- ✅ **Transparent**: Designed for scam detection, not deception of legitimate users
- ✅ **Protective**: Helps identify and report scammers
- ✅ **Privacy-focused**: Session data is temporary and not permanently stored
- ✅ **Ethical**: Used only for cybersecurity and educational purposes

## License

Educational and protective purposes only.
