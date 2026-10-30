/**
 * Maps SEO Pro - Vercel Cloud Cron Automated Post Publisher
 * Endpoint triggered automatically by Vercel Cron or webhook:
 * GET/POST /api/cron-publish
 */

const { processNextPendingPost, getQueueStats } = require('../scheduler/queueManager');
const { isCloudSessionActive, getCloudSession } = require('../scheduler/sessionStore');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('[CloudCron] ⏰ تم استدعاء دالة النشر السحابية التلقائية...');

  try {
    const stats = getQueueStats();
    console.log(`[CloudCron] حالة جدول الانتظار: [معلق: ${stats.pending} | إجمالي: ${stats.total}]`);

    if (stats.pending === 0) {
      return res.status(200).json({
        success: true,
        message: 'لا توجد منشورات معلقة في جدول الانتظار حالياً.',
        stats
      });
    }

    const sessionActive = isCloudSessionActive();
    const sess = getCloudSession();

    console.log(`[CloudCron] فحص الجلسة السحابية: ${sessionActive ? 'متصلة وبها ' + sess.cookiesCount + ' كوكيز' : 'غير متصلة'}`);

    // Execute automated publishing in headless cloud mode
    const wsEndpoint = process.env.BROWSERLESS_WS_ENDPOINT || (process.env.BROWSERLESS_API_KEY ? `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}` : null);

    const publishResult = await processNextPendingPost({
      headless: true,
      browserWSEndpoint: wsEndpoint,
      cookies: sess?.cookies || []
    });

    console.log('[CloudCron] ✅ تم إنهاء محاولة النشر بنجاح:', publishResult);

    return res.status(200).json({
      success: true,
      message: 'تم تنفيذ مهمة النشر السحابية التلقائية بنجاح!',
      sessionActive,
      result: publishResult
    });
  } catch (err) {
    console.error('[CloudCron Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'حدث خطأ أثناء تنفيذ النشر السحابي التلقائي',
      tip: 'إذا تطلب جوجل إعادة التحقق، يمكنك تحديث الكوكيز من لوحة التحكم في الموقع.'
    });
  }
};
