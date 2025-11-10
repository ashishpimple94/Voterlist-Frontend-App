// Vercel Serverless Function for WhatsApp API Proxy
// This avoids CORS issues by making server-side API call
// File: api/whatsapp-send.js (Vercel automatically routes /api/whatsapp-send to this file)

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone_number, message, message_type, location, phone_number_id, api_key } = req.body;

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

    // Call WhatsApp API
    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': api_key
      },
      body: JSON.stringify(payload)
    });

    // Get response text first to handle errors properly
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      // If response is not JSON, it's an error
      console.error('❌ Invalid JSON response from WhatsApp API:', responseText);
      return res.status(response.status || 500).json({
        success: false,
        error: 'Invalid response from WhatsApp API',
        message: 'WhatsApp API returned invalid JSON response',
        details: responseText.substring(0, 200)
      });
    }

    // Check if WhatsApp API returned an error
    if (!response.ok) {
      console.error('❌ WhatsApp API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      
      return res.status(response.status || 400).json({
        success: false,
        error: responseData.error || responseData,
        message: responseData.error?.message || responseData.message || `WhatsApp API error (${response.status})`,
        details: responseData,
        status_code: response.status
      });
    }
    
    // Check if response has error field even if status is OK
    if (responseData.error) {
      console.error('❌ WhatsApp API Error in response:', responseData.error);
      return res.status(400).json({
        success: false,
        error: responseData.error,
        message: responseData.error?.message || 'WhatsApp API error',
        details: responseData
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message_id: responseData.messages?.[0]?.id || null,
      phone_number: phone_number,
      data: responseData
    });

  } catch (error) {
    console.error('❌ WhatsApp API Handler Error:', error);
    console.error('Error Stack:', error.stack);
    
    // Handle specific error types
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return res.status(500).json({
        success: false,
        error: 'Network error',
        message: 'Failed to connect to WhatsApp API. Please check your internet connection.',
        details: error.message
      });
    }
    
    if (error.name === 'SyntaxError') {
      return res.status(500).json({
        success: false,
        error: 'Invalid response format',
        message: 'WhatsApp API returned invalid response',
        details: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      message: 'Failed to send WhatsApp message',
      details: error.stack || error.toString()
    });
  }
}

