# 🚀 Quick Start Guide

## Development Setup:

### Option 1: Run Proxy Server Separately (Recommended)

1. **Install dependencies:**
```bash
npm install express axios cors concurrently
```

2. **Start proxy server (in one terminal):**
```bash
npm run server
# or
node server.js
```

3. **Start React app (in another terminal):**
```bash
npm start
```

### Option 2: Run Both Together

1. **Install dependencies:**
```bash
npm install express axios cors concurrently
```

2. **Run both servers:**
```bash
npm run dev
```

This will:
- Start proxy server on `http://localhost:3001`
- Start React app on `http://localhost:3000`

### Option 3: Use Vercel Dev (For Vercel Serverless Functions)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Run Vercel dev:**
```bash
vercel dev
```

## API Endpoints:

- **Voter Data (GET)**: `https://nodejs-2-i1dr.onrender.com/api/voters/`
- **WhatsApp Send (POST)**: 
  - Development: `http://localhost:3001/api/whatsapp-send`
  - Production: `/api/whatsapp-send` (Vercel serverless)

## Troubleshooting:

### Error: Cannot find module 'express'
**Solution**: Run `npm install express axios cors concurrently`

### Error: Port 3001 already in use
**Solution**: Change PORT in `server.js` or kill process using port 3001

### Error: CORS error
**Solution**: Make sure proxy server is running on port 3001

## Production Deployment:

1. **Deploy to Vercel:**
```bash
vercel
```

2. **Serverless function** (`/api/whatsapp-send`) will work automatically


