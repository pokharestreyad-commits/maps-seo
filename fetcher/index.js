/**
 * Maps SEO Fetcher Orchestrator
 * Automatically determines input type (URL, Place ID, Search Query)
 * and retrieves the data via Google API or Public Web Fallback.
 */

const { parseMapsUrl } = require('./urlParser');
const { findPlaceId, fetchPlaceDetails } = require('./placesClient');
const { extractFromMapsUrl } = require('./htmlParser');

/**
 * Fetches place data from any input (URL, Place ID, or Search Query).
 * @param {string} input - Google Maps URL, Place ID, or Search Query.
 * @param {Object} [options] - Optional settings { apiKey, preferScraper }
 * @returns {Promise<Object>} Raw Place data ready for schema normalizer.
 */
async function fetchPlaceData(input, options = {}) {
  const trimmed = (input || '').trim();
  if (!trimmed) throw new Error('الرجاء إدخال رابط خرائط جوجل أو معرّف المكان (Place ID) أو اسم النشاط.');

  const apiKey = options.apiKey || process.env.GOOGLE_MAPS_API_KEY || null;

  // 1. Check if input is a Google Maps URL
  const isUrl = trimmed.startsWith('http://') || 
                trimmed.startsWith('https://') || 
                trimmed.includes('google.com/maps') || 
                trimmed.includes('maps.app.goo.gl') || 
                trimmed.includes('goo.gl/maps');

  if (isUrl) {
    const parsed = await parseMapsUrl(trimmed);

    // If we have an API key and were able to extract a Place ID from URL
    if (apiKey && parsed.placeId && !parsed.placeId.startsWith('0x')) {
      try {
        return await fetchPlaceDetails(parsed.placeId, apiKey);
      } catch (err) {
        console.warn(`[Fetcher] API details failed for ${parsed.placeId}, falling back to web parser:`, err.message);
      }
    }

    // If API key is present and we extracted a place name
    if (apiKey && parsed.placeName) {
      try {
        const discoveredId = await findPlaceId(parsed.placeName, apiKey);
        if (discoveredId) {
          return await fetchPlaceDetails(discoveredId, apiKey);
        }
      } catch (err) {
        console.warn('[Fetcher] Place text search failed, falling back to web parser:', err.message);
      }
    }

    // Zero-cost Web Parser fallback
    return await extractFromMapsUrl(trimmed);
  }

  // 2. Check if input looks like a Google Place ID (e.g. ChIJN1t_tDeuEmsRUsoyG83frY4)
  const isPlaceId = /^[a-zA-Z0-9_-]{24,}$/.test(trimmed);
  if (isPlaceId) {
    if (!apiKey) {
      throw new Error('لاستخدام معرّف المكان (Place ID) مباشرة، يجب توفير مفتاح Google Maps API Key في options.apiKey أو في متغير البيئة GOOGLE_MAPS_API_KEY.');
    }
    return await fetchPlaceDetails(trimmed, apiKey);
  }

  // 3. Otherwise treat as a Search Query (e.g. "مطعم البرنس التجمع")
  if (!apiKey) {
    throw new Error('للبحث بواسطة الاسم والمدينة، يلزم مفتاح Google Maps API Key. يمكنك إدخال رابط خرائط جوجل المباشر بدلاً من ذلك مجاناً.');
  }

  const foundId = await findPlaceId(trimmed, apiKey);
  if (!foundId) {
    throw new Error(`لم يتم العثور على أي نشاط تجاري مطابق لـ "${trimmed}".`);
  }

  return await fetchPlaceDetails(foundId, apiKey);
}

const { extractServicesFromWebsite, generateWebsiteServicesCampaign } = require('./websiteServices');

module.exports = {
  fetchPlaceData,
  extractServicesFromWebsite,
  generateWebsiteServicesCampaign
};
