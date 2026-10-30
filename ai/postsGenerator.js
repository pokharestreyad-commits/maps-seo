/**
 * AI Google Posts / Updates Generator
 * Creates weekly promotional posts that keep profiles fresh and boost ranking signals.
 */

const { callGroq } = require('./groqClient');

/**
 * Generates ready-to-publish Google Posts.
 * @param {Object} business - { name, category, city, currentOffer }
 * @param {Object} [options]
 * @returns {Promise<Array>} Array of post ideas with hooks and CTAs
 */
async function generateGooglePosts(business, options = {}) {
  const systemPrompt = `أنت صانع محتوى تسويقي متخصص في منشورات وتحديثات خرائط جوجل (Google Posts).
منشورات جوجل تزيد من نسبة التفاعل بنسبة 40% عند وجود فكرة جذابة وزر دعوة لإجراء (CTA).

المطلوب: توليد 2 أفكار لمنشورات جوجل متجددة للأسبوع القادم:
1. منشور عرض / ميزة ترويجية (Promotional / Offer)
2. منشور قيمة وتوعية بالخدمات (Service Spotlight)

الشروط:
- نص جذاب يبدأ بجملة خاطفة (Hook).
- استخدام إيموجي خفيفة ومنسقة.
- تحديد زر الإجراء المقترح (اتصل الآن، اطلب أونلاين، حجز، معرفة المزيد).

أخرج النتيجة ككائن JSON يحتوي على مصفوفة "posts":
{
  "posts": [
    {
      "type": "عرض ترويجي",
      "hook": "العنوان الخاطف",
      "body": "نص المنشور الكامل (بين 60 إلى 120 كلمة)",
      "callToAction": "اتصل الآن"
    }
  ]
}`;

  const userPrompt = `بيانات النشاط التجاري:
- الاسم: ${business.name}
- المجال: ${business.category || ''}
- المدينة: ${business.city || ''}
- العرض أو الخدمة المميزة: ${business.currentOffer || 'أعلى مستويات الجودة والخدمة لعملائنا'}`;

  const raw = await callGroq([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], { ...options, jsonMode: true, temperature: 0.7 });

  try {
    const cleanJson = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return parsed.posts || (Array.isArray(parsed) ? parsed : []);
  } catch {
    const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        return parsed.posts || (Array.isArray(parsed) ? parsed : []);
      } catch {}
    }
    return [{
      type: 'تحديث عام',
      hook: `مرحباً بكم في ${business.name}`,
      body: raw,
      callToAction: 'اتصل الآن'
    }];
  }
}

module.exports = {
  generateGooglePosts
};
