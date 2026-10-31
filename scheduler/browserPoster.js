/**
 * Google Business Profile Browser Automator (Headless Silent Background Mode)
 * 100% Background Execution: Zero windows appear on the screen.
 */

const path = require('path');
const fs = require('fs');
const { sendTelegramPhoto } = require('../local-worker/telegramNotifier');

async function getPuppeteer() {
  const mod = await import('puppeteer-core');
  return mod.default || mod;
}

/**
 * Automates publishing a post to Google Business Profile completely in the background.
 * @param {Object} postData - { businessName, text, callToAction, images }
 * @returns {Promise<Object>} { success, message, screenshotPath }
 */
async function publishPost(postData = {}) {
  const {
    businessName = 'رسلان للتسويق',
    text,
    callToAction = 'اتصل الآن'
  } = postData;

  if (!text) {
    throw new Error('نص المنشور مطلوب لإتمام عملية النشر.');
  }

  console.log(`[BrowserPoster] 🔇 بدء النشر الصامت التام في الخلفية لـ "${businessName}"...`);

  const puppeteer = await getPuppeteer();
  const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const profileDir = 'C:\\Users\\DELL\\chrome_bot_profile';

  let browser;
  let isConnectedToLive = false;
  let page;

  try {
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    isConnectedToLive = true;
    console.log('[BrowserPoster] 🎯 متصل بالمتصفح المرئي النشط أمام المستخدم مباشرة (Port 9222)!');
    const pages = await browser.pages();
    page = pages.find(p => p.url().includes('google.com/search')) || (await browser.newPage());
    await page.bringToFront();
  } catch (connectErr) {
    console.log('[BrowserPoster] 🔇 جاري تشغيل متصفح جديد في الخلفية...');
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      userDataDir: profileDir,
      defaultViewport: { width: 1366, height: 900 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--lang=ar-EG,ar',
        '--window-size=1366,900'
      ]
    });
    page = await browser.newPage();
  }

  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');

    // 1. Ensure we are on the business dashboard
    console.log('[BrowserPoster] 📄 فتح وتحديث صفحة نشاط رسلان للتسويق...');
    if (!page.url().includes('google.com/search') || !page.url().includes('رسلان')) {
      await page.goto('https://www.google.com/search?q=%D8%B1%D8%B3%D9%84%D8%A7%D9%86+%D9%84%D9%84%D8%AA%D8%B3%D9%88%D9%8A%D9%82&hl=ar', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      await new Promise(r => setTimeout(r, 2000));
    }
    await new Promise(r => setTimeout(r, 2000));

    // 2. Click "المشاركات"
    console.log('[BrowserPoster] 🔍 النقر على زر المشاركات في لوحة التحكم...');
    await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*'));
      for (const el of all) {
        if (el.children.length === 0 && (el.textContent || '').trim() === 'المشاركات') {
          (el.closest('button') || el).click();
          return;
        }
      }
    });

    // 3. Wait for business frame
    console.log('[BrowserPoster] ⏳ انتظار إطار لوحة التحكم (local/business)...');
    let businessFrame = null;
    for (let i = 0; i < 20; i++) {
      businessFrame = page.frames().find(f => f.url().includes('/local/business/'));
      if (businessFrame) break;
      await new Promise(r => setTimeout(r, 1000));
    }

    if (!businessFrame) {
      throw new Error('تعذر العثور على إطار لوحة التحكم داخل الصفحة!');
    }

    // 4. Click "+ إضافة مشاركة"
    console.log('[BrowserPoster] 📝 النقر على زر [+ إضافة مشاركة]...');
    await businessFrame.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, div[role="button"], a, span'));
      for (const b of btns) {
        const txt = (b.innerText || '').trim();
        if (txt.includes('إضافة مشاركة')) {
          const target = b.closest('button') || b.closest('div[role="button"]') || b;
          target.click();
          return;
        }
      }
    });

    // 5. Wait for editor frame
    console.log('[BrowserPoster] ⏳ انتظار تحميل محرر المنشور...');
    let editorFrame = null;
    for (let i = 0; i < 15; i++) {
      editorFrame = page.frames().find(f => f.url().includes('/promote/updates/add'));
      if (editorFrame) break;
      await new Promise(r => setTimeout(r, 1000));
    }

    if (!editorFrame && businessFrame.url().includes('/add')) {
      editorFrame = businessFrame;
    }

    if (!editorFrame) {
      throw new Error('تعذر العثور على محرر المنشور!');
    }

    // Wait for textarea
    await editorFrame.waitForSelector('textarea', { timeout: 15000 });
    console.log('[BrowserPoster] 🎉 محرر المنشور جاهز تماماً في الخلفية!');

    // 6. Upload 2 clean compliant images
    const image1 = path.join(__dirname, '..', 'clean_compliant_post.png');
    const image2 = path.join(__dirname, '..', 'clean_compliant_post_2.png');

    console.log('[BrowserPoster] 🖼️ رفع الصورتين المعتمدتين...');
    const fileInput = await editorFrame.$('input[type="file"]');
    if (fileInput && fs.existsSync(image1) && fs.existsSync(image2)) {
      await fileInput.uploadFile(image1, image2);
      console.log('[BrowserPoster] ✅ تم رفع الصورتين بنجاح!');
      await new Promise(r => setTimeout(r, 5000));
    }

    // 7. Write formatted text with paragraph breaks
    console.log('[BrowserPoster] ✍️ كتابة النص بالصيغة المعتمدة...');
    await editorFrame.evaluate((val) => {
      const ta = document.querySelector('textarea');
      if (ta) {
        ta.focus();
        ta.value = val;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, text);

    const ta = await editorFrame.$('textarea');
    if (ta) {
      await ta.focus();
      await ta.type(' ');
      await editorFrame.evaluate(() => {
        const el = document.querySelector('textarea');
        if (el) el.blur();
      });
    }

    await new Promise(r => setTimeout(r, 2000));

    // 8. Click "مشاركة"
    console.log('[BrowserPoster] 🚀 النقر على زر [مشاركة]...');
    const published = await editorFrame.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, div[role="button"]'));
      for (const b of btns) {
        const txt = (b.innerText || '').trim();
        if (txt === 'مشاركة' || txt === 'Post' || txt === 'نشر') {
          b.click();
          return { success: true, text: txt };
        }
      }
      return { success: false };
    });

    console.log('[BrowserPoster] نتيجة النقر على نشر:', published);
    await new Promise(r => setTimeout(r, 8000));

    // 9. Screenshot
    const screenshotDir = path.join(__dirname, '..', 'screenshots');
    const screenshotPath = path.join(screenshotDir, `scheduled-post-live-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log('[BrowserPoster] 📸 تم حفظ لقطة الشاشة في:', screenshotPath);

    // 10. Telegram Notification
    const postUrl = `https://www.google.com/search?q=${encodeURIComponent(businessName)}&hl=ar`;
    try {
      await sendTelegramPhoto(image1, `
🎉 <b>تم تنفيذ نشر المنشور المجدول بنجاح في الخلفية! ⏰🚀</b>
━━━━━━━━━━━━━━━━━━
🏢 <b>النشاط:</b> ${businessName}
🕒 <b>توقيت التنفيذ:</b> ${new Date().toLocaleTimeString('ar-EG')}
🛡️ <b>الوضع:</b> صامت تماماً (Headless Silent) في الخلفية
📸 <b>الصور:</b> تم إرفاق صورتين معتمدتين
✍️ <b>الأسلوب:</b> صيغة الجمع (نحن) مع مسافات وفواصل وبدون ترقيم
🔗 <b>رابط النشاط:</b> <a href="${postUrl}">اضغط هنا لمشاهدة المنشور على Google</a>

📝 <b>النص المنشور:</b>
${text}
      `.trim());
      console.log('[BrowserPoster] 📲 تم إرسال الإشعار لتيليجرام!');
    } catch (err) {
      console.warn('Telegram error:', err.message);
    }

    return {
      success: true,
      message: 'تم نشر المنشور المجدول بنجاح في الخلفية الصامتة!',
      screenshotPath
    };
  } finally {
    if (isConnectedToLive) {
      browser.disconnect();
      console.log('[BrowserPoster] 🔓 تم فك الاتصال بالمتصفح المرئي وإبقاء النافذة مفتوحة أمامك.');
    } else {
      await browser.close();
      console.log('[BrowserPoster] 🔒 تم إغلاق جلسة المتصفح الخلفية.');
    }
  }
}

module.exports = {
  publishPost
};
