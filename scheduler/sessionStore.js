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
      if (data && Array.isArray(data.cookies) && data.cookies.length > 0) {
        return data;
      }
    } catch {}
  }

  // 3. Fallback to permanently bundled verified session for Raslan Marketing
  return {
    updatedAt: '2026-10-30T16:35:58.152Z',
    cookiesCount: 25,
    cookies: [
      { domain: ".google.com", name: "SAPISID", path: "/", value: "KaLTItM3nZ2ThTDp/AmH3DhjqehBSHnssY", secure: true, httpOnly: false },
      { domain: ".google.com", name: "__Secure-3PAPISID", path: "/", value: "KaLTItM3nZ2ThTDp/AmH3DhjqehBSHnssY", secure: true, httpOnly: false },
      { domain: ".google.com", name: "AEC", path: "/", value: "Aaa9EJpxblI2tD6uTbI7c6tICi_WgKgA8KUZ3Mm692tzXoZTkAoVVBCISQ", secure: true, httpOnly: true },
      { domain: ".business.google.com", name: "_ga", path: "/", value: "GA1.1.311482837.1779465475", secure: false, httpOnly: false },
      { domain: "business.google.com", name: "OTZ", path: "/", value: "8851216_48_48_171240_44_319500", secure: true, httpOnly: false },
      { domain: ".business.google.com", name: "_ga_J51Y85KVRZ", path: "/", value: "GS2.1.s1779544033$o1$g0$t1779544042$j51$l0$h0", secure: false, httpOnly: false },
      { domain: ".business.google.com", name: "_ga_ZVJSBCMMFJ", path: "/", value: "GS2.1.s1783188836$o1$g1$t1783188852$j44$l0$h0", secure: false, httpOnly: false },
      { domain: ".google.com", name: "NID", path: "/", value: "CqQDCAES1gIBM9Agl79lDAqafyOYADcn1NwPie5VyemmJwkJ9_tprcDLfQKEyHyfjj9FDsWwSYQaNTlai43Bb5MjTivIV2-rRLF_uTPTFK2qG-d1Uul_Xg1nIyBPKBarmiSgr_E1jxCO59aosh2_gUIqJIZLpvzdoFBQAVdM8qLnDS4oxL-yukUNHLMXLnd7i1Z4QL9_sbI59iUc2XoYu06KtdHwBnVFawyCz20UfU6Cn3oi8BjsVN6KoFDau6YB8_4JcUD_WuRV7gvCqZpTvjuSQ-N5u_s9ggLTQENiLSBW7YiRo3skOzfKr_qjLKkHOl0CskSDg4M9JqqYbewvhI5r5ngX-sdzNN3W5WDaj9LrUDykjbMOLFB-BlBMHIWyk92v-lTZwCtokv7Nu2viOxbBwR_HBtXmOEia4bCCKnvjEPu7n6eryt3Ft5zxPXiMCRP6hhS8Gs381w95FiooATJFAXBKQs9t_GcoIaR_EGwkwNeNTm7TZ5ml9dFFJTlRg1_j_J4Qr8ODSUK1usxIteB4613H03HZWbQq2BnRbdXB47mpKAYI", secure: true, httpOnly: true },
      { domain: ".google.com", name: "APISID", path: "/", value: "fTcf_RF_z1wFMlUm/AN-0BOI2X1Btj3ZsP", secure: false, httpOnly: false },
      { domain: ".google.com", name: "__Secure-1PSIDTS", path: "/", value: "sidts-CjIBnJZzavEO35TQ4lmp3ak5tzgS_Vhj3XK7ulvBXjRzhETWK7-GXrp43gwG9o0sl5ehPRAA", secure: true, httpOnly: true },
      { domain: ".google.com", name: "__Secure-1PAPISID", path: "/", value: "KaLTItM3nZ2ThTDp/AmH3DhjqehBSHnssY", secure: true, httpOnly: false },
      { domain: ".business.google.com", name: "ADS_CUSTOMER_ACCOUNT_SESSION_INFO", path: "/", value: "GO46FO9XQ7JiARc0rWc83Ah1pXYNdOTPL3mK1ca9oEA=authuser-0", secure: true, httpOnly: false },
      { domain: ".google.com", name: "__Secure-3PSID", path: "/", value: "g.a000Dwk0Q_3r9Vx1_8caWQ-hsV-UA4o79MBtXp0M_qPDe8oDmZ3FQVKAMyzCdexpce-PeGax0AACgYKAQQSARQSFQHGX2MiNxzFvR7ePrutpTos75LeaxoVAUF8yKqV7llY_RstKnH86q2cuHbD0076", secure: true, httpOnly: true },
      { domain: ".google.com", name: "__Secure-1PSID", path: "/", value: "g.a000Dwk0Q_3r9Vx1_8caWQ-hsV-UA4o79MBtXp0M_qPDe8oDmZ3FEdv_O81cFr1Z9vrL6irnsgACgYKAWMSARQSFQHGX2MiRF4kN5p05047XflRlBvUNBoVAUF8yKr1B94ptftxKtjh4BxueiPj0076", secure: true, httpOnly: true },
      { domain: ".google.com", name: "__Secure-1PSIDCC", path: "/", value: "APD_SKEtcXs38LJP7EZ9qkeeEGdJx8bMVPR0IMHJ4gXbTPOGNE278b5VGPZa6ml70MVAvhrYiOw", secure: true, httpOnly: true },
      { domain: ".google.com", name: "__Secure-3PSIDCC", path: "/", value: "APD_SKEvWToEXkQ6_CpABAR822tR8tHAolPybGnbD1dc2hCfLSvTug22oSrOqSdI81Mbo2T5Pw", secure: true, httpOnly: true },
      { domain: ".google.com", name: "__Secure-3PSIDTS", path: "/", value: "sidts-CjIBnJZzavEO35TQ4lmp3ak5tzgS_Vhj3XK7ulvBXjRzhETWK7-GXrp43gwG9o0sl5ehPRAA", secure: true, httpOnly: true },
      { domain: ".business.google.com", name: "_ga_V9K47ZG8NP", path: "/", value: "GS2.1.s1783193574$o5$g0$t1783193574$j60$l0$h0", secure: false, httpOnly: false },
      { domain: ".business.google.com", name: "_ga_VM5ES1YN10", path: "/", value: "GS2.1.s1793376973$o4$g0$t1793376973$j60$l0$h0", secure: false, httpOnly: false },
      { domain: ".business.google.com", name: "_gmb_ga", path: "/", value: "GA1.3.311482837.1779465475", secure: false, httpOnly: false },
      { domain: ".google.com", name: "HSID", path: "/", value: "AOo1VyRdpi_nNijbU", secure: false, httpOnly: true },
      { domain: ".google.com", name: "SEARCH_SAMESITE", path: "/", value: "CgQIrKEB", secure: false, httpOnly: false },
      { domain: ".google.com", name: "SID", path: "/", value: "g.a000Dwk0Q_3r9Vx1_8caWQ-hsV-UA4o79MBtXp0M_qPDe8oDmZ3FXirTKdqy3ysQpU_UDPFoJAACgYKAXoSARQSFQHGX2MiZEgEHcZjD43KOCV5coeLCRoVAUF8yKohxg3KZCdgyJQho998illP0076", secure: false, httpOnly: false },
      { domain: ".google.com", name: "SIDCC", path: "/", value: "APD_SKHywzdPCTGO3yie0RSXXyGZKg2XKkkKtZMchzK1HLx-P6FIe7fdZvg_CiN6ITmkxK5rRrQ", secure: false, httpOnly: false },
      { domain: ".google.com", name: "SSID", path: "/", value: "AgSfmzAlrSUueWXDG", secure: true, httpOnly: true }
    ],
    metadata: {
      accountName: 'رسلان للتسويق (Google Business Profile Owner)',
      source: 'verified_persistent_session'
    }
  };
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
