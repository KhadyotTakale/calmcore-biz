const https = require('https');

const BASE_URL = 'https://api.elegant.ux.wimsup.com';
const HEADERS = {
  'X-Elegant-Domain': 'mrudgandh.in',
  'X-Elegant-Auth': 'b7e1d4f2-2c9a-4a8e-bd3f-6c1e9a2f7d8c',
  'Content-Type': 'application/json'
};

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { ...options, headers: { ...HEADERS, ...options.headers } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  console.log('1. Getting Public Token...');
  const authRes = await request(BASE_URL + '/auth/me');
  console.log('Auth Status:', authRes.status);
  const authData = JSON.parse(authRes.body);
  const token = authData.authToken;
  console.log('Token received:', !!token);

  console.log('\n2. Fetching Booking by Slug (WITH TOKEN)...');
  const slug = 'xu518351o42l';
  const bookingRes = await request(BASE_URL + '/booking_by_slug/' + slug, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log('Booking Status:', bookingRes.status);
  console.log('Booking Body:', bookingRes.body);

  if (JSON.parse(bookingRes.body).length === 0) {
      console.log('\n3. Fetching Booking by Slug (WITHOUT TOKEN)...');
      const bookingResNoAuth = await request(BASE_URL + '/booking_by_slug/' + slug);
      console.log('Booking Status (No Auth):', bookingResNoAuth.status);
      console.log('Booking Body (No Auth):', bookingResNoAuth.body);
  }
}

run();
