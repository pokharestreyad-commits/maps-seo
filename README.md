# Maps SEO Core Engine 🚀

محرك فحص وتدقيق السيو المحلي المخصص لخرائط جوجل وملفات **Google Business Profile**.

تم بناء المحرك وفق المبدأ الهندسي: **الجوهر والمنطق البرمجي أولاً (Pure Engine & Logic First)** بدون أي واجهات أو ارتباطات خارجية معقدة.

---

## 📁 الهيكل البرمجي (Architecture)

```
D:\maps seo\
├── ai/                    # محرك الذكاء الاصطناعي (Groq AI Engine)
│   ├── groqClient.js      # عميل Groq السريع (يدعم الموديل العملاق openai/gpt-oss-120b)
│   ├── reviewResponder.js # توليد ردود ذكية على التقييمات الإيجابية والسلبية مع حقن الكلمات
│   ├── descriptionGenerator.js # توليد وصف GBP احترافي (750 حرف) مطابق لسياسات جوجل
│   ├── postsGenerator.js  # توليد منشورات وعروض أسبوعية لخرائط جوجل (Google Posts)
│   └── index.js           # المنسق العام لوحدة الذكاء الاصطناعي
├── fetcher/               # وحدة جلب البيانات المتعددة (Data Fetcher)
│   ├── urlParser.js       # فك الروابط المختصرة واستخراج الإحداثيات والاسم
│   ├── placesClient.js    # عميل Google Places API الرسمي
│   ├── htmlParser.js      # قارئ صفحات خرائط جوجل العامة (Zero-Cost Fallback)
│   ├── websiteServices.js # استخراج خدمات الموقع وتوليد حملة منشورات مخصصة لكل خدمة
│   └── index.js           # المنسق التلقائي لجلب أي رابط أو Place ID أو اسم
├── reporter/              # محرك توليد التقارير التفاعلية (HTML / PDF)
├── scheduler/             # محرك الأتمتة والجدولة (يدعم المتصفح المحلي والمتصفح السحابي Browserless)
│   ├── browserPoster.js   # متصفح آلي خفي (يدعم Local Chrome و Cloud WebSocket Endpoint)
│   ├── queueManager.js    # إدارة جدول الانتظار وحفظ المنشورات لشهر مقدماً
│   └── index.js           # المنسق العام لوحدة الأتمتة
├── rules/                 # قواعد الفحص المتخصصة
├── test-website-services.js # تجربة استخراج خدمات الموقع وتوليد منشورات لكل خدمة
├── scorer.js              # محرك حساب الدرجات والتقييم الإجمالي من 100 مع التصنيف (A+, A, B, C, F)
├── advisor.js             # محرك التوصيات الذكي (المكاسب السريعة وتوليد قوالب الردود بالـ AI)
├── index.js               # نقطة الدخول البرمجية الرئيسية (Master Entrypoint)
├── test-run.js            # سيناريوهات اختبار لقواعد الفحص
├── test-fetcher.js        # سيناريو اختبار الجلب التلقائي للروابط
├── test-ai.js             # سيناريو اختبار توليد نصوص الذكاء الاصطناعي
├── test-competitors.js    # سيناريو اختبار تحليل المنافسين واستراتيجية الهجوم
├── test-report.js         # تجربة إنشاء ملف التقرير التفاعلي المستقل
└── sample-audit-report.html # ملف التقرير الفعلي المُولّد الجاهز للعرض والطباعة
```

---

## ⚡ كيفية الاستخدام (Usage)

### 1. تشغيل الاختبارات التجريبية:
```bash
node test-run.js
```

### 2. استدعاء المحرك في أي ملف كود:
```javascript
const { auditPlace } = require('./index');

const report = auditPlace({
  name: 'اسم النشاط',
  category: 'التصنيف الرئيسي',
  address: 'العنوان بالتفصيل',
  phone: 'رقم الهاتف',
  rating: 4.5,
  userRatingsTotal: 85,
  // ... بقية البيانات
});

console.log(report.audit.overallScore); // 82/100
console.log(report.recommendations.quickWins); // قائمة الإصلاحات السريعة
```

---

## 🎯 الأوزان والمعايير المعتمدة (100 نقطة)

1. **اكتمال الملف (20%)**: Name, Address, Phone, Website, Opening Hours, Description.
2. **هندسة التصنيفات (20%)**: Primary & Secondary Categories + Name Spam Keyword Detection.
3. **ذكاء التقييمات (25%)**: Review Count, Star Rating, Owner Response Rate, Velocity.
4. **الوسائط والهوية (15%)**: Photo Count, Logo, Cover, UGC Photos, Recency.
5. **التفاعل والمميزات (20%)**: Google Posts (Freshness), Attributes / Amenities, Q&A.

---

## 🌐 تشغيل واجهة الموقع محلياً (Local Web App)

```bash
cd "D:\maps seo"
npm start
```
ثم افتح في متصفحك: `http://localhost:3000`

---

## 🚀 الرفع والنشر السحابي (Vercel & Netlify Deployment)

### 1. الرفع إلى GitHub:
```bash
git init
git add .
git commit -m "Initial Maps SEO Pro Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/maps-seo.git
git push -u origin main
```

### 2. النشر على Vercel بنقرة واحدة (موصى به):
1. اذهب إلى [Vercel.com](https://vercel.com) واضغط **"Add New Project"**.
2. اختر مستودع الـ GitHub الخاص بالمشروع.
3. في خانة **Environment Variables**، أضف المفاتيح التالية من ملف `.env`:
   * `GROQ_API_KEY`: مفتاح Groq الخاص بك
   * `GROQ_MODEL`: `openai/gpt-oss-120b`
4. اضغط **Deploy**؛ سيصبح موقعك متاحاً برابط عالمي في 30 ثانية!

### 3. النشر على Netlify:
1. اذهب إلى [Netlify.com](https://netlify.com) واضغط **"Add new site" -> "Import an existing project"**.
2. اربط مستودع GitHub وسيقرأ Netlify ملف `netlify.toml` تلقائياً.
3. في إعدادات **Site configuration -> Environment variables**، أضف `GROQ_API_KEY`.
4. اضغط **Deploy Site**.

---

## 🗄️ ربط قاعدة بيانات Supabase (لإدارة المستخدمين والـ SaaS)

عندما ترغب بحفظ سجلات الفحص والتقارير لكل عميل مسجل:
1. أنشئ مشروعاً مجانياً على [Supabase.com](https://supabase.com).
2. افتح **SQL Editor** والصق محتوى ملف `supabase-schema.sql` واضغط **Run**.
3. سيتم إنشاء جداول الفحص وجداول المنشورات المجدولة مع نظام أمان RLS تلقائياً.

