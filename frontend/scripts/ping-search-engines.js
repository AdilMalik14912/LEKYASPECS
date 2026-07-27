const https = require('https');

const SITEMAP_URL = 'https://lekya.in/sitemap.xml';

const searchEngines = [
  { name: 'Google Search Indexer', url: `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}` },
  { name: 'Bing Webmaster Indexer', url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}` }
];

console.log(`🚀 Initiating Automated Indexing Request for ${SITEMAP_URL}...`);

searchEngines.forEach(engine => {
  https.get(engine.url, (res) => {
    console.log(`✅ [${engine.name}] Response Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`❌ [${engine.name}] Error:`, err.message);
  });
});
