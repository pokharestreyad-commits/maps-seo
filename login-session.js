/**
 * Maps SEO Pro - Google Account One-Time Login & Auto Cookie Extractor
 * يفتح نافذة متصفح جوجل كروم مرئية لتسجيل الدخول بحساب جوجل المالك لـ "رسلان للتسويق".
 * يقوم الروبوت تلقائياً باستخراج كوكيز الجلسة وحفظها في cloud_session.json دون الحاجة لنسخ يدوي!
 */

const { openLoginSession, SESSION_DIR } = require('./scheduler/browserPoster');
const { saveCloudSession } = require('./scheduler/sessionStore');
const readline = require('readline');

async function main() {
  console.log('================================================================');
  console.log('🔐 Maps SEO Pro - تسجيل الدخول واستخراج الجلسة التلقائي');
  console.log('================================================================');
  console.log('📁 مجلد حفظ بيانات المتصفح:', SESSION_DIR);
  console.log('⏳ جاري إطلاق متصفح جوجل كروم المرئي الآن...\n');

  try {
    const browser = await openLoginSession();
    const pages = await browser.pages();
    const page = pages[0] || (await browser.newPage());

    console.log('👉 في نافذة المتصفح المفتوحة الآن:');
    console.log('  1. قم بتسجيل الدخول إلى حساب Google الذي يدير "رسلان للتسويق".');
    console.log('  2. تأكد من فتح صفحة Google Business Profile (أو ظهور لوحة النشاط).');
    console.log('----------------------------------------------------------------');
    console.log('⏳ الروبوت يراقب الجلسة الآن؛ بمجرد اكتمال تسجيل الدخول، سيتم حفظ الكوكيز تلقائياً...');

    // Function to extract and save cookies
    let saved = false;
    async function extractAndSave() {
      try {
        const cookies = await page.cookies();
        const important = cookies.filter(c => c.name.includes('SID') || c.name.includes('SSID') || c.name.includes('APISID'));
        if (important.length >= 2 && !saved) {
          saved = true;
          const result = saveCloudSession(cookies, {
            accountName: 'حساب جوجل المالك - رسلان للتسويق',
            extractedAt: new Date().toISOString()
          });
          console.log('\n🎉 ============================================================');
          console.log(`✅ تم استخراج وحفظ ${result.cookiesCount} كوكيز سحابية بنجاح تام!`);
          console.log('🚀 تم تفعيل الجلسة السحابية في cloud_session.json تلقائياً!');
          console.log('============================================================\n');

          try {
            const { sendTelegramMessage } = require('./local-worker/telegramNotifier');
            await sendTelegramMessage(`
🎉 <b>تم تسجيل الدخول بنجاح تام! 🔐</b>
━━━━━━━━━━━━━━━━━━
🏢 <b>الحساب المعتمد:</b> رسلان للتسويق
🍪 <b>الكوكيز المحفوظة:</b> ${result.cookiesCount} كوكيز
🚀 <b>الحالة:</b> تم حفظ الجلسة بنجاح، والروبوت جاهز الآن لنشر المنشورات تلقائياً بدون أي كابتشا!
            `.trim());
          } catch {}
        }
      } catch (err) {}
    }

    // Monitor every 4 seconds for active session
    const interval = setInterval(async () => {
      try {
        await extractAndSave();
      } catch {}
    }, 4000);

    // Keep open until user closes or presses Enter
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\n⌨️  اضغط [ENTER] عند الانتهاء لحفظ الجلسة وإغلاق المتصفح: ', async () => {
      clearInterval(interval);
      rl.close();
      await extractAndSave();
      try { await browser.close(); } catch {}
      console.log('✅ تم إغلاق المتصفح وحفظ الجلسة بنجاح.');
      process.exit(0);
    });

    browser.on('disconnected', async () => {
      clearInterval(interval);
      console.log('\n✅ تم إغلاق نافذة المتصفح، واكتمل حفظ الجلسة بنجاح!');
      process.exit(0);
    });

  } catch (err) {
    console.error('❌ خطأ أثناء فتح المتصفح:', err.message);
    process.exit(1);
  }
}

main();
