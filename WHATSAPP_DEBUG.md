# WhatsApp API Debug Guide

## ✅ API is Working!

The test shows that WhatsApp API is working correctly:
```json
{
  "success": true,
  "message_id": "wamid.HBgMOTE5MDkwMzg1NTU1FQIAERgSRjcyQzlERjlFMUFFODY3MUY1AA==",
  "phone_number": "919090385555",
  "data": {
    "messaging_product": "whatsapp",
    "contacts": [{"input": "919090385555", "wa_id": "919090385555"}],
    "messages": [{"id": "wamid.HBgMOTE5MDkwMzg1NTU1FQIAERgSRjcyQzlERjlFMUFFODY3MUY1AA=="}]
  }
}
```

## 🔍 Debugging Steps:

### 1. Check Browser Console (F12)
- Open browser console
- Look for WhatsApp API logs
- Check for any error messages

### 2. Check Proxy Server Logs
The proxy server should show:
- `📤 WhatsApp API Request` - Request details
- `📡 Calling WhatsApp API` - API URL
- `✅ WhatsApp API Response Status` - Response status
- `📥 WhatsApp API Response Data` - Full response

### 3. Common Issues:

#### Issue 1: Messages not appearing in WhatsApp
**Possible Causes:**
- Phone number not registered on WhatsApp
- WhatsApp Business API not properly configured
- Message template not approved (for template messages)
- Rate limiting

**Solution:**
- Verify phone number is registered on WhatsApp
- Check WhatsApp Business API dashboard
- Ensure phone number format is correct (91XXXXXXXXXX)

#### Issue 2: API returns success but message not sent
**Possible Causes:**
- API response shows success but WhatsApp API has internal errors
- Phone number format issue
- Message content issue

**Solution:**
- Check server logs for detailed response
- Verify phone number format
- Try sending to a different number

#### Issue 3: CORS or Network Errors
**Solution:**
- Make sure proxy server is running: `npm run server`
- Check proxy server is accessible on port 3001
- Verify setupProxy.js is configured correctly

## 📊 Response Format:

### Success Response:
```json
{
  "success": true,
  "message_id": "wamid.XXX",
  "phone_number": "919090385555",
  "data": {
    "messaging_product": "whatsapp",
    "contacts": [{"input": "919090385555", "wa_id": "919090385555"}],
    "messages": [{"id": "wamid.XXX"}]
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": {...},
  "message": "Error message"
}
```

## 🔧 Testing:

### Test Proxy Server:
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
- Status: 200
- Body: JSON with `success: true` and `message_id`

## 📝 Next Steps:

1. **Check Browser Console** for detailed logs
2. **Check Proxy Server Logs** for API responses
3. **Verify Phone Number** is registered on WhatsApp
4. **Test with Different Numbers** to isolate the issue
5. **Check WhatsApp Business API Dashboard** for message status

## 🎯 If Messages Still Not Sending:

1. Verify WhatsApp Business API is properly set up
2. Check if phone numbers are in the approved list
3. Verify API credentials are correct
4. Check WhatsApp Business API rate limits
5. Contact WhatsApp Business API support

