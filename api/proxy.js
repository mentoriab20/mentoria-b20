const https = require('https');

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwAQFrSuwnW0MB1-9I8byO3taexGc9NIVvkwDr00IVYg-YEMx7EaF3vu5T_APZ1FMPHhQ/exec';

function fetchFollow(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error('Too many redirects'));

    https.get(url, (res) => {
      // Segue redirect automaticamente
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchFollow(res.headers.location, redirectCount + 1)
          .then(resolve)
          .catch(reject);
      }

      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
      res.on('error', reject);
    }).on('error', reject);
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const params = req.query || {};
  const query  = Object.keys(params)
    .map(k => k + '=' + encodeURIComponent(params[k]))
    .join('&');
  const url = SCRIPT_URL + (query ? '?' + query : '');

  try {
    const data = await fetchFollow(url);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(data);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
