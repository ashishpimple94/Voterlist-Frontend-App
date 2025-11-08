# 🚀 Vercel Deployment Guide

## 📋 Overview

Vercel पर deploy करने के लिए, आपको **serverless function** use करना होगा (जो `api/whatsapp-send.js` में है)। अलग से proxy server चलाने की जरूरत नहीं है - Vercel automatically serverless functions handle करता है।

## ✅ Pre-Deployment Setup

### 1. Environment Variables Setup

#### Option A: Vercel Dashboard में (Recommended)

1. Vercel Dashboard में जाएं: https://vercel.com/dashboard
2. अपना project select करें
3. **Settings** → **Environment Variables** पर जाएं
4. ये variables add करें:

```
REACT_APP_WHATSAPP_PHONE_NUMBER_ID=741032182432100
REACT_APP_WHATSAPP_API_KEY=798422d2-818f-11f0-98fc-02c8a5e042bd
REACT_APP_WHATSAPP_API_URL=https://waba.xtendonline.com/v3
REACT_APP_ENV=production
```

#### Option B: Vercel CLI से

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add REACT_APP_WHATSAPP_PHONE_NUMBER_ID
vercel env add REACT_APP_WHATSAPP_API_KEY
vercel env add REACT_APP_WHATSAPP_API_URL
vercel env add REACT_APP_ENV
```

### 2. Files Check

Ensure these files exist:
- ✅ `api/whatsapp-send.js` - Serverless function (already exists)
- ✅ `vercel.json` - Vercel configuration (already exists)
- ✅ `.env.example` - Environment variables example (created)

## 🚀 Deployment Steps

### Method 1: Vercel Dashboard से (Easiest)

1. **GitHub Repository Connect करें:**
   - Vercel Dashboard → **New Project**
   - GitHub repository select करें
   - **Import** button click करें

2. **Build Settings:**
   - **Framework Preset:** Create React App
   - **Root Directory:** `./` (root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

3. **Environment Variables Add करें:**
   - Settings → Environment Variables
   - Variables add करें (ऊपर देखें)

4. **Deploy:**
   - **Deploy** button click करें
   - Wait करें deployment complete होने के लिए

### Method 2: Vercel CLI से

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

## 📁 Project Structure

```
Voter-Search-App/
├── api/
│   └── whatsapp-send.js      # Serverless function (Vercel automatically detects)
├── src/
│   └── App.js                 # React app
├── vercel.json                # Vercel configuration
├── package.json
└── .env.example               # Environment variables example
```

## 🔍 How It Works on Vercel

1. **Client (Browser):** React app `/api/whatsapp-send` को call करता है
2. **Vercel:** Automatically `api/whatsapp-send.js` serverless function को execute करता है
3. **Serverless Function:** WhatsApp API को call करता है (server-side, no CORS issues)
4. **Response:** Client को वापस आता है

## ✅ Post-Deployment Verification

### 1. Check API Endpoint

```bash
# Test the serverless function
curl -X POST https://your-app.vercel.app/api/whatsapp-send \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "919090385555",
    "message": "Test",
    "phone_number_id": "741032182432100",
    "api_key": "798422d2-818f-11f0-98fc-02c8a5e042bd"
  }'
```

### 2. Check Browser Console

1. Deployed app खोलें
2. WhatsApp message भेजने की कोशिश करें
3. Browser console (F12) में check करें:
   - `✅ WhatsApp message sent successfully!`

### 3. Check Vercel Logs

1. Vercel Dashboard → **Deployments**
2. Latest deployment click करें
3. **Functions** tab में logs देखें

## 🔧 Configuration Files

### vercel.json
```json
{
  "rewrites": [
    {
      "source": "/api/Voter/(.*)",
      "destination": "https://xtend.online/Voter/$1"
    }
  ],
  "headers": [
    {
      "source": "/api/whatsapp-send",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### api/whatsapp-send.js
- ✅ Already configured
- ✅ Handles CORS
- ✅ Error handling
- ✅ WhatsApp API integration

## ⚠️ Important Notes

1. **No Proxy Server Needed:** Vercel पर अलग से proxy server चलाने की जरूरत नहीं है
2. **Serverless Functions:** `api/whatsapp-send.js` automatically serverless function बन जाता है
3. **Environment Variables:** Vercel Dashboard में add करना जरूरी है
4. **CORS:** Serverless function automatically CORS handle करता है

## 🐛 Troubleshooting

### Issue 1: API Endpoint Not Found
**Solution:** Check if `api/whatsapp-send.js` file exists and is in root directory

### Issue 2: Environment Variables Not Working
**Solution:** 
- Vercel Dashboard में variables add करें
- Redeploy करें
- Variables `REACT_APP_` prefix के साथ होने चाहिए

### Issue 3: CORS Errors
**Solution:** 
- `vercel.json` में headers check करें
- Serverless function में CORS headers already हैं

### Issue 4: WhatsApp API Errors
**Solution:**
- API credentials verify करें
- Phone Number ID और API Key check करें
- Vercel logs में error messages देखें

## 📝 Environment Variables Checklist

- [ ] `REACT_APP_WHATSAPP_PHONE_NUMBER_ID` - Phone Number ID
- [ ] `REACT_APP_WHATSAPP_API_KEY` - API Key
- [ ] `REACT_APP_WHATSAPP_API_URL` - API URL (optional)
- [ ] `REACT_APP_ENV` - Environment (production)

## 🎯 Deployment Checklist

- [ ] Environment variables Vercel में add किए
- [ ] `api/whatsapp-send.js` file exists
- [ ] `vercel.json` configured
- [ ] Code committed to Git
- [ ] Vercel project connected to repository
- [ ] Deployment successful
- [ ] API endpoint tested
- [ ] WhatsApp messages working

## ✅ Success Indicators

1. ✅ Deployment successful
2. ✅ API endpoint accessible: `https://your-app.vercel.app/api/whatsapp-send`
3. ✅ WhatsApp messages successfully sent
4. ✅ No CORS errors
5. ✅ Vercel logs show successful API calls

---

**Ready to deploy!** 🚀

