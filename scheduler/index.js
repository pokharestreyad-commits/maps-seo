/**
 * Maps SEO Scheduler & Browser Automation - Unified Export
 */

const { openLoginSession, publishPost, SESSION_DIR } = require('./browserPoster');
const { generateMonthlyQueue, processNextPendingPost, getQueueStats, loadQueue } = require('./queueManager');

module.exports = {
  openLoginSession,
  publishPost,
  generateMonthlyQueue,
  processNextPendingPost,
  getQueueStats,
  loadQueue,
  SESSION_DIR
};
