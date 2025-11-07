# 🔧 Fix 404 Error for WhatsApp API

## Problem:
Getting 404 error when calling `/api/whatsapp-send`

## Solution Steps:

### Step 1: Check Proxy Server is Running
```bash
# Check if server is running
lsof -ti:3001

# If not running, start it:
npm run server

# Or manually:
node server.js
```

You should see:
```
🚀 WhatsApp API Proxy Server running on http://localhost:3001
📡 Endpoint: http://localhost:3001/api/whatsapp-send
```

### Step 2: Restart React App
```bash
# Stop React app (Ctrl+C)
# Then restart:
npm start
```

**Important:** React app MUST be restarted after changing `setupProxy.js`

### Step 3: Verify Proxy is Working
Open browser console (F12) and check:
- Look for `📤 [Proxy] Forwarding WhatsApp request` logs
- Look for `📥 [Proxy] Response from proxy server` logs

### Step 4: Test Proxy Directly
```bash
# Test proxy server directly:
curl -X POST http://localhost:3001/api/whatsapp-send \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "919090385555",
    "message": "Test",
    "phone_number_id": "741032182432100",
    "api_key": "798422d2-818f-11f0-98fc-02c8a5e042bd"
  }'
```

Expected response:
```json
{
  "success": true,
  "message_id": "wamid.XXX",
  "phone_number": "919090385555"
}
```

### Step 5: Check Browser Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try sending WhatsApp message
4. Check the request to `/api/whatsapp-send`
5. Look at:
   - Request URL
   - Status code
   - Response body

## Common Issues:

### Issue 1: Proxy Server Not Running
**Symptom:** 404 or 503 error
**Solution:** Start proxy server: `npm run server`

### Issue 2: React App Not Restarted
**Symptom:** Changes in setupProxy.js not taking effect
**Solution:** Restart React app completely

### Issue 3: Port Conflict
**Symptom:** Cannot start proxy server on port 3001
**Solution:** 
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change PORT in server.js
```

### Issue 4: Proxy Not Forwarding
**Symptom:** Request goes to React dev server instead of proxy
**Solution:** 
- Check setupProxy.js is in `src/` folder
- Restart React app
- Check console for proxy logs

## Quick Fix:

1. **Terminal 1:** Start proxy server
   ```bash
   npm run server
   ```

2. **Terminal 2:** Start React app
   ```bash
   npm start
   ```

3. **Or run both together:**
   ```bash
   npm run dev
   ```

## Verification:

After following above steps:
1. Open browser console (F12)
2. Try sending WhatsApp message
3. Check for:
   - ✅ `📤 [Proxy] Forwarding WhatsApp request` (in terminal)
   - ✅ `📥 [Proxy] Response from proxy server: 200` (in terminal)
   - ✅ No 404 errors in browser console
   - ✅ Success message in browser

## Still Getting 404?

1. **Check proxy server logs** - Should show requests coming in
2. **Check React app logs** - Should show proxy forwarding
3. **Check browser Network tab** - See actual request/response
4. **Verify port 3001** - `curl http://localhost:3001/health`

## Debug Commands:

```bash
# Check if proxy server is running
curl http://localhost:3001/health

# Test WhatsApp endpoint directly
curl -X POST http://localhost:3001/api/whatsapp-send \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"919090385555","message":"Test","phone_number_id":"741032182432100","api_key":"798422d2-818f-11f0-98fc-02c8a5e042bd"}'

# Check what's on port 3001
lsof -i:3001
```

