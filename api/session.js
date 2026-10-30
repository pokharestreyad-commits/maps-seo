/**
 * Maps SEO Pro - Cloud Session Management API
 * GET /api/session: Check cloud session status
 * POST /api/session: Save & inject Google session cookies for 100% cloud automation
 * DELETE /api/session: Disconnect/Clear cloud session
 */

const { saveCloudSession, getCloudSession, isCloudSessionActive, normalizeCookies } = require('../scheduler/sessionStore');
const fs = require('fs');
const { getSessionFilePath } = require('../scheduler/sessionStore');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. GET: Check Session Status
    if (req.method === 'GET') {
      const active = isCloudSessionActive();
      const sess = getCloudSession();
      return res.status(200).json({
        success: true,
        active,
        details: sess ? {
          updatedAt: sess.updatedAt,
          cookiesCount: sess.cookiesCount,
          accountName: sess.metadata?.accountName || 'حساب جوجل متصل'
        } : null
      });
    }

    // 2. POST: Save & Activate Cloud Session Cookies
    if (req.method === 'POST') {
      const { cookies, accountName } = req.body || {};

      if (!cookies) {
        return res.status(400).json({
          success: false,
          error: 'يرجى تقديم بيانات الكوكيز (JSON أو نص الكوكيز).'
        });
      }

      const normalized = normalizeCookies(cookies);
      if (normalized.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'صيغة الكوكيز غير صحيحة. يرجى التأكد من نسخ كوكيز حساب جوجل من إضافة Cookie-Editor أو تصدير JSON.'
        });
      }

      const saved = saveCloudSession(normalized, { accountName: accountName || 'Google Account' });

      return res.status(200).json({
        success: true,
        message: `تم تفعيل الجلسة السحابية بنجاح (${saved.cookiesCount} كوكيز). النظام جاهز للأتمتة السحابية 100%! 🚀`,
        details: {
          updatedAt: saved.updatedAt,
          cookiesCount: saved.cookiesCount
        }
      });
    }

    // 3. DELETE: Clear Cloud Session
    if (req.method === 'DELETE') {
      const filePath = getSessionFilePath();
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch {}
      }
      return res.status(200).json({
        success: true,
        message: 'تم مسح الجلسة السحابية بنجاح.'
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('[API /api/session Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'حدث خطأ في معالجة الجلسة السحابية'
    });
  }
};
