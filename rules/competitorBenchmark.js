/**
 * Local SEO Competitor Gap Analysis & Benchmark Engine
 * Compares a target business against top local 3-pack competitors.
 */

const { normalizePlaceData } = require('../schema');
const { calculateAuditScore } = require('../scorer');

/**
 * Compares the target business against a list of local competitors.
 * @param {Object} targetRaw - The business being audited.
 * @param {Array<Object>} competitorsRaw - List of competitor place entities (1 to 5 competitors).
 * @returns {Object} Comprehensive gap analysis and winning roadmap.
 */
function compareWithCompetitors(targetRaw, competitorsRaw = []) {
  const target = normalizePlaceData(targetRaw);
  const targetScore = calculateAuditScore(target);

  // Normalize and score competitors
  const competitors = competitorsRaw.map(c => {
    const norm = normalizePlaceData(c);
    const score = calculateAuditScore(norm);
    return {
      placeId: norm.placeId,
      name: norm.name,
      rating: norm.rating,
      userRatingsTotal: norm.userRatingsTotal,
      photosCount: norm.photosCount,
      primaryCategory: norm.primaryCategory,
      secondaryCategories: norm.secondaryCategories,
      attributes: norm.attributes,
      overallScore: score.overallScore,
      grade: score.grade.symbol,
      hasRecentPosts: norm.posts?.length > 0
    };
  });

  // Calculate Competitor Benchmarks (Averages and Leader)
  const count = competitors.length;
  if (count === 0) {
    return {
      hasCompetitorData: false,
      message: 'لم يتم تمرير بيانات منافسين لإجراء المقارنة المباشرة.'
    };
  }

  // Sort competitors by overall score (descending)
  const sortedByScore = [...competitors].sort((a, b) => b.overallScore - a.overallScore);
  const leader = sortedByScore[0];

  const avgScore = Math.round(competitors.reduce((s, c) => s + c.overallScore, 0) / count);
  const avgReviews = Math.round(competitors.reduce((s, c) => s + c.userRatingsTotal, 0) / count);
  const avgRating = +(competitors.reduce((s, c) => s + c.rating, 0) / count).toFixed(1);
  const avgPhotos = Math.round(competitors.reduce((s, c) => s + c.photosCount, 0) / count);

  // 1. Review Gap Analysis
  const reviewsGap = target.userRatingsTotal - leader.userRatingsTotal;
  const ratingGap = +(target.rating - leader.rating).toFixed(1);

  // 2. Category Intelligence Gap
  // Find secondary categories that competitors use which the target business is missing
  const targetCategories = new Set([target.primaryCategory, ...target.secondaryCategories]);
  const competitorCategoriesCount = {};

  for (const c of competitors) {
    const allCompCats = [c.primaryCategory, ...c.secondaryCategories];
    for (const cat of allCompCats) {
      if (cat && !targetCategories.has(cat)) {
        competitorCategoriesCount[cat] = (competitorCategoriesCount[cat] || 0) + 1;
      }
    }
  }

  // Sort missing categories by popularity among competitors
  const missingValuableCategories = Object.entries(competitorCategoriesCount)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, freq]) => ({
      category: cat,
      usedByCompetitorsCount: freq,
      recommendation: `يستخدمه ${freq} من منافسيك الأقوياء؛ إضافته تفتح لك كلمات بحثية جديدة فوراً.`
    }));

  // 3. Media / Photos Gap
  const photosGap = target.photosCount - leader.photosCount;

  // 4. Position Ranking Estimation
  const allBusinesses = [
    { name: target.name, score: targetScore.overallScore, isTarget: true },
    ...competitors.map(c => ({ name: c.name, score: c.overallScore, isTarget: false }))
  ].sort((a, b) => b.score - a.score);

  const estimatedRank = allBusinesses.findIndex(b => b.isTarget) + 1;

  // 5. Build The Strategic Winning Roadmap
  const winningRoadmap = [];

  // Roadmap 1: Instant Quick Win (Categories)
  if (missingValuableCategories.length > 0) {
    const topMissing = missingValuableCategories.slice(0, 3).map(m => `"${m.category}"`).join(' و ');
    winningRoadmap.push({
      phase: 'المكسب السريع الفوري (في 5 دقائق)',
      action: `أضف التصنيفات الفرعية الناقصة: ${topMissing}`,
      impact: 'الظهور في نتائج بحث إضافية ينافسك عليها المتصدرون حالياً بدونك.',
      difficulty: 'سهل جداً'
    });
  }

  // Roadmap 2: The Reviews Catch-Up Strategy
  if (reviewsGap < 0) {
    const needed = Math.abs(reviewsGap);
    const monthlyPace = Math.max(5, Math.ceil(needed / 6)); // catch up over 6 months
    winningRoadmap.push({
      phase: 'استراتيجية التقييمات التنافسية',
      action: `جمع ما لا يقل عن ${monthlyPace} تقييماً إيجابياً شهرياً للوصول إلى رقم المتصدر (${leader.userRatingsTotal} تقييم).`,
      impact: `سد فجوة الـ ${needed} تقييماً التي يستغلها "${leader.name}" للسيطرة على خريطة المنطقة.`,
      difficulty: 'متوسط ويحتاج استمرارية'
    });
  }

  // Roadmap 3: Visual Supremacy
  if (photosGap < 0) {
    const photosNeeded = Math.abs(photosGap);
    winningRoadmap.push({
      phase: 'التفوق في الجاذبية البصرية',
      action: `رفع ${Math.min(photosNeeded, 25)} صورة احترافية جديدة للمكان والمنتجات لتجاوز مكتبة صور المنافسين.`,
      impact: 'جوجل يعطي أولوية في نقرات المسار والاتصال للملفات ذات المحتوى البصري الأغنى.',
      difficulty: 'سهل'
    });
  }

  return {
    hasCompetitorData: true,
    estimatedLocalRank: estimatedRank,
    totalCompared: count + 1,
    targetBusiness: {
      name: target.name,
      overallScore: targetScore.overallScore,
      rating: target.rating,
      userRatingsTotal: target.userRatingsTotal,
      photosCount: target.photosCount
    },
    leader: {
      name: leader.name,
      overallScore: leader.overallScore,
      rating: leader.rating,
      userRatingsTotal: leader.userRatingsTotal,
      photosCount: leader.photosCount
    },
    marketAverages: {
      avgScore,
      avgReviews,
      avgRating,
      avgPhotos
    },
    gaps: {
      scoreGap: targetScore.overallScore - leader.overallScore,
      reviewsGap,
      ratingGap,
      photosGap,
      missingCategoriesCount: missingValuableCategories.length
    },
    missingValuableCategories,
    leaderboard: allBusinesses.map((b, idx) => ({
      rank: idx + 1,
      name: b.name,
      score: b.score,
      isYourBusiness: b.isTarget
    })),
    winningRoadmap
  };
}

module.exports = {
  compareWithCompetitors
};
