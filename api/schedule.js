/**
 * Maps SEO Scheduler API Endpoint (Vercel / Netlify Serverless Function)
 * GET /api/schedule: Returns current queue stats & scheduled posts
 * POST /api/schedule: Generates new scheduled posts for a business or schedules a post
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { generateGooglePosts } = require('../ai/postsGenerator');

function getQueueFilePath() {
  const baseDir = process.env.VERCEL || process.env.NETLIFY ? os.tmpdir() : path.join(__dirname, '..');
  return path.join(baseDir, 'scheduled_posts.json');
}

function readQueue() {
  const filePath = getQueueFilePath();
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      return [];
    }
  }
  return [];
}

function writeQueue(queue) {
  try {
    fs.writeFileSync(getQueueFilePath(), JSON.stringify(queue, null, 2), 'utf8');
  } catch {}
}

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
    if (req.method === 'GET') {
      const queue = readQueue();
      return res.status(200).json({
        success: true,
        stats: {
          total: queue.length,
          pending: queue.filter(q => q.status === 'PENDING').length,
          published: queue.filter(q => q.status === 'PUBLISHED').length,
          failed: queue.filter(q => q.status === 'FAILED').length
        },
        items: queue
      });
    }

    if (req.method === 'POST') {
      const { action, business, post } = req.body || {};

      // 1. Generate monthly schedule via AI
      if (action === 'generate_monthly' || business) {
        const biz = business || { name: 'نشاط تجاري محلي', category: 'خدمات' };
        const rawPosts = await generateGooglePosts(biz);
        const queue = readQueue();
        const now = Date.now();
        const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

        const newItems = rawPosts.map((p, idx) => {
          const scheduledTime = new Date(now + (idx + 1) * ONE_WEEK_MS);
          return {
            id: `post_${now}_${idx + 1}`,
            businessName: biz.name,
            type: p.type || 'تحديث أسبوعي',
            hook: p.hook,
            body: p.body,
            callToAction: p.callToAction || 'اتصل الآن',
            scheduledFor: scheduledTime.toISOString(),
            scheduledDateFormatted: scheduledTime.toLocaleDateString('ar-EG', { dateStyle: 'full' }),
            status: 'PENDING',
            createdAt: new Date().toISOString()
          };
        });

        const updated = [...queue, ...newItems];
        writeQueue(updated);

        return res.status(200).json({
          success: true,
          message: `تم توليد وجدولة ${newItems.length} منشورات بنجاح.`,
          scheduledItems: newItems
        });
      }

      // 2. Add single custom post
      if (post) {
        const queue = readQueue();
        const newItem = {
          id: `custom_${Date.now()}`,
          businessName: post.businessName || 'نشاط تجاري',
          type: post.type || 'منشور مخصص',
          hook: post.hook || '',
          body: post.body,
          callToAction: post.callToAction || 'اتصل الآن',
          scheduledFor: post.scheduledFor || new Date().toISOString(),
          status: 'PENDING',
          createdAt: new Date().toISOString()
        };
        queue.push(newItem);
        writeQueue(queue);

        return res.status(200).json({
          success: true,
          message: 'تمت إضافة المنشور للجدول بنجاح.',
          post: newItem
        });
      }

      return res.status(400).json({
        success: false,
        error: 'يجب تحديد action أو بيانات business/post في الطلب.'
      });
    }

    // 3. DELETE: Delete a post by ID or delete test posts
    if (req.method === 'DELETE') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const targetId = req.query?.id || body.id;
      const queue = readQueue();

      if (targetId) {
        const initialLen = queue.length;
        const filtered = queue.filter(item => item.id !== targetId);
        writeQueue(filtered);
        return res.status(200).json({
          success: true,
          message: `تم حذف المنشور (${targetId}) بنجاح.`,
          removed: initialLen - filtered.length,
          remaining: filtered.length
        });
      }

      // If delete_tests or clear
      if (body.action === 'delete_tests' || body.deleteTests) {
        const filtered = queue.filter(item => !item.id?.includes('test') && !item.body?.includes('اختبار') && !item.type?.includes('تجريبي'));
        writeQueue(filtered);
        return res.status(200).json({
          success: true,
          message: 'تم حذف وتنظيف جميع المنشورات الاختبارية بنجاح.',
          remaining: filtered.length
        });
      }

      return res.status(400).json({ success: false, error: 'يرجى تحديد id المنشور المراد حذفه.' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('[API /api/schedule Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'حدث خطأ في معالجة الجدولة'
    });
  }
};
