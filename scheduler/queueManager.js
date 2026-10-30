/**
 * Maps SEO Scheduled Queue Manager
 * Manages the queue of scheduled posts, triggers AI generation, and tracks publishing status.
 */

const fs = require('fs');
const path = require('path');
const { generateGooglePosts } = require('../ai/postsGenerator');
const { publishPost } = require('./browserPoster');

const QUEUE_FILE = path.join(__dirname, '..', 'scheduled_posts.json');

/**
 * Loads the existing posts queue from disk.
 * @returns {Array} List of scheduled posts
 */
function loadQueue() {
  if (fs.existsSync(QUEUE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Saves the queue array to disk.
 * @param {Array} queue 
 */
function saveQueue(queue) {
  try {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf8');
  } catch {}
}

/**
 * Generates an automated 4-week content queue using Groq AI and saves it.
 * @param {Object} business - { name, category, city }
 * @param {Object} [options]
 * @returns {Promise<Array>} Newly scheduled posts
 */
async function generateMonthlyQueue(business, options = {}) {
  console.log(`[QueueManager] جاري توليد جدول منشورات شهرية بالذكاء الاصطناعي لـ "${business.name}"...`);

  const rawPosts = await generateGooglePosts(business, options);

  const queue = loadQueue();
  const now = Date.now();
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  const newScheduledItems = rawPosts.map((p, index) => {
    const scheduledTime = new Date(now + (index + 1) * ONE_WEEK_MS);
    return {
      id: `post_${now}_${index + 1}`,
      businessName: business.name,
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

  const updatedQueue = [...queue, ...newScheduledItems];
  saveQueue(updatedQueue);

  return newScheduledItems;
}

/**
 * Executes publishing of the next pending post in the queue.
 * @param {Object} [options] - { headless }
 * @returns {Promise<Object>} Execution result
 */
async function processNextPendingPost(options = {}) {
  const queue = loadQueue();
  const nextItem = queue.find(item => item.status === 'PENDING');

  if (!nextItem) {
    return {
      success: false,
      message: 'لا توجد أي منشورات معلقة في جدول الانتظار حالياً. يمكنك توليد جدول منشورات جديد.'
    };
  }

  console.log(`[QueueManager] جاري نشر المنشور المجدول: "${nextItem.hook}"...`);

  try {
    const postResult = await publishPost({
      businessName: nextItem.businessName,
      text: `${nextItem.hook}\n\n${nextItem.body}`,
      callToAction: nextItem.callToAction,
      headless: options.headless ?? true
    });

    nextItem.status = 'PUBLISHED';
    nextItem.publishedAt = new Date().toISOString();
    nextItem.screenshot = postResult.screenshotPath;

    saveQueue(queue);

    return {
      success: true,
      post: nextItem,
      details: postResult
    };
  } catch (err) {
    nextItem.status = 'FAILED';
    nextItem.error = err.message;
    saveQueue(queue);
    throw err;
  }
}

/**
 * Returns summary stats about scheduled posts.
 */
function getQueueStats() {
  const queue = loadQueue();
  return {
    total: queue.length,
    pending: queue.filter(q => q.status === 'PENDING').length,
    published: queue.filter(q => q.status === 'PUBLISHED').length,
    failed: queue.filter(q => q.status === 'FAILED').length,
    items: queue
  };
}

module.exports = {
  loadQueue,
  generateMonthlyQueue,
  processNextPendingPost,
  getQueueStats
};
