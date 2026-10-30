/**
 * Maps SEO Standalone Interactive HTML Report Generator
 * Generates an ultra-premium, self-contained Arabic HTML report with print-to-PDF support.
 */

const fs = require('fs');
const path = require('path');

/**
 * Generates an interactive, standalone HTML report from an audit object.
 * @param {Object} auditReport - Full audit result (with optional competitor analysis and AI content).
 * @param {string} [outputPath] - Optional file path to write the HTML file.
 * @returns {string} The complete HTML string.
 */
function generateHtmlReport(auditReport, outputPath = null) {
  const { business, audit, recommendations, competitorsAnalysis } = auditReport;
  const grade = audit.grade || { symbol: 'B', label: 'متوسط', color: '#f59e0b' };

  // Calculate potential score
  const potentialScore = recommendations?.potentialScoreAfterFixes || audit.overallScore;

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تقرير فحص السيو المحلي | ${escapeHtml(business.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Outfit:wght@600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: rgba(22, 29, 45, 0.75);
      --card-border: rgba(255, 255, 255, 0.08);
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --primary: #3b82f6;
      --primary-glow: rgba(59, 130, 246, 0.25);
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --accent: #8b5cf6;
      --score-color: ${grade.color};
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.12) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 40%);
      color: var(--text);
      font-family: 'Cairo', sans-serif;
      line-height: 1.6;
      padding: 30px 20px;
      min-height: 100vh;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
    }

    /* Top Bar & Actions */
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--card-border);
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 4px 15px var(--primary-glow);
    }

    .logo-text h2 {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .logo-text span {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .actions-area {
      display: flex;
      gap: 12px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--text);
      border: 1px solid var(--card-border);
      padding: 10px 18px;
      border-radius: 10px;
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .btn:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-2px);
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      border-color: #3b82f6;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
    }

    /* Hero Business Card */
    .hero-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      backdrop-filter: blur(12px);
      border-radius: 20px;
      padding: 30px;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 30px;
      align-items: center;
      margin-bottom: 30px;
      position: relative;
      overflow: hidden;
    }

    .hero-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, var(--score-color), var(--accent));
    }

    .biz-title {
      font-size: 1.85rem;
      font-weight: 900;
      margin-bottom: 8px;
      color: #fff;
    }

    .biz-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 16px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--card-border);
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .biz-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .biz-meta span {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Score Gauge */
    .score-box {
      text-align: center;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--card-border);
      padding: 20px 30px;
      border-radius: 18px;
      min-width: 180px;
    }

    .score-circle {
      font-family: 'Outfit', sans-serif;
      font-size: 3.5rem;
      font-weight: 800;
      color: var(--score-color);
      line-height: 1;
      margin-bottom: 4px;
    }

    .score-max {
      font-size: 1rem;
      color: var(--text-muted);
      font-family: 'Outfit', sans-serif;
    }

    .grade-badge {
      display: inline-block;
      margin-top: 8px;
      background: rgba(255, 255, 255, 0.08);
      color: var(--score-color);
      border: 1px solid var(--score-color);
      padding: 3px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 800;
    }

    /* Metrics Summary Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .metric-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }

    .metric-val {
      font-family: 'Outfit', sans-serif;
      font-size: 1.6rem;
      font-weight: 800;
      color: #fff;
    }

    .metric-label {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    /* Section Styling */
    .section-title {
      font-size: 1.3rem;
      font-weight: 800;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-title span {
      background: var(--card-border);
      height: 1px;
      flex-grow: 1;
    }

    /* Competitor Gap Card */
    .comp-card {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8));
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 20px;
      padding: 26px;
      margin-bottom: 30px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    }

    .leaderboard-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      margin-bottom: 20px;
    }

    .leaderboard-table th, .leaderboard-table td {
      padding: 12px 14px;
      text-align: right;
      border-bottom: 1px solid var(--card-border);
    }

    .leaderboard-table th {
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .leaderboard-table tr.active-row {
      background: rgba(59, 130, 246, 0.12);
      font-weight: 800;
    }

    .strategy-box {
      background: rgba(0, 0, 0, 0.3);
      border-right: 4px solid var(--primary);
      padding: 18px;
      border-radius: 0 12px 12px 0;
      margin-top: 15px;
      font-size: 0.95rem;
    }

    /* Audit Breakdown Cards */
    .breakdown-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 18px;
      margin-bottom: 30px;
    }

    .pillar-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 20px;
    }

    .pillar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .pillar-name {
      font-weight: 700;
      font-size: 0.95rem;
    }

    .pillar-score {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 1rem;
    }

    .progress-bar {
      height: 8px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 15px;
    }

    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .issue-item {
      font-size: 0.85rem;
      margin-bottom: 8px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      line-height: 1.4;
    }

    /* AI Generated Action Templates */
    .ai-card {
      background: linear-gradient(135deg, rgba(22, 29, 45, 0.8), rgba(30, 27, 75, 0.5));
      border: 1px solid rgba(139, 92, 246, 0.25);
      border-radius: 18px;
      padding: 24px;
      margin-bottom: 25px;
    }

    .template-box {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px;
      margin-top: 12px;
      position: relative;
    }

    .copy-btn {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }

    .copy-btn:hover {
      background: var(--primary);
    }

    /* Toast Notification */
    #toast {
      position: fixed;
      bottom: 25px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: var(--success);
      color: #fff;
      padding: 12px 24px;
      border-radius: 30px;
      font-weight: 700;
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      z-index: 9999;
    }

    #toast.show {
      transform: translateX(-50%) translateY(0);
    }

    /* Print / PDF Styles */
    @media print {
      body {
        background: #fff !important;
        color: #0f172a !important;
        padding: 0;
      }
      .actions-area, .copy-btn, #toast {
        display: none !important;
      }
      .hero-card, .metric-card, .comp-card, .pillar-card, .ai-card, .score-box {
        background: #f8fafc !important;
        border: 1px solid #cbd5e1 !important;
        color: #0f172a !important;
        box-shadow: none !important;
        break-inside: avoid;
      }
      .biz-title, .metric-val, .pillar-name {
        color: #0f172a !important;
      }
      .badge, .biz-meta, .metric-label {
        color: #475569 !important;
      }
    }

    @media (max-width: 768px) {
      .hero-card {
        grid-template-columns: 1fr;
        text-align: center;
      }
      .biz-badges, .biz-meta {
        justify-content: center;
      }
      .score-box {
        margin: 0 auto;
      }
    }
  </style>
</head>
<body>

  <div class="container">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="logo-area">
        <div class="logo-icon">📍</div>
        <div class="logo-text">
          <h2>Maps SEO Intelligence</h2>
          <span>نظام فحص وتدقيق خرائط جوجل المتقدم v1.0</span>
        </div>
      </div>
      <div class="actions-area">
        <button class="btn btn-primary" onclick="window.print()">
          <span>🖨️</span> طباعة / حفظ كـ PDF
        </button>
      </div>
    </div>

    <!-- Hero Card -->
    <div class="hero-card">
      <div>
        <h1 class="biz-title">${escapeHtml(business.name)}</h1>
        <div class="biz-badges">
          <span class="badge">🏷️ ${escapeHtml(business.category || 'نشاط محلي')}</span>
          <span class="badge">📍 ${escapeHtml(business.address || 'غير محدد')}</span>
          ${business.phone ? `<span class="badge">📞 ${escapeHtml(business.phone)}</span>` : ''}
        </div>
        <div class="biz-meta">
          <span>📅 تاريخ الفحص: ${new Date().toLocaleDateString('ar-EG', { dateStyle: 'long' })}</span>
          <span>🛡️ حالة الحساب: ${grade.label}</span>
        </div>
      </div>

      <div class="score-box">
        <div class="score-circle">${audit.overallScore}</div>
        <div class="score-max">من 100</div>
        <div class="grade-badge">الدرجة: ${grade.symbol}</div>
      </div>
    </div>

    <!-- Metrics Summary -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">⭐</div>
        <div>
          <div class="metric-val">${business.rating || 0} / 5</div>
          <div class="metric-label">متوسط تقييم النجوم</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6;">💬</div>
        <div>
          <div class="metric-val">${business.userRatingsTotal || 0}</div>
          <div class="metric-label">إجمالي التقييمات</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">🚀</div>
        <div>
          <div class="metric-val">+${potentialScore - audit.overallScore}</div>
          <div class="metric-label">نقاط فورية مستهدفة</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;">🚨</div>
        <div>
          <div class="metric-val">${audit.summary?.criticalCount || 0}</div>
          <div class="metric-label">مشاكل حرجة بحاجة لإصلاح</div>
        </div>
      </div>
    </div>

    ${renderCompetitorSection(competitorsAnalysis)}

    <!-- Audit Pillars Breakdown -->
    <h3 class="section-title">📊 تحليل ركائز السيو المحلي الخمس <span></span></h3>
    <div class="breakdown-grid">
      ${audit.breakdown.map(renderPillarCard).join('')}
    </div>

    <!-- Quick Wins & Priority Roadmap -->
    <h3 class="section-title">⚡ خطة العمل والمكاسب السريعة <span></span></h3>
    <div class="breakdown-grid">
      ${renderQuickWins(recommendations)}
    </div>

    <!-- AI Intelligence Suite -->
    ${renderAiSection(recommendations, competitorsAnalysis)}

    <footer style="text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid var(--card-border); font-size: 0.85rem; color: var(--text-muted);">
      تم إنشاء هذا التقرير تلقائياً بواسطة محرك <strong>Maps SEO Core Engine</strong> المدعوم بالذكاء الاصطناعي 120B.
    </footer>
  </div>

  <div id="toast">تم النسخ إلى الحافظة بنجاح!</div>

  <script>
    function copyText(elemId) {
      const text = document.getElementById(elemId).innerText;
      navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
      });
    }
  </script>
</body>
</html>`;

  if (outputPath) {
    fs.writeFileSync(outputPath, html, 'utf8');
  }

  return html;
}

function renderPillarCard(p) {
  const color = p.percentage >= 80 ? 'var(--success)' : p.percentage >= 50 ? 'var(--warning)' : 'var(--danger)';
  return `
    <div class="pillar-card">
      <div class="pillar-header">
        <div class="pillar-name">${escapeHtml(p.name)}</div>
        <div class="pillar-score" style="color: ${color}">${p.score}/${p.maxScore} (${p.percentage}%)</div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${p.percentage}%; background: ${color}"></div>
      </div>
    </div>
  `;
}

function renderCompetitorSection(comp) {
  if (!comp || !comp.hasCompetitorData) return '';

  return `
    <div class="comp-card">
      <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
        ⚔️ تحليل الفجوة مع المنافسين المحليين
      </h3>
      <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 15px;">
        تمت مقارنة نشاطك مع المتصدرين في منطقتك لتحديد الثغرات التي تكلفك خسارة الترتيب والمكالمات.
      </p>

      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>الترتيب التقديري</th>
            <th>النشاط التجاري</th>
            <th>السكور الإجمالي</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          ${comp.leaderboard.map(b => `
            <tr class="${b.isYourBusiness ? 'active-row' : ''}">
              <td>#${b.rank}</td>
              <td>${escapeHtml(b.name)} ${b.isYourBusiness ? '👈 (نشاطك)' : ''}</td>
              <td style="font-family: Outfit; font-weight: 700;">${b.score}/100</td>
              <td>${b.isYourBusiness ? '<span style="color: var(--primary);">قيد الفحص</span>' : 'منافس'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${comp.missingValuableCategories && comp.missingValuableCategories.length > 0 ? `
        <div style="margin-top: 15px; margin-bottom: 15px;">
          <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 8px;">🎯 تصنيفات فرعية يمتلكها المتصدرون وأنت محروم منها:</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${comp.missingValuableCategories.map(c => `
              <span class="badge" style="background: rgba(139, 92, 246, 0.15); color: #c4b5fd; border-color: rgba(139, 92, 246, 0.3);">
                + ${escapeHtml(c.category)}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${comp.aiStrategy ? `
        <div class="strategy-box">
          <div style="font-weight: 800; color: #60a5fa; margin-bottom: 6px;">🧠 الرؤية التنفيذية واستراتيجية الهجوم:</div>
          <p style="margin-bottom: 10px; line-height: 1.6;">${escapeHtml(comp.aiStrategy.executiveSummary)}</p>
          <div style="font-weight: 700; color: #a78bfa; margin-bottom: 4px;">خطة الهجوم خلال 90 يوماً:</div>
          <p style="white-space: pre-line; line-height: 1.6;">${escapeHtml(comp.aiStrategy.attackStrategy)}</p>
        </div>
      ` : ''}
    </div>
  `;
}

function renderQuickWins(recommendations) {
  if (!recommendations || !recommendations.quickWins?.length) {
    return `<div class="pillar-card"><p>لا توجد مكاسب سريعة متبقية، الملف ممتاز!</p></div>`;
  }

  return recommendations.quickWins.map((q, idx) => `
    <div class="pillar-card" style="border-right: 4px solid var(--success);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-weight: 800; font-size: 0.95rem;">⚡ ${escapeHtml(q.task)}</span>
        <span class="badge" style="color: var(--success); font-family: Outfit; font-weight: 700;">+${q.pointsToGain} نقاط</span>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">${escapeHtml(q.action)}</p>
      <div style="font-size: 0.75rem; color: #94a3b8;">الوقت التقديري للإنجاز: <strong>${q.estimatedMinutes} دقائق</strong></div>
    </div>
  `).join('');
}

function renderAiSection(recommendations, comp) {
  const hasAiReplies = recommendations?.aiReviewResponses?.length > 0;
  const hasAiDesc = Boolean(recommendations?.aiGeneratedDescription?.description);
  const hasAiPosts = recommendations?.aiGeneratedPosts?.length > 0;

  if (!hasAiReplies && !hasAiDesc && !hasAiPosts) return '';

  return `
    <h3 class="section-title">🤖 حلول ومحتوى جاهز مولد بالذكاء الاصطناعي <span></span></h3>
    
    ${hasAiReplies ? `
      <div class="ai-card">
        <h4 style="font-weight: 800; font-size: 1.1rem; margin-bottom: 8px;">💬 ردود جاهزة على التقييمات غير المردود عليها:</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted);">تم تضمين اسم النشاط والكلمات المفتاحية وسياق الحي تلقائياً لدعم السيو المحلي.</p>
        ${recommendations.aiReviewResponses.map((r, idx) => `
          <div class="template-box">
            <button class="copy-btn" onclick="copyText('ai-rep-${idx}')">نسخ الرد 📋</button>
            <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 4px;">
              تقييم من <strong>${escapeHtml(r.author)}</strong> (${r.rating} نجوم): "${escapeHtml(r.customerText || 'تقييم بدون نص')}"
            </div>
            <div id="ai-rep-${idx}" style="font-size: 0.95rem; line-height: 1.6; color: #f8fafc; padding-left: 70px;">
              ${escapeHtml(r.aiGeneratedReply)}
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${hasAiDesc ? `
      <div class="ai-card">
        <h4 style="font-weight: 800; font-size: 1.1rem; margin-bottom: 8px;">📄 وصف نشاط تجاري مهيأ لمحركات البحث (GBP Description):</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted);">
          وصف بطول ${recommendations.aiGeneratedDescription.characterCount} حرف مطابق لسياسات جوجل بدون أخطاء أو روابط محظورة.
        </p>
        <div class="template-box">
          <button class="copy-btn" onclick="copyText('ai-desc')">نسخ الوصف 📋</button>
          <div id="ai-desc" style="font-size: 0.95rem; line-height: 1.7; color: #f8fafc; padding-left: 70px;">
            ${escapeHtml(recommendations.aiGeneratedDescription.description)}
          </div>
        </div>
      </div>
    ` : ''}

    ${hasAiPosts ? `
      <div class="ai-card">
        <h4 style="font-weight: 800; font-size: 1.1rem; margin-bottom: 8px;">📌 منشورات وعروض مقترحة للأسبوع القادم (Google Posts):</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; margin-top: 12px;">
          ${recommendations.aiGeneratedPosts.map((p, idx) => `
            <div class="template-box" style="position: relative;">
              <button class="copy-btn" onclick="copyText('ai-post-${idx}')">نسخ 📋</button>
              <div style="font-weight: 800; font-size: 0.95rem; color: #60a5fa; margin-bottom: 6px;">${escapeHtml(p.hook)}</div>
              <div id="ai-post-${idx}" style="font-size: 0.88rem; line-height: 1.6; color: #e2e8f0; margin-bottom: 10px;">
                ${escapeHtml(p.body)}
              </div>
              <div class="badge" style="background: rgba(59, 130, 246, 0.2); color: #93c5fd;">زر الإجراء: [${escapeHtml(p.callToAction || 'اتصل الآن')}]</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  generateHtmlReport
};
