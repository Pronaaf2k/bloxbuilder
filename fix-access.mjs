const data = JSON.stringify({
  schemaId: 'SitePageLayout',
  operation: 0,
  policyType: 0,
  accessLevel: 0
});

fetch('https://api.seliseblocks.com/uds/v1/pbhtqy/data-access/security/change', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-blocks-key': 'P98661d272d2e430bae1d379f0ac3559c',
  },
  body: data
})
  .then(res => {
    console.log('Status:', res.status);
    return res.text();
  })
  .then(body => {
    console.log('Body:', body);
  })
  .catch(err => {
    console.error('Error:', err.message);
  });
