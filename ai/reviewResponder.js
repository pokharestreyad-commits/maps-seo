/**
 * AI Review Responder (SEO & Sentiment Optimized)
 * Generates tailored responses that boost Local SEO keywords while preserving brand prestige.
 */

const { callGroq } = require('./groqClient');

/**
 * Generates a high-converting, SEO-optimized response to a customer review.
 * @param {Object} review - { author, rating, text }
 * @param {Object} business - { name, category, city, phone }
 * @param {Object} [options] - Options for Groq model
 * @returns {Promise<Object>} { responseText, seoKeywordsIncluded, sentiment }
 */
async function generateReviewResponse(review, business, options = {}) {
  const isPositive = (review.rating || 5) >= 4;
  const sentiment = isPositive ? 'POSITIVE' : 'NEGATIVE_OR_NEUTRAL';

  const systemPrompt = `أنت خبير استراتيجي في السيو المحلي (Local SEO) وإدارة السمعة الرقمية للأنشطة التجارية في خرائط جوجل.
مهمتك: كتابة رد رسمي، ودود، واحترافي باسم مالك النشاط التجاري على تقييم العميل.

قواعد الرد الإيجابي (4-5 نجوم):
1. شكر العميل باسمه الأول.
2. ذكر اسم النشاط التجاري ("${business.name}") وخدمته الأساسية ("${business.category || 'خدماتنا'}") بشكل طبيعي وغير مصطنع.
3. دمج اسم المدينة/المنطقة ("${business.city || ''}") إذا أمكن لدعم السيو المحلي.
4. دعوة لطيفة لتكرار الزيارة.

قواعد الرد السلبي أو المحايد (1-3 نجوم):
1. الترحيب بالعميل بأدب والاعتذار لأن التجربة لم تكن بالمستوى المطلوب، بدون تكرار الكلمات السلبية أو الإساءة.
2. التأكيد على أن رضا العميل وجودة الخدمة هما الأولوية للنشاط.
3. وضع رقم الهاتف المباشر (${business.phone || 'إدارة المكان'}) ودعوة العميل للتواصل لحل المشكلة فوراً وإرضائه.

أخرج النتيجة بصيغة JSON فقط:
{
  "response": "نص الرد النهائي الجاهز للنسخ",
  "keywordsUsed": ["الكلمة 1", "الكلمة 2"],
  "strategyNote": "ملاحظة سريعة توضح لماذا تم الرد بهذا الأسلوب"
}`;

  const userPrompt = `بيانات التقييم:
- اسم العميل: ${review.author || 'عميل كريم'}
- التقييم بالنجوم: ${review.rating || 5} / 5
- نص التعليق: "${review.text || '(لا يوجد نص، تقييم نجوم فقط)'}"

بيانات النشاط:
- الاسم: ${business.name}
- التخصص: ${business.category || ''}
- المدينة / الفرع: ${business.city || ''}
- الهاتف: ${business.phone || ''}

اكتب الرد المطلوب بصيغة JSON فقط.`;

  try {
    const rawResponse = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { ...options, jsonMode: true, temperature: 0.6 });

    const parsed = JSON.parse(rawResponse);
    return {
      sentiment,
      response: parsed.response,
      keywordsUsed: parsed.keywordsUsed || [],
      strategyNote: parsed.strategyNote || ''
    };
  } catch (err) {
    // Graceful fallback if JSON parsing fails
    const cleanText = err.message.includes('JSON')
      ? await callGroq([
          { role: 'system', content: 'أنت مسؤول خدمة عملاء وسيو محلي. اكتب رداً جاهزاً ومباشراً فقط بدون مقدمات.' },
          { role: 'user', content: `اكتب رداً على هذا التقييم (${review.rating} نجوم): "${review.text}" لـ "${business.name}".` }
        ], options)
      : err.message;

    return {
      sentiment,
      response: cleanText,
      keywordsUsed: [],
      strategyNote: 'رد مولد سريع'
    };
  }
}

module.exports = {
  generateReviewResponse
};
