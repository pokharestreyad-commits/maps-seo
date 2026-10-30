/**
 * Local SEO Scoring Engine
 * Aggregates all evaluation rules into an overall 0-100 score with performance grading.
 */

const { evaluateCompleteness } = require('./rules/completeness');
const { evaluateCategories } = require('./rules/categories');
const { evaluateReviews } = require('./rules/reviews');
const { evaluateMedia } = require('./rules/media');
const { evaluateEngagement } = require('./rules/engagement');

function calculateAuditScore(normalizedPlace) {
  const rulesResults = [
    evaluateCompleteness(normalizedPlace),
    evaluateCategories(normalizedPlace),
    evaluateReviews(normalizedPlace),
    evaluateMedia(normalizedPlace),
    evaluateEngagement(normalizedPlace)
  ];

  const totalScore = Math.round(
    rulesResults.reduce((acc, curr) => acc + curr.score, 0)
  );

  const grade = determineGrade(totalScore);

  // Group all issues across all categories
  const criticalIssues = [];
  const warnings = [];
  const allPassed = [];

  for (const rule of rulesResults) {
    if (rule.failures?.length) {
      criticalIssues.push(...rule.failures.map(f => ({ ...f, category: rule.name })));
    }
    if (rule.warnings?.length) {
      warnings.push(...rule.warnings.map(w => ({ ...w, category: rule.name })));
    }
    if (rule.passed?.length) {
      allPassed.push(...rule.passed.map(p => ({ text: p, category: rule.name })));
    }
  }

  // Sort critical issues by points lost (descending)
  criticalIssues.sort((a, b) => (b.pointsLost || 0) - (a.pointsLost || 0));
  warnings.sort((a, b) => (b.pointsLost || 0) - (a.pointsLost || 0));

  return {
    placeId: normalizedPlace.placeId,
    businessName: normalizedPlace.name,
    overallScore: Math.min(100, Math.max(0, totalScore)),
    maxScore: 100,
    grade,
    breakdown: rulesResults.map(r => ({
      ruleId: r.ruleId,
      name: r.name,
      score: r.score,
      maxScore: r.maxScore,
      percentage: r.percentage
    })),
    summary: {
      passedCount: allPassed.length,
      warningsCount: warnings.length,
      criticalCount: criticalIssues.length
    },
    criticalIssues,
    warnings,
    strengths: allPassed
  };
}

function determineGrade(score) {
  if (score >= 90) {
    return {
      symbol: 'A+',
      label: 'ممتاز - منافس شرس على المركز الأول',
      color: '#10B981',
      description: 'الملف مهيأ بشكل شبه مثالي، وتفصلك فقط المنافسة الجغرافية وسرعة التقييمات عن الهيمنة التامة.'
    };
  }
  if (score >= 80) {
    return {
      symbol: 'A',
      label: 'جيد جداً - في المراكز الأولى مع وجود فرص ضائعة',
      color: '#3B82F6',
      description: 'الملف قوي وظاهر، لكن هناك ثغرات بسيطة يستغلها المنافسون لتجاوزك في بعض الأحياء.'
    };
  }
  if (score >= 65) {
    return {
      symbol: 'B',
      label: 'متوسط - ترتيبك متأخر وتفقد اتصالات وزيارات كثيرة',
      color: '#F59E0B',
      description: 'أنت تخسر أكثر من 50% من الزبائن المحتملين في منطقتك لأن ملفك يحتاج تحسينات جوهرية.'
    };
  }
  if (score >= 45) {
    return {
      symbol: 'C',
      label: 'ضعيف - ظهورك نادر وخوارزمية جوجل تتجاهل ملفك',
      color: '#F97316',
      description: 'هناك أخطاء ونواقص كبيرة في البيانات والتقييمات تجعل محرك البحث يفضل المنافسين دائماً.'
    };
  }
  return {
    symbol: 'F',
    label: 'حرج جداً - شبه مخفي في الخرائط ومعرض للإيقاف',
    color: '#EF4444',
    description: 'الملف مهمل أو يحتوي على مخالفات واضحة تمنعك تماماً من الحصول على زبائن من خرائط جوجل.'
  };
}

module.exports = {
  calculateAuditScore
};
