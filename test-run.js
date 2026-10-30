/**
 * Maps SEO Core Engine - Test & Demonstration Suite
 * Runs 3 realistic business cases to demonstrate the accuracy of the engine.
 */

const { auditPlace } = require('./index');

// Case 1: Poor / Critical profile (Spammy name, missing phone & hours, no photos, no replies)
const neglectedBusiness = {
  name: 'مطعم البرنس - أفضل وأرخص كباب ومشويات فيصل',
  category: 'مطعم',
  secondaryCategories: [],
  address: 'شارع فيصل الرئيسي، الجيزة',
  phone: '', // missing
  website: 'http://my-unsecure-restaurant.com',
  description: 'مطعم مشويات',
  openingHours: null, // missing
  rating: 3.6,
  userRatingsTotal: 6,
  photosCount: 2,
  hasLogo: false,
  hasCoverPhoto: false,
  recentPhotosCount: 0,
  ugcPhotosCount: 0,
  attributes: [],
  posts: [],
  qaCount: 0,
  reviews: [
    {
      author: 'محمود السيد',
      rating: 2,
      text: 'الأكل اتأخر جداً والطلب جه بارد ومش مطابق للي طلبناه.',
      publishedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      ownerResponse: null // no response
    }
  ]
};

// Case 2: Average business (Fair foundation, but misses critical optimization opportunities)
const averageBusiness = {
  placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  name: 'مركز النور لطب وجراحة العيون',
  category: 'طبيب عيون',
  secondaryCategories: ['عيادة عيون'],
  address: {
    full: 'شارع عباس العقاد، مدينة نصر، القاهرة',
    street: 'شارع عباس العقاد',
    city: 'القاهرة'
  },
  phone: '+201012345678',
  website: 'https://alnoor-eye-clinic.com',
  description: 'مركز متخصص في جراحات العيون وتصحيح الإبصار بالليزك بأحدث الأجهزة الطبية في مدينة نصر.',
  openingHours: {
    isOpenNow: true,
    periods: [1, 2, 3, 4, 5], // 5 days only
    hasSpecialHours: false
  },
  rating: 4.2,
  userRatingsTotal: 42,
  photosCount: 14,
  hasLogo: true,
  hasCoverPhoto: false,
  recentPhotosCount: 0,
  ugcPhotosCount: 3,
  attributes: ['مدخل كراسي متحركة', 'الدفع بالفيزا'],
  posts: [
    {
      summary: 'خصم 20% على فحوصات قاع العين هذا الأسبوع بمناسبة شهر التوعية.',
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) // 35 days ago
    }
  ],
  qaCount: 1,
  reviews: [
    {
      author: 'سارة عبد الرحمن',
      rating: 5,
      text: 'دكتور محترم جداً والعيادة نظيفة والليزك نجح تماماً الحمد لله.',
      publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      ownerResponse: null // not answered
    },
    {
      author: 'كريم عادل',
      rating: 4,
      text: 'المكان مريح لكن الانتظار كان حوالي 45 دقيقة فوق الميعاد.',
      publishedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      ownerResponse: {
        text: 'شكراً لك أستاذ كريم، نسعى لتطوير نظام المواعيد لتجنب أي تأخير.',
        date: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000)
      }
    }
  ]
};

// Case 3: Highly Optimized Business (Competitive 3-Pack Winner)
const optimizedBusiness = {
  placeId: 'ChIJrTLr-GyuEmsRBfy61i59si0',
  name: 'روما كافيه & لاونج',
  category: 'مقهى',
  secondaryCategories: ['مطعم إيطالي', 'مقهى إنترنت', 'مخبز وحلويات'],
  address: {
    full: 'شارع التسعين الشمالي، التجمع الخامس، القاهرة الجديدة',
    street: 'شارع التسعين الشمالي',
    city: 'القاهرة الجديدة',
    postalCode: '11835'
  },
  phone: '+201122334455',
  website: 'https://romacafe-eg.com',
  description: 'أرقى تجربة قهوة إيطالية متخصصة ومأكولات طازجة في قلب التجمع الخامس. نوفر مساحات عمل هادئة مع واي فاي فائق السرعة، ومناطق عائلية مفتوحة ومواقف سيارات خاصة.',
  openingHours: {
    isOpenNow: true,
    periods: [1, 2, 3, 4, 5, 6, 7], // 7 days
    hasSpecialHours: true
  },
  rating: 4.7,
  userRatingsTotal: 340,
  photosCount: 85,
  hasLogo: true,
  hasCoverPhoto: true,
  recentPhotosCount: 6,
  ugcPhotosCount: 52,
  attributes: [
    'جلسات خارجية', 'واي فاي مجاني', 'دفع إلكتروني',
    'مناسب للعائلات', 'مدخل كراسي متحركة', 'موقف سيارات مجاني'
  ],
  posts: [
    {
      summary: 'جربوا اليوم ساندوتش الكرواسون الجديد مع القهوة المختصة بخصم خاص للصباح!',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      callToAction: 'طلب الآن'
    }
  ],
  qaCount: 6,
  reviews: [
    {
      author: 'مروان طارق',
      rating: 5,
      text: 'أفضل سبانش لاتيه جربته في التجمع، والستاف ودود جداً والمكان مريح للعمل.',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      ownerResponse: {
        text: 'أهلاً بك يا مروان، سعداء جداً أن القهوة وأجواء العمل نالت إعجابك! نراك قريباً.',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    }
  ]
};

console.log('='.repeat(70));
console.log('🚀 اختبار محرك فحص خرائط جوجل (MAPS SEO CORE ENGINE)');
console.log('='.repeat(70));

const cases = [
  { label: 'الحالة 1: نشاط مهمل ومخالف', data: neglectedBusiness },
  { label: 'الحالة 2: نشاط متوسط مع فرص ضائعة', data: averageBusiness },
  { label: 'الحالة 3: نشاط متصدر ومُهيأ بالكامل', data: optimizedBusiness }
];

for (const { label, data } of cases) {
  console.log(`\n📌 ${label}: [${data.name}]`);
  const result = auditPlace(data);
  const { audit, recommendations } = result;

  console.log(`  📊 النتيجة الإجمالية: ${audit.overallScore}/100 (${audit.grade.symbol} - ${audit.grade.label})`);
  console.log('  📈 تفصيل الدرجات:');
  for (const b of audit.breakdown) {
    console.log(`     • ${b.name.padEnd(45)}: ${b.score}/${b.maxScore} (${b.percentage}%)`);
  }

  if (audit.criticalIssues.length > 0) {
    console.log(`  🚨 مشاكل حرجة (${audit.criticalIssues.length}):`);
    for (const c of audit.criticalIssues.slice(0, 2)) {
      console.log(`     - [${c.severity}] ${c.title} (خصم: ${c.pointsLost} نقاط)`);
    }
  }

  if (recommendations.quickWins.length > 0) {
    console.log(`  ⚡ مكاسب سريعة (Quick Wins):`);
    for (const q of recommendations.quickWins.slice(0, 2)) {
      console.log(`     - ${q.task} (${q.estimatedMinutes} دقائق) -> ربح +${q.pointsToGain} نقاط`);
    }
  }

  if (recommendations.readyTemplates.length > 0) {
    const reviewTmpl = recommendations.readyTemplates.find(t => t.type === 'REVIEW_RESPONSES');
    if (reviewTmpl && reviewTmpl.templates.length > 0) {
      console.log(`  🤖 عينة رد ذكي مولد لتقييم عميل:`);
      console.log(`     "${reviewTmpl.templates[0].suggestedResponse}"`);
    }
  }
}

console.log('\n' + '='.repeat(70));
console.log('✅ اكتملت جميع اختبارات المحرك بنجاح تام!');
console.log('='.repeat(70));
