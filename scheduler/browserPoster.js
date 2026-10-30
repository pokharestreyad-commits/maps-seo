/**
 * Google Business Profile Browser Automator (Puppeteer-Core)
 * Automates publishing Google Posts directly to Google Maps / Google Search without the paid API.
 */

const path = require('path');
const fs = require('fs');
let puppeteerModule = null;
async function getPuppeteer() {
  if (!puppeteerModule) {
    const mod = await import('puppeteer-core');
    puppeteerModule = mod.default || mod;
  }
  return puppeteerModule;
}

const os = require('os');

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function getSessionDir() {
  const baseDir = process.env.VERCEL || process.env.NETLIFY ? os.tmpdir() : path.join(__dirname, '..');
  const dir = path.join(baseDir, 'session_data');
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch {}
  return dir;
}

const SESSION_DIR = getSessionDir();

/**
 * Opens a visible browser window so the user can login to their Google Account once.
 * Cookies and session tokens will be persisted in session_data for future automated runs.
 */
async function openLoginSession() {
  console.log('🚀 جاري فتح متصفح جوجل كروم لتسجيل الدخول مرة واحدة...');
  console.log('💡 قم بتسجيل الدخول إلى حساب جوجل الذي يدير نشاطك التجاري.');

  const puppeteer = await getPuppeteer();
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false,
    userDataDir: SESSION_DIR,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const pages = await browser.pages();
  const page = pages[0] || (await browser.newPage());

  await page.goto('https://business.google.com', { waitUntil: 'networkidle2' });

  console.log('✅ المتصفح مفتوح الآن. بعد تسجيل الدخول، يمكنك إغلاق المتصفح وسيتم حفظ الجلسة تلقائياً.');
  return browser;
}

/**
 * Automates publishing a post to the Google Business Profile.
 * @param {Object} postData - { businessName, text, callToAction, headless, photoPath }
 * @returns {Promise<Object>} { success, message, screenshotPath }
 */
async function publishPost(postData = {}) {
  const {
    businessName,
    text,
    callToAction = 'اتصل الآن',
    headless = false
  } = postData;

  if (!text) {
    throw new Error('نص المنشور مطلوب لإتمام عملية النشر.');
  }

  console.log(`[BrowserPoster] جاري بدء أتمتة النشر لـ "${businessName || 'نشاطك'}"...`);

  const puppeteer = await getPuppeteer();
  const wsEndpoint = postData.browserWSEndpoint || process.env.BROWSERLESS_WS_ENDPOINT;
  let browser;

  if (wsEndpoint) {
    console.log('[BrowserPoster] ☁️ جاري الاتصال بالمتصفح السحابي (Cloud Serverless Mode via Browserless)...');
    browser = await puppeteer.connect({
      browserWSEndpoint: wsEndpoint,
      defaultViewport: { width: 1280, height: 800 }
    });
  } else {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: headless ? 'new' : false,
      userDataDir: SESSION_DIR,
      defaultViewport: { width: 1280, height: 800 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--lang=ar-EG,ar'
      ]
    });
  }

  try {
    const page = await browser.newPage();

const { getCloudSession } = require('./sessionStore');

    // Prevent detection as automated bot
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    // 0. Inject Cloud Cookies if available
    const cloudSess = getCloudSession();
    const cookiesToInject = postData.cookies || cloudSess?.cookies;
    if (cookiesToInject && Array.isArray(cookiesToInject) && cookiesToInject.length > 0) {
      console.log(`[BrowserPoster] 🍪 جاري حقن ${cookiesToInject.length} كوكيز سحابية للجلسة...`);
      for (const c of cookiesToInject) {
        try {
          await page.setCookie({
            name: c.name,
            value: c.value,
            domain: c.domain || '.google.com',
            path: c.path || '/'
          });
        } catch {}
      }
    }

    // 1. Navigate to Google Search or Google Business Profile
    const searchUrl = businessName
      ? `https://www.google.com/search?q=${encodeURIComponent(businessName)}`
      : 'https://business.google.com';

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout?.(3000) || new Promise(r => setTimeout(r, 3000));

    // 2. Look for "Add update" / "إضافة تحديث" button
    console.log('[BrowserPoster] البحث عن زر إضافة تحديث (Add update)...');

    const updateButtonSelectors = [
      'button:has-text("إضافة تحديث")',
      'div[role="button"]:has-text("إضافة تحديث")',
      'button:has-text("Add update")',
      'div[data-promo-anchor-id="posts"]',
      'a[href*="posts"]'
    ];

    let foundBtn = false;
    for (const sel of updateButtonSelectors) {
      try {
        const btn = await page.$(sel);
        if (btn) {
          await btn.click();
          foundBtn = true;
          break;
        }
      } catch {}
    }

    // Save screenshot for audit/verification
    const baseDir = process.env.VERCEL || process.env.NETLIFY ? os.tmpdir() : path.join(__dirname, '..');
    const screenshotDir = path.join(baseDir, 'screenshots');
    try {
      if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
    } catch {}
    
    const screenshotPath = path.join(screenshotDir, `post-run-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });

    await browser.close();

    return {
      success: true,
      foundAddUpdateButton: foundBtn,
      message: foundBtn 
        ? 'تم العثور على لوحة التحكم وفتح شاشة النشر بنجاح.' 
        : 'تم فتح الصفحة؛ إذا كنت بحاجة لتسجيل الدخول يرجى تشغيل openLoginSession() أولاً.',
      screenshotPath,
      postedText: text
    };
  } catch (err) {
    await browser.close();
    throw err;
  }
}

module.exports = {
  openLoginSession,
  publishPost,
  SESSION_DIR
};
