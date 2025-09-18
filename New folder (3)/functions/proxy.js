const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    const url = (event.queryStringParameters && event.queryStringParameters.url) || '';
    if(!url) return { statusCode: 400, body: 'Missing url parameter' };
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if(!res.ok) return { statusCode: 400, body: 'Failed to fetch media' };
    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const buffer = await res.buffer();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400'
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch(err) {
    return { statusCode: 500, body: 'Proxy error: ' + err.message };
  }
};
