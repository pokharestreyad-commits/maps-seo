/**
 * Completeness Rule (Weight: 20 points)
 * Checks Core NAP (Name, Address, Phone), Website, Hours, and Business Description.
 */

function evaluateCompleteness(place) {
  let score = 0;
  const maxScore = 20;
  const passed = [];
  const warnings = [];
  const failures = [];

  // 1. Business Name (2 pts)
  if (place.name && place.name.length >= 2) {
    score += 2;
    passed.push('اسم النشاط التجاري مسجل بشكل واضح.');
  } else {
    failures.push({
      id: 'MISSING_NAME',
      title: 'اسم النشاط غير مسجل أو غير صالح',
      severity: 'CRITICAL',
      pointsLost: 2,
      fix: 'يجب كتابة اسم النشاط التجاري الفعلي بدقة.'
    });
  }

  // 2. Address & Physical Location (5 pts)
  if (place.address?.full && place.address.full.length > 5) {
    score += 3;
    if (place.address.street && place.address.city) {
      score += 2;
      passed.push('العنوان مسجل ومفصل (الشارع والمدينة).');
    } else {
      score += 1;
      warnings.push({
        id: 'PARTIAL_ADDRESS',
        title: 'تفاصيل العنوان غير مكتملة',
        severity: 'MEDIUM',
        pointsLost: 1,
        fix: 'أضف اسم الشارع ورقم المبنى والرمز البريدي لتعزيز دقة خريطة جوجل.'
      });
    }
  } else {
    failures.push({
      id: 'MISSING_ADDRESS',
      title: 'العنوان الفعلي مفقود تماماً',
      severity: 'CRITICAL',
      pointsLost: 5,
      fix: 'أضف عنوان نشاطك التجاري بدقة ليتمكن العملاء وخوارزمية جوجل من ربطك بالمنطقة الجغرافية.'
    });
  }

  // 3. Phone Number (4 pts)
  if (place.phone && place.phone.length >= 7) {
    score += 4;
    passed.push('رقم الهاتف مسجل ومتاح للاتصال المباشر.');
  } else {
    failures.push({
      id: 'MISSING_PHONE',
      title: 'رقم الهاتف مفقود',
      severity: 'CRITICAL',
      pointsLost: 4,
      fix: 'أضف رقم هاتف محلي صالح. المكالمات المباشرة هي أهم إشارة تحويل لجوجل.'
    });
  }

  // 4. Website Link (3 pts)
  if (place.website) {
    if (place.website.startsWith('https://')) {
      score += 3;
      passed.push('رابط الموقع الإلكتروني موثق ويدعم بروتوكول الأمان HTTPS.');
    } else {
      score += 2;
      warnings.push({
        id: 'INSECURE_WEBSITE',
        title: 'الموقع الإلكتروني لا يدعم HTTPS',
        severity: 'LOW',
        pointsLost: 1,
        fix: 'تأكد من تفعيل شهادة SSL (https) لموقعك الإلكتروني لزيادة ثقة محرك البحث.'
      });
    }
  } else {
    warnings.push({
      id: 'MISSING_WEBSITE',
      title: 'لا يوجد رابط لموقع إلكتروني',
      severity: 'MEDIUM',
      pointsLost: 3,
      fix: 'ربط ملفك التجاري بموقع أو صفحة هبوط (Landing Page) يعزز ظهورك بنسبة تصل إلى 30%.'
    });
  }

  // 5. Opening Hours (3 pts)
  if (place.openingHours?.hasSevenDays) {
    score += 3;
    if (place.openingHours.hasSpecialHours) {
      passed.push('ساعات العمل محددة لجميع أيام الأسبوع مع ساعات العطلات الرسمية.');
    } else {
      passed.push('ساعات العمل محددة لجميع أيام الأسبوع.');
    }
  } else if (place.openingHours) {
    score += 1.5;
    warnings.push({
      id: 'INCOMPLETE_HOURS',
      title: 'ساعات العمل غير محددة لكل الأيام',
      severity: 'MEDIUM',
      pointsLost: 1.5,
      fix: 'حدد ساعات الفتح والإغلاق لكل أيام الأسبوع بدقة لتجنب تنفير الزبائن.'
    });
  } else {
    failures.push({
      id: 'MISSING_HOURS',
      title: 'ساعات العمل مفقودة بالكامل',
      severity: 'HIGH',
      pointsLost: 3,
      fix: 'قم بتحديد مواعيد العمل الرسمية حتى يعرف العملاء متى يمكنهم زيارتك.'
    });
  }

  // 6. Business Description (3 pts)
  const desc = place.description || '';
  if (desc.length >= 150) {
    score += 3;
    passed.push(`وصف النشاط غني ومفصل (${desc.length} حرف).`);
  } else if (desc.length > 0) {
    score += 1.5;
    warnings.push({
      id: 'SHORT_DESCRIPTION',
      title: 'وصف النشاط التجاري قصير جداً',
      severity: 'MEDIUM',
      pointsLost: 1.5,
      fix: 'اكتب وصفاً مفصلاً (ما بين 250 إلى 750 حرفاً) يشرح خدماتك وأهم ما يميزك مع ذكر منطقتك الجغرافية.'
    });
  } else {
    failures.push({
      id: 'MISSING_DESCRIPTION',
      title: 'وصف النشاط التجاري غير مكتوب',
      severity: 'HIGH',
      pointsLost: 3,
      fix: 'أضف وصفاً شاملاً للنشاط مستخدماً الكلمات المفتاحية التي يبحث عنها زبائنك.'
    });
  }

  return {
    ruleId: 'COMPLETENESS',
    name: 'اكتمال بيانات النشاط (NAP & Core Info)',
    score: Math.min(maxScore, score),
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    passed,
    warnings,
    failures
  };
}

module.exports = {
  evaluateCompleteness
};
