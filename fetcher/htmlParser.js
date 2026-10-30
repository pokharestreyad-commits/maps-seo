/**
 * Google Maps Public Web Page Parser (Zero-Cost / Fallback Provider)
 * Extracts public metadata from Google Maps HTML without requiring an API key.
 */

const { expandShortUrl } = require('./urlParser');

/**
 * Fetches and parses public Google Maps metadata from a URL.
 * @param {string} mapsUrl - Short or full Google Maps URL
 * @returns {Promise<Object>} Extracted business entity
 */
async function extractFromMapsUrl(mapsUrl) {
  const finalUrl = await expandShortUrl(mapsUrl);

  const res = await fetch(finalUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ar,en;q=0.9'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Google Maps page (Status: ${res.status})`);
  }

  const html = await res.text();

  // 1. Extract Name
  let name = '';
  const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
                       html.match(/<meta\s+content="([^"]+)"\s+property="og:title"/i);
  if (ogTitleMatch) {
    // Strip "· Google Maps" if appended
    name = ogTitleMatch[1].replace(/·\s*Google\s*Maps.*/i, '').trim();
  }

  if (!name) {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      name = titleMatch[1].replace(/-\s*Google\s*Maps.*/i, '').trim();
    }
  }

  // 2. Extract Description & Rating from og:description
  // Example: "★★★★☆ · مطعم · شارع فيصل، الجيزة" or "4.5 ★ (120) · مطعم"
  let description = '';
  let rating = 0;
  let userRatingsTotal = 0;
  let primaryCategory = '';
  let address = '';

  const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i) ||
                      html.match(/<meta\s+content="([^"]+)"\s+property="og:description"/i);
  if (ogDescMatch) {
    description = ogDescMatch[1].trim();

    // Parse stars / rating
    const starMatches = (description.match(/★/g) || []).length;
    if (starMatches > 0) {
      rating = starMatches;
    }

    // Try extracting numeric rating like "4.3"
    const numericRating = description.match(/([1-5]\.\d)\s*★?/);
    if (numericRating) {
      rating = parseFloat(numericRating[1]);
    }

    // Try extracting review count like "(120)" or "120 تقييم"
    const countMatch = description.match(/\((\d+[\d,]*)\)/) || description.match(/(\d+[\d,]*)\s*(?:مراجعة|تقييم|reviews)/i);
    if (countMatch) {
      userRatingsTotal = parseInt(countMatch[1].replace(/,/g, ''), 10);
    }

    // Segments separated by '·'
    const parts = description.split('·').map(p => p.trim());
    if (parts.length >= 2) {
      // Typically part 1 is rating/stars, part 2 is category, part 3 is address
      primaryCategory = parts[1].replace(/[★☆\d().,]/g, '').trim();
      if (parts[2]) {
        address = parts.slice(2).join(' - ').trim();
      }
    }
  }

  // 3. Extract Image / Cover Photo
  let hasCoverPhoto = false;
  let photosCount = 1;
  const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
                       html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i);
  if (ogImageMatch && ogImageMatch[1] && !ogImageMatch[1].includes('maps/vt/')) {
    hasCoverPhoto = true;
    photosCount = 5; // Default estimation when gallery is present
  }

  // 4. Extract Coordinates from URL
  let latitude = null;
  let longitude = null;
  const coordsMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordsMatch) {
    latitude = parseFloat(coordsMatch[1]);
    longitude = parseFloat(coordsMatch[2]);
  }

  return {
    source: 'WEB_PARSER',
    name: name || 'نشاط تجاري على خرائط جوجل',
    primaryCategory: primaryCategory || 'نشاط محلي',
    secondaryCategories: [],
    address: {
      full: address || '',
      street: '',
      city: '',
      hasCoordinates: Boolean(latitude && longitude)
    },
    latitude,
    longitude,
    phone: '',
    website: '',
    description,
    rating,
    userRatingsTotal,
    reviews: [],
    photosCount,
    hasLogo: Boolean(hasCoverPhoto),
    hasCoverPhoto,
    attributes: [],
    posts: []
  };
}

module.exports = {
  extractFromMapsUrl
};
