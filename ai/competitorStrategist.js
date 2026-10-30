/**
 * AI Competitor Strategist
 * Generates an executive-level strategic report on how to beat local competitors.
 */

const { callGroq } = require('./groqClient');

/**
 * Generates an executive tactical roadmap based on competitor gap analysis.
 * @param {Object} gapResult - Output of compareWithCompetitors
 * @param {Object} [options]
 * @returns {Promise<Object>} { executiveSummary, attackStrategy, priorityTargets }
 */
async function generateCompetitorStrategy(gapResult, options = {}) {
  if (!gapResult.hasCompetitorData) {
    return {
      executiveSummary: 'لا تتوفر بيانات كافية للمنافسين لإعداد الاستراتيجية.',
      attackStrategy: '',
      priorityTargets: []
    };
  }

  const { targetBusiness, leader, gaps, missingValuableCategories, leaderboard } = gapResult;

  const systemPrompt = `أنت كبير مستشاري التسويق الرقمي والسيو المحلي (Chief Local SEO Strategist).
مهمتك: كتابة تقرير تنفيذي حاسم ومحفز لصاحب النشاط التجاري يشرح له واقعه التنافسي على خرائط جوجل وخطة التغلب على المنافس الأول في منطقته.

أسلوب الكتابة:
- مهني، واقعي، استراتيجي، وواضح بدون تعقيد تقني.
- التركيز على الأثر المالي والمبيعات (خسارة الزبائن لصالح المنافسين وكيفية استعادتهم).

المخرجات المطلوبة بصيغة JSON:
{
  "executiveSummary": "ملخص تحليلي تنفيذي للوضع التنافسي الحالي (في فقرتين مكثفتين)",
  "attackStrategy": "استراتيجية الهجوم الموصى بها لتصدر المركز الأول خلال 90 يوماً",
  "priorityTargets": [
    "الهدف التنافسي رقم 1",
    "الهدف التنافسي رقم 2",
    "الهدف التنافسي رقم 3"
  ]
}`;

  const userPrompt = `البيانات التنافسية:
- نشاط العميل: "${targetBusiness.name}" (السكور: ${targetBusiness.overallScore}/100 - التقييمات: ${targetBusiness.userRatingsTotal} - النجوم: ${targetBusiness.rating})
- المتصدر المحلي: "${leader.name}" (السكور: ${leader.overallScore}/100 - التقييمات: ${leader.userRatingsTotal} - النجوم: ${leader.rating})
- ترتيب العميل في القائمة: المركز ${gapResult.estimatedLocalRank} من أصل ${gapResult.totalCompared} أنشطة مقارنة.
- الفجوة في التقييمات: ${gaps.reviewsGap < 0 ? `متأخر بـ ${Math.abs(gaps.reviewsGap)} تقييم` : 'متفوق'}
- التصنيفات الناقصة لدى العميل وموجودة عند المنافسين: ${missingValuableCategories.map(m => m.category).join(', ') || 'لا توجد'}
- فجوة الصور: ${gaps.photosGap < 0 ? `متأخر بـ ${Math.abs(gaps.photosGap)} صورة` : 'متفوق'}

اكتب التقرير الاستراتيجي بصيغة JSON.`;

  const raw = await callGroq([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], { ...options, jsonMode: true, temperature: 0.65 });

  try {
    const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(clean);
    return {
      executiveSummary: parsed.executiveSummary || raw,
      attackStrategy: parsed.attackStrategy || '',
      priorityTargets: parsed.priorityTargets || []
    };
  } catch {
    return {
      executiveSummary: raw,
      attackStrategy: 'التركيز على إضافة التصنيفات الفرعية ورفع وتيرة التقييمات الشهرية.',
      priorityTargets: missingValuableCategories.slice(0, 3).map(m => `إضافة تصنيف ${m.category}`)
    };
  }
}

module.exports = {
  generateCompetitorStrategy
};
