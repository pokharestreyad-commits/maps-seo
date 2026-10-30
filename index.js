/**
 * Maps SEO Core Engine - Master Entrypoint
 * Provides a clean API to audit any Google Business Profile / Maps entity.
 */

const { normalizePlaceData } = require('./schema');
const { calculateAuditScore } = require('./scorer');
const { generateActionPlan, enrichPlanWithLiveAi } = require('./advisor');
const { compareWithCompetitors } = require('./rules/competitorBenchmark');
const { fetchPlaceData, extractServicesFromWebsite, generateWebsiteServicesCampaign } = require('./fetcher/index');
const { generateHtmlReport } = require('./reporter/index');
const ai = require('./ai/index');
const scheduler = require('./scheduler/index');

/**
 * Runs a complete Local SEO audit on raw place data (Fast / Synchronous).
 * @param {Object} rawPlaceData - Raw data from Google Places API or scraping.
 * @returns {Object} Complete structured audit report.
 */
function auditPlace(rawPlaceData) {
  const normalized = normalizePlaceData(rawPlaceData);
  const scoreResult = calculateAuditScore(normalized);
  const actionPlan = generateActionPlan(scoreResult, normalized);

  return {
    success: true,
    meta: {
      engineVersion: '1.0.0',
      auditedAt: normalized.auditedAt,
      aiPowered: false
    },
    business: {
      name: normalized.name,
      placeId: normalized.placeId,
      address: normalized.address.full,
      phone: normalized.phone,
      website: normalized.website,
      category: normalized.primaryCategory,
      rating: normalized.rating,
      userRatingsTotal: normalized.userRatingsTotal
    },
    audit: scoreResult,
    recommendations: actionPlan
  };
}

/**
 * Runs a complete Local SEO audit and enriches the findings with Groq AI intelligence.
 * @param {Object} rawPlaceData
 * @param {Object} [options] - { apiKey, model }
 * @returns {Promise<Object>} Enriched report with AI review replies, descriptions & posts.
 */
async function auditPlaceWithAi(rawPlaceData, options = {}) {
  const normalized = normalizePlaceData(rawPlaceData);
  const scoreResult = calculateAuditScore(normalized);
  const basePlan = generateActionPlan(scoreResult, normalized);
  const aiPlan = await enrichPlanWithLiveAi(basePlan, normalized, options);

  return {
    success: true,
    meta: {
      engineVersion: '1.0.0',
      auditedAt: normalized.auditedAt,
      aiPowered: true,
      aiModel: options.model || ai.DEFAULT_MODEL
    },
    business: {
      name: normalized.name,
      placeId: normalized.placeId,
      address: normalized.address.full,
      phone: normalized.phone,
      website: normalized.website,
      category: normalized.primaryCategory,
      rating: normalized.rating,
      userRatingsTotal: normalized.userRatingsTotal
    },
    audit: scoreResult,
    recommendations: aiPlan
  };
}

/**
 * Compares target business with local competitors and produces a strategic gap analysis.
 * @param {Object} targetRaw - The business being audited.
 * @param {Array<Object>} competitorsRaw - Array of competitor entities.
 * @param {Object} [options] - { enableAi: true }
 * @returns {Promise<Object>} Comprehensive competitor gap analysis and AI attack strategy.
 */
async function auditWithCompetitors(targetRaw, competitorsRaw = [], options = {}) {
  const auditReport = options.enableAi ? await auditPlaceWithAi(targetRaw, options) : auditPlace(targetRaw);
  const comparison = compareWithCompetitors(targetRaw, competitorsRaw);

  let aiStrategy = null;
  if (options.enableAi !== false && comparison.hasCompetitorData) {
    try {
      aiStrategy = await ai.generateCompetitorStrategy(comparison, options);
    } catch (err) {
      console.warn('[CompetitorStrategy] AI strategy generation failed:', err.message);
    }
  }

  return {
    ...auditReport,
    competitorsAnalysis: {
      ...comparison,
      aiStrategy
    }
  };
}

/**
 * Fetches place data from a Google Maps URL, Place ID, or Search Query, then audits it.
 * @param {string} input - Maps link, Place ID, or Search Query.
 * @param {Object} [options] - { apiKey, enableAi, model }
 * @returns {Promise<Object>} Complete structured audit report.
 */
async function auditFromInput(input, options = {}) {
  const rawData = await fetchPlaceData(input, options);
  if (options.enableAi) {
    return await auditPlaceWithAi(rawData, options);
  }
  return auditPlace(rawData);
}

module.exports = {
  auditPlace,
  auditPlaceWithAi,
  auditWithCompetitors,
  compareWithCompetitors,
  auditFromInput,
  fetchPlaceData,
  normalizePlaceData,
  calculateAuditScore,
  generateActionPlan,
  enrichPlanWithLiveAi,
  generateHtmlReport,
  extractServicesFromWebsite,
  generateWebsiteServicesCampaign,
  scheduler,
  ai
};
