import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const zip = new JSZip();

function addDirectoryToZip(dirPath, zipFolder) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    // Exclude node_modules, dist, .git, and the target zip file itself
    if (
      entry.name === 'node_modules' ||
      entry.name === 'dist' ||
      entry.name === '.git' ||
      entry.name === 'strikezone-source.zip' ||
      entry.name === '.aistudio'
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      const subFolder = zipFolder ? zipFolder.folder(entry.name) : zip.folder(entry.name);
      addDirectoryToZip(fullPath, subFolder);
    } else {
      const fileBuffer = fs.readFileSync(fullPath);
      if (zipFolder) {
        zipFolder.file(entry.name, fileBuffer);
      } else {
        zip.file(entry.name, fileBuffer);
      }
    }
  }
}

console.log('Packaging StrikeZone source files into ZIP...');

// Add root files
const rootFiles = [
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'index.html',
  'README.md',
  'metadata.json',
];

for (const file of rootFiles) {
  if (fs.existsSync(file)) {
    zip.file(file, fs.readFileSync(file));
  }
}

// Add .github
if (fs.existsSync('.github')) {
  addDirectoryToZip('.github', zip.folder('.github'));
}

// Add src
if (fs.existsSync('src')) {
  addDirectoryToZip('src', zip.folder('src'));
}

// Add public (excluding zip itself)
if (fs.existsSync('public')) {
  addDirectoryToZip('public', zip.folder('public'));
}

// Add scripts
if (fs.existsSync('scripts')) {
  addDirectoryToZip('scripts', zip.folder('scripts'));
}

// Ensure public exists
if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

// Generate ZIP buffer and write to public/strikezone-source.zip
const outputPath = path.join('public', 'strikezone-source.zip');
zip
  .generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } })
  .then((content) => {
    fs.writeFileSync(outputPath, content);
    const sizeKb = Math.round(content.length / 1024);
    console.log(`ZIP successfully created at ${outputPath} (${sizeKb} KB)`);
  })
  .catch((err) => {
    console.error('Failed to generate ZIP archive', err);
    process.exit(1);
  });
