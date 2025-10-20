#!/usr/bin/env node

/**
 * TigerBeetle Setup Script
 * Downloads and initializes TigerBeetle for the demo
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const TIGERBEETLE_DIR = path.join(__dirname, '..', 'tigerbeetle-bin');
const DATA_FILE = path.join(__dirname, '..', 'data.tigerbeetle');

async function getPlatform() {
  const platform = process.platform;
  const arch = process.arch;

  const platformMap = {
    darwin: 'macos',
    linux: 'linux',
    win32: 'windows',
  };

  const archMap = {
    x64: 'x86_64',
    arm64: 'aarch64',
  };

  return {
    platform: platformMap[platform] || platform,
    arch: archMap[arch] || arch,
  };
}

async function downloadTigerBeetle() {
  console.log('🐯 Setting up TigerBeetle...\n');

  const { platform, arch } = await getPlatform();
  const version = 'latest';
  const fileName = `tigerbeetle-${arch}-${platform}.zip`;
  const url = `https://github.com/tigerbeetle/tigerbeetle/releases/${version}/download/${fileName}`;

  console.log(`📦 Downloading TigerBeetle for ${platform} (${arch})...`);
  console.log(`   URL: ${url}\n`);

  // Create directory
  if (!fs.existsSync(TIGERBEETLE_DIR)) {
    fs.mkdirSync(TIGERBEETLE_DIR, { recursive: true });
  }

  const zipPath = path.join(TIGERBEETLE_DIR, fileName);

  // Download file
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(zipPath);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log('✅ Download complete\n');
            resolve(zipPath);
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('✅ Download complete\n');
          resolve(zipPath);
        });
      }
    }).on('error', (err) => {
      fs.unlink(zipPath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

async function extractZip(zipPath) {
  console.log('📂 Extracting TigerBeetle...');
  
  try {
    await execAsync(`unzip -o "${zipPath}" -d "${TIGERBEETLE_DIR}"`);
    console.log('✅ Extraction complete\n');
  } catch (error) {
    throw new Error(`Failed to extract: ${error.message}`);
  }
}

async function makeExecutable() {
  const tigerBeetlePath = path.join(TIGERBEETLE_DIR, 'tigerbeetle');
  
  if (process.platform !== 'win32') {
    console.log('🔧 Making TigerBeetle executable...');
    await execAsync(`chmod +x "${tigerBeetlePath}"`);
    console.log('✅ Permissions set\n');
  }
}

async function initializeDataFile() {
  const tigerBeetlePath = path.join(TIGERBEETLE_DIR, 'tigerbeetle');
  
  // Check if data file already exists
  if (fs.existsSync(DATA_FILE)) {
    console.log('ℹ️  Data file already exists, skipping initialization\n');
    return;
  }

  console.log('🗄️  Initializing TigerBeetle data file...');
  
  try {
    const formatCmd = `"${tigerBeetlePath}" format --cluster=0 --replica=0 --replica-count=1 "${DATA_FILE}"`;
    await execAsync(formatCmd);
    console.log('✅ Data file initialized\n');
  } catch (error) {
    throw new Error(`Failed to initialize data file: ${error.message}`);
  }
}

async function printInstructions() {
  console.log('\n✨ TigerBeetle setup complete!\n');
  console.log('📋 Next steps:\n');
  console.log('1. Start TigerBeetle server:');
  console.log('   ./tigerbeetle-bin/tigerbeetle start --addresses=3000 data.tigerbeetle\n');
  console.log('2. Build shared package:');
  console.log('   cd packages/shared && npm run build\n');
  console.log('3. Start backend:');
  console.log('   cd packages/backend && npm run dev\n');
  console.log('4. Start frontend (in another terminal):');
  console.log('   cd packages/frontend && npm run dev\n');
  console.log('5. Open http://localhost:3000 in your browser\n');
  console.log('🎉 Happy coding!\n');
}

async function main() {
  try {
    const zipPath = await downloadTigerBeetle();
    await extractZip(zipPath);
    await makeExecutable();
    await initializeDataFile();
    
    // Clean up zip file
    fs.unlinkSync(zipPath);
    
    await printInstructions();
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nPlease download TigerBeetle manually from:');
    console.error('https://github.com/tigerbeetle/tigerbeetle/releases\n');
    process.exit(1);
  }
}

main();

