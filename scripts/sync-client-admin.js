import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adminPanelPath = path.join(__dirname, '..', 'src', 'components', 'AdminPanel.tsx');
const clientAdminPath = path.join(__dirname, '..', 'src', 'components', 'ClientAdminPanel.tsx');

let code = fs.readFileSync(adminPanelPath, 'utf8');

// 1. Update TabType to remove 'export'
code = code.replace(
  `type TabType = 'enquiries' | 'sections' | 'portfolio' | 'testimonials' | 'brand' | 'about' | 'services' | 'packages' | 'videos' | 'faqs' | 'seo' | 'export';`,
  `type TabType = 'enquiries' | 'sections' | 'portfolio' | 'testimonials' | 'brand' | 'about' | 'services' | 'packages' | 'videos' | 'faqs' | 'seo';`
);

// 2. Remove Turnkey client clone generator state and methods
const startTurnkeyMarker = '// Turnkey Client Clone Generator State';
const endTurnkeyMarker = 'return (';
const turnkeyIdx = code.indexOf(startTurnkeyMarker);
const returnIdx = code.indexOf(endTurnkeyMarker, turnkeyIdx);

if (turnkeyIdx !== -1 && returnIdx !== -1) {
  // Find where handleJsonImport ends before return (
  const snippetToRemove = code.substring(turnkeyIdx, returnIdx);
  code = code.replace(snippetToRemove, '');
}

// 3. Remove Developer navigation items in sidebar
const devSidebarStart = '{isDeveloper && (';
const devSidebarEnd = '{/* Tab Content Area */}';
const devSideIdx = code.indexOf(devSidebarStart);
const tabContentIdx = code.indexOf(devSidebarEnd);
if (devSideIdx !== -1 && tabContentIdx !== -1) {
  // Find the exact block
  const block = code.substring(devSideIdx, tabContentIdx);
  // Keep the closing tags and logout button
  const cleanSidebar = `            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] text-rose-300/80 hover:text-rose-200 hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out Admin
            </button>
          </div>
        </aside>

        `;
  code = code.replace(block, cleanSidebar);
}

// 4. Remove Tab 8: Clone & Export
const tabExportMarker = '{/* ══════════ TAB 8: CLONE & EXPORT ══════════ */}';
const exportIdx = code.indexOf(tabExportMarker);
if (exportIdx !== -1) {
  const closingMain = '</main>';
  const mainIdx = code.indexOf(closingMain, exportIdx);
  if (mainIdx !== -1) {
    const exportBlock = code.substring(exportIdx, mainIdx);
    code = code.replace(exportBlock, '');
  }
}

// 5. Remove isDeveloper from useAuth destructuring if present
code = code.replace('const { isAdmin, user, role, isDeveloper, logout } = useAuth();', 'const { isAdmin, user, role, logout } = useAuth();');

fs.writeFileSync(clientAdminPath, code, 'utf8');
console.log('✅ Successfully synced ClientAdminPanel.tsx with all features!');
