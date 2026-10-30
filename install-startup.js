/**
 * Maps SEO Pro - Windows Startup Auto-Registrar
 * Registers the background worker to start silently with Windows.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const startupFolder = path.join(
  process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
  'Microsoft',
  'Windows',
  'Start Menu',
  'Programs',
  'Startup'
);

const targetVbs = path.join(startupFolder, 'MapsSEO_Poster.vbs');
const projectDir = path.resolve(__dirname);
const scriptPath = path.join(projectDir, 'local-worker', 'localEngine.js');

const vbsContent = `Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "${projectDir.replace(/\\/g, '\\\\')}"
WshShell.Run "node ""${scriptPath.replace(/\\/g, '\\\\')}""", 0, False
`;

try {
  fs.writeFileSync(targetVbs, vbsContent, 'utf8');
  console.log('================================================================');
  console.log('✅ تم تسجيل روبوت Maps SEO Pro في بدء تشغيل الويندوز بنجاح!');
  console.log('================================================================');
  console.log('📁 المسار المسجل:', targetVbs);
  console.log('🚀 سيعمل الروبوت تلقائياً وبشكل صامت في الخلفية عند كل تشغيل للكمبيوتر.');
  console.log('================================================================\n');
} catch (err) {
  console.error('❌ تعذر التسجيل في مجلد Startup:', err.message);
}
