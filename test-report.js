/**
 * Maps SEO HTML Report Generator Test
 * Generates a complete standalone interactive report file for a real-world clinic case.
 */

const path = require('path');
const { auditWithCompetitors, generateHtmlReport } = require('./index');

async function testReportGeneration() {
  console.log('='.repeat(70));
  console.log('📑 تجربة توليد التقرير التفاعلي المستقل (HTML / PDF REPORT GENERATOR)');
  console.log('='.repeat(70));

  const targetClinic = {
    name: 'عيادة د. حسام لطب الأسنان',
    category: 'طبيب أسنان',
    secondaryCategories: ['عيادة أسنان'],
    address: 'شارع النصر، المعادي، القاهرة',
    phone: '+201011223344',
    website: 'https://dr-hossam-dental.com',
    description: 'عيادة أسنان بالمعادي لتقديم خدمات تنظيف وحشو الأسنان.',
    rating: 4.1,
    userRatingsTotal: 38,
    photosCount: 8,
    hasLogo: true,
    hasCoverPhoto: false,
    attributes: ['الدفع نقداً'],
    reviews: [
      {
        author: 'يوسف رامي',
        rating: 3,
        text: 'الدكتور ممتاز في شغله لكن العيادة زحمة جداً وخدمة العملاء في الاستقبال محتاجة تحسين.',
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      }
    ]
  };

  const competitors = [
    {
      name: 'مركز النخبة التخصصي لطب وزراعة الأسنان',
      category: 'طبيب أسنان',
      secondaryCategories: ['مركز زراعة أسنان', 'عيادة تجميل وتبييض أسنان', 'تقويم أسنان'],
      address: 'ميدان الجزائر، المعادي، القاهرة',
      rating: 4.8,
      userRatingsTotal: 290,
      photosCount: 65,
      hasLogo: true,
      hasCoverPhoto: true
    }
  ];

  console.log('⏳ جاري فحص النشاط وتوليد استراتيجية الذكاء الاصطناعي...');
  const auditData = await auditWithCompetitors(targetClinic, competitors, { enableAi: true });

  const outputPath = path.join(__dirname, 'sample-audit-report.html');
  console.log('🎨 جاري إنشاء وتصميم ملف التقرير الفاخر (HTML)...');
  const html = generateHtmlReport(auditData, outputPath);

  console.log(`\n✅ تم إنشاء التقرير بنجاح وحفظه في:`);
  console.log(`   📂 ${outputPath}`);
  console.log(`   📏 حجم ملف التقرير: ${(html.length / 1024).toFixed(1)} KB`);
  console.log('\n💡 يمكنك فتح هذا الملف في أي متصفح مباشرة، أو طباعته كـ PDF بنقرة زر واحدة!');
  console.log('='.repeat(70));
}

testReportGeneration().catch(console.error);
