/**
 * Live Operations Test & Verification Suite
 * Tests all autonomous actions: update_description, reply_reviews, create_post, apply_categories, execute_quick_win
 * Verifies authentication enforcement, payload generation, clipboard data, and session behavior.
 */

const actionHandler = require('./api/action');
const sessionHandler = require('./api/session');
const { isCloudSessionActive, getCloudSession, saveCloudSession } = require('./scheduler/sessionStore');
const { getQueueStats } = require('./scheduler/queueManager');

function createMockReqRes(body, method = 'POST') {
  return new Promise((resolve) => {
    const req = {
      method,
      body
    };
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(k, v) { this.headers[k] = v; },
      status(code) { this.statusCode = code; return this; },
      json(data) { resolve({ statusCode: this.statusCode, data }); },
      end() { resolve({ statusCode: this.statusCode, data: null }); }
    };
    actionHandler(req, res);
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 بدء الفحص الشامل واختبار العمليات الفعلية (Live Execution Audit)');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Check Session Status without cookies
  console.log('▶️ [اختبار 1]: التحقق من حالة الجلسة السحابية الحالية...');
  const initialSessionActive = isCloudSessionActive();
  console.log(`   - الجلسة نشطة: ${initialSessionActive ? 'نعم (مفعلة)' : 'لا (غير مربوطة)'}`);
  passed++;

  // Test 2: Update Description Action without session
  console.log('\n▶️ [اختبار 2]: محاولة تحديث الوصف (750 حرف) بدون جلسة...');
  const testDesc = 'رسلان للتسويق وكالة تسويق رقمي رائدة في الشيخ زايد ومحافظة القاهرة...';
  const descRes = await createMockReqRes({
    action: 'update_description',
    businessName: 'رسلان للتسويق',
    data: { description: testDesc }
  });
  console.log(`   - كود الاستجابة: ${descRes.statusCode}`);
  console.log(`   - requiresAuth: ${descRes.data.requiresAuth}`);
  console.log(`   - هل أظهر نجاح مزيف؟ ${descRes.data.actualExecuted ? '❌ نعم (خطأ)' : '✅ لا، حظر النجاح المزيف وأكد طلب التحقق'}`);
  console.log(`   - حمولة النسخ (copyPayload): موجودة (${descRes.data.copyPayload?.length || 0} حرف)`);
  console.log(`   - رابط التوجيه المباشر: ${descRes.data.directUrl}`);
  if (descRes.data.requiresAuth === true && !descRes.data.actualExecuted) {
    passed++;
  } else {
    failed++;
  }

  // Test 3: Auto-Reply to Reviews without session
  console.log('\n▶️ [اختبار 3]: محاولة إرسال الردود التلقائية على المراجعات بدون جلسة...');
  const replyRes = await createMockReqRes({
    action: 'reply_reviews',
    businessName: 'رسلان للتسويق',
    data: { repliesCount: 5, allRepliesText: 'شكراً جزيلاً لثقتكم في رسلان للتسويق!' }
  });
  console.log(`   - كود الاستجابة: ${replyRes.statusCode}`);
  console.log(`   - requiresAuth: ${replyRes.data.requiresAuth}`);
  console.log(`   - هل أظهر نجاح مزيف؟ ${replyRes.data.actualExecuted ? '❌ نعم' : '✅ لا، منع النجاح المزيف'}`);
  console.log(`   - رابط التقييمات المباشر: ${replyRes.data.directUrl}`);
  if (replyRes.data.requiresAuth === true && !replyRes.data.actualExecuted) {
    passed++;
  } else {
    failed++;
  }

  // Test 4: Create / Schedule Post with Image without session
  console.log('\n▶️ [اختبار 4]: محاولة نشر وجدولة منشور بصورة بالذكاء الاصطناعي بدون جلسة...');
  const postRes = await createMockReqRes({
    action: 'create_post',
    businessName: 'رسلان للتسويق',
    data: {
      postText: 'عرض خاص ومميز من رسلان للتسويق! اتصل بنا الآن.',
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      callToAction: 'اتصل الآن',
      isImmediate: false
    }
  });
  console.log(`   - كود الاستجابة: ${postRes.statusCode}`);
  console.log(`   - requiresAuth: ${postRes.data.requiresAuth}`);
  console.log(`   - حالة المنشور المحفوظ: ${postRes.data.post?.status} (يجب أن تكون PENDING_SESSION)`);
  if (postRes.data.post?.status === 'PENDING_SESSION' && postRes.data.requiresAuth === true) {
    console.log('   ✅ تم الحفظ في الطابور بانتظار الجلسة ومنع ادعاء النشر الفوري المزيف');
    passed++;
  } else {
    failed++;
  }

  // Test 5: Apply Categories without session
  console.log('\n▶️ [اختبار 5]: محاولة تطبيق التصنيفات بدون جلسة...');
  const catRes = await createMockReqRes({
    action: 'apply_categories',
    businessName: 'رسلان للتسويق',
    data: { categoriesText: 'وكالة تسويق، تصميم مواقع' }
  });
  console.log(`   - requiresAuth: ${catRes.data.requiresAuth}`);
  if (catRes.data.requiresAuth === true && !catRes.data.actualExecuted) {
    passed++;
  } else {
    failed++;
  }

  // Test 6: Execute Quick Win without session
  console.log('\n▶️ [اختبار 6]: محاولة تنفيذ مكسب سريع (Quick Win) بدون جلسة...');
  const qwRes = await createMockReqRes({
    action: 'execute_quick_win',
    businessName: 'رسلان للتسويق',
    data: { taskTitle: 'إضافة رابط حجز المواعيد', pointsToGain: 5 }
  });
  console.log(`   - requiresAuth: ${qwRes.data.requiresAuth}`);
  if (qwRes.data.requiresAuth === true && !qwRes.data.actualExecuted) {
    passed++;
  } else {
    failed++;
  }

  // Test 7: Simulation with Authenticated Session (Cookie Injection Test)
  console.log('\n▶️ [اختبار 7]: اختبار العمليات عند توفر جلسة سحابية معتمدة (Authenticated Cloud Session)...');
  const mockCookie = [
    { name: 'SID', value: 'test_sid_verification_123', domain: '.google.com' },
    { name: 'HSID', value: 'test_hsid_verification_123', domain: '.google.com' }
  ];
  saveCloudSession(mockCookie, { source: 'test-runner' });
  console.log('   - تم حقن كوكيز جلسة تجريبية');
  console.log(`   - isCloudSessionActive(): ${isCloudSessionActive()}`);

  const authDescRes = await createMockReqRes({
    action: 'update_description',
    businessName: 'رسلان للتسويق',
    data: { description: testDesc }
  });
  console.log(`   - استجابة التحديث مع الجلسة: actualExecuted = ${authDescRes.data.actualExecuted}`);
  console.log(`   - الرسالة: ${authDescRes.data.message}`);

  // Clean up test session
  const fs = require('fs');
  const { getSessionFilePath } = require('./scheduler/sessionStore');
  try { fs.unlinkSync(getSessionFilePath()); } catch {}

  if (authDescRes.data.actualExecuted === true) {
    console.log('   ✅ تم التأكد من نجاح الأتمتة السحابية الفعلية عند توفر الجلسة!');
    passed++;
  } else {
    failed++;
  }

  console.log('\n================================================================');
  console.log(`🏁 نتائج فحص واختبار العمليات: [نجح: ${passed} | فشل: ${failed}]`);
  console.log('================================================================');
}

runTests().catch(console.error);
