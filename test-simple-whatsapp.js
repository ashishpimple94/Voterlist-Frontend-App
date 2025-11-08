// Simple WhatsApp API test - Debug version
const axios = require('axios');

const PHONE_NUMBER_ID = '741032182432100';
const API_KEY = '798422d2-818f-11f0-98fc-02c8a5e042bd';
const TEST_PHONE = '919090385555';

console.log('🧪 Simple WhatsApp Test\n');

// Test 1: Direct API
async function testDirect() {
  console.log('1️⃣ Testing Direct API...');
  try {
    const response = await axios.post(
      `https://waba.xtendonline.com/v3/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: TEST_PHONE,
        type: 'text',
        text: { body: 'Test message' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
      }
    );
    console.log('✅ Direct API: SUCCESS');
    console.log('   Message ID:', response.data.messages?.[0]?.id);
    return true;
  } catch (err) {
    console.log('❌ Direct API: FAILED');
    console.log('   Error:', err.message);
    return false;
  }
}

// Test 2: Proxy Server
async function testProxy() {
  console.log('\n2️⃣ Testing Proxy Server...');
  try {
    const response = await axios.post(
      'http://localhost:3001/api/whatsapp-send',
      {
        phone_number: TEST_PHONE,
        message: 'Test message',
        phone_number_id: PHONE_NUMBER_ID,
        api_key: API_KEY
      }
    );
    console.log('✅ Proxy Server: SUCCESS');
    console.log('   Message ID:', response.data.message_id);
    return true;
  } catch (err) {
    console.log('❌ Proxy Server: FAILED');
    console.log('   Error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.log('   ⚠️  Server not running! Run: npm run server');
    }
    return false;
  }
}

// Test 3: Vercel endpoint (relative)
async function testVercel() {
  console.log('\n3️⃣ Testing Vercel Endpoint (if deployed)...');
  // This won't work locally, just for info
  console.log('   ℹ️  Vercel endpoint: /api/whatsapp-send');
  console.log('   ℹ️  Only works in production deployment');
}

async function runTests() {
  const directResult = await testDirect();
  await new Promise(r => setTimeout(r, 1000));
  const proxyResult = await testProxy();
  testVercel();
  
  console.log('\n📊 Summary:');
  console.log(`   Direct API: ${directResult ? '✅' : '❌'}`);
  console.log(`   Proxy Server: ${proxyResult ? '✅' : '❌'}`);
  
  if (!proxyResult) {
    console.log('\n💡 To fix proxy server:');
    console.log('   1. Open new terminal');
    console.log('   2. Run: npm run server');
    console.log('   3. Wait for: "🚀 WhatsApp API Proxy Server running..."');
  }
}

runTests();

