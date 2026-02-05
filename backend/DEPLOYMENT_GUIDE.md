# Deploying ScamShield Honeypot to Render

## Prerequisites
✅ Render.com account (free tier available)
✅ GitHub account
✅ Git installed on your system

## Step-by-Step Deployment Guide

### Step 1: Push Code to GitHub

1. **Initialize Git repository** (if not already done):
```bash
cd "c:\Users\ntnsi\Downloads\ai impactsubmit ps 2\backend"
git init
git add .
git commit -m "Initial commit: ScamShield Honeypot API"
```

2. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Name it: `scamshield-honeypot`
   - Make it **Public** (Render free tier requires public repos)
   - Don't initialize with README (we already have files)

3. **Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/scamshield-honeypot.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render

1. **Go to Render Dashboard**:
   - Visit: https://dashboard.render.com
   - Sign in or create account

2. **Create New Web Service**:
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub account if not already connected
   - Select your `scamshield-honeypot` repository

3. **Configure the Service**:
   - **Name**: `scamshield-honeypot` (or your preferred name)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable":
   
   ```
   API_KEY = mysecret123
   GEMINI_API_KEY = AIzaSyBWn-7WhBwpbCltVni3naVuiS7f5M97pl4
   PORT = 3000
   ```

5. **Deploy**:
   - Click **"Create Web Service"**
   - Render will automatically deploy your app
   - Wait 2-5 minutes for deployment to complete

### Step 3: Test Your Deployed API

Once deployed, Render will give you a URL like:
```
https://scamshield-honeypot-xxxx.onrender.com
```

1. **Test Health Endpoint**:
```bash
curl https://YOUR-APP-NAME.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-05T...",
  "service": "ScamShield Honeypot API",
  "version": "1.0.0"
}
```

2. **Test Honeypot Endpoint**:
```bash
curl -X POST https://YOUR-APP-NAME.onrender.com/api/honeypot \
  -H "Content-Type: application/json" \
  -H "x-api-key: mysecret123" \
  -d '{
    "sessionId": "test-session",
    "message": {
      "text": "URGENT! Your account is blocked. Verify KYC at bit.ly/verify"
    }
  }'
```

### Step 4: Submit to Hackathon

Once testing is successful:

1. **Copy your API endpoint URL**:
   ```
   https://YOUR-APP-NAME.onrender.com/api/honeypot
   ```

2. **Note your API key**:
   ```
   mysecret123
   ```

3. **Test with Hackathon Endpoint Tester**:
   - Use the hackathon's testing tool
   - Enter your URL and API key
   - Verify it passes

4. **Submit for Evaluation**:
   - Submit your endpoint URL
   - Submit your API key
   - Complete the hackathon submission form

## Important Notes

### Free Tier Limitations
- Render free tier **spins down after 15 minutes of inactivity**
- First request after spin-down may take 30-60 seconds to wake up
- Keep this in mind during hackathon evaluation

### Keeping Service Alive (Optional)
If you need to keep the service always active:
- Use a service like UptimeRobot to ping `/health` every 14 minutes
- Or upgrade to Render's paid tier ($7/month)

### Environment Variables Security
- Never commit `.env` file to GitHub (already in `.gitignore`)
- API keys are safe in Render's environment variable system
- You can update them in Render dashboard without redeploying

## Troubleshooting

### Deployment Failed
- Check Render logs in the dashboard
- Verify `package.json` has all dependencies
- Ensure Node.js version is >= 18.0.0

### API Returns Errors
- Check environment variables are set correctly in Render
- View logs in Render dashboard for error details
- Test locally first to isolate deployment issues

### Gemini API Errors
- Verify GEMINI_API_KEY is correct
- Check API key has proper permissions
- API will use fallback responses if Gemini fails

## Your Deployment Details

**Repository**: (to be created)
**Render URL**: (will be generated after deployment)
**API Endpoint**: `https://YOUR-APP.onrender.com/api/honeypot`
**API Key**: `mysecret123`
**Health Check**: `https://YOUR-APP.onrender.com/health`

## Next Steps

1. ✅ Create GitHub repository
2. ✅ Push code to GitHub
3. ✅ Deploy on Render
4. ✅ Test deployed API
5. ✅ Submit to hackathon
