# 📱 WhatsApp API Configuration

## ✅ Verified Configuration

### API Endpoint
```
https://waba.xtendonline.com/v3/{phone_number_id}/messages
```

### Phone Number ID
```
741032182432100
```

### API Key
```
798422d2-818f-11f0-98fc-02c8a5e042bd
```

## 📋 Request Format

### Endpoint
```
POST https://waba.xtendonline.com/v3/741032182432100/messages
```

### Headers
```
Content-Type: application/json
apikey: 798422d2-818f-11f0-98fc-02c8a5e042bd
```

### Payload Format
```json
{
    "to": "919090385555",
    "type": "text",
    "text": {
        "body": "Your message here"
    },
    "messaging_product": "whatsapp"
}
```

### Example Request
```json
{
    "to": "919090385555",
    "type": "text",
    "text": {
        "body": "📋 *मतदार माहिती*\n\n🏷️ *अनु क्र.:* 123\n👤 *नाव:* John Doe\n\nNana Walke Foundation"
    },
    "messaging_product": "whatsapp"
}
```

## 🔍 Verification

### ✅ All Files Updated:
1. **server.js** - Development proxy server
2. **api/whatsapp-send.js** - Vercel serverless function
3. **src/App.js** - React app (2 locations: auto-send and manual send)

### ✅ Format Verification:
- ✅ Endpoint URL: Correct
- ✅ Phone Number ID: Correct (741032182432100)
- ✅ API Key: Correct (798422d2-818f-11f0-98fc-02c8a5e042bd)
- ✅ Payload structure: Correct
- ✅ Headers: Correct (Content-Type and apikey)

## 📝 Phone Number Format

### Required Format:
- Country code: `91` (India)
- Format: `91XXXXXXXXXX` (91 + 10 digits)
- Example: `919090385555`

### Validation:
- Must be exactly 10 digits after country code
- Automatically adds `91` if not present
- Removes non-numeric characters

## 🚀 Usage

### Development:
```bash
# Terminal 1: Start proxy server
npm run server

# Terminal 2: Start React app
npm start
```

### Production:
- Deploy to Vercel
- Serverless function at `/api/whatsapp-send` automatically handles requests

## 🔐 Security Notes

- ⚠️ API key is hardcoded in the code (for now)
- ✅ API calls go through proxy/serverless function (not directly from browser)
- ✅ CORS is handled by server-side proxy

## 🧪 Testing

### Test with cURL:
```bash
curl -X POST http://localhost:3001/api/whatsapp-send \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "919090385555",
    "message": "Test message",
    "phone_number_id": "741032182432100",
    "api_key": "798422d2-818f-11f0-98fc-02c8a5e042bd"
  }'
```

### Expected Response:
```json
{
    "success": true,
    "message_id": "wamid.XXX",
    "phone_number": "919090385555",
    "data": {
        "messaging_product": "whatsapp",
        "contacts": [{
            "input": "919090385555",
            "wa_id": "919090385555"
        }],
        "messages": [{
            "id": "wamid.XXX"
        }]
    }
}
```

## ✅ Status

All configurations verified and correct! 🎉

