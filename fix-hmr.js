const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing HMR issues...\n');

// Step 1: Kill any running Next.js processes
console.log('1️⃣ Stopping Next.js processes...');
try {
  if (process.platform === 'win32') {
    execSync('taskkill /F /IM node.exe', { stdio: 'ignore' });
  } else {
    execSync('pkill -f "next dev" || true', { stdio: 'ignore' });
  }
  console.log('   ✅ Processes stopped\n');
} catch (e) {
  console.log('   ℹ️ No processes to stop\n');
}

// Step 2: Clear Next.js cache
console.log('2️⃣ Clearing Next.js cache...');
const nextDir = path.join(__dirname, '.next');
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('   ✅ .next directory removed\n');
} else {
  console.log('   ℹ️ No .next directory found\n');
}

// Step 3: Clear node_modules cache
console.log('3️⃣ Clearing node_modules cache...');
const cacheDir = path.join(__dirname, 'node_modules', '.cache');
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log('   ✅ Cache cleared\n');
} else {
  console.log('   ℹ️ No cache found\n');
}

// Step 4: Check for .env.local
console.log('4️⃣ Checking environment configuration...');
const envFile = path.join(__dirname, '.env.local');
const envExampleFile = path.join(__dirname, '.env.local.example');

if (!fs.existsSync(envFile) && fs.existsSync(envExampleFile)) {
  fs.copyFileSync(envExampleFile, envFile);
  console.log('   ✅ Created .env.local from example\n');
} else if (fs.existsSync(envFile)) {
  console.log('   ✅ .env.local exists\n');
} else {
  console.log('   ⚠️  No .env.local found - creating empty file\n');
  fs.writeFileSync(envFile, '');
}

console.log('✨ HMR fix complete!\n');
console.log('Next steps:');
console.log('1. Run: npm install --legacy-peer-deps');
console.log('2. Run: npm run dev');
console.log('3. Open http://localhost:3000 in a fresh browser tab\n');