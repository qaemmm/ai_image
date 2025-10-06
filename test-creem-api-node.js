// Creem API diagnostic script without external deps
// Usage: node test-creem-api-node.js

import fs from 'fs';
import path from 'path';

// Minimal .env loader (no dependencies)
function loadEnv(envPath) {
  const abs = path.resolve(envPath);
  if (!fs.existsSync(abs)) {
    console.warn('ENV file not found at', abs);
    return;
  }
  const lines = fs.readFileSync(abs, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    if (!(k in process.env)) process.env[k] = v;
  }
}

loadEnv('.env.local');

const CREEM_API_KEY = process.env.CREEM_API_KEY || '';
const PRODUCT_ID = 'prod_2WXLA8gc9V8fEBXEWwSF7X'; // pro yearly (example)

console.log('\n===== Creem API Diagnostic (No Deps) =====');
console.log('ENV path:', path.resolve('.env.local'));
console.log('API Key present:', !!CREEM_API_KEY);
console.log('API Key (full):', CREEM_API_KEY);
console.log('API Key length:', CREEM_API_KEY.length);
console.log('Has whitespace:', /\s/.test(CREEM_API_KEY));
console.log('==========================================\n');

if (!CREEM_API_KEY) {
  console.error('Missing CREEM_API_KEY in .env.local');
  process.exit(1);
}

async function httpJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, statusText: res.statusText, headers: Object.fromEntries(res.headers.entries()), data };
}

async function postJson(url, body, headers = {}) {
  return httpJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
}

async function getJson(url, headers = {}) {
  return httpJson(url, { method: 'GET', headers });
}

async function run() {
  // A) Sanity check: list products
  console.log('GET https://api.creem.io/v1/products');
  let res = await getJson('https://api.creem.io/v1/products', { 'x-api-key': CREEM_API_KEY });
  console.log('→ Status:', res.status, res.statusText);
  if (!res.ok) console.log('→ Body:', typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));

  // B) Get specific product
  console.log(`\nGET https://api.creem.io/v1/products/${PRODUCT_ID}`);
  res = await getJson(`https://api.creem.io/v1/products/${PRODUCT_ID}`, { 'x-api-key': CREEM_API_KEY });
  console.log('→ Status:', res.status, res.statusText);
  if (!res.ok) console.log('→ Body:', typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));

  // C) Try checkout
  const payload = { product_id: PRODUCT_ID, units: 1, success_url: 'https://example.com/success' };
  console.log('\nPOST https://api.creem.io/v1/checkouts');
  console.log('Payload:', JSON.stringify(payload));
  res = await postJson('https://api.creem.io/v1/checkouts', payload, { 'x-api-key': CREEM_API_KEY });

  if (!res.ok) {
    console.log('\n❌ Request failed');
    console.log('Status:', res.status);
    console.log('Status Text:', res.statusText);
    console.log('Response:', typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));
    return;
  }

  console.log('\n✅ Request succeeded');
  console.log('Response:', JSON.stringify(res.data, null, 2));
}

run().catch(err => {
  console.error('Unexpected error:', err);
});

