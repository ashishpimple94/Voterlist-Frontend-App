// Test script for WhatsApp API - Direct API call
const axios = require('axios');

// Configuration
const PHONE_NUMBER_ID = '741032182432100';
const API_KEY = '798422d2-818f-11f0-98fc-02c8a5e042bd';
const TEST_PHONE_NUMBER = '919090385555'; // Replace with your test number
const DIRECT_API_URL = `https://waba.xtendonline.com/v3/${PHONE_NUMBER_ID}/messages`;

// Test message
const testMessage = `🧪 *WhatsApp API Test*\n\n` +
  `✅ This is a test message from Voter Search App\n` +
  `📅 Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n` +
  `🔧 Testing Direct API integration\n\n` +
  `If you receive this, the API is working correctly! 🎉`;

console.log('🧪 WhatsApp API Direct Test');
console.log('=' .repeat(50));
console.log('\n📋 Configuration:');
console.log(`  Phone Number ID: ${PHONE_NUMBER_ID}`);
console.log(`  API Key: ${API_KEY.substring(0, 10)}...`);
console.log(`  Test Phone: ${TEST_PHONE_NUMBER}`);
console.log(`  API URL: ${DIRECT_API_URL}`);
console.log('\n' + '='.repeat(50));

async function testDirectAPI() {
  console.log('\n🔍 Testing Direct WhatsApp API');
  console.log('-'.repeat(50));
  
  try {
    const payload = {
      messaging_product: 'whatsapp',
      to: TEST_PHONE_NUMBER,
      type: 'text',
      text: {
        body: testMessage
      }
    };
    
    console.log('\n📤 Sending request to:', DIRECT_API_URL);
    console.log('📦 Payload:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('\n🔑 Headers:');
    console.log('  Content-Type: application/json');
    console.log('  apikey: ' + API_KEY.substring(0, 10) + '...');
    
    const response = await axios.post(DIRECT_API_URL, payload, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY
      }
    });
    
    console.log('\n✅ Response Status:', response.status);
    console.log('📥 Response Headers:', JSON.stringify(response.headers, null, 2));
    console.log('\n📥 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.messages && response.data.messages[0]?.id) {
      const messageId = response.data.messages[0].id;
      const waId = response.data.contacts?.[0]?.wa_id;
      
      console.log('\n🎉 SUCCESS! Message sent successfully!');
      console.log('   Message ID:', messageId);
      
      if (waId) {
        console.log('   WA ID:', waId);
        console.log('   ✅ Contact is registered on WhatsApp');
      }
      
      console.log('\n✅ WhatsApp API is working correctly!');
      console.log('   Check the recipient\'s WhatsApp for the test message.');
      console.log('\n⚠️  Important Notes:');
      console.log('   • Message delivery may take a few seconds');
      console.log('   • Free-form messages only work within 24-hour window');
      console.log('   • For first-time messages, you need approved templates');
      
      return true;
    } else if (response.data.error) {
      console.log('\n❌ FAILED: API returned error');
      console.log('   Error:', JSON.stringify(response.data.error, null, 2));
      
      if (response.data.error.message) {
        console.log('\n📝 Error Message:', response.data.error.message);
        console.log('   Error Code:', response.data.error.code);
        console.log('   Error Type:', response.data.error.type);
      }
      
      return false;
    } else {
      console.log('\n⚠️  Unexpected response format');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
    
  } catch (error) {
    console.log('\n❌ ERROR: Direct API test failed');
    console.log('   Error Code:', error.code);
    console.log('   Error Message:', error.message);
    
    if (error.response) {
      console.log('\n📥 Error Response:');
      console.log('   Status:', error.response.status);
      console.log('   Status Text:', error.response.statusText);
      console.log('   Headers:', JSON.stringify(error.response.headers, null, 2));
      console.log('\n📥 Error Response Data:');
      console.log(JSON.stringify(error.response.data, null, 2));
      
      if (error.response.data.error) {
        console.log('\n📝 Error Details:');
        console.log('   Message:', error.response.data.error.message);
        console.log('   Code:', error.response.data.error.code);
        console.log('   Type:', error.response.data.error.type);
        console.log('   Details:', JSON.stringify(error.response.data.error, null, 2));
      }
    } else if (error.request) {
      console.log('\n❌ No response received');
      console.log('   Request:', error.request);
    }
    
    console.log('\n💡 Troubleshooting Tips:');
    console.log('   1. Check if API key is correct');
    console.log('   2. Verify phone number ID is correct');
    console.log('   3. Ensure phone number is in correct format (91XXXXXXXXXX)');
    console.log('   4. Check network connection');
    console.log('   5. Verify WhatsApp Business API account status');
    
    return false;
  }
}

// Run test
console.log('\n🚀 Starting Direct WhatsApp API Test...\n');

testDirectAPI()
  .then(success => {
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Result: ' + (success ? '✅ PASSED' : '❌ FAILED'));
    console.log('='.repeat(50));
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Fatal Error:', error);
    process.exit(1);
  });

