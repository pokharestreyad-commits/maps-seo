/**
 * Maps SEO Pro - Google Account One-Time Login & Captcha Solver
 * يفتح نافذة متصفح مرئية لتسجيل الدخول لحساب جوجل المالك وحل الكابتشا لمرة واحدة.
 * يتم حفظ الكوكيز وملفات الجلسة في مجلد session_data للاستخدام التلقائي الطويل في الخلفية.
 */

const { openLoginSession, SESSION_DIR } = require('./scheduler/browserPoster');
const readline = require('readline');

async function main() {
  console.log('================================================================');
  console.log('🔐 Maps SEO Pro - تسجيل الدخول وحل الكابتشا لمرة واحدة');
  console.log('================================================================');
  console.log('📁 مجلد حفظ الجلسة والكوكيز:', SESSION_DIR);
  console.log('⏳ جاري فتح متصفح جوجل كروم الآن...');

  try {
    const browser = await openLoginSession();

    console.log('\n----------------------------------------------------------------');
    console.log('👉 الخطوات المطلوبة في المتصفح المفتوح أمامك:');
    console.log('  1. قم بتسجيل الدخول إلى حساب Google الذي يدير نشاطك التجاري.');
    console.log('  2. إذا ظهرت شاشة الكابتشا (أنا لست برنامج روبوت)، قم بحلها.');
    console.log('  3. تأكد من ظهور لوحة نشاطك التجاري في خرائط جوجل.');
    console.log('----------------------------------------------------------------');
    console.log('⌨️  بعد الانتهاء، اضغط [ENTER] هنا في هذه الشاشة لحفظ الجلسة وإغلاق المتصفح:');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('', async () => {
      rl.close();
      try {
        await browser.close();
      } catch {}
      console.log('\n✅ تم حفظ الجلسة بنجاح تام! 🎉');
      console.log('🚀 الآن يمكن للنظام النشر التلقائي في الخلفية بدون كابتشا لفترات طويلة.');
      console.log('💡 لتجربة نشر المنشور المجدول فوراً في الخلفية، شغّل: npm run post-now\n');
      process.exit(0);
    });

    browser.on('disconnected', () => {
      console.log('\n✅ تم إغلاق المتصفح وحفظ الجلسة في session_data بنجاح!');
      process.exit(0);
    });

  } catch (err) {
    console.error('❌ خطأ أثناء فتح المتصفح:', err.message);
    process.exit(1);
  }
}

main();
