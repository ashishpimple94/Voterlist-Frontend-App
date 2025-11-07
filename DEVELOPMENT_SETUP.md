# 🔧 Development Setup for WhatsApp API

## Problem:
In development mode, `/api/whatsapp-send` is being proxied to `https://xtend.online`, causing WordPress redirect errors.

## Solutions:

### Option 1: Use Vercel Dev Server (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Run with serverless functions
vercel dev
```

This will:
- Run React app on `http://localhost:3000`
- Run serverless functions on same port
- `/api/whatsapp-send` will work automatically

### Option 2: Use Separate Proxy Server

1. Install dependencies:
```bash
npm install express axios
```

2. Run proxy server:
```bash
node api/whatsapp-proxy.js
```

3. Update `src/App.js` to use:
```javascript
const proxyApiUrl = 'http://localhost:3001/api/whatsapp-send';
```

### Option 3: Direct API Call (If CORS allows)

Update `src/App.js` to call WhatsApp API directly:
```javascript
const whatsappApiUrl = `https://waba.xtendonline.com/v3/${phoneNumberId}/messages`;
```

**Note:** This may still have CORS issues in browser.

## Current Configuration:

- **Voter Data**: `https://nodejs-2-i1dr.onrender.com/api/voters/` (GET)
- **WhatsApp API**: `/api/whatsapp-send` (POST) - Vercel serverless function

## Quick Fix for Development:

1. **Best**: Use `vercel dev` command
2. **Alternative**: Run separate proxy server on port 3001
3. **Fallback**: Update proxy URL to use external service

## Production:

- Deploy to Vercel: `vercel`
- Serverless function will work automatically at `/api/whatsapp-send`


