/**
 * Engagement, Posts & Attributes Rule (Weight: 20 points)
 * Evaluates Google Posts (Updates), Business Attributes / Amenities, and Q&A presence.
 */

function evaluateEngagement(place) {
  let score = 0;
  const maxScore = 20;
  const passed = [];
  const warnings = [];
  const failures = [];

  const posts = place.posts || [];
  const attributes = place.attributes || [];
  const qaCount = place.qaCount || 0;

  // 1. Google Updates / Posts (8 pts)
  if (posts.length > 0) {
    const dates = posts
      .map(p => p.createdAt ? new Date(p.createdAt).getTime() : 0)
      .filter(d => d > 0);

    const mostRecentPost = dates.length > 0 ? Math.max(...dates) : 0;
    const daysSinceLastPost = mostRecentPost > 0 ? Math.round((Date.now() - mostRecentPost) / (1000 * 60 * 60 * 24)) : 999;

    if (daysSinceLastPost <= 14) {
      score += 8;
      passed.push(`النشاط ينشر تحديثات مستمرة على جوجل (آخر منشور قبل ${daysSinceLastPost} يوماً).`);
    } else if (daysSinceLastPost <= 45) {
      score += 5;
      warnings.push({
        id: 'OUTDATED_POSTS',
        title: 'المنشورات غير منتظمة أو قديمة',
        severity: 'MEDIUM',
        pointsLost: 3,
        fix: `مرّ ${daysSinceLastPost} يوماً على آخر منشور. منشورات جوجل تنتهي فعاليتها البصرية بعد أسبوع إلى أسبوعين؛ داوم على نشر العروض الأسبوعية.`
      });
    } else {
      score += 2;
      failures.push({
        id: 'ABANDONED_POSTS',
        title: 'توقف نشر التحديثات على ملف جوجل',
        severity: 'MEDIUM',
        pointsLost: 6,
        fix: 'انشر تحديثاً أو عرضاً جديداً الآن مع زر إجراء (اتصل بنا / اطلب الآن).'
      });
    }
  } else {
    failures.push({
      id: 'NO_GOOGLE_POSTS',
      title: 'عدم استخدام منشورات وتحديثات جوجل (Google Posts)',
      severity: 'HIGH',
      pointsLost: 8,
      fix: 'خاصية Google Posts مجانية وتمنحك مساحة إعلانية مجانية في صفحة البحث. انشر عرضك الترويجي القادم فوراً.'
    });
  }

  // 2. Attributes & Amenities (7 pts)
  if (attributes.length >= 6) {
    score += 7;
    passed.push(`تم تحديد ${attributes.length} من سمات ومميزات المكان (وسائل الدفع، إمكانية الوصول، الخدمات).`);
  } else if (attributes.length >= 2) {
    score += 4;
    warnings.push({
      id: 'FEW_ATTRIBUTES',
      title: 'عدد السمات والمميزات قليل',
      severity: 'MEDIUM',
      pointsLost: 3,
      fix: `قمت بتحديد ${attributes.length} سمات فقط. تفعيل سمات مثل (طرق الدفع، توفر مواقف، مناسب للعائلات، مدخل كراسي متحركة) يساعدك في الظهور عند الفلترة البحثية.`
    });
  } else {
    failures.push({
      id: 'NO_ATTRIBUTES',
      title: 'السمات والمميزات (Attributes) غير مفعلة',
      severity: 'HIGH',
      pointsLost: 7,
      fix: 'ادخل إلى لوحة تحكم نشاطك وفعّل كل الخيارات المتاحة التي تنطبق عليك (واي فاي، دفع إلكتروني، حجز مسبق...).'
    });
  }

  // 3. Questions & Answers Section (5 pts)
  if (qaCount >= 3) {
    score += 5;
    passed.push(`قسم الأسئلة والأجوبة نشط (${qaCount} أسئلة مجاب عليها)، مما يوفر معلومات فورية للباحثين.`);
  } else if (qaCount > 0) {
    score += 2.5;
    warnings.push({
      id: 'FEW_QA',
      title: 'قسم الأسئلة والأجوبة محدود',
      severity: 'LOW',
      pointsLost: 2.5,
      fix: 'يمكنك بنفسك إضافة الأسئلة الشائعة التي يكررها الزبائن والإجابة عليها رسمياً كمالك للنشاط.'
    });
  } else {
    warnings.push({
      id: 'EMPTY_QA',
      title: 'قسم الأسئلة والأجوبة فارغ تماماً',
      severity: 'LOW',
      pointsLost: 5,
      fix: 'اطرح بنفسك 3 إلى 5 أسئلة متكررة (مثل الأسعار، المواعيد، طريقة الحجز) وأجب عليها لتوفير إجابات سريعة للزبائن.'
    });
  }

  return {
    ruleId: 'ENGAGEMENT',
    name: 'التفاعل والمميزات (Engagement & Attributes)',
    score: Math.min(maxScore, score),
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    passed,
    warnings,
    failures
  };
}

module.exports = {
  evaluateEngagement
};
