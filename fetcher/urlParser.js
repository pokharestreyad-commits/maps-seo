/**
 * Google Maps URL Parser & Resolver
 * Extracts Place ID, Coordinates, Place Name, and CID from various Google Maps URL formats.
 */

/**
 * Resolves short links (e.g. maps.app.goo.gl or goo.gl/maps) by following HTTP redirects.
 * @param {string} shortUrl 
 * @returns {Promise<string>} Canonical expanded URL
 */
async function expandShortUrl(shortUrl) {
  try {
    const response = await fetch(shortUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ar-EG,ar;q=0.9,en;q=0.8'
      }
    });
    let finalUrl = response.url || shortUrl;
    if (finalUrl === shortUrl || finalUrl.includes('maps.app.goo.gl')) {
      const html = await response.text();
      const metaRefresh = html.match(/content=["']\d+;\s*url=([^"']+)["']/i);
      if (metaRefresh) return metaRefresh[1];
      const canonical = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
                        html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
      if (canonical) return canonical[1];
      const aHref = html.match(/<a\s+[^>]*href=["'](https?:\/\/[^"']*(?:google\.com\/maps|maps\.google)[^"']*)["']/i);
      if (aHref) return aHref[1];
    }
    return finalUrl;
  } catch {
    return shortUrl;
  }
}

/**
 * Parses any Google Maps URL and extracts structured identifiers.
 * @param {string} urlString 
 * @returns {Promise<Object>} Extracted metadata { placeName, lat, lng, placeId, cid, originalUrl }
 */
async function parseMapsUrl(urlString) {
  let url = urlString.trim();

  // If it's a short URL, expand it first
  if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
    url = await expandShortUrl(url);
  }

  const result = {
    originalUrl: urlString,
    canonicalUrl: url,
    placeName: null,
    latitude: null,
    longitude: null,
    placeId: null,
    cid: null
  };

  // 1. Extract Place Name from /maps/place/NAME/
  const placeMatch = url.match(/\/maps\/place\/([^/@?]+)/i);
  if (placeMatch && placeMatch[1]) {
    result.placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
  }

  // 2. Extract Latitude & Longitude from /@lat,lng,zoom/
  const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordsMatch) {
    result.latitude = parseFloat(coordsMatch[1]);
    result.longitude = parseFloat(coordsMatch[2]);
  }

  // 3. Extract Place ID from !1s... or query params
  const placeIdParam = url.match(/[?&]place_id=([a-zA-Z0-9_-]+)/i);
  if (placeIdParam) {
    result.placeId = placeIdParam[1];
  } else {
    // Check 1s hex or place id token inside data params
    const dataPlaceId = url.match(/!1s(0x[0-9a-fA-F]+:[0-9a-fA-F]+|[a-zA-Z0-9_-]{20,})/);
    if (dataPlaceId) {
      result.placeId = dataPlaceId[1];
    }
  }

  // 4. Extract CID (Customer ID)
  const cidMatch = url.match(/[?&]cid=(\d+)/i);
  if (cidMatch) {
    result.cid = cidMatch[1];
  }

  return result;
}

module.exports = {
  expandShortUrl,
  parseMapsUrl
};
