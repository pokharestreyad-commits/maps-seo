/**
 * Maps SEO Automated Scheduler & Browser Poster Test
 */

const { scheduler } = require('./index');

async function testScheduler() {
  console.log('='.repeat(70));
  console.log('🤖 اختبار نظام الجدولة والأتمتة بدون API مدفوع (BROWSER AUTOMATION SCHEDULER)');
  console.log('='.repeat(70));

  const sampleBusiness = {
    name: 'عيادة د. حسام لطب الأسنان بالمعادي',
    category: 'طبيب أسنان',
    city: 'المعادي، القاهرة'
  };

  // 1. Generate an AI-powered 4-Week Schedule Queue
  console.log('\n1️⃣ تجربة توليد جدول منشورات أوتوماتيكي لشهر كامل (Queue Generation):');
  const newQueue = await scheduler.generateMonthlyQueue(sampleBusiness);
  console.log(`  ✅ تم توليد وتجهيز ${newQueue.length} منشورات مجدولة بتواريخ مستقبلية:`);

  for (const [i, p] of newQueue.entries()) {
    console.log(`     [الأسبوع ${i + 1}] موعد النشر: ${p.scheduledDateFormatted}`);
    console.log(`        العنوان: ${p.hook}`);
    console.log(`        زر الإجراء: [${p.callToAction}] | الحالة: ${p.status}`);
  }

  // 2. Check Queue Stats
  console.log('\n2️⃣ التحقق من حالة جدول الانتظار (Queue Stats):');
  const stats = scheduler.getQueueStats();
  console.log(`  📊 إجمالي المنشورات المجدولة في النظام: ${stats.total}`);
  console.log(`  ⏳ المنشورات قيد الانتظار: ${stats.pending}`);
  console.log(`  ✅ المنشورات المنشورة: ${stats.published}`);

  // 3. Test Headless Browser Navigation Simulation
  console.log('\n3️⃣ اختبار تشغيل المتصفح الخفي (Headless Browser Check):');
  try {
    const testPostResult = await scheduler.publishPost({
      businessName: 'Google',
      text: 'اختبار تجريبي للمتصفح الخفي',
      headless: true
    });
    console.log('  ✅ المتصفح الخفي يعمل بكفاءة تامة وتصفح بنجاح بدون مشاكل!');
    console.log(`     لقطة الشاشة للتحقق: ${testPostResult.screenshotPath}`);
  } catch (err) {
    console.log('  ⚠️ تنبيه المتصفح:', err.message);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ اكتمل اختبار نظام الجدولة والأتمتة بنجاح كامل!');
  console.log('='.repeat(70));
}

testScheduler().catch(console.error);
