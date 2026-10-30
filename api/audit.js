/**
 * Serverless API Handler for Vercel & Netlify
 * Accepts POST requests with a Google Maps URL, Place ID, or raw data,
 * and returns the complete Local SEO audit, competitor gap analysis, and AI recommendations.
 */

const fs = require('fs');
const path = require('path');

// Auto-load .env in development
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        if (!process.env[k.trim()]) {
          process.env[k.trim()] = v.join('=').trim();
        }
      }
    }
  }
}
loadEnv();

const { auditWithCompetitors, auditFromInput, auditPlaceWithAi } = require('../index');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Only POST method is allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { url, placeData, competitors, enableAi = true, options = {} } = body;

    let result;

    if (competitors && Array.isArray(competitors) && competitors.length > 0) {
      // Comparison audit mode
      const target = placeData || { name: url || 'نشاط تجاري' };
      result = await auditWithCompetitors(target, competitors, { ...options, enableAi });
    } else if (url) {
      // Direct URL / Place ID input
      result = await auditFromInput(url, { ...options, enableAi });
    } else if (placeData) {
      // Raw data provided
      result = await auditPlaceWithAi(placeData, { ...options, enableAi });
    } else {
      return res.status(400).json({
        success: false,
        error: 'الرجاء إدخال رابط خرائط جوجل أو بيانات النشاط التجاري.'
      });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('[API Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'حدث خطأ أثناء معالجة فحص خرائط جوجل.'
    });
  }
};
