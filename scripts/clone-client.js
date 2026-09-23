import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourceDir = path.resolve(__dirname, '..');

// Helper for interactive questions
const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
};

// Recursive folder copy excluding node_modules, dist, .git
const copyRecursive = (src, dest) => {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    const baseName = path.basename(src);
    if (baseName === 'node_modules' || baseName === 'dist' || baseName === '.git') {
      return;
    }

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

async function main() {
  console.log('\n🌸 ────────────────────────────────────────────────────────');
  console.log('   TURNKEY CLIENT WEBSITE & ADMIN GENERATOR');
  console.log('   Generates a 100% clean client website with ZERO clone/export code');
  console.log('   ────────────────────────────────────────────────────────\n');

  const args = process.argv.slice(2);

  const salonName = args[0] || (await askQuestion('1. Enter Client Salon / Brand Name (e.g. Pooja Makeovers): ')) || 'Client Salon';
  const founderName = args[1] || (await askQuestion('2. Enter Artist / Founder Name (e.g. Pooja Sharma): ')) || 'Lead Artist';
  const location = args[2] || (await askQuestion('3. Enter City / Location (e.g. Patna, Bihar): ')) || 'City';
  const phone = args[3] || (await askQuestion('4. Enter WhatsApp / Phone Number (e.g. +91 98765 43210): ')) || '+91 98765 43210';
  const instagram = args[4] || (await askQuestion('5. Enter Instagram Handle (e.g. @pooja_makeovers): ')) || '@salon';
  const clientEmail = args[5] || (await askQuestion('6. Enter Client Admin Login Email: ')) || 'client@salon.com';
  const clientPassword = args[6] || (await askQuestion('7. Enter Client Admin Login Password: ')) || 'client2026';

  const sanitizedFolder = salonName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const targetDir = path.resolve(sourceDir, '..', sanitizedFolder);

  console.log(`\n📂 Target directory: ${targetDir}`);
  if (fs.existsSync(targetDir)) {
    console.error(`❌ Error: Target folder "${targetDir}" already exists. Please delete it or choose a different name.`);
    process.exit(1);
  }

  console.log('📦 1/4: Copying project files...');
  copyRecursive(sourceDir, targetDir);

  console.log('✂️  2/4: Stripping master developer tools & installing pure Client Admin Panel...');
  const clientAdminSrc = path.join(targetDir, 'src', 'components', 'ClientAdminPanel.tsx');
  const adminPanelTarget = path.join(targetDir, 'src', 'components', 'AdminPanel.tsx');
  const masterAdminTarget = path.join(targetDir, 'src', 'components', 'MasterAdminPanel.tsx');

  if (fs.existsSync(clientAdminSrc)) {
    const clientCode = fs.readFileSync(clientAdminSrc, 'utf8');
    const adjustedCode = clientCode
      .replace(/export const ClientAdminPanel: React\.FC<ClientAdminPanelProps>/g, 'export const AdminPanel: React.FC<AdminPanelProps>')
      .replace(/interface ClientAdminPanelProps/g, 'interface AdminPanelProps');

    fs.writeFileSync(adminPanelTarget, adjustedCode, 'utf8');
    fs.unlinkSync(clientAdminSrc);
  }

  if (fs.existsSync(masterAdminTarget)) {
    fs.unlinkSync(masterAdminTarget);
  }

  console.log('🔐 3/4: Setting up client credentials in src/config/adminCredentials.ts...');
  const credentialsCode = `/**
 * Client Admin Credentials for ${salonName}
 * Role is strictly 'client' (Content editing and slide-toggles only. Zero clone tools exist).
 */

export interface AdminAccount {
  email: string;
  password: string;
  role: 'developer' | 'client';
  label: string;
}

export const ADMIN_ACCOUNTS: AdminAccount[] = [
  // Master Developer (You can still log into client site if maintenance is needed)
  {
    email: 'admin@khushimakeup.com',
    password: 'khushi123',
    role: 'developer',
    label: 'Master Developer',
  },

  // Client Access (Only content editing for their site)
  {
    email: '${clientEmail}',
    password: '${clientPassword}',
    role: 'client',
    label: '${salonName} Admin',
  },
];
`;
  fs.writeFileSync(path.join(targetDir, 'src', 'config', 'adminCredentials.ts'), credentialsCode, 'utf8');

  // Also pre-configure the default brand in makeupData.ts
  const makeupDataTarget = path.join(targetDir, 'src', 'data', 'makeupData.ts');
  if (fs.existsSync(makeupDataTarget)) {
    let dataCode = fs.readFileSync(makeupDataTarget, 'utf8');
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanInsta = instagram.replace(/^@/, '').trim();
    const fullPhone = cleanPhone.startsWith('91') && cleanPhone.length > 10 ? cleanPhone : `91${cleanPhone}`;
    const waUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(`Hello ${founderName}! ✨ I would like to enquire about booking a makeup session.`)}`;

    dataCode = dataCode
      .replace(/name:\s*'[^']+',/, `name: '${salonName}',`)
      .replace(/founder:\s*'[^']+',/, `founder: '${founderName}',`)
      .replace(/location:\s*'[^']+',/, `location: '${location}',`)
      .replace(/phone:\s*'[^']+',/, `phone: '${cleanPhone}',`)
      .replace(/phoneDisplay:\s*'[^']+',/, `phoneDisplay: '${phone}',`)
      .replace(/phoneHref:\s*'[^']+',/, `phoneHref: 'tel:+${fullPhone}',`)
      .replace(/instagram:\s*'[^']+',/, `instagram: '@${cleanInsta}',`)
      .replace(/instagramProfileUrl:\s*'[^']+',/, `instagramProfileUrl: 'https://instagram.com/${cleanInsta}',`)
      .replace(/instagramDmUrl:\s*'[^']+',/, `instagramDmUrl: 'https://ig.me/m/${cleanInsta}',`)
      .replace(/whatsappUrl:\s*'[^']+',/, `whatsappUrl: '${waUrl}',`);
    fs.writeFileSync(makeupDataTarget, dataCode, 'utf8');
  }

  console.log('🧹 4/4: Cleaning scripts and build configs in the cloned project...');
  // Remove generator scripts from the client copy
  const scriptsDir = path.join(targetDir, 'scripts');
  if (fs.existsSync(scriptsDir)) {
    fs.rmSync(scriptsDir, { recursive: true, force: true });
  }

  // Update cloned package.json
  const targetPkgPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(targetPkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(targetPkgPath, 'utf8'));
    pkg.name = sanitizedFolder.toLowerCase();
    if (pkg.scripts) {
      delete pkg.scripts['clone-client'];
      delete pkg.scripts['make-client'];
    }
    fs.writeFileSync(targetPkgPath, JSON.stringify(pkg, null, 2), 'utf8');
  }

  console.log('\n🌸 ────────────────────────────────────────────────────────');
  console.log('✨ CLONING COMPLETED SUCCESSFULLY!');
  console.log(`📁 Client Project Path: ${targetDir}`);
  console.log(`🔑 Client Login: ${clientEmail} / ${clientPassword}`);
  console.log('🛡️  SECURITY GUARANTEE:');
  console.log('   - ZERO clone tools exist in the client website codebase.');
  console.log('   - ZERO export/import tools exist in the client website codebase.');
  console.log('   - ZERO reset tools exist in the client website codebase.');
  console.log('\n🚀 Next Steps:');
  console.log(`   1. cd "${targetDir}"`);
  console.log('   2. npm install');
  console.log('   3. npm run build');
  console.log('   4. Drag the "dist" folder to Netlify!\n');
}

main().catch(console.error);
