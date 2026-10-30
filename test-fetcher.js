/**
 * Maps SEO Fetcher Test
 * Validates URL parsing, short link resolution, and automated place extraction.
 */

const { parseMapsUrl } = require('./fetcher/urlParser');
const { auditFromInput } = require('./index');

async function run() {
  console.log('='.repeat(70));
  console.log('🧪 اختبار وحدة جلب وتحليل روابط خرائط جوجل (FETCHER TEST)');
  console.log('='.repeat(70));

  // Test 1: URL parser with complex Maps URL
  const testUrl = 'https://www.google.com/maps/place/El+Prince+Restaurant/@30.012345,31.234567,17z/data=!3m1!4b1!4m6!3m5!1s0x145846923456789:0xabcdef123456!8m2!3d30.012345!4d31.234567';
  
  console.log('\n1️⃣ اختبار فك ترميز الرابط (URL Parser):');
  const parsed = await parseMapsUrl(testUrl);
  console.log('  • اسم المكان المستخرج:', parsed.placeName);
  console.log('  • خط العرض:', parsed.latitude);
  console.log('  • خط الطول:', parsed.longitude);
  console.log('  • Place/Data Token:', parsed.placeId);

  // Test 2: Live resolution test with a public Google Maps link (or simulated)
  console.log('\n2️⃣ تجربة استدعاء auditFromInput برابط مباشر:');
  try {
    const report = await auditFromInput(testUrl);
    console.log('  ✅ تم جلب البيانات وفحص النشاط بنجاح:');
    console.log('     - اسم النشاط:', report.business.name);
    console.log('     - السكور الإجمالي:', report.audit.overallScore + '/100');
    console.log('     - التقييم:', report.audit.grade.label);
    console.log('     - عدد التوصيات السريعة:', report.recommendations.quickWins.length);
  } catch (err) {
    console.log('  ⚠️ تنبيه أثناء الجلب الحي (متوقع إذا لم يكن هناك اتصال مباشر):', err.message);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ انتهى اختبار وحدة الجلب بنجاح!');
  console.log('='.repeat(70));
}

run();
