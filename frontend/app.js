// ScamShield - Intelligent Scam Detection System
// Core Detection Engine

class ScamDetector {
    constructor() {
        this.patterns = this.initializePatterns();
        this.extractors = this.initializeExtractors();
    }

    // Initialize detection patterns
    initializePatterns() {
        return {
            urgency: {
                keywords: [
                    'urgent', 'immediately', 'expire', 'expires', 'expired', 'limited time',
                    'act now', 'hurry', 'last chance', 'within 24 hours', 'today only',
                    'turant', 'jaldi', 'aaj hi', 'abhi', 'समय सीमित', 'जल्दी'
                ],
                severity: 'high',
                description: 'Uses urgency tactics to pressure victims into quick decisions'
            },
            financial: {
                keywords: [
                    'otp', 'kyc', 'payment', 'refund', 'cashback', 'prize', 'won', 'reward',
                    'transfer', 'bank account', 'credit card', 'debit card', 'cvv', 'pin',
                    'पेमेंट', 'रिफंड', 'इनाम', 'जीता', 'ओटीपी', 'खाता'
                ],
                severity: 'high',
                description: 'Requests sensitive financial information or payments'
            },
            authority: {
                keywords: [
                    'police', 'government', 'tax department', 'income tax', 'cyber cell',
                    'rbi', 'reserve bank', 'ministry', 'court', 'legal action',
                    'पुलिस', 'सरकार', 'कर विभाग', 'आरबीआई'
                ],
                severity: 'medium',
                description: 'Impersonates government or authority figures to gain trust'
            },
            reward: {
                keywords: [
                    'congratulations', 'winner', 'lottery', 'lucky draw', 'free', 'offer',
                    'claim', 'gift', 'bonus', 'discount', '50% off', 'cashprize',
                    'बधाई', 'जीते', 'लॉटरी', 'मुफ्त', 'ऑफर'
                ],
                severity: 'high',
                description: 'Promises unrealistic rewards or prizes to lure victims'
            },
            threat: {
                keywords: [
                    'blocked', 'suspended', 'deactivated', 'locked', 'terminated',
                    'arrest', 'penalty', 'fine', 'legal action', 'court case',
                    'ब्लॉक', 'बंद', 'जुर्माना', 'गिरफ्तार'
                ],
                severity: 'high',
                description: 'Uses threats or fear tactics to manipulate victims'
            },
            verification: {
                keywords: [
                    'verify', 'confirm', 'update', 'validate', 'authenticate',
                    'click here', 'link', 'login', 'password', 'username',
                    'सत्यापित', 'कन्फर्म', 'अपडेट', 'लिंक'
                ],
                severity: 'medium',
                description: 'Requests verification or clicking suspicious links (phishing)'
            },
            techSupport: {
                keywords: [
                    'virus', 'malware', 'hacked', 'security alert', 'microsoft',
                    'windows', 'antivirus', 'computer problem', 'remote access',
                    'वायरस', 'हैक', 'सुरक्षा', 'कंप्यूटर'
                ],
                severity: 'medium',
                description: 'Tech support scam attempting to gain system access'
            },
            contact: {
                keywords: [
                    'call', 'whatsapp', 'contact', 'message', 'reply',
                    'कॉल करें', 'संपर्क', 'मैसेज', 'व्हाट्सएप'
                ],
                severity: 'low',
                description: 'Requests immediate contact through unofficial channels'
            }
        };
    }

    // Initialize data extractors
    initializeExtractors() {
        return {
            upi: {
                regex: /\b([a-zA-Z0-9.\-_]+@[a-zA-Z]+)\b/g,
                label: 'UPI IDs',
                validator: (match) => {
                    const validProviders = ['paytm', 'phonepe', 'googlepay', 'gpay', 'ybl',
                        'axl', 'ibl', 'oksbi', 'okaxis', 'okicici', 'upi'];
                    return validProviders.some(provider => match.toLowerCase().includes(provider));
                }
            },
            phone: {
                regex: /(?:\+91|91)?[\s-]?([6-9]\d{9})\b/g,
                label: 'Phone Numbers',
                validator: (match) => match.length === 10 || match.length === 12
            },
            url: {
                regex: /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g,
                label: 'URLs',
                validator: (match) => {
                    const suspiciousPatterns = ['bit.ly', 'tinyurl', 'short', 'link'];
                    return match.includes('.') && !match.includes('@');
                }
            },
            bankAccount: {
                regex: /\b(\d{9,18})\b/g,
                label: 'Bank Account Numbers',
                validator: (match) => match.length >= 9 && match.length <= 18
            },
            ifsc: {
                regex: /\b([A-Z]{4}0[A-Z0-9]{6})\b/g,
                label: 'IFSC Codes',
                validator: (match) => match.length === 11
            }
        };
    }

    // Main analysis function
    analyze(message) {
        if (!message || message.trim().length === 0) {
            return null;
        }

        const messageLower = message.toLowerCase();
        const detectedPatterns = [];
        const extractedData = {};
        let totalScore = 0;
        const maxScore = Object.keys(this.patterns).length * 10;

        // Detect patterns
        for (const [patternName, patternData] of Object.entries(this.patterns)) {
            const matches = patternData.keywords.filter(keyword =>
                messageLower.includes(keyword.toLowerCase())
            );

            if (matches.length > 0) {
                const severityScore = {
                    'high': 10,
                    'medium': 6,
                    'low': 3
                }[patternData.severity];

                totalScore += severityScore;

                detectedPatterns.push({
                    name: this.formatPatternName(patternName),
                    severity: patternData.severity,
                    description: patternData.description,
                    matches: matches
                });
            }
        }

        // Extract intelligence
        for (const [dataType, extractor] of Object.entries(this.extractors)) {
            const matches = [...new Set([...message.matchAll(extractor.regex)].map(m => m[0] || m[1]))];
            const validMatches = matches.filter(match => extractor.validator(match));

            if (validMatches.length > 0) {
                extractedData[dataType] = validMatches;
                // Having extractable data increases scam likelihood
                totalScore += validMatches.length * 2;
            }
        }

        // Calculate confidence score
        const confidence = Math.min((totalScore / maxScore) * 100, 100);

        // Determine threat level
        let threatLevel;
        if (confidence >= 60) {
            threatLevel = 'high';
        } else if (confidence >= 30) {
            threatLevel = 'medium';
        } else {
            threatLevel = 'low';
        }

        // Generate educational insights
        const insights = this.generateInsights(detectedPatterns, extractedData, confidence);

        return {
            scamDetected: confidence >= 30,
            confidence: Math.round(confidence),
            threatLevel,
            detectedPatterns,
            extractedData,
            insights
        };
    }

    // Generate educational insights
    generateInsights(patterns, extractedData, confidence) {
        const insights = [];

        if (confidence >= 60) {
            insights.push('🚨 HIGH RISK: This message exhibits multiple strong indicators of a scam. Do not respond or share any information.');
        } else if (confidence >= 30) {
            insights.push('⚠️ MODERATE RISK: This message contains suspicious elements. Exercise extreme caution and verify through official channels.');
        } else {
            insights.push('✓ LOW RISK: While some suspicious patterns were detected, this may be legitimate. Always verify sender identity.');
        }

        if (patterns.some(p => p.severity === 'high')) {
            insights.push('❌ Never share OTP, passwords, bank details, or make payments based on unsolicited messages.');
        }

        if (extractedData.upi && extractedData.upi.length > 0) {
            insights.push('💰 UPI IDs detected: Legitimate organizations never ask for payments via personal UPI IDs in unsolicited messages.');
        }

        if (extractedData.url && extractedData.url.length > 0) {
            insights.push('🔗 Links detected: Never click links in suspicious messages. They may lead to phishing sites or download malware.');
        }

        if (extractedData.phone && extractedData.phone.length > 0) {
            insights.push('📱 Phone numbers detected: Scammers often provide numbers to establish direct contact. Verify through official channels first.');
        }

        if (patterns.find(p => p.name.includes('Urgency'))) {
            insights.push('⏰ Urgency tactics: Scammers create false urgency to prevent you from thinking clearly. Legitimate services give you time.');
        }

        if (patterns.find(p => p.name.includes('Authority'))) {
            insights.push('🏛️ Authority impersonation: Government agencies and banks never contact you via unofficial channels demanding immediate action.');
        }

        insights.push('✅ Always verify: Contact organizations directly using official numbers from their website, not numbers provided in messages.');

        return insights;
    }

    // Format pattern name for display
    formatPatternName(name) {
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }
}

// UI Controller
class UIController {
    constructor() {
        this.detector = new ScamDetector();
        this.historyManager = new HistoryManager();
        this.exportManager = new ExportManager();
        this.currentResults = null;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.messageInput = document.getElementById('messageInput');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.threatBadge = document.getElementById('threatBadge');
        this.confidenceBar = document.getElementById('confidenceBar');
        this.confidenceScore = document.getElementById('confidenceScore');
        this.patternsList = document.getElementById('patternsList');
        this.intelligenceData = document.getElementById('intelligenceData');
        this.insightsList = document.getElementById('insightsList');
    }

    attachEventListeners() {
        this.analyzeBtn.addEventListener('click', () => this.analyzeMessage());
        this.clearBtn.addEventListener('click', () => this.clearResults());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.analyzeMessage();
            }
        });
    }

    analyzeMessage() {
        const message = this.messageInput.value.trim();

        if (!message) {
            alert('Please enter a message to analyze');
            return;
        }

        const results = this.detector.analyze(message);

        if (!results) {
            return;
        }

        // Save to history
        this.historyManager.addAnalysis(message, results);

        // Store current results for export
        this.currentResults = {
            message,
            timestamp: new Date().toISOString(),
            ...results
        };

        this.displayResults(results);
    }

    displayResults(results) {
        // Show results section
        this.resultsSection.classList.remove('hidden');

        // Scroll to results
        setTimeout(() => {
            this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);

        // Display threat level
        this.displayThreatLevel(results.threatLevel, results.confidence);

        // Display detected patterns
        this.displayPatterns(results.detectedPatterns);

        // Display extracted intelligence
        this.displayIntelligence(results.extractedData);

        // Display insights
        this.displayInsights(results.insights);

        // Show export buttons
        this.showExportOptions();
    }

    displayThreatLevel(level, confidence) {
        const levelText = {
            'high': 'High Risk',
            'medium': 'Medium Risk',
            'low': 'Low Risk'
        };

        this.threatBadge.textContent = levelText[level];
        this.threatBadge.className = `threat-badge ${level}`;

        this.confidenceBar.style.width = `${confidence}%`;
        this.confidenceScore.textContent = `${confidence}%`;

        // Update color based on level
        if (level === 'high') {
            this.confidenceBar.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        } else if (level === 'medium') {
            this.confidenceBar.style.background = 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)';
        } else {
            this.confidenceBar.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        }
    }

    displayPatterns(patterns) {
        if (patterns.length === 0) {
            this.patternsList.innerHTML = '<div class="empty-state">No suspicious patterns detected</div>';
            return;
        }

        this.patternsList.innerHTML = patterns.map(pattern => `
            <div class="pattern-item ${pattern.severity}" style="animation-delay: ${Math.random() * 0.3}s">
                <svg class="pattern-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="pattern-content">
                    <div class="pattern-title">${pattern.name}</div>
                    <div class="pattern-description">${pattern.description}</div>
                </div>
            </div>
        `).join('');
    }

    displayIntelligence(data) {
        const hasData = Object.values(data).some(arr => arr && arr.length > 0);

        if (!hasData) {
            this.intelligenceData.innerHTML = '<div class="empty-state">No extractable intelligence found</div>';
            return;
        }

        const intelligence = [];

        if (data.upi && data.upi.length > 0) {
            intelligence.push({
                label: 'UPI IDs',
                values: data.upi,
                icon: '💳'
            });
        }

        if (data.phone && data.phone.length > 0) {
            intelligence.push({
                label: 'Phone Numbers',
                values: data.phone,
                icon: '📱'
            });
        }

        if (data.url && data.url.length > 0) {
            intelligence.push({
                label: 'URLs',
                values: data.url,
                icon: '🔗'
            });
        }

        if (data.bankAccount && data.bankAccount.length > 0) {
            intelligence.push({
                label: 'Bank Accounts',
                values: data.bankAccount,
                icon: '🏦'
            });
        }

        if (data.ifsc && data.ifsc.length > 0) {
            intelligence.push({
                label: 'IFSC Codes',
                values: data.ifsc,
                icon: '🏛️'
            });
        }

        this.intelligenceData.innerHTML = intelligence.map(item => `
            <div class="intelligence-item">
                <div class="intelligence-label">${item.icon} ${item.label} <span class="intelligence-count">${item.values.length}</span></div>
                ${item.values.map(value => `<div class="intelligence-value">${this.escapeHtml(value)}</div>`).join('')}
            </div>
        `).join('');
    }

    displayInsights(insights) {
        this.insightsList.innerHTML = insights.map((insight, index) => `
            <div class="insight-item" style="animation-delay: ${index * 0.1}s">
                <p>${this.escapeHtml(insight)}</p>
            </div>
        `).join('');
    }

    clearResults() {
        this.messageInput.value = '';
        this.resultsSection.classList.add('hidden');
        this.messageInput.focus();
    }

    showExportOptions() {
        // Export buttons are now visible after analysis
        const exportSection = document.getElementById('exportSection');
        if (exportSection) {
            exportSection.classList.remove('hidden');
        }
    }

    exportCurrentAsJSON() {
        if (this.currentResults) {
            this.exportManager.exportToJSON(this.currentResults,
                `scam_analysis_${Date.now()}.json`);
        } else {
            alert('No analysis to export. Please analyze a message first.');
        }
    }

    exportHistoryAsCSV() {
        const history = this.historyManager.getHistory();
        if (history.length > 0) {
            this.exportManager.exportToCSV(history);
        } else {
            alert('No history to export.');
        }
    }

    copyIntelligence() {
        if (this.currentResults && this.currentResults.extractedData) {
            const text = JSON.stringify(this.currentResults.extractedData, null, 2);
            this.exportManager.copyToClipboard(text);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// History Manager - Persistent storage for analyses
class HistoryManager {
    constructor() {
        this.storageKey = 'scamshield_history';
    }

    addAnalysis(message, results) {
        const history = this.getHistory();
        const entry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            message: message.substring(0, 200), // Truncate for storage
            threatLevel: results.threatLevel,
            confidence: results.confidence,
            patternsCount: results.detectedPatterns.length,
            extractedData: results.extractedData
        };

        history.unshift(entry);

        // Keep only last 100 entries
        if (history.length > 100) {
            history.splice(100);
        }

        localStorage.setItem(this.storageKey, JSON.stringify(history));
        return entry;
    }

    getHistory() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    deleteEntry(id) {
        const history = this.getHistory().filter(entry => entry.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(history));
    }

    clearAll() {
        localStorage.removeItem(this.storageKey);
    }

    getStatistics() {
        const history = this.getHistory();
        const stats = {
            total: history.length,
            high: history.filter(h => h.threatLevel === 'high').length,
            medium: history.filter(h => h.threatLevel === 'medium').length,
            low: history.filter(h => h.threatLevel === 'low').length,
            avgConfidence: history.reduce((sum, h) => sum + h.confidence, 0) / (history.length || 1)
        };
        return stats;
    }
}

// Export Manager - Data export functionality
class ExportManager {
    exportToJSON(data, filename = 'scamshield_report.json') {
        const json = JSON.stringify(data, null, 2);
        this.downloadFile(json, filename, 'application/json');
    }

    exportToCSV(history, filename = 'scamshield_history.csv') {
        const headers = ['Timestamp', 'Threat Level', 'Confidence %', 'Patterns Detected', 'Message Preview'];
        const rows = history.map(entry => [
            new Date(entry.timestamp).toLocaleString(),
            entry.threatLevel.toUpperCase(),
            entry.confidence,
            entry.patternsCount,
            `"${entry.message.replace(/"/g, '""')}"`
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        this.downloadFile(csv, filename, 'text/csv');
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Copied to clipboard!');
            }).catch(() => {
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    }

    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            alert('Copied to clipboard!');
        } catch (err) {
            alert('Could not copy to clipboard');
        }
        document.body.removeChild(textarea);
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Note: UIController is now initialized in index.html/dashboard.html
// and exposed globally as window.uiController
