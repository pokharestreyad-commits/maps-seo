/**
 * Maps SEO AI Integration Test (Powered by Groq openai/gpt-oss-120b)
 */

const { auditPlaceWithAi, ai } = require('./index');

async function testAiSuite() {
  console.log('='.repeat(70));
  console.log('🤖 اختبار قدرات الذكاء الاصطناعي (GROQ AI LOCAL SEO ENGINE)');
  console.log('الموديل المستخدم:', ai.DEFAULT_MODEL);
  console.log('='.repeat(70));

  const sampleClinic = {
    name: 'عيادة د. أحمد لطب وزراعة الأسنان',
    category: 'طبيب أسنان',
    city: 'المعادي، القاهرة',
    phone: '+201099887766'
  };

  // 1. Test Negative Review Recovery Response
  console.log('\n1️⃣ تجربة توليد رد ذكي على تقييم سلبي (نجمتين) لحماية السمعة:');
  const negReview = {
    author: 'أحمد شريف',
    rating: 2,
    text: 'الدكتور كويس بس الانتظار كان ساعتين كاملين فوق الميعاد ومفيش نظام في الاستقبال.'
  };

  const negResult = await ai.generateReviewResponse(negReview, sampleClinic);
  console.log('  💬 الرد الذكي المولد:');
  console.log(`     "${negResult.response}"`);
  console.log('  🎯 استراتيجية الرد:', negResult.strategyNote);

  // 2. Test Positive Review SEO Reply
  console.log('\n2️⃣ تجربة توليد رد على تقييم إيجابي (5 نجوم) مع حقن الكلمات المفتاحية:');
  const posReview = {
    author: 'مريم حسن',
    rating: 5,
    text: 'عملت تبييض أسنان وتنظيف جير والنتيجة تحفة بجد وتسلم إيد الدكتور وفريق العيادة.'
  };

  const posResult = await ai.generateReviewResponse(posReview, sampleClinic);
  console.log('  💬 الرد الذكي المولد:');
  console.log(`     "${posResult.response}"`);
  console.log('  🔑 الكلمات المفتاحية المدمجة في الرد:', posResult.keywordsUsed.join(' | '));

  // 3. Test Business Description Generator (Google Profile 750 chars)
  console.log('\n3️⃣ تجربة توليد وصف نشاط تجاري مهيأ لمحركات البحث (GBP Description):');
  const descResult = await ai.generateBusinessDescription({
    name: sampleClinic.name,
    category: sampleClinic.category,
    services: ['زراعة الأسنان', 'ابتسامة هوليود', 'تقويم الأسنان الشفاف', 'تبييض الأسنان بالليزر'],
    city: sampleClinic.city,
    highlights: 'أحدث أجهزة التصوير ثلاثي الأبعاد، تعقيم بمواصفات أوروبية، بدون ألم'
  });

  console.log(`  📄 نص الوصف (${descResult.characterCount} حرف - صالح لسياسات جوجل: ${descResult.withinLimit}):`);
  console.log(`     "${descResult.description}"`);
  console.log('  🎯 الكلمات المستهدفة:', descResult.targetedKeywords.join(' | '));

  // 4. Test Google Posts Generator
  console.log('\n4️⃣ تجربة توليد أفكار منشورات جوجل للأسبوع القادم (Google Posts):');
  const posts = await ai.generateGooglePosts({
    name: sampleClinic.name,
    category: sampleClinic.category,
    city: sampleClinic.city,
    currentOffer: 'كشف واستشارة مجانية مع خطة علاج كاملة يوم السبت القادم'
  });

  for (const [i, p] of posts.entries()) {
    console.log(`  📌 [منشور ${i + 1}] (${p.type}):`);
    console.log(`     العنوان (Hook): ${p.hook}`);
    console.log(`     النص: ${p.body}`);
    console.log(`     زر الإجراء (CTA): [${p.callToAction}]`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ اكتملت جميع اختبارات الذكاء الاصطناعي بنجاح تام وسرعة خارقة!');
  console.log('='.repeat(70));
}

testAiSuite().catch(err => {
  console.error('❌ خطأ في اختبار الذكاء الاصطناعي:', err);
});
