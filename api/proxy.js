const https = require('https');

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwAQFrSuwnW0MB1-9I8byO3taexGc9NIVvkwDr00IVYg-YEMx7EaF3vu5T_APZ1FMPHhQ/exec';

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
    const data = await new Promise((resolve, reject) => {
      https.get(url, (response) => {
        let body = '';
        response.on('data', chunk => body += chunk);
        response.on('end', () => resolve(body));
        response.on('error', reject);
      }).on('error', reject);
    });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(data);

  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
