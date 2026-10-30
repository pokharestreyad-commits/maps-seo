/**
 * Local SEO Competitor Benchmark Test
 * Tests the gap analysis algorithm and the Groq 120B AI strategic attack roadmap.
 */

const { auditWithCompetitors } = require('./index');

async function testCompetitorEngine() {
  console.log('='.repeat(70));
  console.log('⚔️ اختبار محرك مقارنة المنافسين واستراتيجية الهجوم (COMPETITOR BENCHMARK)');
  console.log('='.repeat(70));

  // 1. Target Business (The client wanting to win)
  const targetClinic = {
    name: 'عيادة د. حسام لطب الأسنان',
    category: 'طبيب أسنان',
    secondaryCategories: [], // missing secondary categories
    address: 'شارع النصر، المعادي، القاهرة',
    phone: '+201011223344',
    website: 'https://dr-hossam-dental.com',
    rating: 4.1,
    userRatingsTotal: 38,
    photosCount: 8,
    hasLogo: true,
    hasCoverPhoto: false,
    attributes: ['الدفع نقداً'],
    posts: []
  };

  // 2. Top Competitors in the same local market (Google 3-Pack Leaders)
  const competitors = [
    {
      name: 'مركز النخبة التخصصي لطب وزراعة الأسنان', // Leader
      category: 'طبيب أسنان',
      secondaryCategories: ['مركز زراعة أسنان', 'عيادة تجميل وتبييض أسنان', 'تقويم أسنان'],
      address: 'ميدان الجزائر، المعادي، القاهرة',
      phone: '+201055667788',
      website: 'https://el-nokhba-dental.com',
      rating: 4.8,
      userRatingsTotal: 290,
      photosCount: 65,
      hasLogo: true,
      hasCoverPhoto: true,
      attributes: ['مدخل كراسي متحركة', 'الدفع بالفيزا', 'يقبل الحجز المسبق'],
      posts: [{ summary: 'عرض تبييض الأسنان', createdAt: new Date() }]
    },
    {
      name: 'سمايل كير كلينك المعادي', // Runner up
      category: 'طبيب أسنان',
      secondaryCategories: ['مركز زراعة أسنان', 'عيادة أسنان للأطفال'],
      address: 'شارع 9، المعادي، القاهرة',
      phone: '+201099881122',
      website: 'https://smilecare-eg.com',
      rating: 4.5,
      userRatingsTotal: 120,
      photosCount: 28,
      hasLogo: true,
      hasCoverPhoto: true,
      attributes: ['الدفع بالفيزا', 'واي فاي مجاني'],
      posts: []
    }
  ];

  console.log(`\n🔍 جاري تحليل الفجوة التنافسية لـ [${targetClinic.name}] ضد أقوى ${competitors.length} منافسين في المنطقة...`);

  const fullReport = await auditWithCompetitors(targetClinic, competitors, { enableAi: true });
  const comp = fullReport.competitorsAnalysis;

  console.log('\n📊 لوحة الترتيب المحلي التقديري (Local Leaderboard):');
  for (const b of comp.leaderboard) {
    const badge = b.isYourBusiness ? ' 👈 (نشاطك)' : '';
    console.log(`  #${b.rank} - [${b.name.padEnd(42)}] السكور: ${b.score}/100${badge}`);
  }

  console.log('\n📉 تحليل الفجوات المباشرة مع المتصدر (#1 ' + comp.leader.name + '):');
  console.log(`  • فجوة السكور: ${comp.gaps.scoreGap} نقطة`);
  console.log(`  • فجوة التقييمات: ${comp.gaps.reviewsGap} تقييم (لديك ${targetClinic.userRatingsTotal} مقابل ${comp.leader.userRatingsTotal})`);
  console.log(`  • فجوة النجوم: ${comp.gaps.ratingGap} نجمة (${targetClinic.rating} مقابل ${comp.leader.rating})`);
  console.log(`  • فجوة الصور: ${comp.gaps.photosGap} صورة (${targetClinic.photosCount} مقابل ${comp.leader.photosCount})`);

  console.log('\n🎯 الكلمات والتصنيفات الفرعية التي يستغلها المنافسون وأنت محروم منها:');
  for (const m of comp.missingValuableCategories) {
    console.log(`  ➕ تصنيف: [${m.category}] -> ${m.recommendation}`);
  }

  console.log('\n⚡ خطة التفوق التنافسي الميدانية (Winning Roadmap):');
  for (const [i, step] of comp.winningRoadmap.entries()) {
    console.log(`  [المرحلة ${i + 1}] ${step.phase}:`);
    console.log(`    الإجراء: ${step.action}`);
    console.log(`    الأثر: ${step.impact} (الصعوبة: ${step.difficulty})`);
  }

  if (comp.aiStrategy) {
    console.log('\n🧠 الاستراتيجية التنفيذية من الذكاء الاصطناعي (AI Strategic Executive Briefing):');
    console.log(`  📌 الملخص التنفيذي:`);
    console.log(`     "${comp.aiStrategy.executiveSummary}"`);
    console.log(`\n  ⚔️ استراتيجية الهجوم (Attack Strategy):`);
    console.log(`     "${comp.aiStrategy.attackStrategy}"`);
    console.log(`\n  🎯 الأهداف التنافسية ذات الأولوية:`);
    for (const t of comp.aiStrategy.priorityTargets) {
      console.log(`     • ${t}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ اكتمل اختبار محرك مقارنة المنافسين بنجاح ساحق!');
  console.log('='.repeat(70));
}

testCompetitorEngine().catch(console.error);
