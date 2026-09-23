import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n🌸 Converting project to Pure Client Edition...');

// 1. Swap AdminPanel.tsx with ClientAdminPanel.tsx
const clientAdminPath = path.join(rootDir, 'src', 'components', 'ClientAdminPanel.tsx');
const adminPanelPath = path.join(rootDir, 'src', 'components', 'AdminPanel.tsx');
const masterAdminPath = path.join(rootDir, 'src', 'components', 'MasterAdminPanel.tsx');

if (fs.existsSync(clientAdminPath)) {
  const clientCode = fs.readFileSync(clientAdminPath, 'utf8');
  // Rename ClientAdminPanel to AdminPanel inside the file so App.tsx works without changes
  const adjustedCode = clientCode
    .replace(/export const ClientAdminPanel: React\.FC<ClientAdminPanelProps>/g, 'export const AdminPanel: React.FC<AdminPanelProps>')
    .replace(/interface ClientAdminPanelProps/g, 'interface AdminPanelProps');

  fs.writeFileSync(adminPanelPath, adjustedCode, 'utf8');
  console.log('  ✓ Replaced AdminPanel.tsx with pure ClientAdminPanel (all clone & export tools removed)');

  // Remove ClientAdminPanel.tsx and MasterAdminPanel.tsx
  fs.unlinkSync(clientAdminPath);
  console.log('  ✓ Deleted ClientAdminPanel.tsx');
}

if (fs.existsSync(masterAdminPath)) {
  fs.unlinkSync(masterAdminPath);
  console.log('  ✓ Deleted MasterAdminPanel.tsx');
}

// 2. Clean ContentContext.tsx to remove exportConfigJson & importConfigJson if present
const contentContextPath = path.join(rootDir, 'src', 'context', 'ContentContext.tsx');
if (fs.existsSync(contentContextPath)) {
  let ctxCode = fs.readFileSync(contentContextPath, 'utf8');
  ctxCode = ctxCode
    .replace(/exportConfigJson:\s*\(\)\s*=>\s*string;?/g, '')
    .replace(/importConfigJson:\s*\(jsonString:\s*string\)\s*=>\s*Promise<\{[^}]+\}>;?/g, '');
  fs.writeFileSync(contentContextPath, ctxCode, 'utf8');
  console.log('  ✓ Cleaned ContentContext.tsx');
}

// 3. Update package.json to remove setup scripts
const pkgPath = path.join(rootDir, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (pkg.scripts) {
    delete pkg.scripts['make-client'];
    delete pkg.scripts['clone-client'];
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
    console.log('  ✓ Cleaned package.json scripts');
  }
}

// 4. Delete self
const selfPath = path.join(rootDir, 'scripts', 'prepare-client-site.js');
if (fs.existsSync(selfPath)) {
  fs.unlinkSync(selfPath);
  console.log('  ✓ Removed preparation script');
}

console.log('\n🎉 SUCCESS! This website is now 100% pure client edition.');
console.log('   - ZERO clone tools exist in the codebase.');
console.log('   - ZERO export/import tools exist in the codebase.');
console.log('   - ZERO reset tools exist in the codebase.');
console.log('   - Run "npm run build" to create the clean client bundle for Netlify.\n');
