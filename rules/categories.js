/**
 * Categories & Naming Rule (Weight: 20 points)
 * Checks Primary Category accuracy, Secondary Categories depth, and Name Spam (Keyword Stuffing).
 */

const SPAMMY_TRIGGER_WORDS = [
  'أفضل', 'ارخص', 'أرخص', 'احسن', 'أحسن', 'خصم', 'عروض',
  'توصيل مجاني', 'شاطر', 'مضمون', 'رقم 1', 'رقم واحد',
  'best', 'cheapest', 'free delivery', 'discount', 'offer', '#1'
];

function evaluateCategories(place) {
  let score = 0;
  const maxScore = 20;
  const passed = [];
  const warnings = [];
  const failures = [];

  // 1. Primary Category (8 pts)
  if (place.primaryCategory && place.primaryCategory.length >= 3) {
    score += 8;
    passed.push(`تم تحديد التصنيف الرئيسي بدقة: (${place.primaryCategory}).`);
  } else {
    failures.push({
      id: 'MISSING_PRIMARY_CATEGORY',
      title: 'التصنيف الرئيسي مفقود أو غير محدد',
      severity: 'CRITICAL',
      pointsLost: 8,
      fix: 'يجب اختيار التصنيف الرئيسي بعناية فائقة، فهو العامل رقم 1 في تحديد نتائج البحث التي تظهر فيها.'
    });
  }

  // 2. Secondary Categories (7 pts)
  const secCount = place.secondaryCategories?.length || 0;
  if (secCount >= 3 && secCount <= 6) {
    score += 7;
    passed.push(`تمت إضافة ${secCount} تصنيفات فرعية (عدد مثالي لتغطية مجالات نشاطك).`);
  } else if (secCount === 1 || secCount === 2) {
    score += 4;
    warnings.push({
      id: 'FEW_SECONDARY_CATEGORIES',
      title: 'عدد التصنيفات الفرعية قليل جداً',
      severity: 'MEDIUM',
      pointsLost: 3,
      fix: `لديك ${secCount} تصنيف فرعي فقط. أضف بين 3 إلى 5 تصنيفات فرعية لتظهر في عمليات بحث أكثر تخصصاً.`
    });
  } else if (secCount > 8) {
    score += 4;
    warnings.push({
      id: 'DILUTED_CATEGORIES',
      title: 'تشتت التصنيفات (عدد مفرط)',
      severity: 'LOW',
      pointsLost: 3,
      fix: `لديك ${secCount} تصنيفاً فرعياً، الإفراط يضعف تخصصك في نظر خوارزمية جوجل. ركز على الخدمات الأساسية فقط.`
    });
  } else {
    failures.push({
      id: 'NO_SECONDARY_CATEGORIES',
      title: 'لا توجد أي تصنيفات فرعية',
      severity: 'HIGH',
      pointsLost: 7,
      fix: 'أضف التصنيفات الفرعية المتعلقة بنشاطك (مثل: صيانة، قطع غيار، استشارات) لتوسيع نطاق ظهورك.'
    });
  }

  // 3. Name Keyword Stuffing Risk Analysis (5 pts)
  const name = (place.name || '').toLowerCase();
  const foundSpamWords = SPAMMY_TRIGGER_WORDS.filter(w => name.includes(w.toLowerCase()));
  const containsPipeOrHyphen = name.includes('-') || name.includes('|') || name.includes('–');
  
  if (foundSpamWords.length > 0) {
    warnings.push({
      id: 'KEYWORD_STUFFING_RISK',
      title: 'خطر حشو الكلمات الترويجية في اسم النشاط',
      severity: 'HIGH',
      pointsLost: 5,
      fix: `اسم النشاط يحتوي على كلمات ترويجية مثل (${foundSpamWords.join(', ')}). سياسات جوجل تحظر ذلك وقد تؤدي لتعليق حسابك (Suspension). اجعل الاسم يطابق لافتة محلك الحقيقية.`
    });
  } else if (containsPipeOrHyphen && name.split(/[-|–]/).length > 2) {
    score += 2;
    warnings.push({
      id: 'NAME_OVER_OPTIMIZATION',
      title: 'الاسم مفرط الطول أو يحتوي على فواصل متعددة',
      severity: 'LOW',
      pointsLost: 3,
      fix: 'يفضل أن يكون الاسم التجاري ناصعاً ومطابقاً لاسمك على أرض الواقع بدون حشو جمل إضافية بعد الفواصل.'
    });
  } else {
    score += 5;
    passed.push('اسم النشاط نظيف ومطابق لمعايير جوجل وخالٍ من الكلمات الترويجية المحظورة.');
  }

  return {
    ruleId: 'CATEGORIES',
    name: 'هندسة التصنيفات واسم النشاط (Categories & Name)',
    score: Math.min(maxScore, score),
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    passed,
    warnings,
    failures
  };
}

module.exports = {
  evaluateCategories
};
