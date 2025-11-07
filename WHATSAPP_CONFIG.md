# 📱 WhatsApp API Configuration

## Current Configuration:

### Phone Number ID:
```
741032182432100
```

### API Key:
```
798422d2-818f-11f0-98fc-02c8a5e042bd
```

### API Endpoints:

**Direct WhatsApp API:**
```
https://waba.xtendonline.com/v3/741032182432100/messages
```

**Node.js Backend Proxy (Current):**
```
https://nodejs-2-i1dr.onrender.com/api/whatsapp/send
```

## Phone Number Format:

✅ **Always includes country code 91**
- Format: `919090385555` (91 + 10 digits)
- Example: `9090385555` → `919090385555`
- Example: `919090385555` → `919090385555` (already has 91)

## Request Payload:

```json
{
  "phone_number": "919090385555",
  "message": "📋 मतदार माहिती...",
  "phone_number_id": "741032182432100",
  "api_key": "798422d2-818f-11f0-98fc-02c8a5e042bd"
}
```

## Locations in Code:

1. **Auto-send function**: Line ~302
2. **Manual send function**: Line ~1098

## Important Notes:

- ✅ Phone number always formatted as `91XXXXXXXXXX`
- ✅ API key and Phone Number ID are configured correctly
- ✅ Using Node.js backend proxy to avoid CORS issues
- ⚠️ Node.js backend endpoint `/api/whatsapp/send` needs to be implemented


