# ScamShield - Intelligent Scam Detection System

A transparent, ethical tool for detecting scam messages and extracting intelligence for reporting to authorities.

## 🎯 Features

- **Real-time Scam Detection** - Analyzes messages instantly for scam indicators
- **Pattern Recognition** - Detects urgency tactics, financial requests, authority impersonation, and more
- **Intelligence Extraction** - Automatically extracts UPI IDs, phone numbers, URLs, bank details, and IFSC codes
- **Confidence Scoring** - Provides a percentage-based risk assessment
- **Educational Insights** - Explains why content is flagged as suspicious
- **Hinglish Support** - Works with both English and Hindi text
- **Beautiful UI** - Modern glassmorphic design with smooth animations

## 🚀 Getting Started

### Prerequisites

- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No installation required - runs entirely in the browser

### Usage

1. Open `index.html` in your web browser
2. Paste any suspicious message into the text area
3. Click "Analyze Message"
4. Review the detailed analysis including:
   - Threat level (High/Medium/Low Risk)
   - Confidence score
   - Detected scam patterns
   - Extracted intelligence data
   - Educational insights on why it's suspicious

### Example Scam Messages to Test

**Lottery/Prize Scam:**
```
Congratulations! You have won Rs 50,000 in lucky draw. Send processing fee Rs 500 to 9876543210@paytm within 24 hours to claim prize.
```

**Banking Scam:**
```
Your account will be blocked. Urgent KYC update required. Click here to verify: bit.ly/kyc123. Enter OTP to continue.
```

**Authority Impersonation:**
```
This is income tax department. You have pending tax payment of Rs 25,000. Pay immediately or legal action will be taken. Call 9123456789.
```

## 🔍 How It Works

### Detection Patterns

The system identifies these scam indicators:

- **Urgency Tactics** - "urgent", "immediately", "expires", "last chance"
- **Financial Requests** - OTP, KYC, payment, refund requests
- **Authority Impersonation** - Claims from police, government, banks
- **Reward Scams** - Prizes, lotteries, free offers
- **Threats** - Account blocking, legal action, penalties
- **Phishing** - Suspicious links, verification requests
- **Tech Support Scams** - Virus alerts, remote access requests

### Intelligence Extraction

Automatically detects and extracts:

- **UPI IDs** - Format: `username@provider`
- **Phone Numbers** - Indian mobile numbers (10 digits)
- **URLs** - Web links including shortened URLs
- **Bank Account Numbers** - 9-18 digit account numbers
- **IFSC Codes** - 11-character bank codes

### Confidence Scoring

- **High Risk (60%+)** - Multiple strong scam indicators detected
- **Medium Risk (30-59%)** - Some suspicious patterns present
- **Low Risk (<30%)** - Few or minor indicators detected

## 📊 Technical Details

### Files Structure

```
├── index.html      # Main application page
├── style.css       # Styling and animations
├── app.js          # Detection engine and logic
└── README.md       # This file
```

### Technology Stack

- **HTML5** - Semantic structure
- **CSS3** - Modern styling with glassmorphism and gradients
- **Vanilla JavaScript** - No dependencies required
- **Regex-based Detection** - Pattern matching and extraction

## 🛡️ Privacy & Ethics

This tool is designed for **educational and protective purposes only**:

- ✅ **Transparent** - Users know they're using a detection tool
- ✅ **Privacy-focused** - All analysis happens locally in your browser
- ✅ **No data collection** - Nothing is stored or transmitted
- ✅ **Educational** - Teaches users to recognize scams
- ❌ **Not for deception** - Never impersonates or engages scammers

## 🎨 UI Features

- **Glassmorphic Design** - Modern translucent cards with blur effects
- **Gradient Backgrounds** - Vibrant color schemes
- **Smooth Animations** - Fade-ins, slides, and transitions
- **Responsive Layout** - Works on mobile and desktop
- **Dark Theme** - Optimized for readability

## 📝 Reporting Scams

If you identify a scam using this tool:

1. **National Cyber Crime Portal**: https://cybercrime.gov.in
2. **Report to your bank** - Use official contact numbers
3. **Local police** - File a complaint at your nearest station
4. **Save evidence** - Screenshots, phone numbers, UPI IDs

## ⚠️ Disclaimer

- This tool provides automated analysis but is not 100% accurate
- Always use your judgment and verify through official channels
- False positives and false negatives can occur
- For official verification, contact organizations directly using known contact information

## 🔧 Customization

You can extend the detection patterns in `app.js`:

```javascript
// Add new patterns to the patterns object
yourNewPattern: {
    keywords: ['keyword1', 'keyword2'],
    severity: 'high',
    description: 'Description of the pattern'
}
```

## 📄 License

This project is for educational purposes. Feel free to use and modify for legitimate scam prevention efforts.

## 🤝 Contributing

To improve detection:
- Add new scam patterns you encounter
- Improve regex patterns for better extraction
- Enhance educational insights
- Report false positives/negatives

---

**Remember**: Stay vigilant online. Never share OTP, passwords, or financial information based on unsolicited messages. When in doubt, verify through official channels.
