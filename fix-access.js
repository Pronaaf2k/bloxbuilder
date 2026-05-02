const https = require('https');

const data = JSON.stringify({
  schemaId: 'SitePageLayout',
  operation: 0,
  policyType: 0,
  accessLevel: 0
});

const options = {
  hostname: 'api.seliseblocks.com',
  port: 443,
  path: '/uds/v1/pbhtqy/data-access/security/change',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-blocks-key': 'P98661d272d2e430bae1d379f0ac3559c',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(data);
req.end();
