// Simple Express server for WhatsApp API proxy in development
// Run this separately: node server.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use(cors());
app.use(express.json());

// WhatsApp API proxy endpoint
app.post('/api/whatsapp-send', async (req, res) => {
  try {
    const { phone_number, message, message_type, location, phone_number_id, api_key } = req.body;

    console.log('📤 WhatsApp API Request:', {
      phone_number,
      phone_number_id,
      message_type: message_type || 'text',
      message_preview: message?.substring(0, 50) + '...',
      has_location: !!location
    });

    // Validate input
    if (!phone_number || !phone_number_id || !api_key) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: phone_number, phone_number_id, api_key'
      });
    }

    // WhatsApp API URL - Official WhatsApp Business API
    // Format: https://waba.xtendonline.com/v3/{phone_number_id}/messages
    const whatsappApiUrl = `https://waba.xtendonline.com/v3/${phone_number_id}/messages`;

    let payload;

    // Check if it's a location message
    if (message_type === 'location' && location) {
      // Validate location fields
      if (!location.latitude || !location.longitude || !location.name || !location.address) {
        return res.status(400).json({
          success: false,
          error: 'Missing required location fields: latitude, longitude, name, address'
        });
      }

      // Prepare payload for location message
      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phone_number,
        type: 'location',
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          name: location.name,
          address: location.address
        }
      };
    } else {
      // Text message - validate message field
      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: message'
        });
      }

      // Prepare payload for text message
      payload = {
        messaging_product: 'whatsapp',
        to: phone_number, // Format: 919090385555 (with country code 91)
        type: 'text',
        text: {
          body: message
        }
      };
    }

    console.log('📡 Calling WhatsApp API:', whatsappApiUrl);
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));
    console.log('🔑 API Key:', api_key.substring(0, 10) + '...');

    // Call WhatsApp API
    const response = await axios.post(whatsappApiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': api_key
      },
      timeout: 30000
    });

    console.log('✅ WhatsApp API Response Status:', response.status);
    console.log('📥 WhatsApp API Response Data:', JSON.stringify(response.data, null, 2));

    // Check if WhatsApp API returned an error in the response
    if (response.data && response.data.error) {
      console.error('❌ WhatsApp API Error in Response:', response.data.error);
      return res.status(400).json({
        success: false,
        error: response.data.error,
        message: response.data.error.message || 'WhatsApp API error',
        details: response.data
      });
    }

    // Check if messages array exists and has items
    if (!response.data.messages || !response.data.messages[0]) {
      console.warn('⚠️ No message ID in response:', response.data);
    }

    // Return success response
    return res.json({
      success: true,
      message_id: response.data.messages?.[0]?.id || null,
      phone_number: phone_number,
      data: response.data
    });

  } catch (error) {
    console.error('❌ WhatsApp API Error:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Response Status:', error.response?.status);
    console.error('Error Response Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Full Error:', error);
    
    // Check if it's an axios error with response
    if (error.response) {
      // WhatsApp API returned an error response
      const errorData = error.response.data;
      return res.status(error.response.status).json({
        success: false,
        error: errorData.error || errorData,
        message: errorData.error?.message || errorData.message || 'WhatsApp API error',
        details: errorData,
        status_code: error.response.status
      });
    }
    
    // Network or other errors
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      message: 'Failed to send WhatsApp message',
      code: error.code
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'WhatsApp API Proxy' });
});

app.listen(PORT, () => {
  console.log(`🚀 WhatsApp API Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}/api/whatsapp-send`);
});


