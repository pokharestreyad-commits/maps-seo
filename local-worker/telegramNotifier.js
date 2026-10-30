/**
 * Maps SEO Pro - Telegram Bot Notification Engine
 * Sends real-time alerts, post confirmations with photos, missed-post alerts, and schedule reminders.
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const l of lines) {
      const trimmed = l.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > -1) {
        const k = trimmed.substring(0, idx).trim();
        const v = trimmed.substring(idx + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
}
loadEnv();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9291089590:AAE1BG9KgitzmIOU3gRmS3D2VgsN9DID4VI';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1077637435';

/**
 * Sends a text message to Telegram with Markdown or HTML formatting.
 */
async function sendTelegramMessage(text, options = {}) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: options.parseMode || 'HTML',
        disable_web_page_preview: options.disablePreview ?? false,
        reply_markup: options.replyMarkup
      })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('[Telegram Error]:', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Sends a photo to Telegram with a caption.
 */
async function sendTelegramPhoto(imageBufferOrBase64OrUrl, caption = '', options = {}) {
  // If base64 or URL
  if (typeof imageBufferOrBase64OrUrl === 'string' && imageBufferOrBase64OrUrl.startsWith('http')) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          photo: imageBufferOrBase64OrUrl,
          caption,
          parse_mode: 'HTML'
        })
      });
      return await res.json();
    } catch (err) {
      return sendTelegramMessage(`${caption}\n\n[تعذر إرسال الصورة: ${err.message}]`);
    }
  }

  // If local file path
  if (typeof imageBufferOrBase64OrUrl === 'string' && fs.existsSync(imageBufferOrBase64OrUrl)) {
    try {
      const fileBuffer = fs.readFileSync(imageBufferOrBase64OrUrl);
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      
      let body = '';
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="chat_id"\r\n\r\n${CHAT_ID}\r\n`;
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n`;
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="parse_mode"\r\n\r\nHTML\r\n`;
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="photo"; filename="screenshot.png"\r\n`;
      body += `Content-Type: image/png\r\n\r\n`;

      const preBuffer = Buffer.from(body, 'utf8');
      const postBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
      const fullBuffer = Buffer.concat([preBuffer, fileBuffer, postBuffer]);

      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
        body: fullBuffer
      });
      return await res.json();
    } catch (err) {
      console.error('[Telegram Photo Error]:', err.message);
      return sendTelegramMessage(`${caption}`);
    }
  }

  // Fallback to text message
  return sendTelegramMessage(caption);
}

/**
 * 1. Startup Notification (when Windows boots)
 */
async function notifyStartup(stats = {}) {
  const text = `
🟢 <b>تم إقلاع نظام Maps SEO Pro المحلي بنجاح! 🚀</b>
━━━━━━━━━━━━━━━━━━
🏢 <b>النشاط التجاري:</b> رسلان للتسويق
💻 <b>حالة الروبوت المحلي:</b> متصل ويعمل في الخلفية
📊 <b>حالة الجدول الحالية:</b>
 • إجمالي المهام: ${stats.total || 0}
 • قيد الانتظار: ${stats.pending || 0}
 • تم نشرها: ${stats.published || 0}

⚡ <i>يقوم الروبوت بمراقبة المواعيد تلقائياً وتعويض أي مهام فائتة أثناء إغلاق الكمبيوتر.</i>
  `.trim();

  return sendTelegramMessage(text, {
    replyMarkup: {
      inline_keyboard: [
        [{ text: '🌐 فتح لوحة التحكم السحابية', url: 'https://seo.raslans.net' }]
      ]
    }
  });
}

/**
 * 2. Missed Posts Catch-Up Notification
 */
async function notifyMissedCatchUp(count) {
  const text = `
⚠️ <b>تنبيه: اكتشاف منشورات فائتة أثناء إغلاق الكمبيوتر!</b>
━━━━━━━━━━━━━━━━━━
اكتشف الروبوت المحلي وجود <b>${count}</b> منشورات كان موعد جدولتها أثناء إغلاق الجهاز.
⏳ <b>الإجراء:</b> جاري الآن تشغيل المتصفح وتعويض نشرها تلقائياً على خرائط Google فوراً دون أي تدخل منك! 🚀
  `.trim();

  return sendTelegramMessage(text);
}

/**
 * 3. Successful Post Published Notification (with Photo)
 */
async function notifyPostPublished(post, screenshotPath = null) {
  const caption = `
✅ <b>تم نشر منشور جديد بنجاح في خرائط Google! 📸🎉</b>
━━━━━━━━━━━━━━━━━━
🏢 <b>النشاط:</b> ${post.businessName || 'رسلان للتسويق'}
📌 <b>النوع:</b> ${post.type || 'تحديث أسبوعي'}
⏰ <b>موعد التنفيذ:</b> ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
📞 <b>زر الإجراء:</b> <code>${post.callToAction || 'اتصل الآن'}</code>

📝 <b>محتوى المنشور:</b>
${(post.body || post.hook || '').slice(0, 300)}...

🌐 <a href="https://www.google.com/search?q=%D8%B1%D8%B3%D9%84%D8%A7%D9%86+%D9%84%D9%84%D8%AA%D8%B3%D9%88%D9%8A%D9%82">عرض بطاقة النشاط على Google Search</a>
  `.trim();

  if (screenshotPath && fs.existsSync(screenshotPath)) {
    return sendTelegramPhoto(screenshotPath, caption);
  } else if (post.imageUrl && post.imageUrl.startsWith('http')) {
    return sendTelegramPhoto(post.imageUrl, caption);
  } else {
    return sendTelegramMessage(caption);
  }
}

/**
 * 4. Upcoming Next Post Reminder
 */
async function notifyUpcomingReminder(nextPost) {
  if (!nextPost) return;
  const dateFormatted = nextPost.scheduledDateFormatted || (nextPost.scheduledFor ? new Date(nextPost.scheduledFor).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' }) : 'قريباً');
  
  const text = `
⏰ <b>تذكير بموعد المنشور القادم (Upcoming Schedule)</b>
━━━━━━━━━━━━━━━━━━
📅 <b>الموعد المجدول:</b> ${dateFormatted}
📌 <b>النوع:</b> ${nextPost.type || 'تحديث أسبوعي'}
📝 <b>المحتوى:</b> ${(nextPost.body || nextPost.hook || '').slice(0, 150)}...
📞 <b>زر الإجراء:</b> ${nextPost.callToAction || 'اتصل الآن'}

💡 <b>ملاحظة:</b> <i>احرص على فتح جهاز الكمبيوتر قبل هذا الموعد أو تركه قيد التشغيل ليتمكن الروبوت من النشر الآلي التلقائي. (وإذا كان مغلقاً، سينشره فور تشغيل الجهاز لاحقاً).</i>
  `.trim();

  return sendTelegramMessage(text, {
    replyMarkup: {
      inline_keyboard: [
        [{ text: '📋 استعراض كل المنشورات المجدولة', url: 'https://seo.raslans.net' }]
      ]
    }
  });
}

/**
 * 5. General Optimization Action Notification (Description, Reviews, Categories)
 */
async function notifyOptimizationAction(actionName, details, scoreGain = 10) {
  const text = `
⚡ <b>تم تطبيق تحسين سيو ناجح في ملف Google Maps! ✨</b>
━━━━━━━━━━━━━━━━━━
🛠️ <b>نوع الإجراء:</b> ${actionName}
🎯 <b>النقاط المكتسبة:</b> +${scoreGain} نقطة سيو
📋 <b>التفاصيل:</b> ${details}
🏆 <b>الحالة:</b> مؤكد ومنفذ في خوادم Google عبر الجلسة المعتمدة.
  `.trim();

  return sendTelegramMessage(text);
}

module.exports = {
  sendTelegramMessage,
  sendTelegramPhoto,
  notifyStartup,
  notifyMissedCatchUp,
  notifyPostPublished,
  notifyUpcomingReminder,
  notifyOptimizationAction
};
