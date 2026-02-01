const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const projectRoot = process.cwd();
const inputPath = path.join(projectRoot, 'public/logo/favicon.png');
const outputDir = path.join(projectRoot, 'public/icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [
  { size: 16, name: 'icon-16x16.png' },
  { size: 32, name: 'icon-32x32.png' },
  { size: 48, name: 'icon-48x48.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
];

async function generateIcons() {
  console.log('🎨 Generating optimized icons...\n');
  
  for (const { size, name } of sizes) {
    const outputPath = path.join(outputDir, name);
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(outputPath);
    
    const stats = fs.statSync(outputPath);
    console.log(`✅ ${name} (${size}x${size}) - ${(stats.size / 1024).toFixed(1)}KB`);
  }
  
  // Generate favicon.ico for browsers
  console.log('\n📌 Generating favicon.ico...');
  const pngToIco = require('png-to-ico');
  
  // Use 16, 32, and 48px icons for the ICO file
  const icoInputs = [
    path.join(outputDir, 'icon-16x16.png'),
    path.join(outputDir, 'icon-32x32.png'),
    path.join(outputDir, 'icon-48x48.png'),
  ];
  
  // Handle ESM default export
  const generateIco = pngToIco.default || pngToIco;

  try {
    const icoBuffer = await generateIco(icoInputs);
    const faviconPath = path.join(projectRoot, 'public', 'favicon.ico');
    fs.writeFileSync(faviconPath, icoBuffer);
    
    const faviconStats = fs.statSync(faviconPath);
    console.log(`✅ favicon.ico - ${(faviconStats.size / 1024).toFixed(1)}KB`);
  } catch (error) {
    console.error('❌ Error generating favicon.ico:', error);
  }
  
  console.log('\n🎉 All icons generated!');
  console.log('   - PNG icons in: public/icons/');
  console.log('   - favicon.ico in: public/');
}

generateIcons().catch(console.error);
