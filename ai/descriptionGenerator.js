/**
 * AI Google Business Profile Description Generator
 * Generates an SEO-rich, 750-character profile description following Google's official policies.
 */

const { callGroq } = require('./groqClient');

/**
 * Generates an optimized GBP description.
 * @param {Object} business - { name, category, services, city, highlights }
 * @param {Object} [options]
 * @returns {Promise<Object>} { description, characterCount, targetedKeywords }
 */
async function generateBusinessDescription(business, options = {}) {
  const systemPrompt = `أنت خبير سيو محلي معتمد لدى Google Business Profile.
مهمتك: كتابة وصف احترافي متكامل لنشاط تجاري ليتم نشره في قسم "معلومات النشاط التجاري" على خرائط جوجل.

شروط جوجل الصارمة لوصف النشاط:
1. الحد الأقصى للطول 750 حرفاً (الهدف ما بين 500 إلى 720 حرفاً).
2. أول 250 حرفاً هي الأهم لأنها تظهر قبل زر "المزيد".
3. يمنع منعاً باتاً وضع روابط مواقع (URLs)، أرقام هواتف، أو عروض خصومات صريحة ومؤقتة (سياسات جوجل ترفضها وتلغي الوصف).
4. التركيز على ما يميز المكان (USP)، الخدمات المقدمة، والموقع الجغرافي.
5. لغة عربية سليمة وجذابة ومحفزة للزيارة.

أخرج النتيجة بصيغة JSON فقط:
{
  "description": "نص الوصف الكامل",
  "targetedKeywords": ["كلمة 1", "كلمة 2", "كلمة 3"]
}`;

  const userPrompt = `بيانات النشاط:
- اسم النشاط: ${business.name}
- التصنيف والخدمات: ${business.category || ''} - ${Array.isArray(business.services) ? business.services.join(', ') : (business.services || '')}
- المدينة / المنطقة: ${business.city || business.address || ''}
- أهم المميزات: ${business.highlights || 'جودة عالية، فريق محترف، رضا العملاء'}`;

  const raw = await callGroq([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], { ...options, jsonMode: true, temperature: 0.6 });

  try {
    const parsed = JSON.parse(raw);
    const desc = parsed.description.trim();
    return {
      description: desc,
      characterCount: desc.length,
      withinLimit: desc.length <= 750,
      targetedKeywords: parsed.targetedKeywords || []
    };
  } catch {
    return {
      description: raw,
      characterCount: raw.length,
      withinLimit: raw.length <= 750,
      targetedKeywords: []
    };
  }
}

module.exports = {
  generateBusinessDescription
};
