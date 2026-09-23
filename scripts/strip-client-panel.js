/**
 * strip-client-panel.js
 * Converts ClientAdminPanel.tsx (copied from AdminPanel.tsx)
 * into a pure client-safe panel with zero developer tools.
 * Run: node scripts/strip-client-panel.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const targets = [
  path.resolve(__dirname, '../src/components/ClientAdminPanel.tsx'),
  // Also strip from NaveenSaloonWale if it exists
  path.resolve(__dirname, '../../NaveenSaloonWale/src/components/ClientAdminPanel.tsx'),
];

for (const filePath of targets) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping (not found): ${filePath}`);
    continue;
  }

  let code = fs.readFileSync(filePath, 'utf8');

  // 1. Change export name so App.tsx can still import it as 'AdminPanel'
  //    (ClientAdminPanel in client sites is named AdminPanel)
  //    Nothing to do here since App.tsx imports 'AdminPanel' directly.

  // 2. Remove export tab from TabType
  code = code.replace(
    /type TabType = [^;]+;/,
    "type TabType = 'sections' | 'portfolio' | 'brand' | 'about' | 'services' | 'packages' | 'videos' | 'faqs';"
  );

  // 3. Remove developer-only state
  code = code.replace(/\/\/ Turnkey Client Clone Generator State[\s\S]*?]\s*\);\n\s*const \[copiedCredentials[^\n]+\n/m, '');

  // 4. Remove unused imports (Download, Upload, Copy, Check, Briefcase, RotateCcw)
  code = code.replace(/\s*Download,\n/g, '\n');
  code = code.replace(/\s*Upload,\n/g, '\n');
  code = code.replace(/\s*Copy,\n/g, '\n');
  code = code.replace(/\s*Check\n/g, '\n');
  code = code.replace(/\s*RotateCcw,\n/g, '\n');
  code = code.replace(/\s*Briefcase,\n/g, '\n');
  code = code.replace(/\s*ExternalLink,\n/g, '\n');
  code = code.replace(/\s*ChevronRight,\n/g, '\n');

  // 5. Remove jsonImportRef
  code = code.replace(/\s*const jsonImportRef = useRef<HTMLInputElement>\(null\);\n/g, '\n');

  // 6. Remove resetToDefault from destructuring
  code = code.replace(
    /const \{ content, saveContent, resetToDefault, exportConfigJson, importConfigJson, isFirebaseConnected \} = useSiteContent\(\);/,
    'const { content, saveContent, isFirebaseConnected } = useSiteContent();'
  );

  // 7. Remove developer-only destructured values from useAuth
  code = code.replace(
    /const \{ isAdmin, user, role, isDeveloper, logout \} = useAuth\(\);/,
    'const { logout } = useAuth();'
  );

  // 8. Remove handleReset function entirely
  code = code.replace(/\s*const handleReset[^;]+;\s*\};\n/g, '\n');

  // 9. Remove downloadConfigJson, handleDownloadClientCloneJson, generatedCredentialsSnippet, handleJsonImport
  code = code.replace(/\s*const downloadConfigJson[^;]+;\n[^}]+\};\n/g, '\n');
  code = code.replace(/\s*const handleDownloadClientCloneJson[\s\S]*?^\s*\};\n/m, '\n');
  code = code.replace(/\s*const generatedCredentialsSnippet[\s\S]*?^\s*`;\n/m, '\n');
  code = code.replace(/\s*const handleJsonImport[\s\S]*?^\s*\};\n/m, '\n');

  // 10. Remove isDeveloper usage from header badges
  code = code.replace(/\s*<span[^>]*>\s*\{isDeveloper \? 'Master Admin' : 'Client Access'\}[\s\S]*?<\/span>\n/m, '\n');
  code = code.replace(/\s*\{isDeveloper[\s\S]*?Customise your photos[^}]+\}\n/m, '\n');

  // 11. Remove export tab sidebar button (isDeveloper block)
  code = code.replace(/\s*\{isDeveloper \&\& \(\s*<>\s*<div className="my-2[\s\S]*?<\/>\s*\)\}\n/m, '\n');

  // 12. Remove Reset button from sidebar (isDeveloper block)
  code = code.replace(/\s*\{isDeveloper \&\& \(\s*<button[\s\S]*?Reset To Original Defaults[\s\S]*?<\/button>\s*\)\}\n/m, '\n');

  // 13. Remove entire export tab JSX block
  code = code.replace(/\s*\{\/\* ══+TAB 8: CLONE[\s\S]*?^\s*\}\)\}\n/m, '\n');

  // 14. Remove isDeveloper check on export tab redirect
  code = code.replace(/\s*\/\/ Ensure client cannot remain on export tab[\s\S]*?\}\s*\}, \[isDeveloper[^\]]+\]\);\n/m, '\n');

  // 15. Remove fileInputRef (unused)
  code = code.replace(/\s*const fileInputRef = useRef<HTMLInputElement>\(null\);\n/g, '\n');

  // 16. Update subtitle based on role (remove conditional)
  code = code.replace(
    /\{isDeveloper[\s\S]*?Customise your photos, videos[^}]+\}\}/,
    'Customise photos, videos, model galleries, pricing, and texts.'
  );

  fs.writeFileSync(filePath, code, 'utf8');
  console.log(`✓ Stripped developer tools from: ${path.basename(path.dirname(path.dirname(filePath))) + '/...' || filePath}`);
}

console.log('\nDone! ClientAdminPanel.tsx now has identical UI to AdminPanel.tsx minus clone/export/reset tools.');
