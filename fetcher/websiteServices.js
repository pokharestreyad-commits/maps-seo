/**
 * Website Services Extractor & Campaign Generator
 * Scrapes a business website, extracts core services, and generates specialized Google Posts.
 */

const { callGroq } = require('../ai/groqClient');

/**
 * Scrapes a website URL and extracts its core services using Groq AI.
 * @param {string} websiteUrl 
 * @param {Object} [options]
 * @returns {Promise<Array<string>>} List of extracted service names
 */
async function extractServicesFromWebsite(websiteUrl, options = {}) {
  let targetUrl = websiteUrl.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  console.log(`[ServicesScraper] جاري قراءة محتوى الموقع: ${targetUrl}...`);

  let htmlText = '';
  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (res.ok) {
      const rawHtml = await res.text();
      // Strip script, style, and html tags to get clean visible text
      htmlText = rawHtml
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 4000); // take first 4000 chars of content
    }
  } catch (err) {
    console.warn(`[ServicesScraper] تعذر جلب الموقع الحي (${err.message})؛ سيتم الاعتماد على الذكاء الاصطناعي.`);
  }

  const systemPrompt = `أنت خبير في تحليل المواقع واستخراج الخدمات والمنتجات التجارية.
المطلوب: استخراج قائمة الخدمات الأساسية التي يقدمها هذا النشاط التجاري من محتوى موقعه.

الشروط:
- استخرج فقط الخدمات الرئيسية الواضحة (بين 3 إلى 7 خدمات).
- كل خدمة تكون عبارة عن جملة موجزة واضحة (مثال: "زراعة الأسنان الفورية"، "علاج جذور الأسنان"، "تقويم الأسنان الشفاف").
- أخرج النتيجة كمصفوفة JSON فقط داخل كائن "services":
{
  "services": ["الخدمة 1", "الخدمة 2", "الخدمة 3"]
}`;

  const userPrompt = `رابط الموقع: ${targetUrl}
محتوى نص الموقع المستخرج:
"${htmlText || 'موقع يقدم خدمات طبية/تجارية عامة'}"

استخرج الخدمات بصيغة JSON فقط.`;

  const raw = await callGroq([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], { ...options, jsonMode: true, temperature: 0.5 });

  try {
    const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(clean);
    return parsed.services || [];
  } catch {
    return ['خدمات عامة', 'استشارات متخصصة'];
  }
}

/**
 * Creates dedicated Google Posts for each service found on the website.
 * @param {string} websiteUrl 
 * @param {Object} businessInfo - { name, city, phone }
 * @returns {Promise<Object>} { services, campaignPosts }
 */
async function generateWebsiteServicesCampaign(websiteUrl, businessInfo = {}) {
  const services = await extractServicesFromWebsite(websiteUrl);

  console.log(`[ServicesCampaign] تم استخراج ${services.length} خدمات من الموقع. جاري توليد منشورات مخصصة لكل خدمة...`);

  const campaignPosts = [];

  for (const service of services) {
    const systemPrompt = `أنت مسوق سيو محلي محترف. اكتب منشور ترويجي مخصص لخرائط جوجل (Google Post) يسلط الضوء على هذه الخدمة بالتحديد:
الخدمة: "${service}"
اسم النشاط: "${businessInfo.name || 'مركزنا'}"
المدينة: "${businessInfo.city || ''}"

الشروط:
1. يبدأ بـ Hook جذاب جداً عن فوائد الخدمة أو حل المشكلة التي يعاني منها الزبون.
2. نص لا يتجاوز 100 كلمة، سهل القراءة، مع 2-3 إيموجي منسقة.
3. زر إجراء: [احجز الآن] أو [اتصل الآن].

أخرج النتيجة كـ JSON:
{
  "service": "${service}",
  "hook": "العنوان الخاطف",
  "body": "نص المنشور الكامل",
  "callToAction": "احجز الآن"
}`;

    try {
      const raw = await callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `اكتب منشور خدمة "${service}" الآن.` }
      ], { jsonMode: true, temperature: 0.65 });

      const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);
      campaignPosts.push(parsed);
    } catch {
      campaignPosts.push({
        service,
        hook: `هل تبحث عن أفضل جودة في ${service}؟`,
        body: `نقدم لك في ${businessInfo.name || 'مركزنا'} أرقى مستوى خدمة في ${service} بأحدث التقنيات لضمان راحتك ورضاك التام. تواصل معنا اليوم للمزيد من التفاصيل!`,
        callToAction: 'اتصل الآن'
      });
    }
  }

  return {
    websiteUrl,
    extractedServicesCount: services.length,
    services,
    campaignPosts
  };
}

module.exports = {
  extractServicesFromWebsite,
  generateWebsiteServicesCampaign
};
