/**
 * Maps SEO Pro - Cloud Session & Cookie Store
 * Handles parsing, saving, and retrieving Google session cookies for 100% Cloud Execution.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function getSessionFilePath() {
  const baseDir = process.env.VERCEL || process.env.NETLIFY ? os.tmpdir() : path.join(__dirname, '..');
  return path.join(baseDir, 'cloud_session.json');
}

/**
 * Parses cookies whether supplied as JSON array or raw "name=value; name2=value2" header string.
 * @param {string|Array} input 
 * @returns {Array<Object>} Puppeteer-compatible cookies array
 */
function normalizeCookies(input) {
  if (!input) return [];

  // Case 1: Already an array
  if (Array.isArray(input)) {
    return input.map(c => ({
      name: c.name,
      value: c.value,
      domain: c.domain || '.google.com',
      path: c.path || '/',
      httpOnly: c.httpOnly ?? true,
      secure: c.secure ?? true,
      sameSite: c.sameSite || 'Lax'
    })).filter(c => c.name && c.value);
  }

  // Case 2: String input (either JSON string or "Cookie:" header string)
  if (typeof input === 'string') {
    const trimmed = input.trim();

    // Check if JSON
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        return normalizeCookies(parsed);
      } catch {}
    }

    // Parse raw header "SID=abc; HSID=xyz; ..."
    const pairs = trimmed.split(';');
    const cookies = [];
    for (const pair of pairs) {
      const idx = pair.indexOf('=');
      if (idx > -1) {
        const name = pair.substring(0, idx).trim();
        const value = pair.substring(idx + 1).trim();
        if (name && value) {
          cookies.push({
            name,
            value,
            domain: '.google.com',
            path: '/',
            httpOnly: true,
            secure: true
          });
        }
      }
    }
    return cookies;
  }

  return [];
}

/**
 * Saves normalized cookies to cloud session file.
 */
function saveCloudSession(cookiesInput, metadata = {}) {
  const cookies = normalizeCookies(cookiesInput);
  if (cookies.length === 0) {
    throw new Error('لم يتم العثور على أي كوكيز صالحة في المدخلات. تأكد من نسخها بشكل صحيح.');
  }

  const sessionData = {
    updatedAt: new Date().toISOString(),
    cookiesCount: cookies.length,
    cookies,
    metadata
  };

  const filePath = getSessionFilePath();
  fs.writeFileSync(filePath, JSON.stringify(sessionData, null, 2), 'utf8');
  return sessionData;
}

/**
 * Retrieves the stored cloud session.
 */
function getCloudSession() {
  // 1. Check environment variable (e.g., GitHub Actions Secret or Vercel Env)
  const envCookies = process.env.GOOGLE_SESSION_COOKIES || process.env.SESSION_COOKIES;
  if (envCookies) {
    try {
      const normalized = normalizeCookies(envCookies);
      if (normalized.length > 0) {
        return {
          updatedAt: new Date().toISOString(),
          cookiesCount: normalized.length,
          cookies: normalized,
          metadata: { source: 'environment' }
        };
      }
    } catch {}
  }

  // 2. Check cloud session file
  const filePath = getSessionFilePath();
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return data;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Checks if a valid cloud session is configured.
 */
function isCloudSessionActive() {
  const sess = getCloudSession();
  return !!(sess && Array.isArray(sess.cookies) && sess.cookies.length > 0);
}

module.exports = {
  normalizeCookies,
  saveCloudSession,
  getCloudSession,
  isCloudSessionActive,
  getSessionFilePath
};
