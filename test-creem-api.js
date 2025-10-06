// Test script to verify Creem API integration
// Run with: node test-creem-api.js

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const CREEM_API_KEY = process.env.CREEM_API_KEY;
const TEST_PRODUCT_ID = 'prod_4BV6rfzTZBt37QapS6JPtj'; // Pro Monthly

console.log('🧪 Testing Creem API Integration\n');
console.log('API Key:', CREEM_API_KEY ? '✓ Loaded' : '✗ Missing');
console.log('Product ID:', TEST_PRODUCT_ID);
console.log('\n' + '='.repeat(50) + '\n');

async function testCreemCheckout() {
  try {
    const payload = {
      product_id: TEST_PRODUCT_ID,
      units: 1,
      success_url: 'http://localhost:5174/payment/success?session_id={CHECKOUT_SESSION_ID}',
      customer: {
        email: 'test@example.com'
      },
      metadata: {
        user_id: 'test_user_123',
        plan_id: 'pro',
        interval: 'month'
      }
    };

    console.log('📤 Sending request to Creem API...\n');
    console.log('Endpoint: https://api.creem.io/v1/checkouts');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');

    const response = await axios.post(
      'https://api.creem.io/v1/checkouts',
      payload,
      {
        headers: {
          'x-api-key': CREEM_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS!\n');
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');
    console.log('🎉 Checkout URL:', response.data.checkout_url);
    console.log('📋 Session ID:', response.data.id);
    
  } catch (error) {
    console.log('❌ ERROR!\n');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');
    
    if (error.response?.status === 404) {
      console.log('💡 Tip: Check if the API endpoint is correct');
      console.log('   Correct: /v1/checkouts');
      console.log('   Wrong: /v1/checkout/sessions');
    } else if (error.response?.status === 500) {
      console.log('💡 Tip: Check if all required fields are present');
      console.log('   Required: product_id, units, success_url');
    } else if (error.response?.status === 401) {
      console.log('💡 Tip: Check if the API key is valid');
    }
  }
}

testCreemCheckout();

