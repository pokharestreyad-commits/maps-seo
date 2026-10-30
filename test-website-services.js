/**
 * Test Website Services Extraction & Dedicated Campaign Generator
 */

const { generateWebsiteServicesCampaign } = require('./index');

async function testWebsiteCampaign() {
  console.log('='.repeat(70));
  console.log('🌐 اختبار قراءة الموقع الإلكتروني وتوليد منشورات لكل خدمة متخصصة');
  console.log('='.repeat(70));

  const sampleClinic = {
    name: 'مركز النور التخصصي لطب وجراحة العيون',
    city: 'مدينة نصر، القاهرة',
    phone: '+201012345678'
  };

  const sampleWebsite = 'https://alnoor-eye-clinic.com';

  console.log(`\n🔍 جاري استخراج الخدمات وتوليد منشورات لـ [${sampleClinic.name}] من موقعه...`);
  const campaign = await generateWebsiteServicesCampaign(sampleWebsite, sampleClinic);

  console.log(`\n✅ تم استخراج ${campaign.extractedServicesCount} خدمات أساسية:`);
  for (const s of campaign.services) {
    console.log(`   • ${s}`);
  }

  console.log(`\n📌 عينة من المنشورات المجهزة لخرائط جوجل (مخصصة لكل خدمة):`);
  for (const [i, p] of campaign.campaignPosts.slice(0, 2).entries()) {
    console.log(`\n   [منشور خدمة ${i + 1}]: "${p.service}"`);
    console.log(`   العنوان: ${p.hook}`);
    console.log(`   النص: ${p.body}`);
    console.log(`   زر الإجراء: [${p.callToAction}]`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ اكتمل اختبار استخراج الخدمات وتوليد الحملة بنجاح كامل!');
  console.log('='.repeat(70));
}

testWebsiteCampaign().catch(console.error);
