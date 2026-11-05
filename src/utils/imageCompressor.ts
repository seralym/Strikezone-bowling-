import { UserPersonalConfig } from '../types/bowling';

/**
 * Compresses an image file or Base64 data URL using HTML5 Canvas.
 * Limits maximum side dimension to `maxDimension` (default 1000px)
 * and applies JPEG compression with `quality` (default 0.7)
 * to keep Base64 payload around 80–180 KB for safe localStorage storage.
 */
export async function compressImage(
  input: File | string,
  maxDimension: number = 1000,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve) => {
    // Universal safe resolver that never throws or rejects
    if (typeof input === 'string') {
      processDataUrl(input, maxDimension, quality, resolve);
      return;
    }

    // Check if input is a PDF file directly
    if (input.type === 'application/pdf' || input.name.toLowerCase().endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = (e.target?.result as string) || '';
        resolve(raw);
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(input);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        resolve('');
        return;
      }
      processDataUrl(dataUrl, maxDimension, quality, resolve);
    };
    reader.onerror = () => {
      console.warn('FileReader failed to read file');
      resolve('');
    };
    reader.readAsDataURL(input);
  });
}

function processDataUrl(
  dataUrl: string,
  maxDimension: number,
  quality: number,
  resolve: (res: string) => void
) {
  if (!dataUrl) {
    resolve('');
    return;
  }

  // 1. PDF Documents: Keep directly without attempting canvas render
  if (dataUrl.startsWith('data:application/pdf') || dataUrl.includes('application/pdf')) {
    resolve(dataUrl);
    return;
  }

  // 2. Small SVG vector icons (< 250 KB): keep raw vector definition
  if (dataUrl.startsWith('data:image/svg+xml') && dataUrl.length < 250 * 1024) {
    resolve(dataUrl);
    return;
  }

  // 3. Universal Canvas Compression for raster formats (JPEG, PNG, WebP, GIF, BMP, AVIF, HEIC, TIFF, etc.)
  let hasResolved = false;
  const safeResolve = (res: string) => {
    if (!hasResolved) {
      hasResolved = true;
      resolve(res);
    }
  };

  // Safety timeout: If browser image decoder stalls on a strange file, fallback directly to raw dataUrl after 3.5s
  const timer = setTimeout(() => {
    console.warn('Image processing timed out, falling back to raw dataUrl');
    safeResolve(dataUrl);
  }, 3500);

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      clearTimeout(timer);
      try {
        let { width, height } = img;

        // Calculate scaled dimensions keeping aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        // Ensure valid non-zero dimensions
        width = Math.max(1, width);
        height = Math.max(1, height);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          safeResolve(dataUrl);
          return;
        }

        // High quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Dark theme background base for transparency preservation
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        let compressed = '';
        try {
          compressed = canvas.toDataURL('image/jpeg', quality);
        } catch {
          // Fallback to webp or png if jpeg export is blocked
          try {
            compressed = canvas.toDataURL('image/webp', quality);
          } catch {
            compressed = canvas.toDataURL();
          }
        }

        // If compressed output is valid, use it; otherwise fallback to original dataUrl
        if (compressed && compressed.length > 50) {
          safeResolve(compressed);
        } else {
          safeResolve(dataUrl);
        }
      } catch (drawErr) {
        console.warn('Canvas draw exception, safely falling back to raw dataUrl', drawErr);
        safeResolve(dataUrl);
      }
    };

    img.onerror = (e) => {
      clearTimeout(timer);
      // Non-fatal fallback: format unsupported by Canvas decoder (e.g. raw HEIC or exotic TIFF)
      // Save directly via FileReader Data URL so the file is never lost!
      console.warn('Image decoder failed for canvas, safely using raw dataUrl fallback', e);
      safeResolve(dataUrl);
    };

    img.src = dataUrl;
  } catch (err) {
    clearTimeout(timer);
    console.warn('Unexpected error in processDataUrl, safely resolving dataUrl', err);
    safeResolve(dataUrl);
  }
}

/**
 * Calculates estimated KB size of a Base64 string
 */
export function getImageSizeKb(dataUrl?: string): number {
  if (!dataUrl) return 0;
  return Math.round((dataUrl.length * 3) / 4 / 1024);
}

const OPTIMIZATION_THRESHOLD_CHARS = 300 * 1024; // ~225 KB raw payload or 300K chars

/**
 * One-time background optimization for already stored heavy images in localStorage.
 * Scans userConfig balls and oil patterns. If images exceed threshold,
 * recompresses them via HTML5 Canvas and returns the optimized configuration.
 */
export async function optimizeHeavyStoredImages(
  userConfig: UserPersonalConfig
): Promise<{ updatedConfig: UserPersonalConfig; count: number; savedKb: number } | null> {
  let hasChanges = false;
  let count = 0;
  let initialTotalKb = 0;
  let finalTotalKb = 0;

  // 1. Check oil patterns
  const nextOilPatterns = await Promise.all(
    (userConfig.oilPatterns || []).map(async (pattern) => {
      if (pattern.imageUrl && pattern.imageUrl.length > OPTIMIZATION_THRESHOLD_CHARS) {
        try {
          const beforeKb = getImageSizeKb(pattern.imageUrl);
          initialTotalKb += beforeKb;
          const compressed = await compressImage(pattern.imageUrl, 1000, 0.7);
          const afterKb = getImageSizeKb(compressed);
          finalTotalKb += afterKb;

          if (compressed.length < pattern.imageUrl.length) {
            hasChanges = true;
            count++;
            return { ...pattern, imageUrl: compressed };
          }
        } catch (e) {
          console.warn('Could not compress pattern image', pattern.name, e);
        }
      }
      return pattern;
    })
  );

  // 2. Check balls in arsenal
  const nextBalls = await Promise.all(
    (userConfig.balls || []).map(async (ball) => {
      if (ball.imageUrl && ball.imageUrl.length > OPTIMIZATION_THRESHOLD_CHARS) {
        try {
          const beforeKb = getImageSizeKb(ball.imageUrl);
          initialTotalKb += beforeKb;
          const compressed = await compressImage(ball.imageUrl, 1000, 0.7);
          const afterKb = getImageSizeKb(compressed);
          finalTotalKb += afterKb;

          if (compressed.length < ball.imageUrl.length) {
            hasChanges = true;
            count++;
            return { ...ball, imageUrl: compressed };
          }
        } catch (e) {
          console.warn('Could not compress ball image', ball.name, e);
        }
      }
      return ball;
    })
  );

  if (!hasChanges) {
    return null;
  }

  const updatedConfig: UserPersonalConfig = {
    ...userConfig,
    oilPatterns: nextOilPatterns,
    balls: nextBalls,
  };

  const savedKb = Math.max(0, initialTotalKb - finalTotalKb);
  return { updatedConfig, count, savedKb };
}
