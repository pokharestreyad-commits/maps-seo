// Maps SEO Pro - Frontend Controller

// Pre-packaged realistic demo datasets for instant 1-click testing
const DEMO_PRESETS = {
  clinic: {
    placeData: {
      name: 'عيادة د. حسام لطب الأسنان',
      category: 'طبيب أسنان',
      secondaryCategories: ['عيادة أسنان'],
      address: 'شارع النصر، المعادي، القاهرة',
      phone: '+201011223344',
      website: 'https://dr-hossam-dental.com',
      rating: 4.1,
      userRatingsTotal: 38,
      photosCount: 8,
      hasLogo: true,
      hasCoverPhoto: false,
      attributes: ['الدفع نقداً'],
      reviews: [
        {
          author: 'يوسف رامي',
          rating: 3,
          text: 'الدكتور ممتاز في شغله لكن العيادة زحمة جداً وخدمة العملاء في الاستقبال محتاجة تحسين.'
        }
      ]
    },
    competitors: [
      {
        name: 'مركز النخبة التخصصي لطب وزراعة الأسنان',
        category: 'طبيب أسنان',
        secondaryCategories: ['مركز زراعة أسنان', 'عيادة تجميل وتبييض أسنان', 'تقويم أسنان'],
        address: 'ميدان الجزائر، المعادي، القاهرة',
        rating: 4.8,
        userRatingsTotal: 290,
        photosCount: 65,
        hasLogo: true,
        hasCoverPhoto: true
      },
      {
        name: 'سمايل كير كلينك المعادي',
        category: 'طبيب أسنان',
        secondaryCategories: ['مركز زراعة أسنان', 'عيادة أسنان للأطفال'],
        address: 'شارع 9، المعادي، القاهرة',
        rating: 4.5,
        userRatingsTotal: 120,
        photosCount: 28,
        hasLogo: true,
        hasCoverPhoto: true
      }
    ]
  },
  restaurant: {
    placeData: {
      name: 'مطعم البرنس - أفضل وأرخص كباب ومشويات فيصل',
      category: 'مطعم',
      secondaryCategories: [],
      address: 'شارع فيصل، الجيزة',
      phone: '',
      website: 'http://my-unsecure-restaurant.com',
      rating: 3.6,
      userRatingsTotal: 8,
      photosCount: 2,
      hasLogo: false,
      hasCoverPhoto: false,
      reviews: [
        {
          author: 'محمود السيد',
          rating: 2,
          text: 'الأكل اتأخر جداً والطلب جه بارد ومش مطابق للي طلبناه.'
        }
      ]
    },
    competitors: [
      {
        name: 'مشويات قصر الكبابجي',
        category: 'مطعم مشويات',
        secondaryCategories: ['مطعم عائلي', 'خدمة توصيل طعام'],
        address: 'شارع فيصل، الجيزة',
        rating: 4.6,
        userRatingsTotal: 410,
        photosCount: 80,
        hasLogo: true,
        hasCoverPhoto: true
      }
    ]
  },
  cafe: {
    placeData: {
      name: 'روما كافيه & لاونج',
      category: 'مقهى',
      secondaryCategories: ['مطعم إيطالي', 'مقهى إنترنت', 'مخبز وحلويات'],
      address: 'شارع التسعين الشمالي، التجمع الخامس، القاهرة',
      phone: '+201122334455',
      website: 'https://romacafe-eg.com',
      rating: 4.7,
      userRatingsTotal: 340,
      photosCount: 85,
      hasLogo: true,
      hasCoverPhoto: true,
      recentPhotosCount: 6,
      ugcPhotosCount: 52,
      attributes: ['جلسات خارجية', 'واي فاي مجاني', 'دفع إلكتروني', 'مناسب للعائلات'],
      posts: [{ summary: 'عرض القهوة والكرواسون' }],
      reviews: [
        {
          author: 'مروان طارق',
          rating: 5,
          text: 'أفضل سبانش لاتيه جربته في التجمع والمكان مريح للعمل.'
        }
      ]
    },
    competitors: []
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const auditForm = document.getElementById('auditForm');
  const targetInput = document.getElementById('targetInput');
  const loadingSection = document.getElementById('loadingSection');
  const resultsSection = document.getElementById('resultsSection');
  const demoBtns = document.querySelectorAll('.demo-btn');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const newAuditBtn = document.getElementById('newAuditBtn');
  const printBtn = document.getElementById('printBtn');

  // 1. Tab Navigation
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId)?.classList.add('active');
    });
  });

  // 2. Demo Buttons Click
  demoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      const preset = DEMO_PRESETS[type];
      if (preset) {
        targetInput.value = preset.placeData.name;
        triggerAuditRequest({
          placeData: preset.placeData,
          competitors: preset.competitors,
          enableAi: true
        });
      }
    });
  });

  // 3. Form Submit
  auditForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = targetInput.value.trim();
    if (!query) return;

    triggerAuditRequest({
      url: query,
      enableAi: true
    });
  });

  // 4. Reset Button
  newAuditBtn?.addEventListener('click', () => {
    resultsSection.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    targetInput.focus();
  });

  // 5. Print Button
  printBtn?.addEventListener('click', () => {
    window.print();
  });

  // Main Audit Request Execution
  async function triggerAuditRequest(payload) {
    loadingSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    loadingSection.scrollIntoView({ behavior: 'smooth' });

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `خطأ في الاتصال بالسيرفر (${res.status})`);
      }

      const reportData = await res.json();
      renderAuditResults(reportData);
    } catch (err) {
      alert(`⚠️ تعذر إكمال الفحص: ${err.message}`);
    } finally {
      loadingSection.classList.add('hidden');
    }
  }

  // Render Full Results
  function renderAuditResults(data) {
    const { business, audit, recommendations, competitorsAnalysis } = data;

    // Header info
    document.getElementById('bizName').textContent = business.name || 'النشاط التجاري';
    document.getElementById('bizCategory').textContent = `🏷️ ${business.category || 'نشاط محلي'}`;
    document.getElementById('bizAddress').textContent = `📍 ${business.address || 'العنوان محدد'}`;
    document.getElementById('bizPhone').textContent = business.phone ? `📞 ${business.phone}` : '📞 لا يوجد هاتف مسجل';
    document.getElementById('gradeDesc').textContent = audit.grade?.description || '';

    // Score & Gauge
    const scoreVal = audit.overallScore || 0;
    document.getElementById('overallScoreVal').textContent = scoreVal;
    const gradeSymbolElem = document.getElementById('gradeSymbol');
    gradeSymbolElem.textContent = audit.grade?.symbol || 'B';
    gradeSymbolElem.style.borderColor = audit.grade?.color || '#3b82f6';
    gradeSymbolElem.style.color = audit.grade?.color || '#3b82f6';

    const gaugeCircle = document.getElementById('gaugeCircle');
    gaugeCircle.style.borderColor = audit.grade?.color || '#3b82f6';
    gaugeCircle.style.boxShadow = `0 0 35px ${audit.grade?.color || '#3b82f6'}44`;

    // Mini Stats
    document.getElementById('starsVal').textContent = business.rating ? `${business.rating} / 5` : 'غير متوفر';
    document.getElementById('reviewsCountVal').textContent = business.userRatingsTotal || 0;
    
    const potentialGain = (recommendations?.potentialScoreAfterFixes || scoreVal) - scoreVal;
    document.getElementById('quickWinsGain').textContent = `+${Math.max(potentialGain, 5)}`;
    document.getElementById('criticalIssuesCount').textContent = audit.criticalIssues?.length || 0;

    // 1. Render 5 Pillars
    const pillarsContainer = document.getElementById('pillarsContainer');
    pillarsContainer.innerHTML = '';
    (audit.breakdown || []).forEach(p => {
      const color = p.percentage >= 80 ? 'var(--success)' : p.percentage >= 50 ? 'var(--warning)' : 'var(--danger)';
      pillarsContainer.innerHTML += `
        <div class="pillar-item">
          <div class="pillar-top">
            <span>${p.name}</span>
            <span style="color: ${color}; font-family: Outfit;">${p.score}/${p.maxScore} (${p.percentage}%)</span>
          </div>
          <div class="p-bar">
            <div class="p-fill" style="width: ${p.percentage}%; background: ${color}"></div>
          </div>
        </div>
      `;
    });

    // Quick Wins List
    const quickWinsContainer = document.getElementById('quickWinsContainer');
    quickWinsContainer.innerHTML = '';
    const wins = recommendations?.quickWins || [];
    if (wins.length === 0) {
      quickWinsContainer.innerHTML = '<div class="win-item"><p>لا توجد مكاسب سريعة متبقية؛ أداء الملف قوي جداً!</p></div>';
    } else {
      wins.forEach(w => {
        quickWinsContainer.innerHTML += `
          <div class="win-item">
            <div class="win-top">
              <strong>${w.task}</strong>
              <span class="win-gain">+${w.pointsToGain} نقاط</span>
            </div>
            <p class="win-action">${w.action}</p>
          </div>
        `;
      });
    }

    // 2. Render Competitors
    renderCompetitors(competitorsAnalysis);

    // 3. Render AI Suite
    renderAiSuite(recommendations);

    // 4. Render Calendar
    renderCalendar(recommendations, business);

    // 5. Render Fix Center
    renderFixCenter(data);

    // Show Results Section
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }

  function renderCompetitors(comp) {
    const compTabBtn = document.querySelector('[data-tab="competitorsTab"]');
    if (!comp || !comp.hasCompetitorData) {
      compTabBtn.style.display = 'none';
      return;
    }
    compTabBtn.style.display = 'inline-block';

    // Leaderboard
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    (comp.leaderboard || []).forEach(b => {
      tbody.innerHTML += `
        <tr class="${b.isYourBusiness ? 'active-row' : ''}">
          <td>#${b.rank}</td>
          <td>${b.name} ${b.isYourBusiness ? '👈 (نشاطك)' : ''}</td>
          <td style="font-family: Outfit; font-weight: 700;">${b.score}/100</td>
          <td>${b.isYourBusiness ? '<span style="color: var(--primary);">قيد الفحص</span>' : 'منافس'}</td>
        </tr>
      `;
    });

    // Missing categories
    const tagsContainer = document.getElementById('missingCategoriesPills');
    tagsContainer.innerHTML = '';
    (comp.missingValuableCategories || []).forEach(c => {
      tagsContainer.innerHTML += `<span class="tag-purple">+ ${c.category}</span>`;
    });

    // Strategy
    const banner = document.getElementById('strategyBanner');
    if (comp.aiStrategy) {
      banner.style.display = 'block';
      document.getElementById('executiveSummaryText').textContent = comp.aiStrategy.executiveSummary || '';
      document.getElementById('attackStrategyText').textContent = comp.aiStrategy.attackStrategy || '';
    } else {
      banner.style.display = 'none';
    }
  }

  function renderAiSuite(rec) {
    // Reviews
    const reviewsList = document.getElementById('aiReviewsList');
    reviewsList.innerHTML = '';
    const aiReplies = rec?.aiReviewResponses || [];

    if (aiReplies.length === 0) {
      reviewsList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">لا توجد تقييمات معلقة غير مردود عليها حالياً.</p>';
    } else {
      aiReplies.forEach((r, idx) => {
        reviewsList.innerHTML += `
          <div class="copy-box" style="margin-bottom: 12px;">
            <button class="copy-action-btn" onclick="copyElementText('reply-text-${idx}')">نسخ الرد 📋</button>
            <div style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 4px;">
              تقييم من <strong>${r.author}</strong> (${r.rating} نجوم): "${r.customerText || 'تقييم بدون تعليق'}"
            </div>
            <div id="reply-text-${idx}" class="box-content">${r.aiGeneratedReply}</div>
          </div>
        `;
      });
    }

    // Description
    const descTextElem = document.getElementById('aiDescText');
    const descBlock = document.getElementById('aiDescBlock');
    if (rec?.aiGeneratedDescription?.description) {
      descBlock.style.display = 'block';
      descTextElem.textContent = rec.aiGeneratedDescription.description;
    } else {
      descBlock.style.display = 'none';
    }

    // Posts
    const postsGrid = document.getElementById('aiPostsGrid');
    postsGrid.innerHTML = '';
    const posts = rec?.aiGeneratedPosts || [];
    posts.forEach((p, idx) => {
      postsGrid.innerHTML += `
        <div class="post-card">
          <button class="copy-action-btn" onclick="copyElementText('post-body-${idx}')">نسخ 📋</button>
          <div class="post-hook">${p.hook}</div>
          <div id="post-body-${idx}" class="post-body">${p.body}</div>
          <span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #93c5fd;">زر الإجراء: [${p.callToAction || 'اتصل الآن'}]</span>
        </div>
      `;
    });
  }

  // 4. Content & Scheduling Calendar
  function renderCalendar(rec, business) {
    const timeline = document.getElementById('scheduledPostsTimeline');
    if (!timeline) return;
    timeline.innerHTML = '';
    const posts = rec?.aiGeneratedPosts || [];

    const SCHEDULE_DAYS = [
      { day: 'الأحد', time: '11:30 ص', tip: 'ذروة بحث وتصفح العملاء' },
      { day: 'الثلاثاء', time: '01:15 م', tip: 'استراحة منتصف الأسبوع' },
      { day: 'الخميس', time: '06:00 م', tip: 'ذروة عطلة نهاية الأسبوع' }
    ];

    if (posts.length === 0) {
      timeline.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">سيتم توليد منشورات الجدولة تلقائياً عند فحص النشاط التجاري.</p>';
      return;
    }

    posts.forEach((p, idx) => {
      const schedule = SCHEDULE_DAYS[idx % SCHEDULE_DAYS.length];
      const card = document.createElement('div');
      card.className = 'timeline-card';
      card.innerHTML = `
        <div>
          <div class="timeline-card-header">
            <span class="timeline-day-badge">📅 ${schedule.day} (${schedule.time})</span>
            <span class="timeline-time-badge">${schedule.tip}</span>
          </div>
          <div class="timeline-hook">${p.hook}</div>
          <div class="timeline-body">${p.body}</div>
          <span class="timeline-cta-badge">🎯 زر الإجراء: [${p.callToAction || 'اتصل الآن'}]</span>
        </div>
        <div class="timeline-actions">
          <button class="btn-publish-now" onclick="publishDirectlyToGoogle(${idx})">نشر فوري في خرائط جوجل 🚀</button>
          <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 6px 12px;" onclick="copyPostFull(${idx})">نسخ النص 📋</button>
        </div>
      `;
      timeline.appendChild(card);
    });

    window._currentPosts = posts;
    window._currentBusiness = business;

    // Export Schedule CSV
    const exportBtn = document.getElementById('exportScheduleBtn');
    if (exportBtn) {
      exportBtn.onclick = () => {
        let csvContent = '\uFEFF';
        csvContent += 'اليوم,الوقت الموصى به,العنوان الخاطف,نص المنشور,زر الإجراء\n';
        posts.forEach((p, idx) => {
          const schedule = SCHEDULE_DAYS[idx % SCHEDULE_DAYS.length];
          const cleanBody = (p.body || '').replace(/"/g, '""');
          const cleanHook = (p.hook || '').replace(/"/g, '""');
          csvContent += `"${schedule.day}","${schedule.time}","${cleanHook}","${cleanBody}","${p.callToAction || 'اتصل الآن'}"\n`;
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `جدول-منشورات-خرائط-جوجل-${(business?.name || 'نشاط').replace(/\s+/g, '_')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      };
    }
  }

  // 5. 1-Click Fix Center
  function renderFixCenter(data) {
    const currentScore = data.audit?.overallScore || 0;
    const simCurrent = document.getElementById('simCurrentScore');
    const simTarget = document.getElementById('simTargetScore');
    if (simCurrent) simCurrent.textContent = currentScore;
    if (simTarget) simTarget.textContent = Math.min(100, currentScore + 27);

    // Categories
    const fixCatList = document.getElementById('fixCatList');
    if (fixCatList) {
      fixCatList.innerHTML = '';
      const missingCats = data.competitorsAnalysis?.missingValuableCategories || [];
      if (missingCats.length === 0) {
        fixCatList.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">تصنيفاتك مكتملة ومطابقة لأفضل المنافسين!</span>';
      } else {
        missingCats.forEach(c => {
          fixCatList.innerHTML += `<span class="fix-cat-tag">+ ${c.category}</span>`;
        });
      }
    }

    const copyCatsBtn = document.getElementById('copyCatsBtn');
    if (copyCatsBtn) {
      copyCatsBtn.onclick = () => {
        const missingCats = data.competitorsAnalysis?.missingValuableCategories || [];
        const catNames = missingCats.map(c => c.category).join('، ');
        navigator.clipboard.writeText(catNames || data.business?.category || '').then(() => {
          showToast('تم نسخ الفئات المقترحة بنجاح 📋');
        });
      };
    }

    // Description
    const fixDescContent = document.getElementById('fixDescContent');
    if (fixDescContent) {
      fixDescContent.textContent = data.recommendations?.aiGeneratedDescription?.description || 'لا يوجد وصف مقترح حالياً.';
    }

    // Reviews Batch
    const fixReviewsBatch = document.getElementById('fixReviewsBatch');
    const replies = data.recommendations?.aiReviewResponses || [];
    if (fixReviewsBatch) {
      fixReviewsBatch.innerHTML = '';
      if (replies.length === 0) {
        fixReviewsBatch.innerHTML = '<p style="color: var(--text-muted); font-size: 0.84rem;">لا توجد تقييمات معلقة غير مجاب عليها.</p>';
      } else {
        replies.slice(0, 3).forEach(r => {
          fixReviewsBatch.innerHTML += `
            <div style="background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; margin-bottom: 6px; font-size: 0.82rem;">
              <strong>${r.author}:</strong> ${r.aiGeneratedReply}
            </div>
          `;
        });
      }
    }

    const copyAllRepliesBtn = document.getElementById('copyAllRepliesBtn');
    if (copyAllRepliesBtn) {
      copyAllRepliesBtn.onclick = () => {
        const text = replies.map(r => `العميل: ${r.author} (${r.rating} نجوم)\nالرد: ${r.aiGeneratedReply}\n---`).join('\n\n');
        navigator.clipboard.writeText(text).then(() => {
          showToast('تم نسخ جميع الردود كحزمة واحدة 📋');
        });
      };
    }

    // Simulation Checkbox dynamic score update
    const checkboxes = document.querySelectorAll('.fix-checkbox');
    checkboxes.forEach(chk => {
      chk.checked = true;
      chk.onchange = updateSimulation;
    });

    function updateSimulation() {
      let totalGains = 0;
      checkboxes.forEach(chk => {
        if (chk.checked) {
          totalGains += parseInt(chk.getAttribute('data-gain') || 0, 10);
        }
      });
      const projected = Math.min(100, currentScore + totalGains);
      if (simTarget) simTarget.textContent = projected;
    }

    // Download Action Pack File
    const downloadBtn = document.getElementById('downloadFixPackBtn');
    if (downloadBtn) {
      downloadBtn.onclick = () => {
        const biz = data.business || {};
        const missingCats = data.competitorsAnalysis?.missingValuableCategories || [];
        const cats = missingCats.map(c => `  - ${c.category}`).join('\n');
        const desc = data.recommendations?.aiGeneratedDescription?.description || 'لم يتم توليد وصف';
        const reps = replies.map(r => `• العميل (${r.author} - ${r.rating} نجوم):\nالرد: ${r.aiGeneratedReply}`).join('\n\n');
        const postsList = (data.recommendations?.aiGeneratedPosts || []).map((p, i) => `[منشور ${i+1}]:\nالعنوان: ${p.hook}\nالنص: ${p.body}\nزر الإجراء: ${p.callToAction}`).join('\n\n');

        const content = `========================================================================
📑 حزمة الإصلاح الفوري وخطة تصدر خرائط جوجل (Maps SEO Action Pack)
المنصة: https://seo.raslans.net | مدعوم بنظام الذكاء الاصطناعي 120B
النشاط: ${biz.name || 'النشاط التجاري'}
العنوان: ${biz.address || 'العنوان'}
السكور الحالي: ${currentScore}/100 | السكور المستهدف بعد التطبيق: 95/100
تاريخ الإصدار: ${new Date().toLocaleDateString('ar-EG')}
========================================================================

1️⃣ التصنيفات والفئات المقترحة للإضافة في بطاقة جوجل بيزنس:
الفئة الرئيسية: ${biz.category || ''}
الفئات الثانوية الموصى بإضافتها فوراً (للتفوق على المنافسين):
${cats || '  - تصنيفاتك الحالية جيدة ومكتملة'}

------------------------------------------------------------------------
2️⃣ الوصف المعتمد والمحسن لمحركات البحث (750 حرف متوافق مع خوارزميات جوجل):
${desc}

------------------------------------------------------------------------
3️⃣ الردود الذكية الجاهزة على مراجعات العملاء:
${reps || 'لا توجد تقييمات معلقة'}

------------------------------------------------------------------------
4️⃣ جدول المنشورات والعروض الأسبوعية (Freshness Signals):
${postsList}

------------------------------------------------------------------------
✅ قائمة التحقق السريعة لتنفيذ التحسينات:
[ ] إضافة الفئات الموصى بها في إعدادات "فئات الأنشطة التجارية"
[ ] نسخ الوصف ولصقه في خانة "الوصف" في بطاقة جوجل
[ ] نشر الردود على العملاء المعلقين لرفع مؤشر التفاعل
[ ] جدولة منشورات الأسبوع بانتظام
========================================================================`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `حزمة-إصلاح-سيو-خرائط-جوجل-${(biz.name || 'نشاط').replace(/\s+/g, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      };
    }
  }
});

// Toast notification helper
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

// Global publish direct to Google handler
window.publishDirectlyToGoogle = function(idx) {
  const post = window._currentPosts?.[idx];
  if (!post) return;
  const fullText = `${post.hook}\n\n${post.body}\n\n[إجراء: ${post.callToAction || 'اتصل الآن'}]`;
  navigator.clipboard.writeText(fullText).then(() => {
    showToast('🚀 تم نسخ المنشور! جاري توجيهك لبطاقة نشاطك...');
    setTimeout(() => {
      window.open('https://business.google.com/locations', '_blank');
    }, 800);
  });
};

window.copyPostFull = function(idx) {
  const post = window._currentPosts?.[idx];
  if (!post) return;
  const fullText = `${post.hook}\n\n${post.body}\n\n[إجراء: ${post.callToAction || 'اتصل الآن'}]`;
  navigator.clipboard.writeText(fullText).then(() => {
    showToast('تم نسخ المنشور بالكامل بنجاح 📋');
  });
};

// Global copy helper
window.copyElementText = function(elemId) {
  const el = document.getElementById(elemId);
  if (!el) return;
  const text = el.innerText || el.textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('تم النسخ بنجاح! 📋');
  });
};
