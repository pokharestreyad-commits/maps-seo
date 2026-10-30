/**
 * Media & Visual Presence Rule (Weight: 15 points)
 * Evaluates photo volume, branding (logo & cover), upload recency, and customer-generated photos.
 */

function evaluateMedia(place) {
  let score = 0;
  const maxScore = 15;
  const passed = [];
  const warnings = [];
  const failures = [];

  const count = place.photosCount || 0;

  // 1. Total Photos Count (6 pts)
  if (count >= 40) {
    score += 6;
    passed.push(`مكتبة صور غنية ومتكاملة (${count} صورة) تزيد من تفاعل العملاء بنسبة 42% وفقاً لإحصاءات جوجل.`);
  } else if (count >= 15) {
    score += 4.5;
    passed.push(`عدد صور جيد (${count} صورة). الاستمرار برفع صور أسبوعياً سيعزز الترتيب.`);
  } else if (count >= 5) {
    score += 2.5;
    warnings.push({
      id: 'LOW_PHOTOS_COUNT',
      title: 'عدد الصور قليل',
      severity: 'MEDIUM',
      pointsLost: 3.5,
      fix: `لديك ${count} صور فقط. الأنشطة التي تمتلك أكثر من 30 صورة تتلقى طلبات اتجاهات هاتفية أكثر بنسبة 35%.`
    });
  } else {
    failures.push({
      id: 'CRITICAL_NO_PHOTOS',
      title: 'معرض الصور شبه فارغ',
      severity: 'HIGH',
      pointsLost: 6,
      fix: `لديك ${count} صور فقط! الصور هي أول ما ينظر إليه العميل في الهاتف. التقط وارفع صوراً لواجهة المحل ومن الداخل وللمنتجات فوراً.`
    });
  }

  // 2. Logo & Cover Photo (5 pts)
  if (place.hasLogo && place.hasCoverPhoto) {
    score += 5;
    passed.push('شعار النشاط وصورة الغلاف محددتان ومضبوطتان باحترافية.');
  } else if (place.hasLogo || place.hasCoverPhoto) {
    score += 2.5;
    warnings.push({
      id: 'PARTIAL_BRANDING_PHOTOS',
      title: 'صورة الشعار أو الغلاف مفقودة',
      severity: 'MEDIUM',
      pointsLost: 2.5,
      fix: `أنت تفتقد إما الشعار أو صورة الغلاف الرئيسية. اضبط الاثنين لتبدو علامتك التجارية موثوقة عند النقر.`
    });
  } else {
    failures.push({
      id: 'MISSING_BRANDING_PHOTOS',
      title: 'غياب الشعار وصورة الغلاف الرسمية',
      severity: 'HIGH',
      pointsLost: 5,
      fix: 'ارفع صورة شعار مربعة عالية الدقة وصورة غلاف عريضة تمثل واجهة نشاطك التجاري.'
    });
  }

  // 3. Photo Recency & Customer Contributions (4 pts)
  if (place.recentPhotosCount > 0) {
    score += 2;
    passed.push('تم رفع صور جديدة خلال الثلاثين يوماً الماضية، مما يثبت نشاط المحل.');
  } else {
    warnings.push({
      id: 'NO_RECENT_PHOTOS',
      title: 'لا توجد صور حديثة مرفوعة مؤخراً',
      severity: 'LOW',
      pointsLost: 2,
      fix: 'جوجل يفضل الحسابات التي ترفع صورة أو صورتين كل أسبوع أو أسبوعين لإظهار استمرارية النشاط.'
    });
  }

  if (place.ugcPhotosCount > 0) {
    score += 2;
    passed.push('يوجد صور ملتقطة ومرفوعة بواسطة الزبائن (UGC)، وهي أقوى إشارة واقعية لمحرك البحث.');
  } else {
    warnings.push({
      id: 'NO_CUSTOMER_PHOTOS',
      title: 'لا توجد صور من تصوير العملاء',
      severity: 'LOW',
      pointsLost: 2,
      fix: 'شجع زبائنك على تصوير المكان أو الطلب ورفعه في تقييماتهم للحصول على ثقة خوارزمية أعلى.'
    });
  }

  return {
    ruleId: 'MEDIA',
    name: 'الوسائط والهوية البصرية (Media & Visuals)',
    score: Math.min(maxScore, score),
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    passed,
    warnings,
    failures
  };
}

module.exports = {
  evaluateMedia
};
