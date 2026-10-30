/**
 * Maps SEO Pro - Scheduled Posts Background Worker & Runner
 * ينفذ نشر المنشور التالي المعلق في جدول الانتظار في الخلفية التلقائية (Headless).
 */

const { processNextPendingPost, getQueueStats, generateMonthlyQueue } = require('./scheduler/queueManager');

async function main() {
  console.log('================================================================');
  console.log('🤖 Maps SEO Pro - محرك تنفيذ المنشورات المجدولة التلقائي');
  console.log('================================================================');

  const stats = getQueueStats();
  console.log(`📊 حالة الجدول: [إجمالي: ${stats.total} | معلق: ${stats.pending} | تم نشره: ${stats.published}]`);

  if (stats.pending === 0) {
    console.log('💡 لا توجد منشورات معلقة في جدول الانتظار.');
    console.log('⏳ جاري توليد جدول منشورات أوتوماتيكي بالذكاء الاصطناعي للأسبوع القادم...');
    await generateMonthlyQueue({
      name: 'عيادة د. حسام لطب الأسنان',
      category: 'طبيب أسنان',
      city: 'المعادي، القاهرة'
    });
    console.log('✅ تم تجهيز منشورات جديدة في الجدول!');
  }

  console.log('🚀 جاري بدء عملية النشر التلقائي في الخلفية (Headless Mode)...');

  try {
    const result = await processNextPendingPost({ headless: true });
    
    console.log('\n----------------------------------------------------------------');
    console.log('🎉 نتيجة تشغيل المنشور:');
    console.log('📌 المنشور:', result.post?.hook);
    console.log('الحالة:', result.post?.status);
    console.log('رسالة المحرك:', result.details?.message);
    if (result.details?.screenshotPath) {
      console.log('📸 لقطة الشاشة التوثيقية:', result.details.screenshotPath);
    }
    console.log('----------------------------------------------------------------');

    if (!result.details?.foundAddUpdateButton) {
      console.log('💡 تنبيه: إذا لم يجد الروبوت زر النشر أو ظهرت كابتشا:');
      console.log('👉 شغّل الأمر التالي لمرة واحدة لحلها وحفظ الجلسة:');
      console.log('   npm run login\n');
    }
  } catch (err) {
    console.error('\n❌ حدث خطأ أثناء تنفيذ النشر:', err.message);
    if (err.message.includes('unusual traffic') || err.message.includes('captcha') || err.message.includes('robot')) {
      console.log('\n⚠️ جوجل تطلب التحقق من الكابتشا لمرة واحدة.');
      console.log('👉 شغّل: npm run login لفتح المتصفح وحلها مرة واحدة فقط.\n');
    }
  }
}

main();
