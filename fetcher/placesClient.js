/**
 * Google Places API Client (Official Provider)
 * Fetches place details, reviews, photos, and opening hours using Google Places API.
 */

const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

/**
 * Searches for a place by text query to obtain its Place ID.
 * @param {string} query - e.g. "مطعم بلبن المعادي"
 * @param {string} apiKey - Google Maps API Key
 * @returns {Promise<string|null>} Place ID
 */
async function findPlaceId(query, apiKey) {
  if (!apiKey) throw new Error('GOOGLE_MAPS_API_KEY is required to search via Google Places API.');

  const endpoint = `${GOOGLE_PLACES_BASE_URL}/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address&key=${apiKey}`;
  
  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`Google API HTTP error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (data.status === 'OK' && data.candidates?.length > 0) {
    return data.candidates[0].place_id;
  }
  return null;
}

/**
 * Retrieves comprehensive details for a specific Place ID.
 * @param {string} placeId 
 * @param {string} apiKey 
 * @returns {Promise<Object>} Raw place data formatted for schema normalizer
 */
async function fetchPlaceDetails(placeId, apiKey) {
  if (!apiKey) throw new Error('GOOGLE_MAPS_API_KEY is required to fetch place details.');

  const fields = [
    'place_id',
    'name',
    'formatted_address',
    'address_components',
    'geometry',
    'international_phone_number',
    'formatted_phone_number',
    'website',
    'rating',
    'user_ratings_total',
    'reviews',
    'photos',
    'opening_hours',
    'types',
    'editorial_summary',
    'business_status',
    'curbside_pickup',
    'delivery',
    'dine_in',
    'reservable',
    'serves_beer',
    'serves_wine',
    'wheelchair_accessible_entrance'
  ].join(',');

  const endpoint = `${GOOGLE_PLACES_BASE_URL}/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&language=ar&key=${apiKey}`;

  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`Google Places API Details HTTP error: ${res.status}`);
  }

  const data = await res.json();
  if (data.status !== 'OK') {
    throw new Error(`Google API returned error status: ${data.status} - ${data.error_message || ''}`);
  }

  const r = data.result;

  // Extract address components (City, Street, Country, Postal Code)
  const components = r.address_components || [];
  const getComp = (type) => components.find(c => c.types.includes(type))?.long_name || '';

  // Extract attributes/amenities supported by Google
  const detectedAttributes = [];
  if (r.wheelchair_accessible_entrance) detectedAttributes.push('مدخل كراسي متحركة');
  if (r.delivery) detectedAttributes.push('خدمة التوصيل');
  if (r.dine_in) detectedAttributes.push('تناول الطعام داخل المكان');
  if (r.curbside_pickup) detectedAttributes.push('استلام من الخارج');
  if (r.reservable) detectedAttributes.push('يقبل الحجز المسبق');

  // Map reviews
  const reviews = (r.reviews || []).map(rev => ({
    author: rev.author_name,
    rating: rev.rating,
    text: rev.text,
    publishedAt: new Date(rev.time * 1000),
    ownerResponse: null // Google Places Details API does not include owner replies; Business Profile API or scraping is used for replies.
  }));

  return {
    placeId: r.place_id,
    name: r.name,
    primaryCategory: r.types?.[0] || '',
    secondaryCategories: (r.types || []).slice(1, 6),
    address: {
      full: r.formatted_address,
      street: getComp('route'),
      city: getComp('locality') || getComp('administrative_area_level_2') || getComp('administrative_area_level_1'),
      country: getComp('country'),
      postalCode: getComp('postal_code'),
      hasCoordinates: Boolean(r.geometry?.location)
    },
    latitude: r.geometry?.location?.lat,
    longitude: r.geometry?.location?.lng,
    phone: r.formatted_phone_number || r.international_phone_number || '',
    website: r.website || '',
    description: r.editorial_summary?.overview || '',
    openingHours: r.opening_hours ? {
      isOpenNow: r.opening_hours.open_now,
      periods: r.opening_hours.periods || [],
      weekdayDescriptions: r.opening_hours.weekday_text || []
    } : null,
    rating: r.rating || 0,
    userRatingsTotal: r.user_ratings_total || 0,
    reviews,
    photosCount: r.photos?.length || 0,
    hasLogo: Boolean(r.photos?.length),
    hasCoverPhoto: Boolean(r.photos?.length > 1),
    attributes: detectedAttributes
  };
}

module.exports = {
  findPlaceId,
  fetchPlaceDetails
};
