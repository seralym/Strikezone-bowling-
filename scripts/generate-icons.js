import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateIcons() {
  const publicDir = path.resolve('public');
  const iconSvgPath = path.join(publicDir, 'icon.svg');
  const iconMaskableSvgPath = path.join(publicDir, 'icon-maskable.svg');

  console.log('Generating crisp PNG icons from SVG logo...');

  // 1. icon-512.png
  await sharp(iconSvgPath)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('Created public/icon-512.png (512x512)');

  // 2. icon-192.png
  await sharp(iconSvgPath)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('Created public/icon-192.png (192x192)');

  // 3. pwa-512x512.png
  await sharp(iconSvgPath)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Updated public/pwa-512x512.png (512x512)');

  // 4. pwa-192x192.png
  await sharp(iconSvgPath)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Updated public/pwa-192x192.png (192x192)');

  // 5. pwa-maskable-512x512.png (using maskable SVG with full-bleed background & safe zone)
  await sharp(iconMaskableSvgPath)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Updated public/pwa-maskable-512x512.png (512x512 maskable)');

  // 6. apple-touch-icon.png (180x180 for iOS Safari home screen)
  await sharp(iconMaskableSvgPath)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Updated public/apple-touch-icon.png (180x180 for iOS)');

  console.log('All icons successfully generated!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
