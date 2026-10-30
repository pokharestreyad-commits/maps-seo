/**
 * Maps SEO Advisor & Remediation Engine
 * Turns audit findings into concrete, actionable tasks, ready-made AI prompts, and quick wins.
 */

function generateActionPlan(auditResult, place) {
  const quickWins = [];
  const priorityTasks = [];
  const readyTemplates = [];

  const { criticalIssues, warnings } = auditResult;
  const allIssues = [...criticalIssues, ...warnings];

  // 1. Identify Quick Wins (< 5 minutes to fix)
  for (const issue of allIssues) {
    if (['PARTIAL_BRANDING_PHOTOS', 'EMPTY_QA', 'FEW_ATTRIBUTES', 'SHORT_DESCRIPTION', 'NO_GOOGLE_POSTS'].includes(issue.id)) {
      quickWins.push({
        task: issue.title,
        estimatedMinutes: 5,
        action: issue.fix,
        pointsToGain: issue.pointsLost || 2
      });
    }
  }

  // 2. High-Impact Priority Roadmap
  if (criticalIssues.length > 0) {
    for (const issue of criticalIssues.slice(0, 4)) {
      priorityTasks.push({
        priority: 'عاجل جداً',
        title: issue.title,
        impact: `استعادة ${issue.pointsLost || 3} نقاط فوراً`,
        solution: issue.fix
      });
    }
  }

  // 3. Automated Review Response Generation (Templates / AI Prompts)
  const unansweredReviews = (place.reviews || []).filter(r => !r.ownerResponse?.text);
  if (unansweredReviews.length > 0) {
    const samples = unansweredReviews.slice(0, 3).map(r => {
      const isPositive = r.rating >= 4;
      return {
        author: r.author,
        rating: r.rating,
        reviewText: r.text || '(تقييم بدون نص)',
        suggestedResponse: isPositive
          ? `شكراً جزيلاً لك يا ${r.author} على ثقتك في ${place.name}! نسعد دائماً بتقديم أفضل خدمة لك، ونتطلع لزيارتك القادمة في فرعنا.`
          : `أهلاً بك يا ${r.author}، نأسف جداً لسماع تجربتك هذه في ${place.name}. رضاكم هو أولويتنا القصوى، ونرجو التواصل معنا مباشرة عبر الهاتف ${place.phone || ''} لنتمكن من تصحيح الأمر فوراً.`
      };
    });

    readyTemplates.push({
      type: 'REVIEW_RESPONSES',
      title: 'ردود جاهزة على التقييمات غير المردود عليها',
      count: unansweredReviews.length,
      templates: samples
    });
  }

  // 4. Ready-to-use Google Post Draft
  const primaryCat = place.primaryCategory || 'خدماتنا';
  readyTemplates.push({
    type: 'GOOGLE_POST_DRAFT',
    title: 'منشور مقترح لتحديث جوجل (Google Post) للأسبوع القادم',
    content: `هل تبحث عن أفضل تجربة في ${primaryCat}؟\nنحن في "${place.name}" ملتزمون بتقديم أعلى مستويات الجودة والخدمة لعملائنا الكرام.\n📍 زورونا اليوم أو اتصلوا بنا مباشرة للاستفسار والحجز!`,
    callToAction: 'اتصل الآن'
  });

  // 5. Review Direct Share Link
  let reviewLink = null;
  if (place.placeId) {
    reviewLink = `https://search.google.com/local/writereview?placeid=${place.placeId}`;
  }

  return {
    potentialScoreAfterFixes: Math.min(100, auditResult.overallScore + quickWins.reduce((sum, q) => sum + q.pointsToGain, 0)),
    directReviewLink: reviewLink,
    quickWins,
    priorityTasks,
    readyTemplates
  };
}

/**
 * Enriches the static action plan with dynamic Groq AI generations.
 * @param {Object} plan - Output of generateActionPlan
 * @param {Object} place - Normalized place data
 * @param {Object} [options] - Groq options
 * @returns {Promise<Object>} Enriched plan with live AI content
 */
async function enrichPlanWithLiveAi(plan, place, options = {}) {
  const { generateReviewResponse, generateBusinessDescription, generateGooglePosts } = require('./ai/index');
  const enriched = { ...plan };

  // 1. Generate live dynamic responses for unanswered reviews
  const unanswered = (place.reviews || []).filter(r => !r.ownerResponse?.text);
  if (unanswered.length > 0) {
    try {
      const aiResponses = await Promise.all(
        unanswered.slice(0, 3).map(async (rev) => {
          const aiResult = await generateReviewResponse(rev, {
            name: place.name,
            category: place.primaryCategory,
            city: place.address?.city,
            phone: place.phone
          }, options);

          return {
            author: rev.author,
            rating: rev.rating,
            customerText: rev.text,
            aiGeneratedReply: aiResult.response,
            keywordsIncluded: aiResult.keywordsUsed,
            strategy: aiResult.strategyNote
          };
        })
      );

      enriched.aiReviewResponses = aiResponses;
    } catch (err) {
      console.warn('[Advisor] Live AI review response failed:', err.message);
    }
  }

  // 2. Generate optimized description if description is short or missing
  if (!place.description || place.description.length < 150) {
    try {
      enriched.aiGeneratedDescription = await generateBusinessDescription({
        name: place.name,
        category: place.primaryCategory,
        services: place.secondaryCategories,
        city: place.address?.city || place.address?.full
      }, options);
    } catch (err) {
      console.warn('[Advisor] Live AI description failed:', err.message);
    }
  }

  // 3. Generate dynamic weekly Google Posts
  try {
    enriched.aiGeneratedPosts = await generateGooglePosts({
      name: place.name,
      category: place.primaryCategory,
      city: place.address?.city
    }, options);
  } catch (err) {
    console.warn('[Advisor] Live AI posts failed:', err.message);
  }

  return enriched;
}

module.exports = {
  generateActionPlan,
  enrichPlanWithLiveAi
};

