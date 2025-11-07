# 📱 Node.js Backend WhatsApp Endpoint Required

## ⚠️ Important: CORS Fix

WhatsApp API directly browser से call नहीं हो सकता (CORS policy के कारण)।

## ✅ Solution: Node.js Backend Proxy Endpoint

Node.js backend पर यह endpoint implement करना होगा:

### Endpoint:
```
POST https://nodejs-2-i1dr.onrender.com/api/whatsapp/send
```

### Request Payload:
```json
{
  "phone_number": "919090385555",
  "message": "📋 मतदार माहिती...",
  "phone_number_id": "741032182432100",
  "api_key": "798422d2-818f-11f0-98fc-02c8a5e042bd"
}
```

### Expected Response (Success):
```json
{
  "success": true,
  "message_id": "wamid.HBgM...",
  "phone_number": "919090385555"
}
```

### Expected Response (Error):
```json
{
  "success": false,
  "error": "Error message",
  "message": "Error description"
}
```

## 🔧 Implementation Example (Node.js/Express):

```javascript
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { phone_number, message, phone_number_id, api_key } = req.body;
    
    // Validate input
    if (!phone_number || !message || !phone_number_id || !api_key) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Call WhatsApp API
    const whatsappApiUrl = `https://waba.xtendonline.com/v3/${phone_number_id}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      preview_url: false,
      recipient_type: 'individual',
      to: phone_number,
      type: 'text',
      text: {
        body: message
      }
    };
    
    const response = await axios.post(whatsappApiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': api_key
      }
    });
    
    // Return success response
    res.json({
      success: true,
      message_id: response.data.messages?.[0]?.id || null,
      phone_number: phone_number,
      data: response.data
    });
    
  } catch (error) {
    console.error('WhatsApp API Error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      message: error.response?.data?.error?.message || 'WhatsApp API error'
    });
  }
});
```

## 📋 Summary:

1. ✅ Node.js backend पर `/api/whatsapp/send` endpoint implement करें
2. ✅ WhatsApp API को server-side call करें
3. ✅ Response को proper format में return करें
4. ✅ CORS headers set करें (अगर जरूरत हो)

## 🔑 API Credentials:

- **Phone Number ID**: `741032182432100`
- **API Key**: `798422d2-818f-11f0-98fc-02c8a5e042bd`
- **WhatsApp API URL**: `https://waba.xtendonline.com/v3/{phone_number_id}/messages`


