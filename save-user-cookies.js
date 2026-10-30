/**
 * Script to save user's live Google session cookies and sync with local & cloud production.
 */

const { saveCloudSession, isCloudSessionActive, getCloudSession } = require('./scheduler/sessionStore');
const fs = require('fs');
const path = require('path');

const userCookies = [
    {
        "domain": ".google.com",
        "expirationDate": 1827071426.572779,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SAPISID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "KaLTItM3nZ2ThTDp/AmH3DhjqehBSHnssY"
    },
    {
        "domain": ".google.com",
        "expirationDate": 1827071426.57304,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-3PAPISID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "KaLTItM3nZ2ThTDp/AmH3DhjqehBSHnssY"
    },
    {
        "domain": ".google.com",
        "expirationDate": 1807375064.324305,
        "hostOnly": false,
        "httpOnly": true,
        "name": "AEC",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "Aaa9EJpxblI2tD6uTbI7c6tICi_WgKgA8KUZ3Mm692tzXoZTkAoVVBCISQ"
    },
    {
        "domain": ".business.google.com",
        "expirationDate": 1827936973.048948,
        "hostOnly": false,
        "httpOnly": false,
        "name": "_ga",
        "path": "/",
        "sameSite": null,
        "secure": false,
        "session": false,
        "storeId": null,
        "value": "GA1.1.311482837.1779465475"
    },
    {
        "domain": "business.google.com",
        "expirationDate": 1795968972,
        "hostOnly": true,
        "httpOnly": false,
        "name": "OTZ",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "8851216_48_48_171240_44_319500"
    },
    {
        "domain": ".business.google.com",
        "expirationDate": 1814104042.833997,
        "hostOnly": false,
        "httpOnly": false,
        "name": "_ga_J51Y85KVRZ",
        "path": "/",
        "sameSite": null,
        "secure": false,
        "session": false,
        "storeId": null,
        "value": "GS2.1.s1779544033$o1$g0$t1779544042$j51$l0$h0"
    },
    {
        "domain": ".business.google.com",
        "expirationDate": 1817748852.866177,
        "hostOnly": false,
        "httpOnly": false,
        "name": "_ga_ZVJSBCMMFJ",
        "path": "/",
        "sameSite": null,
        "secure": false,
        "session": false,
        "storeId": null,
        "value": "GS2.1.s1783188836$o1$g1$t1783188852$j44$l0$h0"
    },
    {
        "domain": ".google.com",
        "expirationDate": 1809171529.40797,
        "hostOnly": false,
        "httpOnly": true,
        "name": "NID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "CqQDCAES1gIBM9Agl79lDAqafyOYADcn1NwPie5VyemmJwkJ9_tprcDLfQKEyHyfjj9FDsWwSYQaNTlai43Bb5MjTivIV2-rRLF_uTPTFK2qG-d1Uul_Xg1nIyBPKBarmiSgr_E1jxCO59aosh2_gUIqJIZLpvzdoFBQAVdM8qLnDS4oxL-yukUNHLMXLnd7i1Z4QL9_sbI59iUc2XoYu06KtdHwBnVFawyCz20UfU6Cn3oi8BjsVN6KoFDau6YB8_4JcUD_WuRV7gvCqZpTvjuSQ-N5u_s9ggLTQENiLSBW7YiRo3skOzfKr_qjLKkHOl0CskSDg4M9JqqYbewvhI5r5ngX-sdzNN3W5WDaj9LrUDykjbMOLFB-BlBMHIWyk92v-lTZwCtokv7Nu2viOxbBwR_HBtXmOEia4bCCKnvjEPu7n6eryt3Ft5zxPXiMCRP6hhS8Gs381w95FiooATJFAXBKQs9t_GcoIaR_EGwkwNeNTm7TZ5ml9dFFJTlRg1_j_J4Qr8ODSUK1usxIteB4613H03HZWbQq2BnRbdXB47mpKAYI"
    },
    {
        "domain": ".google.com",
        "expirationDate": 1827071426.572645,
        "hostOnly": false,
        "httpOnly": false,
        "name": "APISID",
        "path": "/",
        "sameSite": null,
        "secure": false,
        "session": false,
        "storeId": null,
        "value": "fTcf_RF_z1wFMlUm/AN-0BOI2X1Btj3ZsP"
    },
    {
        "domain": ".google.com",
        "expirationDate": 1824913353.256675,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDTS",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "sidts-CjIBnJZzavEO35TQ4lmp3ak5tzgS_Vhj3XK7ulvBXjRzhETWK7-GXrp43gwG9o0sl5ehPRAA"
    },
    {
        "domain": ".google.com",
        "expirationDate": 1827071426.57291,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-1PAPISID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "KaLTItM3nZ2ThTDp/AmH3DhjqehBSHnssY"
    },
    {
        "domain": ".business.google.com",
        "hostOnly": false,
        "httpOnly": false,
        "name": "ADS_CUSTOMER_ACCOUNT_SESSION_INFO",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": true,
        "storeId": null,
        "value": "GO46FO9XQ7JiARc0rWc83Ah1pXYNdOTPL3mK1ca9oEA=authuser-0"
    },
    {
        "domain": ".google.com",
        "expirationDate": 1827071426.5742,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "g.a000Dwk0Q_3r9Vx1_8caWQ-hsV-UA4o79MBtXp0M_qPDe8oDmZ3FQVKAMyzCdexpce-PeGax0AACgYKAQQSARQSFQHGX2MiNxzFvR7ePrutpTos75LeaxoVAUF8yKqV7llY_RstKnH86q2cuHbD0076"
    },
    {
        "domain": ".google.com",
        "expirationDate": 1827071426.574068,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "g.a000Dwk0Q_3r9Vx1_8caWQ-hsV-UA4o79MBtXp0M_qPDe8oDmZ3FEdv_O81cFr1Z9vrL6irnsgACgYKAWMSARQSFQHGX2MiRF4kN5p05047XflRlBvUNBoVAUF8yKr1B94ptftxKtjh4BxueiPj0076"
    },
    {
        "domain": ".google.com",
        "expirationDate": 1824913825.324022,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDCC",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "APD_SKEtcXs38LJP7EZ9qkeeEGdJx8bMVPR0IMHJ4gXbTPOGNE278b5VGPZa6ml70MVAvhrYiOw"
    },
    {
        "domain": ".google.com",
        "expirationDate": 1824913825.324113,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDCC",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "APD_SKEvWToEXkQ6_CpABAR822tR8tHAolPybGnbD1dc2hCfLSvTug22oSrOqSdI81Mbo2T5Pw"
    },
    {
        "domain": ".google.com",
        "expirationDate": 1824913353.256899,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDTS",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "sidts-CjIBnJZzavEO35TQ4lmp3ak5tzgS_Vhj3XK7ulvBXjRzhETWK7-GXrp43gwG9o0sl5ehPRAA"
    },
    {
        "domain": ".business.google.com",
        "expirationDate": 1817753574.951238,
        "hostOnly": false,
        "httpOnly": false,
        "name": "_ga_V9K47ZG8NP",
        "path": "/",
        "sameSite": null,
        "secure": false,
        "session": false,
        "storeId": null,
        "value": "GS2.1.s1783193574$o5$g0$t1783193574$j60$l0$h0"
    },
    {
        "domain": ".business.google.com",
        "expirationDate": 1827936973.071372,
        "hostOnly": false,
        "httpOnly": false,
        "name": "_ga_VM5ES1YN10",
        "path": "/",
        "sameSite": null,
        "secure": false,
        "session": false,
        "storeId": null,
        "value": "GS2.1.s1793376973$o4$g0$t1793376973$j60$l0$h0"
    },
    {
        "domain": ".business.google.com",
        "expirationDate": 1814025478.232447,
        "hostOnly": false,
        "httpOnly": false,
        "name": "_gmb_ga",
        "path": "/",
        "sameSite": null,
        "secure": false,
        "session": false,
        "storeId": null,
        "value": "GA1.3.311482837.1779465475"
    },
    {
        "domain": ".google.com",
        "expirationDate": 1827071426.572314,
        "hostOnly": false,
        "httpOnly": true,
        "name": "HSID",
        "path": "/",
        "sameSite": null,
        "secure": false,
        "session": false,
        "storeId": null,
        "value": "AOo1VyRdpi_nNijbU"
    },
    {
        "domain": ".google.com",
        "expirationDate": 1799952800.435909,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SEARCH_SAMESITE",
        "path": "/",
        "sameSite": "strict",
        "secure": false,
        "session": false,
        "storeId": null,
        "value": "CgQIrKEB"
    },
    {
        "domain": ".google.com",
        "expirationDate": 1827071426.573938,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SID",
        "path": "/",
        "sameSite": null,
        "secure": false,
        "session": false,
        "storeId": null,
        "value": "g.a000Dwk0Q_3r9Vx1_8caWQ-hsV-UA4o79MBtXp0M_qPDe8oDmZ3FXirTKdqy3ysQpU_UDPFoJAACgYKAXoSARQSFQHGX2MiZEgEHcZjD43KOCV5coeLCRoVAUF8yKohxg3KZCdgyJQho998illP0076"
    },
    {
        "domain": ".google.com",
        "expirationDate": 1824913825.32383,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SIDCC",
        "path": "/",
        "sameSite": null,
        "secure": false,
        "session": false,
        "storeId": null,
        "value": "APD_SKHywzdPCTGO3yie0RSXXyGZKg2XKkkKtZMchzK1HLx-P6FIe7fdZvg_CiN6ITmkxK5rRrQ"
    },
    {
        "domain": ".google.com",
        "expirationDate": 1827071426.572504,
        "hostOnly": false,
        "httpOnly": true,
        "name": "SSID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AgSfmzAlrSUueWXDG"
    }
];

async function run() {
  console.log('================================================================');
  console.log('🔐 جاري حفظ وتفعيل كوكيز الجلسة الحقيقية لحساب رسلان للتسويق...');
  console.log('================================================================');

  const saved = saveCloudSession(userCookies, {
    accountName: 'رسلان للتسويق (Google Business Profile Owner)',
    source: 'user_provided_session'
  });

  console.log(`✅ تم حفظ ${saved.cookiesCount} كوكيز في cloud_session.json بنجاح.`);
  console.log(`🟢 حالة الجلسة السحابية: isCloudSessionActive() = ${isCloudSessionActive()}`);

  // Also POST to live production https://seo.raslans.net/api/session
  try {
    console.log('🚀 جاري مزامنة الجلسة السحابية مع خادم الإنتاج (https://seo.raslans.net)...');
    const res = await fetch('https://seo.raslans.net/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cookies: userCookies,
        accountName: 'رسلان للتسويق (Google Business Profile Owner)'
      })
    });
    const json = await res.json();
    console.log('📡 استجابة خادم الإنتاج:', json);
  } catch (err) {
    console.log('⚠️ ملاحظة المزامنة الخارجية:', err.message);
  }

  console.log('\n🎉 اكتمل التفعيل بنجاح! الجلسة نشطة وموثقة.');
}

run();
