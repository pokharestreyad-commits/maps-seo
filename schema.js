/**
 * Maps SEO Core Engine - Data Normalizer & Schema
 * Standardizes raw place data into an audited structure.
 */

function normalizePlaceData(raw = {}) {
  return {
    placeId: raw.placeId || raw.id || '',
    name: (raw.name || '').trim(),
    
    // Categories
    primaryCategory: (raw.primaryCategory || raw.category || '').trim(),
    secondaryCategories: Array.isArray(raw.secondaryCategories)
      ? raw.secondaryCategories.map(c => String(c).trim()).filter(Boolean)
      : [],

    // Address & NAP
    address: {
      full: typeof raw.address === 'string'
        ? raw.address.trim()
        : (raw.address?.full || raw.formattedAddress || '').trim(),
      street: (raw.address?.street || '').trim(),
      city: (raw.address?.city || '').trim(),
      country: (raw.address?.country || '').trim(),
      postalCode: (raw.address?.postalCode || '').trim(),
      hasCoordinates: Boolean(raw.latitude && raw.longitude || raw.coordinates || raw.address?.hasCoordinates)
    },

    // Contact
    phone: (raw.phone || raw.phoneNumber || raw.internationalPhoneNumber || '').trim(),
    website: (raw.website || raw.websiteUri || '').trim(),

    // Profile Details
    description: (raw.description || raw.editorialSummary || '').trim(),
    openingHours: normalizeOpeningHours(raw.openingHours || raw.regularOpeningHours),
    
    // Reviews
    rating: Number(raw.rating || 0),
    userRatingsTotal: Number(raw.userRatingsTotal || raw.reviewCount || 0),
    reviews: Array.isArray(raw.reviews) ? raw.reviews.map(normalizeReview) : [],

    // Media
    photosCount: Number(raw.photosCount || raw.photos?.length || 0),
    hasLogo: Boolean(raw.hasLogo || raw.logoUrl),
    hasCoverPhoto: Boolean(raw.hasCoverPhoto || raw.coverPhotoUrl),
    recentPhotosCount: Number(raw.recentPhotosCount || 0), // photos in last 30 days
    ugcPhotosCount: Number(raw.ugcPhotosCount || 0), // customer uploaded photos

    // Engagement & Attributes
    attributes: Array.isArray(raw.attributes) ? raw.attributes : Object.keys(raw.attributes || {}),
    posts: Array.isArray(raw.posts) ? raw.posts.map(normalizePost) : [],
    qaCount: Number(raw.qaCount || raw.questionsAndAnswersCount || 0),
    
    // Audit Metadata
    auditedAt: new Date().toISOString()
  };
}

function normalizeOpeningHours(hours) {
  if (!hours) return null;
  const periods = hours.periods || hours.weekdayDescriptions || hours.days || [];
  return {
    isOpenNow: Boolean(hours.openNow ?? hours.isOpenNow),
    hasSevenDays: Array.isArray(periods) ? periods.length >= 7 : false,
    hasSpecialHours: Boolean(hours.specialHours || hours.holidayHours?.length),
    raw: hours
  };
}

function normalizeReview(r) {
  return {
    id: r.id || r.reviewId || '',
    author: r.author || r.authorName || 'عميل',
    rating: Number(r.rating || 0),
    text: (r.text || r.comment || '').trim(),
    publishedAt: r.publishedAt || r.publishTime || (r.time ? new Date(r.time * 1000) : null),
    ownerResponse: r.ownerResponse ? {
      text: (r.ownerResponse.text || r.ownerResponse || '').trim(),
      respondedAt: r.ownerResponse.date ? new Date(r.ownerResponse.date) : null
    } : null
  };
}

function normalizePost(p) {
  return {
    id: p.id || '',
    summary: (p.summary || p.text || '').trim(),
    createdAt: p.createdAt || (p.date ? new Date(p.date) : null),
    callToAction: p.callToAction || p.actionType || null
  };
}

module.exports = {
  normalizePlaceData
};
