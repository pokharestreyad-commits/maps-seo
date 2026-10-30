/**
 * Maps SEO Pro - Central Local Background Worker
 * Synchronizes with Cloud Dashboard (https://seo.raslans.net)
 * Runs at Windows boot, executes missed tasks, publishes via local Chrome,
 * and sends live Telegram alerts & upcoming reminders.
 */

const fs = require('fs');
const path = require('path');
const {
  sendTelegramMessage,
  notifyStartup,
  notifyMissedCatchUp,
  notifyPostPublished,
  notifyUpcomingReminder,
  notifyOptimizationAction
} = require('./telegramNotifier');
const {
  executeLocalPost,
  executeLocalDescription,
  executeLocalReviewReplies
} = require('./chromeExecutor');

const CLOUD_URL = process.env.CLOUD_API_URL || 'https://seo.raslans.net';
const QUEUE_FILE = path.join(__dirname, '..', 'scheduled_posts.json');
const POLL_INTERVAL_MS = 60 * 1000; // Check every 60 seconds

function readLocalQueue() {
  if (fs.existsSync(QUEUE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
    } catch {
      return [];
    }
  }
  return [];
}

function writeLocalQueue(queue) {
  try {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf8');
  } catch (err) {
    console.error('[Queue Write Error]:', err.message);
  }
}

/**
 * Sync queue with Cloud API (https://seo.raslans.net/api/schedule)
 */
async function syncWithCloud() {
  try {
    const res = await fetch(`${CLOUD_URL}/api/schedule`);
    if (!res.ok) return readLocalQueue();
    const data = await res.json();
    const cloudItems = data.items || [];
    const localItems = readLocalQueue();

    // Merge unique by ID
    const map = new Map();
    // Prioritize published status from local or cloud
    [...cloudItems, ...localItems].forEach(item => {
      if (item && item.id) {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        } else {
          // If already exists, prefer PUBLISHED status
          const existing = map.get(item.id);
          if (item.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
            map.set(item.id, item);
          }
        }
      }
    });

    const merged = Array.from(map.values());
    writeLocalQueue(merged);
    return merged;
  } catch (err) {
    console.warn('[Cloud Sync Warning]:', err.message, '- Using local queue cache.');
    return readLocalQueue();
  }
}

/**
 * Updates a post status on both local file and Cloud API
 */
async function markPostAsPublished(post, details = {}) {
  // 1. Update local
  const queue = readLocalQueue();
  const target = queue.find(i => i.id === post.id);
  if (target) {
    target.status = 'PUBLISHED';
    target.publishedAt = new Date().toISOString();
    target.executionDetails = details;
  }
  writeLocalQueue(queue);

  // 2. Notify cloud
  try {
    await fetch(`${CLOUD_URL}/api/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_post',
        businessName: post.businessName || 'رسلان للتسويق',
        data: {
          postText: post.body || post.hook || '',
          image: post.imageUrl || null,
          callToAction: post.callToAction || 'اتصل الآن',
          type: post.type || 'تحديث أسبوعي',
          isImmediate: true
        }
      })
    });
  } catch (err) {
    console.warn('[Cloud Notification Warning]:', err.message);
  }
}

/**
 * 1. Process Missed Posts (scheduled while computer was powered off)
 */
async function processMissedTasks(queue) {
  const now = new Date();
  const missedPosts = queue.filter(item => {
    const isPending = item.status === 'PENDING' || item.status === 'PENDING_SESSION';
    const isPost = item.body || item.hook || item.id?.startsWith('post');
    if (!isPending || !isPost) return false;
    const schedDate = new Date(item.scheduledFor || 0);
    return schedDate <= now;
  });

  if (missedPosts.length > 0) {
    console.log(`\n⚠️ اكتشاف ${missedPosts.length} منشورات كانت مجدولة أثناء إغلاق الكمبيوتر! جاري تعويضها...`);
    await notifyMissedCatchUp(missedPosts.length);

    for (const post of missedPosts) {
      console.log(`🚀 جاري نشر المنشور الفائت: "${(post.body || post.hook || '').slice(0, 50)}..."`);
      try {
        const result = await executeLocalPost(post);
        await markPostAsPublished(post, result);
        await notifyPostPublished(post, result.screenshotPath);
        console.log(`✅ تم نشر المنشور بنجاح وإرسال إشعار تيليجرام.`);
      } catch (err) {
        console.error(`❌ تعذر نشر المنشور (${post.id}):`, err.message);
      }
      // Brief pause between posts
      await new Promise(r => setTimeout(r, 4000));
    }
  }
}

/**
 * 2. Check Upcoming Posts & Send Reminder
 */
async function checkUpcomingReminder(queue) {
  const now = new Date();
  const futurePosts = queue.filter(item => {
    const isPending = item.status === 'PENDING' || item.status === 'PENDING_SESSION';
    const isPost = item.body || item.hook || item.id?.startsWith('post');
    return isPending && isPost && new Date(item.scheduledFor) > now;
  }).sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));

  const nextPost = futurePosts[0];
  if (nextPost) {
    console.log(`⏰ المنشور القادم مجدول في: ${nextPost.scheduledDateFormatted || nextPost.scheduledFor}`);
    await notifyUpcomingReminder(nextPost);
  }
}

/**
 * Main Worker Cycle
 */
async function startWorker() {
  console.log('================================================================');
  console.log('🤖 Maps SEO Pro - روبوت النشر المحلي التلقائي المتصل بـ Telegram');
  console.log('================================================================');
  console.log(`🏢 النشاط التجاري المستهدف: رسلان للتسويق`);
  console.log(`🌐 السيرفر السحابي المتصل: ${CLOUD_URL}`);
  console.log(`⏳ فحص ومزامنة الطابور كل ${POLL_INTERVAL_MS / 1000} ثانية...\n`);

  // 1. Initial Cloud Sync
  const queue = await syncWithCloud();
  const stats = {
    total: queue.length,
    pending: queue.filter(i => i.status === 'PENDING' || i.status === 'PENDING_SESSION').length,
    published: queue.filter(i => i.status === 'PUBLISHED').length
  };

  // 2. Notify Telegram on System Startup
  console.log('📲 إرسال إشعار تشغيل النظام إلى تيليجرام...');
  await notifyStartup(stats);

  // 3. Process Missed Posts on Startup
  await processMissedTasks(queue);

  // 4. Send upcoming reminder
  await checkUpcomingReminder(queue);

  console.log('\n🟢 الروبوت جاهز ويعمل الآن في الخلفية...');

  // 5. Continuous Loop
  let lastReminderSentAt = Date.now();
  setInterval(async () => {
    try {
      const currentQueue = await syncWithCloud();
      const now = new Date();

      // Check if any post is due now
      const duePosts = currentQueue.filter(item => {
        const isPending = item.status === 'PENDING' || item.status === 'PENDING_SESSION';
        const isPost = item.body || item.hook || item.id?.startsWith('post');
        if (!isPending || !isPost) return false;
        return new Date(item.scheduledFor) <= now;
      });

      for (const post of duePosts) {
        console.log(`\n🔔 حان الآن موعد نشر المنشور: "${(post.body || post.hook || '').slice(0, 50)}..."`);
        const result = await executeLocalPost(post);
        await markPostAsPublished(post, result);
        await notifyPostPublished(post, result.screenshotPath);
        console.log(`✅ تم نشر المنشور في موعده بنجاح وإرسال التأكيد بالصورة على تيليجرام.`);
      }

      // Send upcoming reminder once every 12 hours if future posts exist
      if (Date.now() - lastReminderSentAt > 12 * 60 * 60 * 1000) {
        lastReminderSentAt = Date.now();
        await checkUpcomingReminder(currentQueue);
      }
    } catch (err) {
      console.error('[Worker Loop Error]:', err.message);
    }
  }, POLL_INTERVAL_MS);
}

// Global Exception Handler so background process never crashes silently
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]:', reason);
});

startWorker();
