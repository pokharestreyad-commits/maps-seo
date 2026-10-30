/**
 * Reviews Intelligence Rule (Weight: 25 points)
 * Analyzes Review Volume, Star Rating, Owner Response Rate, Velocity/Recency, and Keyword Presence.
 */

function evaluateReviews(place) {
  let score = 0;
  const maxScore = 25;
  const passed = [];
  const warnings = [];
  const failures = [];

  const totalReviews = place.userRatingsTotal || place.reviews?.length || 0;
  const rating = place.rating || 0;
  const reviews = place.reviews || [];

  // 1. Total Volume of Reviews (6 pts)
  if (totalReviews >= 100) {
    score += 6;
    passed.push(`حجم التقييمات ممتاز (${totalReviews} تقييم)، مما يعزز الثقة والخوارزمية.`);
  } else if (totalReviews >= 30) {
    score += 4.5;
    passed.push(`حجم التقييمات جيد (${totalReviews} تقييم)، والاستمرار سيبعدك عن المنافسين.`);
  } else if (totalReviews >= 10) {
    score += 3;
    warnings.push({
      id: 'LOW_REVIEW_VOLUME',
      title: 'عدد التقييمات قليل نسبياً',
      severity: 'MEDIUM',
      pointsLost: 3,
      fix: `لديك ${totalReviews} تقييم فقط. الأنشطة التي تمتلك أكثر من 30 تقييماً تحظى بضعف فرص الظهور في خرائط جوجل.`
    });
  } else {
    failures.push({
      id: 'CRITICAL_LOW_REVIEWS',
      title: 'حجم التقييمات ضعيف جداً أو شبه منعدم',
      severity: 'CRITICAL',
      pointsLost: 6,
      fix: `لديك ${totalReviews} تقييم فقط! التقييمات هي الوقود الأهم لترتيب النشاط. ابدأ حملة لطلب تقييمات من زبائنك الراضين فوراً.`
    });
  }

  // 2. Average Star Rating (5 pts)
  if (rating >= 4.3 && rating <= 4.9) {
    score += 5;
    passed.push(`متوسط التقييم مثالي (${rating} نجوم)، وهو النطاق الأكثر مصداقية وتحويلاً للعملاء.`);
  } else if (rating === 5.0 && totalReviews < 20) {
    score += 4;
    warnings.push({
      id: 'SUSPICIOUS_PERFECT_RATING',
      title: 'تقييم 5.0 كامل مع عدد قليل من المراجعات',
      severity: 'LOW',
      pointsLost: 1,
      fix: 'العملاء وخوارزميات التفتيش تشك أحياناً في تقييم 5.0 التام مع قلة التقييمات. زد عدد المراجعات لترسيخ المصداقية الطبيعية.'
    });
  } else if (rating >= 4.0 && rating < 4.3) {
    score += 3.5;
    passed.push(`متوسط التقييم مقبول (${rating} نجوم). حاول رفع مستوى الخدمة للوصول إلى 4.5 فما فوق.`);
  } else if (rating > 0 && rating < 4.0) {
    failures.push({
      id: 'POOR_RATING',
      title: 'متوسط التقييم منخفض ومقلق',
      severity: 'CRITICAL',
      pointsLost: 5,
      fix: `متوسط التقييم (${rating}) ينفر أكثر من 60% من الزبائن ويقلل ظهورك في نتائج البحث المميزة. عالج شكاوى العملاء سريعاً.`
    });
  } else {
    failures.push({
      id: 'NO_RATING',
      title: 'لا يوجد متوسط تقييم مسجل',
      severity: 'HIGH',
      pointsLost: 5,
      fix: 'احصل على تقييمات أولى من عملائك لتفعيل متوسط النجوم على ملفك.'
    });
  }

  // 3. Owner Response Rate (8 pts)
  if (reviews.length > 0) {
    const answeredCount = reviews.filter(r => r.ownerResponse && r.ownerResponse.text).length;
    const responseRate = Math.round((answeredCount / reviews.length) * 100);

    if (responseRate >= 80) {
      score += 8;
      passed.push(`معدل رد المالك على التقييمات ممتاز (${responseRate}%). جوجل يقدر هذا التفاعل جداً.`);
    } else if (responseRate >= 50) {
      score += 5;
      warnings.push({
        id: 'AVERAGE_RESPONSE_RATE',
        title: 'معدل الرد على التقييمات متوسط',
        severity: 'MEDIUM',
        pointsLost: 3,
        fix: `ترد على ${responseRate}% فقط من التقييمات. حاول الرد على 100% من المراجعات الإيجابية والسلبية.`
      });
    } else {
      failures.push({
        id: 'POOR_RESPONSE_RATE',
        title: 'إهمال الرد على مراجعات العملاء',
        severity: 'HIGH',
        pointsLost: 8,
        fix: `معدل ردك هو (${responseRate}%). عدم الرد يرسل إشارة سلبية لخوارزمية جوجل بأن النشاط غير متفاعل.`
      });
    }
  } else {
    score += 2;
  }

  // 4. Recency & Velocity (4 pts)
  if (reviews.length > 0) {
    const dates = reviews
      .map(r => r.publishedAt ? new Date(r.publishedAt).getTime() : 0)
      .filter(d => d > 0);
    
    if (dates.length > 0) {
      const mostRecent = Math.max(...dates);
      const daysSinceLast = Math.round((Date.now() - mostRecent) / (1000 * 60 * 60 * 24));

      if (daysSinceLast <= 15) {
        score += 4;
        passed.push(`التقييمات حديثة جداً (آخر مراجعة قبل ${daysSinceLast} يوماً).`);
      } else if (daysSinceLast <= 45) {
        score += 2.5;
        warnings.push({
          id: 'STALE_REVIEWS',
          title: 'تباطؤ في وتيرة استقبال التقييمات',
          severity: 'MEDIUM',
          pointsLost: 1.5,
          fix: `مرّ ${daysSinceLast} يوماً على آخر تقييم. جوجل يفضل تدفقاً مستمراً (Review Velocity) بمعدل 1-2 تقييم أسبوعياً على الأقل.`
        });
      } else {
        failures.push({
          id: 'FROZEN_REVIEWS',
          title: 'توقف تدفق التقييمات لفترة طويلة',
          severity: 'HIGH',
          pointsLost: 4,
          fix: `آخر تقييم كان قبل أكثر من ${daysSinceLast} يوماً! الحسابات الراكدة تفقد مراكزها تلقائياً لصالح المنافسين النشطين.`
        });
      }
    }
  }

  // 5. Keyword Richness in Reviews & Responses (2 pts)
  const reviewsWithText = reviews.filter(r => r.text && r.text.length > 20);
  if (reviews.length > 0 && reviewsWithText.length / reviews.length >= 0.5) {
    score += 2;
    passed.push('نسبة جيدة من التقييمات تحتوي على تعليقات نصية تفصيلية تفيد محرك البحث.');
  }

  return {
    ruleId: 'REVIEWS',
    name: 'ذكاء التقييمات والتفاعل (Reviews Intelligence)',
    score: Math.min(maxScore, score),
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    passed,
    warnings,
    failures
  };
}

module.exports = {
  evaluateReviews
};
