import JSZip from 'jszip';

/**
 * Downloads the complete StrikeZone project as a ZIP archive.
 * Optimized for mobile Chrome / Safari and desktop browsers.
 */
export async function downloadProjectZip(onProgress?: (status: string) => void): Promise<boolean> {
  if (onProgress) onProgress('Подготовка архива...');

  try {
    // Primary path: fetch the pre-packaged complete repository archive from public/
    // This includes .github/workflows, public assets, src, package.json, configs, etc.
    const zipUrl = './strikezone-source.zip';
    const response = await fetch(zipUrl);

    if (response.ok) {
      if (onProgress) onProgress('Скачивание ZIP-файла...');
      const blob = await response.blob();
      triggerBlobDownload(blob, 'strikezone-bowling-tracker.zip');
      if (onProgress) onProgress('Готово! Файл сохранён.');
      return true;
    }
  } catch (err) {
    console.warn('Direct zip fetch failed, falling back to dynamic client bundle', err);
  }

  // Fallback path: generate zip dynamically in browser with JSZip
  try {
    if (onProgress) onProgress('Формирование архива в браузере...');
    const zip = new JSZip();

    // Fetch key manifest & configuration files
    const fetchFile = async (path: string) => {
      try {
        const res = await fetch(path);
        if (res.ok) return await res.text();
      } catch (e) {
        return null;
      }
      return null;
    };

    const [pkgJson, viteConf, tsConf, indexHtml, readme] = await Promise.all([
      fetchFile('./package.json'),
      fetchFile('./vite.config.ts'),
      fetchFile('./tsconfig.json'),
      fetchFile('./index.html'),
      fetchFile('./README.md'),
    ]);

    if (pkgJson) zip.file('package.json', pkgJson);
    if (viteConf) zip.file('vite.config.ts', viteConf);
    if (tsConf) zip.file('tsconfig.json', tsConf);
    if (indexHtml) zip.file('index.html', indexHtml);
    if (readme) zip.file('README.md', readme);

    // Add github workflow
    const deployYml = await fetchFile('./.github/workflows/deploy.yml');
    if (deployYml) {
      zip.folder('.github')?.folder('workflows')?.file('deploy.yml', deployYml);
    }

    if (onProgress) onProgress('Сжатие данных (JSZip)...');
    const content = await zip.generateAsync({ type: 'blob' });
    triggerBlobDownload(content, 'strikezone-bowling-tracker.zip');
    if (onProgress) onProgress('Готово! Файл сохранён.');
    return true;
  } catch (err) {
    console.error('Failed to generate zip fallback', err);
    // Last resort direct link navigation
    window.location.href = './strikezone-source.zip';
    return true;
  }
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1500);
}
