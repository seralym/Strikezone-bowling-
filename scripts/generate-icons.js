import fs from 'fs';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generatePNG(width, height, isMaskable = false) {
  const rowStride = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowStride);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = width * (isMaskable ? 0.38 : 0.44);

  // Bowling ball holes relative positions
  const hole1X = cx - maxR * 0.22;
  const hole1Y = cy - maxR * 0.28;
  const hole2X = cx + maxR * 0.22;
  const hole2Y = cy - maxR * 0.28;
  const thumbX = cx;
  const thumbY = cy + maxR * 0.32;

  const fingerR = maxR * 0.13;
  const thumbR = maxR * 0.17;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 9, g = 9, b = 11, a = 255; // Dark obsidian background

      // Icon rounded squircle for non-maskable, or full-bleed for maskable
      if (!isMaskable) {
        const cornerR = width * 0.22;
        const qx = Math.max(0, Math.abs(dx) - (cx - cornerR));
        const qy = Math.max(0, Math.abs(dy) - (cy - cornerR));
        const qDist = Math.sqrt(qx * qx + qy * qy);
        if (qDist > cornerR) {
          a = 0; // Outside rounded icon
        }
      }

      if (a > 0 && dist <= maxR) {
        // Bowling Ball Surface Gradient (Gold/Amber radial with specular shine)
        const shineDx = x - (cx - maxR * 0.35);
        const shineDy = y - (cy - maxR * 0.4);
        const shineDist = Math.sqrt(shineDx * shineDx + shineDy * shineDy);
        const t = Math.min(1, Math.max(0, shineDist / (maxR * 1.5)));

        // Golden amber gradient: #f59e0b -> #d97706 -> #78350f -> #291205
        let ballR = 245 - t * 180;
        let ballG = 158 - t * 125;
        let ballB = 11 - t * 8;

        // Swirl ribbon effect
        const angle = Math.atan2(dy, dx);
        const wave = Math.sin(angle * 3 + dist * 0.05);
        if (wave > 0.4) {
          ballR = Math.min(255, ballR + 25);
          ballG = Math.min(255, ballG + 15);
        }

        // Specular highlight
        if (shineDist < maxR * 0.4) {
          const highlight = 1 - shineDist / (maxR * 0.4);
          ballR = Math.min(255, ballR + highlight * 80);
          ballG = Math.min(255, ballG + highlight * 80);
          ballB = Math.min(255, ballB + highlight * 100);
        }

        // Check if inside finger hole 1
        const dHole1 = Math.sqrt((x - hole1X) ** 2 + (y - hole1Y) ** 2);
        const dHole2 = Math.sqrt((x - hole2X) ** 2 + (y - hole2Y) ** 2);
        const dThumb = Math.sqrt((x - thumbX) ** 2 + (y - thumbY) ** 2);

        if (dHole1 <= fingerR || dHole2 <= fingerR || dThumb <= thumbR) {
          // Hole depth dark
          ballR = 15;
          ballG = 15;
          ballB = 18;
        } else if (dHole1 <= fingerR + 2 || dHole2 <= fingerR + 2 || dThumb <= thumbR + 2) {
          // Hole rim shadow
          ballR = 50;
          ballG = 25;
          ballB = 8;
        }

        // Antialias outer edge
        if (dist > maxR - 1.5) {
          const edgeAlpha = Math.max(0, Math.min(1, (maxR - dist) / 1.5));
          r = Math.round(r * (1 - edgeAlpha) + ballR * edgeAlpha);
          g = Math.round(g * (1 - edgeAlpha) + ballG * edgeAlpha);
          b = Math.round(b * (1 - edgeAlpha) + ballB * edgeAlpha);
        } else {
          r = Math.round(ballR);
          g = Math.round(ballG);
          b = Math.round(ballB);
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // deflate
  ihdrData[11] = 0; // standard filter
  ihdrData[12] = 0; // non-interlaced

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/pwa-192x192.png', generatePNG(192, 192, false));
fs.writeFileSync('public/pwa-512x512.png', generatePNG(512, 512, false));
fs.writeFileSync('public/pwa-maskable-512x512.png', generatePNG(512, 512, true));
fs.writeFileSync('public/apple-touch-icon.png', generatePNG(180, 180, false));
fs.writeFileSync('public/favicon.ico', generatePNG(32, 32, false));

console.log('Successfully generated all PWA icons: 192, 512, maskable, apple-touch, favicon.');
